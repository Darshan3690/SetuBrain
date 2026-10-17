'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Terminal,
  CheckCircle2,
  Zap,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Building2,
  FileText,
  CreditCard,
  UserCheck,
  Sparkles,
  MessageSquare,
  Lock,
  Users
} from 'lucide-react';

interface Scenario {
  id: string;
  badge: string;
  title: string;
  query: string;
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
                return <span key={tIdx} className="text-zinc-500 font-bold">{token}</span>;
              }
              if (token.includes('->') || token.includes('<-')) {
                return <span key={tIdx} className="text-emerald-400 font-semibold">{token}</span>;
              }
              return <span key={tIdx} className="text-zinc-300">{token}</span>;
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
    badge: '01 · MULTI-HOP OWNERSHIP',
    title: '4-Hop Dynamic Ownership Chain',
    query: 'How do I purchase software?',
    cypher: `MATCH (d:Department)-[:RESPONSIBLE_FOR]->(proc:Procedure)\nMATCH (proc)-[:USES_APP]->(app:Application)\nMATCH (proc)-[:GOVERNED_BY]->(pol:Policy)-[:APPROVED_BY]->(sme:Contact)\nRETURN d.name, proc.title, app.name, pol.title, sme.name;`,
    outcome: 'At Acme Corp, new software purchases must be requested through Ramp. Self-serve auto-approval applies for spend under $500/month. Contracts over $5,000/year require VP of Finance (Priya Sharma) approval.',
    principle: 'Vector chunks lose relational context across documents. Graph edges maintain deterministic ownership.',
    mechanic: 'Traverse 4 continuous hops: Dept → Procedure → Application → Policy → Approver.',
    status: 'VERIFIED',
  },
  {
    id: 'trap2',
    badge: '02 · SUPERSEDED POLICIES',
    title: 'Follow [:SUPERSEDES] Edge to Halt Stale Caps',
    query: 'What is our hotel reimbursement limit?',
    cypher: `MATCH (pol:Policy {id: 'POL-TRV-2025'})\nMATCH (pol)-[:SUPERSEDES]->(old:Policy)\nWHERE pol.status = 'ACTIVE'\nRETURN pol.title, pol.content, old.title AS supersededPolicy;`,
    outcome: 'The authoritative lodging reimbursement limit is $250 per night for Tier-1 cities under active policy POL-TRV-2025. The legacy $150 limit was formally superseded in Feb 2025.',
    principle: 'Explicit supersession relationships prevent agents from applying outdated corporate limits.',
    mechanic: 'Filter out nodes with incoming [:SUPERSEDES] edges; serve only terminal active versions.',
    status: 'STALE',
  },
  {
    id: 'trap3',
    badge: '03 · CONFLICT HALT',
    title: 'Block Contradictory Policies & Summon Curator',
    query: 'How do we handle laptop wipe on offboarding?',
    cypher: `MATCH (polA:Policy)-[c:CONFLICTS_WITH]->(polB:Policy)\nRETURN polA.id, polA.content, polB.id, polB.content, c.severity, c.description;`,
    outcome: 'EXECUTION HALTED: Contradictory policies detected between POL-SEC-101 (immediate cryptographic wipe) and POL-HR-202 (7-day grace period). Routed to Curator Agent.',
    principle: 'When corporate policies clash, an AI agent must halt instead of hallucinating a synthetic compromise.',
    mechanic: 'Query [:CONFLICTS_WITH] edges; halt traversal and dispatch resolution alert to governance team.',
    status: 'CONFLICT',
  },
  {
    id: 'trap4',
    badge: '04 · EXPERT ROUTING',
    title: 'Deterministic Abstention & Marcus Vance Escalation',
    query: 'What is my GPU cluster quota in Engineering?',
    cypher: `MATCH (d:Department {slug: 'engineering'})\nOPTIONAL MATCH (d)-[:RESPONSIBLE_FOR]->(p:Procedure)\nWHERE p.title =~ '(?i).*gpu.*'\nRETURN d.sme_name, d.sme_email, count(p) AS matchingProcedures;`,
    outcome: 'ABSTENTION: No verified GPU procedure found in Department(Engineering). Escalation ticket generated and routed to Principal Infra Architect Marcus Vance (marcus@acme.com).',
    principle: 'Never guess when company knowledge is missing. Explicitly abstain and escalate to the designated SME.',
    mechanic: 'Count matching paths; if zero, trigger deterministic abstention and route to Department SME node.',
    status: 'ABSTAIN',
  },
  {
    id: 'trap5',
    badge: '05 · DECISION PROVENANCE',
    title: 'Trace Exception DEC-901 to Slack & Signed Policy',
    query: 'Trace decision DEC-901 refund exception',
    cypher: `MATCH (dec:Decision {id: 'DEC-901'})\nMATCH (dec)-[:BASED_ON]->(pol:Policy)\nMATCH (dec)-[:EVIDENCED_BY]->(doc:Document)\nMATCH (dec)-[:APPROVED_BY]->(auth:Contact)\nRETURN dec, pol, doc, auth;`,
    outcome: 'Decision DEC-901 was an approved $4,500 credit granted under POL-OPS-SLA-2025. Fully evidenced by signed Slack thread DOC-SLACK-901 and authorized by VP Ops Elena Rostova.',
    principle: 'Enterprise audits require provenance chains, not isolated text snippets.',
    mechanic: 'Follow backward provenance edges from Decision to Policy, Authorizer, and Evidence nodes.',
    status: 'VERIFIED',
  },
];

