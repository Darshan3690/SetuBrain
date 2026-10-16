'use client';

import React, { useState } from 'react';
import {
  GitBranch,
  History,
  AlertOctagon,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Terminal,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface Scenario {
  id: string;
  badge: string;
  title: string;
  query: string;
  path: string[];
  cypher: string;
  outcome: string;
  principle: string;
  mechanic: string;
  status: 'VERIFIED' | 'STALE' | 'CONFLICT' | 'ABSTAIN';
}

function renderHighlightedCypher(cypher: string) {
  const lines = cypher.split('\n');
  return (
    <div className="space-y-1 font-mono text-xs leading-relaxed select-all">
      {lines.map((line, lIdx) => {
        const tokens = line.split(/(\b(?:MATCH|OPTIONAL MATCH|WHERE|RETURN|WITH|ORDER BY|LIMIT|CREATE|SET|AND|OR|AS|GROUP BY|DESC|ASC|IN)\b|:\w+|\[:[A-Za-z0-9_]+\]|\$[A-Za-z0-9_]+|'[^']*'|"[^"]*"|\(|\)|-[^->]*-?>|<-?[^-]*-)/g);
        return (
          <div key={lIdx}>
            {tokens.map((token, tIdx) => {
              if (/^(MATCH|OPTIONAL MATCH|WHERE|RETURN|WITH|ORDER BY|LIMIT|CREATE|SET|AND|OR|AS|GROUP BY|DESC|ASC|IN)$/.test(token)) {
                return <span key={tIdx} className="text-purple-400 font-bold">{token}</span>;
              }
              if (token.startsWith(':') && !token.startsWith('::')) {
                return <span key={tIdx} className="text-sky-300 font-semibold">{token}</span>;
              }
              if (token.startsWith('[:') || token.startsWith('-[')) {
                return <span key={tIdx} className="text-emerald-400 font-semibold">{token}</span>;
              }
              if (token.startsWith('$')) {
                return <span key={tIdx} className="text-amber-300 font-semibold">{token}</span>;
              }
              if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"'))) {
                return <span key={tIdx} className="text-emerald-300">{token}</span>;
              }
              if (token === '(' || token === ')' || token === '{' || token === '}') {
                return <span key={tIdx} className="text-slate-400 font-bold">{token}</span>;
              }
              if (token.includes('->') || token.includes('<-')) {
                return <span key={tIdx} className="text-emerald-400 font-semibold">{token}</span>;
              }
              return <span key={tIdx} className="text-slate-200">{token}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

const SCENARIOS: Scenario[] = [
  {
    id: 'trap1',
    badge: 'TRAP 1 • MULTI-HOP OWNERSHIP',
    title: '4-Hop Dynamic Ownership Chain',
    query: 'How do I purchase software?',
    path: [
      'Department(DEPT-FIN)',
      'RESPONSIBLE_FOR -> Procedure(PROC-SAAS-01)',
      'USES_APP -> Application(APP-RAMP)',
      'GOVERNED_BY -> Policy(POL-FIN-2026)',
      'APPROVED_BY -> Contact(SME-PRIYA)',
    ],
    cypher: `MATCH (d:Department)-[:RESPONSIBLE_FOR]->(proc:Procedure)\nMATCH (proc)-[:USES_APP]->(app:Application)\nMATCH (proc)-[:GOVERNED_BY]->(pol:Policy)-[:APPROVED_BY]->(sme:Contact)\nRETURN d.name, proc.title, app.name, pol.title, sme.name;`,
    outcome: 'At Acme Corp, new software purchases must be requested through Ramp. Self-serve auto-approval applies for spend under $500/month. Contracts over $5,000/year require VP of Finance (Priya Sharma) approval.',
    principle: 'Vector chunks lose relational context across documents. Graph edges maintain deterministic ownership.',
    mechanic: 'Traverse 4 continuous hops: Dept → Procedure → Application → Policy → Approver.',
    status: 'VERIFIED',
  },
  {
    id: 'trap2',
    badge: 'TRAP 2 • SUPERSEDED POLICIES',
    title: 'Follow [:SUPERSEDES] Edge to Halt Stale Caps',
    query: 'What is our hotel reimbursement limit?',
    path: [
      'Department(DEPT-FIN)',
      'Policy(POL-TRV-2025) [ACTIVE: $250/night]',
      '[:SUPERSEDES] -> Policy(POL-TRV-2024) [STALE: $150/night]',
    ],
    cypher: `MATCH (pol:Policy {id: 'POL-TRV-2025'})\nMATCH (pol)-[:SUPERSEDES]->(old:Policy)\nWHERE pol.status = 'ACTIVE'\nRETURN pol.title, pol.content, old.title AS supersededPolicy;`,
    outcome: 'The authoritative lodging reimbursement limit is $250 per night for Tier-1 cities under active policy POL-TRV-2025. The legacy $150 limit was formally superseded in Feb 2025.',
    principle: 'Explicit supersession relationships prevent agents from applying outdated corporate limits.',
    mechanic: 'Filter out nodes with incoming [:SUPERSEDES] edges; serve only terminal active versions.',
    status: 'STALE',
  },
  {
    id: 'trap3',
    badge: 'TRAP 3 • CONFLICT HALT',
    title: 'Block Contradictory Policies & Summon Curator',
    query: 'How do we handle laptop wipe on offboarding?',
    path: [
      'Department(Security) -> Policy(POL-SEC-101: 0-Hour Immediate Wipe)',
      '[:CONFLICTS_WITH] (Severity: HIGH)',
      'Department(HR) -> Policy(POL-HR-202: 7-Day Recovery Grace Period)',
    ],
    cypher: `MATCH (polA:Policy)-[c:CONFLICTS_WITH]->(polB:Policy)\nRETURN polA.id, polA.content, polB.id, polB.content, c.severity, c.description;`,
    outcome: 'EXECUTION HALTED: Contradictory policies detected between POL-SEC-101 (immediate cryptographic wipe) and POL-HR-202 (7-day grace period). Routed to Curator Agent.',
    principle: 'When corporate policies clash, an AI agent must halt instead of hallucinating a synthetic compromise.',
    mechanic: 'Query [:CONFLICTS_WITH] edges; halt traversal and dispatch resolution alert to governance team.',
    status: 'CONFLICT',
  },
  {
    id: 'trap4',
    badge: 'TRAP 4 • EXPERT ROUTING',
    title: 'Deterministic Abstention & Marcus Vance Escalation',
    query: 'What is my GPU cluster quota in Engineering?',
    path: [
      'Department(DEPT-ENG)',
      'Missing Procedure Node: [UNINDEXED]',
      'Deterministically Routed to SME: Marcus Vance (marcus@acme.com)',
    ],
    cypher: `MATCH (d:Department {slug: 'engineering'})\nOPTIONAL MATCH (d)-[:RESPONSIBLE_FOR]->(p:Procedure)\nWHERE p.title =~ '(?i).*gpu.*'\nRETURN d.sme_name, d.sme_email, count(p) AS matchingProcedures;`,
    outcome: 'ABSTENTION: No verified GPU procedure found in Department(Engineering). Escalation ticket generated and routed to Principal Infra Architect Marcus Vance (marcus@acme.com).',
    principle: 'Never guess when company knowledge is missing. Explicitly abstain and escalate to the designated SME.',
    mechanic: 'Count matching paths; if zero, trigger deterministic abstention and route to Department SME node.',
    status: 'ABSTAIN',
  },
  {
    id: 'trap5',
    badge: 'TRAP 5 • DECISION PROVENANCE',
    title: 'Trace Exception DEC-901 to Slack & Signed Policy',
    query: 'Trace decision DEC-901 refund exception',
    path: [
      'Decision(DEC-901: Customer SLA Credit)',
      'BASED_ON -> Policy(POL-OPS-SLA-2025)',
      'EVIDENCED_BY -> Document(DOC-SLACK-901: #ops-exec thread)',
      'APPROVED_BY -> Contact(Elena Rostova, VP Ops)',
    ],
    cypher: `MATCH (dec:Decision {id: 'DEC-901'})\nMATCH (dec)-[:BASED_ON]->(pol:Policy)\nMATCH (dec)-[:EVIDENCED_BY]->(doc:Document)\nMATCH (dec)-[:APPROVED_BY]->(auth:Contact)\nRETURN dec, pol, doc, auth;`,
    outcome: 'Decision DEC-901 was an approved $4,500 credit granted under POL-OPS-SLA-2025. Fully evidenced by signed Slack thread DOC-SLACK-901 and authorized by VP Ops Elena Rostova.',
    principle: 'Enterprise audits require provenance chains, not isolated text snippets.',
    mechanic: 'Follow backward provenance edges from Decision to Policy, Authorizer, and Evidence nodes.',
    status: 'VERIFIED',
  },
];

export default function EnterpriseTrapLab({ onLaunchConsole }: { onLaunchConsole?: () => void }) {
  const [selectedTrap, setSelectedTrap] = useState<Scenario>(SCENARIOS[0]);

  return (
    <section id="traps" className="py-20 lg:py-28 relative overflow-hidden bg-[#030712]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>INTERACTIVE SCENARIO LABORATORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The 5 Enterprise Traps That{' '}
            <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
              Break Traditional AI
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Click any scenario to see how SetuBrain uses FalkorDB openCypher to traverse relationships, catch superseded policies, halt contradictions, and escalate to human experts.
          </p>
        </div>

        {/* Bento Grid: Left Column Cards / Right Column Simulation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 5 Scenario Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {SCENARIOS.map((scenario) => {
              const isSelected = selectedTrap.id === scenario.id;
              return (
                <div
                  key={scenario.id}
                  onClick={() => setSelectedTrap(scenario)}
                  className={`p-4.5 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900/90 border-sky-500/50 shadow-xl shadow-sky-500/10 scale-[1.01]'
                      : 'bg-[#080D18]/70 border-white/5 hover:border-white/15 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-slate-400">
                      {scenario.badge}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold ${
                        scenario.status === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : scenario.status === 'CONFLICT'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
                          : scenario.status === 'STALE'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                          : 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {scenario.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white font-sans">{scenario.title}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-1">
                    &ldquo;{scenario.query}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Shared Interactive Visual Simulation (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#080D18]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Top Bar of Active Scenario */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wide">
                  ACTIVE SIMULATION: {selectedTrap.badge}
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  &ldquo;{selectedTrap.query}&rdquo;
                </h3>
              </div>
              {onLaunchConsole && (
                <button
                  onClick={onLaunchConsole}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-xs font-mono transition-all cursor-pointer"
                >
                  <span>Test in Live Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Visual Traversal Path Diagram */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 space-y-2.5">
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>GRAPH TRAVERSAL PATH:</span>
                <span className="text-emerald-400 font-mono text-[10px]">Deterministic Traversal</span>
              </div>
              <div className="flex flex-col space-y-2">
                {selectedTrap.path.map((step, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs font-mono text-slate-200">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-sky-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <span className="bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/5 text-slate-300 w-full overflow-x-auto">
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* FalkorDB Cypher Query Snippet */}
            <div className="p-4 rounded-2xl bg-slate-950/95 border border-white/10 space-y-2 font-mono text-xs shadow-inner">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>FALKORDB OPENCYPHER QUERY:</span>
                </span>
                <span className="text-cyan-400 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-white/5">
                  14.3 ms execution
                </span>
              </div>
              <div className="overflow-x-auto p-3 rounded-xl bg-black/50 border border-white/5">
                {renderHighlightedCypher(selectedTrap.cypher)}
              </div>
            </div>

            {/* Governed Outcome Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/30 to-indigo-950/30 border border-sky-500/25 space-y-1.5">
              <span className="text-[10px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
                Authoritative Governed Outcome:
              </span>
              <p className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed">
                {selectedTrap.outcome}
              </p>
            </div>

            {/* Governance Principle */}
            <div className="pt-2 flex items-start space-x-3 text-xs text-slate-400 font-sans border-t border-white/5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200 font-medium">Why this matters: </strong>
                {selectedTrap.principle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
