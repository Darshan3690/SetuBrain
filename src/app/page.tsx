'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  ShieldCheck,
  Building2,
  RefreshCw,
  GitBranch,
  FileCode2,
  AlertTriangle,
  UserCheck,
  Search,
  ExternalLink,
  ChevronRight,
  Database,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';

interface TraversalResult {
  tenantId: string;
  tenantName: string;
  query: string;
  trapType?: string;
  summary: string;
  authoritativeAnswer: string;
  graphTraversalPath: string[];
  nodesInvolved: any[];
  edgesInvolved: any[];
  supersededPolicies?: any[];
  conflictsDetected?: any[];
  abstentionNotice?: {
    isAbstaining: boolean;
    reason: string;
    routedSME?: {
      name: string;
      email: string;
      role: string;
      title: string;
    };
  };
  decisionProvenance?: {
    decisionId: string;
    title: string;
    rationale: string;
    policy: any;
    sourceDocument: any;
    authorizer: any;
  };
  compiledSkillMd?: string;
}

const TRAP_PRESETS = [
  {
    id: 'trap1',
    label: 'Trap 1: Multi-Hop & SKILL.md',
    desc: '4-Hop ownership & dynamic skill generation',
    query: 'How do I purchase software?',
    color: 'from-blue-600 to-indigo-600',
    badge: 'Verified 4-Hop'
  },
  {
    id: 'trap2',
    label: 'Trap 2: Superseded Policy',
    desc: 'Catches $250 new cap vs $150 legacy limit',
    query: 'What is our hotel reimbursement limit?',
    color: 'from-emerald-600 to-teal-600',
    badge: 'Supersession'
  },
  {
    id: 'trap3',
    label: 'Trap 3: Conflicting Policies',
    desc: '0-hour wipe vs 7-day HR grace period',
    query: 'How do we handle laptop wipe on offboarding?',
    color: 'from-amber-600 to-orange-600',
    badge: 'Curator Agent'
  },
  {
    id: 'trap4',
    label: 'Trap 4: Missing Knowledge',
    desc: 'Deterministic abstention & routing to Marcus Vance',
    query: 'What is my GPU cluster quota in Engineering?',
    color: 'from-purple-600 to-pink-600',
    badge: 'No Hallucinations'
  },
  {
    id: 'trap5',
    label: 'Trap 5: Decision Provenance',
    desc: 'Traces DEC-901 back to Slack & Policy',
    query: 'Trace decision DEC-901 refund exception',
    color: 'from-cyan-600 to-blue-600',
    badge: 'Audit Trail'
  }
];