export default function EnterpriseTrapLab({ onLaunchConsole }: { onLaunchConsole?: () => void }) {
  const [selectedTrap, setSelectedTrap] = useState<Scenario>(SCENARIOS[0]);

  // Interactive Simulation State
  const [pulseHop, setPulseHop] = useState(4);
  const [isPulsing, setIsPulsing] = useState(true);
  const [showSkillCard, setShowSkillCard] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);
  const [marcusApproved, setMarcusApproved] = useState(false);

  // Auto-pulse animation for Trap 1
  useEffect(() => {
    if (selectedTrap.id !== 'trap1' || !isPulsing) return;
    let current = 0;
    const interval = setInterval(() => {
      setPulseHop(current);
      if (current === 4) {
        setShowSkillCard(true);
      }
      current = (current + 1) % 5;
    }, 700);

    return () => clearInterval(interval);
  }, [selectedTrap.id, isPulsing]);

  const restartPulse = () => {
    setPulseHop(0);
    setShowSkillCard(false);
    setIsPulsing(true);
  };

  return (
    <section id="traps" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608]">
      {/* Background subtle radial aura */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[500px] bg-gradient-to-tr from-white/[0.02] via-sky-500/[0.03] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>INTERACTIVE SCENARIO LABORATORY</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The 5 Enterprise Traps That{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              Break Traditional AI
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Click any scenario to see how SetuBrain uses FalkorDB openCypher to traverse relationships, catch superseded policies, halt contradictions, and escalate to human experts.
          </p>
        </div>

        {/* Bento Grid: Left Column Cards / Right Column Live Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 5 Scenario Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-2.5">
            {SCENARIOS.map((scenario) => {
              const isSelected = selectedTrap.id === scenario.id;
              return (
                <div
                  key={scenario.id}
                  onClick={() => {
                    setSelectedTrap(scenario);
                    if (scenario.id === 'trap1') {
                      restartPulse();
                    }
                  }}
                  className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900/90 border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.5)] translate-x-1'
                      : 'bg-[#0c0c0e]/70 border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-semibold tracking-wider text-zinc-400">
                      {scenario.badge}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                        scenario.status === 'VERIFIED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : scenario.status === 'CONFLICT'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : scenario.status === 'STALE'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      ● {scenario.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-white font-sans">{scenario.title}</h4>
                  <p className="text-xs text-zinc-400 font-mono mt-1 line-clamp-1">
                    &ldquo;{scenario.query}&rdquo;
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Dynamic Spatial & Interactive Simulation Stage (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-2xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl space-y-6">
            {/* Top Bar of Active Scenario */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <span className="text-xs font-mono text-zinc-400 font-semibold tracking-wide flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE SIMULATION: {selectedTrap.badge}
                </span>
                <h3 className="text-lg font-bold text-white font-sans mt-0.5">
                  &ldquo;{selectedTrap.query}&rdquo;
                </h3>
              </div>
              {onLaunchConsole && (
                <button
                  onClick={onLaunchConsole}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 border border-white/[0.08] text-xs font-mono transition-all cursor-pointer"
                >
                  <span>Test in Live Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* DYNAMIC SIMULATION STAGE: CUSTOM FOR EACH TRAP */}
            <div className="relative rounded-xl bg-[#070709] border border-white/[0.08] p-5 overflow-hidden">
              {/* TRAP 1: Sequential 4-Hop Animated Pulse Pipeline */}
              {selectedTrap.id === 'trap1' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono text-zinc-400">SEQUENTIAL 4-HOP PULSE PIPELINE</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {pulseHop === 0 && '0.0 ms • Dept Entry'}
                        {pulseHop === 1 && '3.2 ms • Procedure Bound'}
                        {pulseHop === 2 && '7.8 ms • App Verified'}
                        {pulseHop === 3 && '11.4 ms • Policy Checked'}
                        {pulseHop === 4 && '14.3 ms • Approver Linked'}
                      </span>
                    </div>
                    <button
                      onClick={restartPulse}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-mono transition-all cursor-pointer border border-white/[0.06]"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Replay Pulse</span>
                    </button>
                  </div>

                  {/* 5 Floating Isometric Cards in Pipeline */}
                  <div className="grid grid-cols-5 gap-2 pt-2">
                    {[
                      { name: 'Finance', icon: Building2, tag: 'DEPT-FIN', hop: 0 },
                      { name: 'Proc-SaaS', icon: FileText, tag: 'PROC-SAAS-01', hop: 1 },
                      { name: 'Ramp', icon: CreditCard, tag: 'APP-RAMP', hop: 2 },
                      { name: 'POL-2026', icon: ShieldCheck, tag: 'POL-FIN-2026', hop: 3 },
                      { name: 'P. Sharma', icon: UserCheck, tag: 'VP Finance', hop: 4 },
                    ].map((step, idx) => {
                      const Icon = step.icon;
                      const isReached = pulseHop >= step.hop;
                      const isCurrent = pulseHop === step.hop;
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col items-center p-2.5 rounded-lg border text-center transition-all duration-300 ${
                            isCurrent
                              ? 'bg-zinc-800 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105'
                              : isReached
                              ? 'bg-zinc-900/80 border-white/[0.15] text-zinc-200'
                              : 'bg-zinc-950/60 border-white/[0.04] text-zinc-500 opacity-50'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-md flex items-center justify-center mb-1.5 ${
                            isCurrent
                              ? 'bg-emerald-500 text-zinc-950 font-bold'
                              : isReached
                              ? 'bg-zinc-800 text-emerald-400'
                              : 'bg-zinc-900 text-zinc-600'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-[11px] font-bold truncate max-w-full">{step.name}</span>
                          <span className="text-[9px] font-mono text-zinc-400 truncate max-w-full">{step.tag}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pulse Progress Bar */}
                  <div className="w-full bg-zinc-900 rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-1 transition-all duration-300"
                      style={{ width: `${((pulseHop + 1) / 5) * 100}%` }}
                    />
                  </div>

                  {/* Flip Open Live SKILL.md Card at Step 4 */}
                  {showSkillCard && (
                    <div className="p-3.5 rounded-lg bg-zinc-900/90 border border-emerald-500/30 text-xs font-mono space-y-2 animate-fade-in">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                        <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>COMPILED AGENT CAPABILITY (SKILL.md)</span>
                        </span>
                        <span className="text-[10px] text-zinc-400">Autonomously Callable</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed space-y-0.5">
                        <div className="text-zinc-400">---</div>
                        <div><span className="text-sky-300">name:</span> acme-saas-procurement-executor</div>
                        <div><span className="text-sky-300">governed_policy:</span> POL-FIN-2026 (Self-serve &lt; $500/mo)</div>
                        <div><span className="text-sky-300">target_app:</span> Ramp Virtual Cards (APP-RAMP)</div>
                        <div><span className="text-sky-300">approver:</span> Priya Sharma (VP Finance)</div>
                        <div className="text-zinc-400">---</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TRAP 2: Visual Supersession Split & Rejection Animation */}
              {selectedTrap.id === 'trap2' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>3D SUPERSESSION COMPARISON</span>
                    <span className="text-emerald-400">Terminal Version Filter Active</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Stale Policy Card (Rejected) */}
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/10 opacity-50 scale-95 transition-all text-left space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">
                          REJECTED (STALE)
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 line-through">POL-TRV-2024</span>
                      </div>
                      <h4 className="text-sm font-semibold text-zinc-400 line-through">Hotel Lodging Ceiling: $150/night</h4>
                      <p className="text-[11px] text-zinc-500 leading-relaxed">
                        Legacy travel cap superseded in Feb 2025. Vector RAG retrieves this with 0.89 cosine similarity and issues the wrong limit.
                      </p>
                      <div className="text-[10px] font-mono text-rose-400/80 pt-1">
                        ← [:SUPERSEDES] edge pruned by FalkorDB
                      </div>
                    </div>

                    {/* Active Authoritative Policy Card */}
                    <div className="p-4 rounded-xl border border-emerald-500/50 bg-zinc-900/90 shadow-[0_0_25px_rgba(16,185,129,0.15)] transition-all text-left space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                          ACTIVE AUTHORITATIVE
                        </span>
                        <span className="text-[11px] font-mono text-emerald-300 font-bold">POL-TRV-2025</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white">Hotel Lodging Ceiling: $250/night</h4>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        Governing policy effective 2025. Pre-authorized bookings via Navan corporate portal for Tier-1 metropolitan areas.
                      </p>
                      <div className="text-[10px] font-mono text-emerald-400 pt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified 100% deterministic answer</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TRAP 3: Collision Shockwave & Interactive "Resolve" Button */}
              {selectedTrap.id === 'trap3' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>CONTRADICTORY CHARTER COLLISION</span>
                    <span className={conflictResolved ? 'text-emerald-400' : 'text-rose-400'}>
                      {conflictResolved ? '● RESOLVED BY CURATOR' : '● EXECUTION HALTED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Security Policy */}
                    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/80 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs text-rose-400 font-mono font-bold">
                        <Lock className="w-3.5 h-3.5" />
                        <span>POL-SEC-101 (Security)</span>
                      </div>
                      <p className="text-xs text-zinc-200">
                        Zero-Day Endpoint Rule: Trigger cryptographic remote wipe within 0 hours of offboarding notification.
                      </p>
                    </div>

                    {/* HR Policy */}
                    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/80 space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-mono font-bold">
                        <Users className="w-3.5 h-3.5" />
                        <span>POL-HR-202 (People Ops)</span>
                      </div>
                      <p className="text-xs text-zinc-200">
                        7-Day Data Retention Grace Period: Allow departing employee personal data recovery window.
                      </p>
                    </div>
                  </div>

                  {/* Shockwave Banner & Resolution Button */}
                  <div className={`p-3.5 rounded-xl border text-xs font-mono space-y-2.5 transition-all ${
                    conflictResolved
                      ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                      : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {conflictResolved ? (
                          <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
                        )}
                        <span className="font-bold">
                          {conflictResolved
                            ? 'RESOLUTION COMPILED: POL-SEC-101 OVERRIDES WITH 24-HR QUARANTINE'
                            : '[:CONFLICTS_WITH] DETECTED: AUTONOMOUS HALT TRIGGERED'}
                        </span>
                      </div>
                      <button
                        onClick={() => setConflictResolved(!conflictResolved)}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer border ${
                          conflictResolved
                            ? 'bg-zinc-800 text-zinc-300 border-white/[0.1] hover:bg-zinc-700'
                            : 'bg-emerald-500 text-zinc-950 border-emerald-400 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        }`}
                      >
                        {conflictResolved ? 'Reset Conflict' : '⚡ Click to Resolve Conflict Live as Curator'}
                      </button>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {conflictResolved
                        ? 'Curator Agent established explicit [:SUPERSEDES] edge. Security immediate wipe takes precedence with 24-hour backup vault staging.'
                        : 'Vector RAG would generate an unsupported compromise. SetuBrain refuses to execute ambiguous actions and routes to human governance.'}
                    </p>
                  </div>
                </div>
              )}

              {/* TRAP 4: Missing Knowledge Scan & Marcus Vance Escalation */}
              {selectedTrap.id === 'trap4' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>ZERO-GUESSING UNINDEXED PROCEDURE ESCALATION</span>
                    <span className={marcusApproved ? 'text-emerald-400' : 'text-purple-400'}>
                      {marcusApproved ? '● SME SIGNED & UNLOCKED' : '● ABSTAINED & ESCALATED'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Missing Node Slot */}
                    <div className={`p-3.5 rounded-xl border transition-all text-left space-y-1.5 ${
                      marcusApproved
                        ? 'border-emerald-500/40 bg-emerald-950/10'
                        : 'border-dashed border-zinc-700 bg-zinc-900/40'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-zinc-400">PROCEDURE SLOT</span>
                        <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                          marcusApproved
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {marcusApproved ? 'PROC-ENG-GPU (PUBLISHED)' : '[UNINDEXED / MISSING]'}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-white">
                        {marcusApproved ? 'Run:ai Cluster Quota: 8x H100 (72h)' : 'GPU Cluster Quota Policy'}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {marcusApproved
                          ? 'Authoritatively verified by Engineering Lead. Pre-authorized compute provisioning live.'
                          : 'No matching path found under Department(Engineering). Hallucination blocked.'}
                      </p>
                    </div>

                    {/* Marcus Vance SME Card */}
                    <div className="p-3.5 rounded-xl border border-white/[0.08] bg-zinc-900/90 text-left space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-xs font-bold">
                            MV
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-white">Marcus Vance</h5>
                            <span className="text-[10px] font-mono text-zinc-400">Principal Infra Architect</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-purple-300">DEPT-ENG SME</span>
                      </div>

                      <button
                        onClick={() => setMarcusApproved(!marcusApproved)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                          marcusApproved
                            ? 'bg-zinc-800 text-zinc-300 border-white/[0.08] hover:bg-zinc-700'
                            : 'bg-white text-zinc-950 border-white hover:bg-zinc-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                        }`}
                      >
                        {marcusApproved ? 'Reset Quota Simulation' : '✓ Simulate Marcus Approving 8x H100 Quota'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TRAP 5: 3D Stacked Evidence Trace & Mini Slack Card */}
              {selectedTrap.id === 'trap5' && (
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                    <span>4-LAYER PROVENANCE AUDIT STACK</span>
                    <span className="text-emerald-400">Traceable to DOC-SLACK-901</span>
                  </div>

                  {/* 4 Stacked Evidence Cards */}
                  <div className="space-y-2">
                    {/* Layer 1: Decision */}
                    <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                          1
                        </span>
                        <span className="text-white font-semibold">Decision DEC-901</span>
                        <span className="text-emerald-400">$4,500 SLA Credit Exception</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">2026-03-14 10:45 AM</span>
                    </div>

                    {/* Layer 2: Governing SLA Policy */}
                    <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.08] flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 flex items-center justify-center text-[10px] font-bold">
                          2
                        </span>
                        <span className="text-white font-semibold">Governing Policy</span>
                        <span className="text-sky-300">POL-OPS-SLA-2025 (99.5% Uptime Guarantee)</span>
                      </div>
                      <span className="text-zinc-500 text-[10px]">Clause 4.2</span>
                    </div>

                    {/* Layer 3: Realistic Mini Slack UI Card */}
                    <div className="p-3.5 rounded-lg bg-[#0e0e11] border border-white/[0.1] text-xs font-sans space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-zinc-400 border-b border-white/[0.06] pb-1.5 font-mono">
                        <span className="flex items-center gap-1.5 text-zinc-300">
                          <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                          <span>#exec-approvals • Slack Evidence ID: DOC-SLACK-901</span>
                        </span>
                        <span className="text-emerald-400 font-bold">Verified Audit Proof</span>
                      </div>
                      <div className="flex items-start space-x-2.5">
                        <div className="w-6 h-6 rounded-md bg-sky-500/20 text-sky-300 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          ER
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-baseline space-x-2">
                            <span className="font-bold text-white text-xs">Elena Rostova</span>
                            <span className="text-[10px] text-zinc-500 font-mono">VP Operations • 10:14 AM</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                            &ldquo;Verified 42-minute API gateway latency spike exceeding 99.5% monthly SLA commitment. Incident INC-4412 confirmed. Authorizing standard 10% credit ($4,500) per POL-OPS-SLA-2025.&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Layer 4: Cryptographic Sign-Off */}
                    <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span>Sign-off: Elena Rostova &amp; Priya Sharma</span>
                      <span className="text-emerald-400">FalkorDB Provenance Hash: e8f2...99b1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* FalkorDB Cypher Query Snippet */}
            <div className="p-4 rounded-xl bg-[#070709] border border-white/[0.08] space-y-2 font-mono text-xs shadow-inner">
              <div className="text-[11px] text-zinc-400 flex items-center justify-between">
                <span className="text-zinc-300 font-semibold flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>FALKORDB OPENCYPHER QUERY:</span>
                </span>
                <span className="text-emerald-400 text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06]">
                  14.3 ms execution
                </span>
              </div>
              <div className="overflow-x-auto p-3 rounded-lg bg-black/60 border border-white/[0.04]">
                {renderHighlightedCypher(selectedTrap.cypher)}
              </div>
            </div>

            {/* Governed Outcome Box */}
            <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/[0.08] space-y-1.5">
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                <span>Authoritative Governed Outcome:</span>
              </span>
              <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed">
                {selectedTrap.outcome}
              </p>
            </div>

            {/* Governance Principle */}
            <div className="pt-2 flex items-start space-x-3 text-xs text-zinc-400 font-sans border-t border-white/[0.06]">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-zinc-200 font-medium">Why this matters: </strong>
                {selectedTrap.principle}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