export default function SetuBrainDashboard() {
  const [tenant, setTenant] = useState<'tenant_acme' | 'tenant_globex'>('tenant_acme');
  const [query, setQuery] = useState('How do I purchase software?');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<TraversalResult | null>(null);
  const [copiedSkill, setCopiedSkill] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        showToast('FalkorDB graphs seeded successfully for Acme & Globex!');
        handleRunQuery();
      } else {
        showToast(`Seed warning: ${data.error || 'Failed'}`);
      }
    } catch (e: any) {
      showToast(`Seed notice: ${e.message}`);
    } finally {
      setSeeding(false);
    }
  };

  const handleRunQuery = async (overrideQuery?: string, overrideTenant?: 'tenant_acme' | 'tenant_globex') => {
    const activeQuery = overrideQuery !== undefined ? overrideQuery : query;
    const activeTenant = overrideTenant !== undefined ? overrideTenant : tenant;

    setLoading(true);
    try {
      const res = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: activeTenant, query: activeQuery }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data);
      } else {
        showToast(`Query error: ${data.error}`);
      }
    } catch (e: any) {
      showToast(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial query on mount
    handleRunQuery();
  }, []);

  const handleCopySkill = () => {
    if (result?.compiledSkillMd) {
      navigator.clipboard.writeText(result.compiledSkillMd);
      setCopiedSkill(true);
      setTimeout(() => setCopiedSkill(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-indigo-400/40 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-indigo-200" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GitBranch className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-white">SetuBrain</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  सेतु • The Bridge
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  FalkorDB Powered
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The Graph-Powered Bridge Between Scattered Company Knowledge and Reliable AI Execution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Tenant Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
              <button
                onClick={() => {
                  setTenant('tenant_acme');
                  handleRunQuery(query, 'tenant_acme');
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tenant === 'tenant_acme'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Acme Corp</span>
              </button>
              <button
                onClick={() => {
                  setTenant('tenant_globex');
                  handleRunQuery(query, 'tenant_globex');
                }}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tenant === 'tenant_globex'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Globex Inc</span>
              </button>
            </div>

            {/* Seed Button */}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all hover:border-slate-600 shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-indigo-400' : 'text-slate-400'}`} />
              <span>{seeding ? 'Seeding...' : 'Reset Graph'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/60 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                <span>YC RFS: Company Brain Solution</span>
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                Deterministic Corporate Knowledge Traversal
              </h1>
              <p className="text-sm text-slate-300 max-w-2xl">
                Flat vector retrieval hallucinates on outdated policies and conflicting documents. SetuBrain uses 
                <span className="text-indigo-400 font-semibold"> FalkorDB multi-tenant graphs</span> to enforce strict supersession, provenance, and dynamic <code className="text-pink-300 bg-pink-950/50 px-1 py-0.5 rounded border border-pink-800/40 text-xs">SKILL.md</code> agent workflows.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Tenant Graph</div>
                <div className="text-sm font-bold text-white">
                  {tenant === 'tenant_acme' ? 'Acme Corp (tenant_acme)' : 'Globex Inc (tenant_globex)'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5 Traps Showcase Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Interactive Trap Demonstrations (1-Click Verification)</span>
            </h2>
            <span className="text-xs text-slate-500">Click any trap to query live graph paths</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {TRAP_PRESETS.map((preset) => {
              const isSelected = query === preset.query;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    setQuery(preset.query);
                    handleRunQuery(preset.query);
                  }}
                  className={`text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between space-y-2 relative group overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                      : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {preset.badge}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight mb-1">{preset.label}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2">{preset.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
              placeholder="Ask a corporate policy or procedure question..."
              className="w-full bg-slate-900/70 border border-slate-800 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-inner"
            />
          </div>
          <button
            onClick={() => handleRunQuery()}
            disabled={loading}
            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Query Graph</span>}
          </button>
        </div>

        {/* Results Panel */}
        {result && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Authoritative Answer & Specialized Trap Cards */}
            <div className="lg:col-span-7 space-y-6">
              {/* Primary Answer Card */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Authoritative Answer</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                    Tenant: {result.tenantName}
                  </span>
                </div>

                <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                  {result.authoritativeAnswer}
                </div>

                <div className="pt-2 text-xs text-slate-400 flex items-center space-x-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                  <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>{result.summary}</span>
                </div>
              </div>

              {/* TRAP 2: Superseded Policies Card */}
              {result.supersededPolicies && result.supersededPolicies.length > 0 && (
                <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Supersession Audit Trail (Legacy Policy Rejected)</span>
                  </div>
                  <div className="space-y-2">
                    {result.supersededPolicies.map((sp, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-amber-900/30 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-200">{sp.title}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/40 font-mono">
                            SUPERSEDED
                          </span>
                        </div>
                        <p className="text-slate-400">{sp.content}</p>
                        <div className="text-[11px] text-amber-400/90 font-mono pt-1">
                          ↳ Reason: {sp.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TRAP 3: Conflicts Card (Curator Agent) */}
              {result.conflictsDetected && result.conflictsDetected.length > 0 && (
                <div className="p-5 rounded-2xl bg-red-950/20 border border-red-800/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-red-400 text-xs font-bold uppercase tracking-wider">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Curator Agent Alert: Contradiction Flagged</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-900/50 text-red-200 font-mono">
                      Execution Halted
                    </span>
                  </div>
                  {result.conflictsDetected.map((conf, idx) => (
                    <div key={idx} className="bg-slate-900/90 p-4 rounded-xl border border-red-900/40 space-y-2 text-xs">
                      <div className="text-red-300 font-semibold">{conf.description}</div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <span className="text-indigo-400 block font-mono text-[10px]">Source A:</span>
                          {conf.policyA}
                        </div>
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                          <span className="text-indigo-400 block font-mono text-[10px]">Source B:</span>
                          {conf.policyB}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TRAP 4: Deterministic Abstention Card */}
              {result.abstentionNotice?.isAbstaining && (
                <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <UserCheck className="w-4 h-4" />
                    <span>Deterministic Abstention & Authoritative SME Routing</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    To prevent hallucinated policies, SetuBrain halted LLM speculation and routed this topic to the Department Subject Matter Expert:
                  </p>
                  {result.abstentionNotice.routedSME && (
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-purple-900/30 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{result.abstentionNotice.routedSME.name}</div>
                        <div className="text-[11px] text-purple-300">{result.abstentionNotice.routedSME.title}</div>
                      </div>
                      <a
                        href={`mailto:${result.abstentionNotice.routedSME.email}`}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                      >
                        Contact SME
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* TRAP 5: Decision Provenance Card */}
              {result.decisionProvenance && (
                <div className="p-5 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 space-y-3">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                    <Layers className="w-4 h-4" />
                    <span>Full Audit Trail & Decision Provenance</span>
                  </div>
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-cyan-900/30 space-y-2 text-xs">
                    <div className="text-cyan-200 font-semibold">{result.decisionProvenance.title}</div>
                    <p className="text-slate-300">{result.decisionProvenance.rationale}</p>
                    <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        Policy: {result.decisionProvenance.policy?.properties?.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        Evidence: {result.decisionProvenance.sourceDocument?.properties?.title}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800">
                        Approved By: {result.decisionProvenance.authorizer?.properties?.name}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Graph Traversal Path & Dynamic SKILL.md */}
            <div className="lg:col-span-5 space-y-6">
              {/* Graph Traversal Path */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <GitBranch className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Graph Traversal Path</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {result.graphTraversalPath.length} Hops
                  </span>
                </div>

                <div className="space-y-2.5">
                  {result.graphTraversalPath.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 text-xs">
                      <div className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800/60 flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="bg-slate-950/70 px-3 py-2 rounded-xl border border-slate-800/80 text-slate-200 font-mono text-[11px] flex-1 break-all">
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Compiled SKILL.md (Trap 1 Highlight) */}
              {result.compiledSkillMd && (
                <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/30 shadow-xl space-y-4 backdrop-blur-md relative">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <FileCode2 className="w-4 h-4 text-pink-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Compiled SKILL.md (Agent Ready)</span>
                    </div>
                    <button
                      onClick={handleCopySkill}
                      className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
                    >
                      {copiedSkill ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 font-mono text-[11px] text-slate-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {result.compiledSkillMd}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        SetuBrain • FalkorDB Multi-Tenant Graph Engine • Y Combinator Company Brain RFS Solution
      </footer>
    </div>
  );
}
