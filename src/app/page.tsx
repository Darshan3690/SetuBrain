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
  ChevronRight,
  Database,
  CheckCircle2,
  Copy,
  Check,
  Inbox,
  Award,
  Sparkles,
  History,
  XCircle,
  Terminal
} from 'lucide-react';
import GraphTopologyMap from '@/components/GraphTopologyMap';
import McpInspector from '@/components/McpInspector';

interface TraversalResult {
  tenantId: string;
  tenantName: string;
  query: string;
  trapType?: string;
  summary: string;
  authoritativeAnswer: string;
  graphTraversalPath: string[];
  nodesInvolved: unknown[];
  edgesInvolved: unknown[];
  supersededPolicies?: Array<{
    policyId?: string;
    title?: string;
    content?: string;
    supersededBy?: string;
    reason?: string;
  }>;
  conflictsDetected?: Array<{
    conflictId: string;
    policyA: string;
    policyB: string;
    severity: string;
    description: string;
  }>;
  curatorResolution?: {
    isResolved: boolean;
    precedence: string;
    resolvedBy: string;
  };
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
    policy?: { id?: string; properties?: { title?: string } };
    sourceDocument?: { id?: string; properties?: { title?: string } };
    authorizer?: { id?: string; properties?: { name?: string } };
  };
  compiledSkillMd?: string;
  latencyMs?: number;
  isLiveEngine?: boolean;
  executedCypher?: string;
}

interface DepartmentData {
  id: string;
  name: string;
  slug: string;
  sme: { name: string; email: string; role: string };
  apps: string[];
  proceduresCount: number;
  activePoliciesCount: number;
  openConflicts: number;
  unansweredEscalations: number;
  healthScore: number;
  status: 'HEALTHY' | 'ATTENTION' | 'CRITICAL';
}

interface BenchmarkItem {
  id: number;
  category: string;
  query: string;
  groundTruth: string;
  vectorRag: {
    status: string;
    returned: string;
    failureReason: string;
  };
  setuBrain: {
    status: string;
    returned: string;
    resolutionMechanic: string;
    latencyMs: number;
  };
}

interface EpisodeLog {
  id: string;
  sessionId: string;
  tenantId: string;
  query: string;
  status: string;
  trapType: string;
  cypherLatencyMs: number;
  timestamp: string;
  summary: string;
}

const TRAP_PRESETS = [
  {
    id: 'trap1',
    label: 'Trap 1: Multi-Hop & SKILL.md',
    desc: '4-Hop ownership & dynamic skill generation',
    query: 'How do I purchase software?',
    badge: 'Verified 4-Hop'
  },
  {
    id: 'trap2',
    label: 'Trap 2: Superseded Policy',
    desc: 'Catches $250 new cap vs $150 legacy limit',
    query: 'What is our hotel reimbursement limit?',
    badge: 'Supersession'
  },
  {
    id: 'trap3',
    label: 'Trap 3: Conflicting Policies',
    desc: '0-hour wipe vs 7-day HR grace period',
    query: 'How do we handle laptop wipe on offboarding?',
    badge: 'Curator Agent'
  },
  {
    id: 'trap4',
    label: 'Trap 4: Missing Knowledge',
    desc: 'Deterministic abstention & routing to Marcus Vance',
    query: 'What is my GPU cluster quota in Engineering?',
    badge: 'Closed Loop'
  },
  {
    id: 'trap5',
    label: 'Trap 5: Decision Provenance',
    desc: 'Traces DEC-901 back to Slack & Policy',
    query: 'Trace decision DEC-901 refund exception',
    badge: 'Audit Trail'
  }
];

export default function SetuBrainDashboard() {
  const [activeTab, setActiveTab] = useState<'engine' | 'inbox' | 'curator' | 'departments' | 'benchmark' | 'memory' | 'mcp'>('engine');
  const [tenant, setTenant] = useState<'tenant_acme' | 'tenant_globex'>('tenant_acme');
  const [query, setQuery] = useState('How do I purchase software?');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<TraversalResult | null>(null);
  const [copiedSkill, setCopiedSkill] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Phase 2 state
  const [isGpuApproved, setIsGpuApproved] = useState(false);
  const [curatorStatus, setCuratorStatus] = useState<'DETECTED' | 'RESOLVED'>('DETECTED');
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeLog[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const refreshAuxiliaryData = async () => {
    try {
      // Check expert status
      const expRes = await fetch('/api/expert/approve');
      const expData = await expRes.json();
      if (expData.ok) setIsGpuApproved(expData.isApproved);

      // Check curator status
      const curRes = await fetch('/api/curator');
      const curData = await curRes.json();
      if (curData.ok) setCuratorStatus(curData.conflictStatus);

      // Fetch departments
      const deptRes = await fetch(`/api/departments?tenantId=${tenant}`);
      const deptData = await deptRes.json();
      if (deptData.ok) setDepartments(deptData.departments);

      // Fetch episodes
      const epRes = await fetch(`/api/episodes?tenantId=${tenant}`);
      const epData = await epRes.json();
      if (epData.ok) setEpisodes(epData.episodes);
    } catch (e) {
      console.error('Aux refresh error:', e);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        showToast('FalkorDB graphs and state reset to initial 5-trap configuration!');
        setIsGpuApproved(false);
        setCuratorStatus('DETECTED');
        handleRunQuery();
        refreshAuxiliaryData();
      } else {
        showToast(`Seed warning: ${data.error || 'Failed'}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to seed';
      showToast(`Seed notice: ${msg}`);
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
        refreshAuxiliaryData();
      } else {
        showToast(`Query error: ${data.error}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network failure';
      showToast(`Network error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveGpuProcedure = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/expert/approve', { method: 'POST' });
      const data = await res.json();
      if (data.ok) {
        setIsGpuApproved(true);
        showToast('Marcus Vance published PROC-ENG-GPU live to FalkorDB!');
        refreshAuxiliaryData();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to approve';
      showToast(`Approve error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveConflict = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/curator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve' }),
      });
      const data = await res.json();
      if (data.ok) {
        setCuratorStatus('RESOLVED');
        showToast('Curator Agent resolved policy conflict: POL-SEC-101 supersedes POL-HR-202!');
        refreshAuxiliaryData();
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Curator action failed';
      showToast(`Curator error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      try {
        const [qRes, expRes, curRes, deptRes, epRes, bmRes] = await Promise.all([
          fetch('/api/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tenantId: 'tenant_acme', query: 'How do I purchase software?' }),
          }),
          fetch('/api/expert/approve'),
          fetch('/api/curator'),
          fetch('/api/departments?tenantId=tenant_acme'),
          fetch('/api/episodes?tenantId=tenant_acme'),
          fetch('/api/benchmark'),
        ]);

        const [qData, expData, curData, deptData, epData, bmData] = await Promise.all([
          qRes.json(),
          expRes.json(),
          curRes.json(),
          deptRes.json(),
          epRes.json(),
          bmRes.json(),
        ]);

        if (isMounted) {
          if (qData.ok) setResult(qData);
          if (expData.ok) setIsGpuApproved(expData.isApproved);
          if (curData.ok) setCuratorStatus(curData.conflictStatus);
          if (deptData.ok) setDepartments(deptData.departments);
          if (epData.ok) setEpisodes(epData.episodes);
          if (bmData.ok) setBenchmarks(bmData.benchmarks);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      }
    };

    initData();
    return () => {
      isMounted = false;
    };
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

      {/* Top Header */}
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
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  YC Company Brain RFS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The Graph-Powered Bridge Between Scattered Company Knowledge and Reliable AI Execution
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Cypher Engine Status Badge */}
            <div className="hidden sm:flex items-center">
              {result?.isLiveEngine ? (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono shadow-sm shadow-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">FalkorDB Live Cypher Engine</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <span className="font-semibold">Resilient Graph Engine</span>
                </div>
              )}
            </div>

            {/* Tenant Switcher */}
            <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
              <button
                onClick={() => {
                  setTenant('tenant_acme');
                  handleRunQuery(query, 'tenant_acme');
                  refreshAuxiliaryData();
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
                  refreshAuxiliaryData();
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
              <span>{seeding ? 'Resetting...' : 'Reset Graph'}</span>
            </button>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-6 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-t border-slate-800/40 pt-2">
          <button
            onClick={() => setActiveTab('engine')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'engine'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Knowledge Engine & 5 Traps</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('inbox');
              refreshAuxiliaryData();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'inbox'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Inbox className="w-3.5 h-3.5" />
            <span>SME Expert Inbox</span>
            {isGpuApproved ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/30">
                1 Pending
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('curator');
              refreshAuxiliaryData();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'curator'
                ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Curator Agent</span>
            {curatorStatus === 'RESOLVED' ? (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                Resolved
              </span>
            ) : (
              <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 text-[10px] font-mono border border-red-500/30">
                1 Conflict
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveTab('departments');
              refreshAuxiliaryData();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'departments'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Department Health</span>
          </button>

          <button
            onClick={() => setActiveTab('benchmark')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'benchmark'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>15-Query Benchmark</span>
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              100% vs 26.7%
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab('memory');
              refreshAuxiliaryData();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'memory'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Episodic Memory</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
              {episodes.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('mcp')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === 'mcp'
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>MCP Tool Inspector (Track 01)</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              JSON-RPC 2.0
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full space-y-8">
        {/* ====================================================================== */}
        {/* TAB 1: KNOWLEDGE ENGINE & 5 TRAPS                                      */}
        {/* ====================================================================== */}
        {activeTab === 'engine' && (
          <div className="space-y-8">
            {/* Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900/60 to-purple-950/60 border border-slate-800 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-medium">
                    <span>Deterministic Graph Traversal Engine</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    FalkorDB Multi-Tenant Company Brain
                  </h1>
                  <p className="text-sm text-slate-300 max-w-2xl">
                    Traverse multi-hop relationships, enforce explicit supersessions, halt contradictory policies, and compile verified <code className="text-pink-300 bg-pink-950/50 px-1 py-0.5 rounded border border-pink-800/40 text-xs">SKILL.md</code> agent workflows.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs font-mono uppercase tracking-wider text-slate-400">Active Tenant</div>
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
                  <span>Interactive Trap Demonstrations</span>
                </h2>
                <span className="text-xs text-slate-500">1-Click Verification of Enterprise Failure Modes</span>
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
                {/* Left Column: Authoritative Answer & Trap Resolvers */}
                <div className="lg:col-span-7 space-y-6">
                  {/* Primary Answer Card */}
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Authoritative Answer</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.latencyMs && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                            {result.latencyMs}ms
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                          Tenant: {result.tenantName}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed text-slate-200 whitespace-pre-wrap font-sans">
                      {result.authoritativeAnswer}
                    </div>

                    <div className="pt-2 text-xs text-slate-400 flex items-center space-x-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                      <Database className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{result.summary}</span>
                    </div>

                    {result.executedCypher && (
                      <div className="pt-3 border-t border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="flex items-center space-x-1.5 text-indigo-400 font-semibold">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Executed Parameterized Cypher</span>
                          </span>
                          <span className="text-slate-500 text-[10px]">
                            {result.isLiveEngine ? '⚡ FalkorDB Live Cypher Execution' : '🛡️ Resilient In-Memory Graph Query'}
                          </span>
                        </div>
                        <pre className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-indigo-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-inner">
                          {result.executedCypher}
                        </pre>
                      </div>
                    )}
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
                              <span className="text-indigo-400 block font-mono text-[10px]">Security Mandate:</span>
                              {conf.policyA}
                            </div>
                            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
                              <span className="text-indigo-400 block font-mono text-[10px]">HR Policy:</span>
                              {conf.policyB}
                            </div>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setActiveTab('curator');
                                refreshAuxiliaryData();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all"
                            >
                              Open Curator Resolution Panel →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* TRAP 3 RESOLUTION BADGE */}
                  {result.curatorResolution?.isResolved && (
                    <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Curator Resolution Enforced</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Zero-Trust Endpoint Wipe (POL-SEC-101) took precedence over HR grace period. Audited by <code className="text-emerald-300 font-mono">CuratorAgent</code>.
                      </p>
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
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setActiveTab('inbox');
                                refreshAuxiliaryData();
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium transition-all"
                            >
                              Open SME Inbox →
                            </button>
                          </div>
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

                {/* Right Column: Visual Graph Topology, Live Traversal Path & SKILL.md */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Interactive Visual Graph Topology Map */}
                  <GraphTopologyMap
                    tenantId={tenant}
                    trapType={result.trapType}
                    isGpuApproved={isGpuApproved}
                    curatorStatus={curatorStatus}
                  />

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

                  {/* Dynamic Compiled SKILL.md */}
                  {result.compiledSkillMd && (
                    <div className="p-6 rounded-3xl bg-slate-900/60 border border-indigo-500/30 shadow-xl space-y-4 backdrop-blur-md relative">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center space-x-2">
                          <FileCode2 className="w-4 h-4 text-pink-400" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Compiled SKILL.md</span>
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
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 2: SME EXPERT INBOX (CLOSED LEARNING LOOP)                        */}
        {/* ====================================================================== */}
        {activeTab === 'inbox' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-purple-900/30 shadow-xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
                    MV
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">SME Expert Inbox: Marcus Vance</h2>
                    <p className="text-xs text-slate-400">
                      Principal Infra Architect • Engineering Department • <code className="text-purple-300">marcus@acme.com</code>
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-mono border ${
                  isGpuApproved
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {isGpuApproved ? 'Procedure Published to Graph' : '1 Escalation Awaiting Approval'}
                </span>
              </div>
            </div>

            {/* Escalated Item Card */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                    ESCALATION #ESC-ENG-882
                  </span>
                  <h3 className="text-base font-bold text-white">
                    &ldquo;How do I request GPU cluster quota for a hackathon in Engineering?&rdquo;
                  </h3>
                  <p className="text-xs text-slate-400">
                    Escalated by SetuBrain Deterministic Abstention Handler (Trap 4) due to missing procedure in Department(DEPT-ENG).
                  </p>
                </div>
                <span className="text-xs text-slate-500 font-mono">Oct 15, 2026</span>
              </div>

              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="font-semibold text-purple-300">Drafted Corporate Policy & Procedure for Approval:</div>
                <div className="space-y-1 text-slate-300">
                  <div><strong>Procedure ID</strong>: <code>PROC-ENG-GPU</code> (&ldquo;GPU Cluster Quota & AI Compute Allocation Request&rdquo;)</div>
                  <div><strong>Governing Policy</strong>: <code>POL-ENG-GPU-2026</code> (Version 1.0, APPROVED)</div>
                  <div><strong>Primary Application</strong>: Run:ai Orchestrator (<code>https://runai.infra.acme.internal</code>)</div>
                  <div><strong>Approved Limit</strong>: Up to 8x NVIDIA H100 GPUs auto-approved for 72 hours for hackathons.</div>
                  <div><strong>Escalation Threshold</strong>: Requests exceeding 8 GPUs require Marcus Vance authorization.</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-400">
                  {isGpuApproved ? (
                    <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                      <Check className="w-4 h-4" />
                      <span>Live in FalkorDB (Cypher node active in tenant_acme)</span>
                    </span>
                  ) : (
                    <span>Click below to publish this procedure live into the knowledge graph.</span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {!isGpuApproved ? (
                    <button
                      onClick={handleApproveGpuProcedure}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Publish GPU Procedure to Graph as Marcus Vance</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab('engine');
                        setQuery('What is my GPU cluster quota in Engineering?');
                        handleRunQuery('What is my GPU cluster quota in Engineering?');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Test GPU Cluster Quota in Engine →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: CURATOR AGENT (CONFLICT RESOLUTION)                            */}
        {/* ====================================================================== */}
        {activeTab === 'curator' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-red-900/30 shadow-xl space-y-2 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-red-400" />
                    <span>Curator Agent • Contradiction Resolution Center</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Track 02 Agent Coordination: Continuous scan for semantic contradictions across procedures and policies.
                  </p>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full font-mono border ${
                  curatorStatus === 'RESOLVED'
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-red-500/10 text-red-300 border-red-500/20'
                }`}>
                  {curatorStatus === 'RESOLVED' ? 'All Conflicts Resolved' : '1 Active Conflict Detected'}
                </span>
              </div>
            </div>

            {/* Conflict Resolution Card */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                    CONFLICT #CONF-01 • HIGH RISK
                  </span>
                  <h3 className="text-base font-bold text-white">
                    Endpoint Offboarding: Zero-Trust Wipe vs. 7-Day HR Grace Period
                  </h3>
                  <p className="text-xs text-slate-400">
                    Governing Procedure: <code>PROC-SEC-03</code> (Remote Laptop Wipe & Contractor Offboarding)
                  </p>
                </div>
              </div>

              {/* Side-by-side Contradiction View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-red-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-300">Security Mandate (POL-SEC-101)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-400">0-Hour Wipe</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    &ldquo;Security requires immediate 0-hour remote cryptographic wipe via CrowdStrike Falcon the moment a contractor or employee offboarding ticket is filed.&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">Owner: Elena Rostova (Head of InfoSec)</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-red-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">HR Grace Period (POL-HR-202)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400">7-Day Wait</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    &ldquo;IT and Security must wait 7 calendar days after final employment date before wiping laptops so departing staff can retrieve personal tax documents.&rdquo;
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">Owner: David Kim (HR Compliance Lead)</div>
                </div>
              </div>

              {/* Resolution Action */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">
                  {curatorStatus === 'RESOLVED' ? (
                    <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>Resolution Active: POL-SEC-101 formally marked as superseding POL-HR-202</span>
                    </span>
                  ) : (
                    <span>Automated agent execution is currently halted on laptop wipe until resolved.</span>
                  )}
                </div>

                <div>
                  {curatorStatus === 'DETECTED' ? (
                    <button
                      onClick={handleResolveConflict}
                      disabled={loading}
                      className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all flex items-center space-x-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Resolve Conflict (Enforce Security Zero-Trust Precedence)</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveTab('engine');
                        setQuery('How do we handle laptop wipe on offboarding?');
                        handleRunQuery('How do we handle laptop wipe on offboarding?');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30 transition-all flex items-center space-x-2"
                    >
                      <span>Test Resolved Laptop Wipe in Engine →</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 4: DEPARTMENT HEALTH SCORES                                       */}
        {/* ====================================================================== */}
        {activeTab === 'departments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Department Knowledge Topology & Health</h2>
                <p className="text-xs text-slate-400">
                  Live governance metrics based on open policy contradictions, SME ownership, and unaddressed escalations.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Tenant: {tenant === 'tenant_acme' ? 'Acme Corp' : 'Globex Inc'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4 backdrop-blur-md flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400">{dept.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-mono border ${
                        dept.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : dept.status === 'ATTENTION'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {dept.healthScore}% Health
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">{dept.name}</h3>
                      <div className="text-xs text-slate-400 pt-0.5">
                        Authoritative SME: <span className="text-slate-200 font-semibold">{dept.sme.name}</span> ({dept.sme.role})
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">{dept.sme.email}</div>
                    </div>

                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Owned Applications:</span>
                        <span className="font-semibold text-white">{dept.apps.length > 0 ? dept.apps.join(', ') : 'None'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Active Procedures:</span>
                        <span className="font-semibold text-white">{dept.proceduresCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Open Conflicts:</span>
                        <span className={`font-semibold ${dept.openConflicts > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                          {dept.openConflicts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      dept.status === 'HEALTHY' ? 'text-emerald-400' : dept.status === 'ATTENTION' ? 'text-amber-400' : 'text-red-400'
                    }`}>
                      {dept.status === 'HEALTHY' ? 'Fully Verified' : dept.status === 'ATTENTION' ? 'Pending SME Publish' : 'Policy Dispute Open'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 5: 15-QUESTION BENCHMARK RUNNER                                   */}
        {/* ====================================================================== */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>Gold Standard 15-Query Enterprise Benchmark</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Direct side-by-side comparison across all 5 failure modes: Naive Vector RAG vs. SetuBrain FalkorDB.
                  </p>
                </div>
              </div>

              {/* KPI Scorecards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-red-950/20 border border-red-900/40 text-center space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-red-400 font-mono font-bold">Naive Vector RAG</div>
                  <div className="text-3xl font-black text-red-400">26.7%</div>
                  <div className="text-[11px] text-slate-400">4 / 15 Passed (Hallucinations on traps)</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-center space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono font-bold">SetuBrain FalkorDB</div>
                  <div className="text-3xl font-black text-emerald-400">100.0%</div>
                  <div className="text-[11px] text-slate-400">15 / 15 Passed (Deterministic accuracy)</div>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-900/40 text-center space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-indigo-400 font-mono font-bold">Avg Cypher Latency</div>
                  <div className="text-3xl font-black text-indigo-300">14.3 ms</div>
                  <div className="text-[11px] text-slate-400">Native sub-millisecond in-memory graph</div>
                </div>
              </div>
            </div>

            {/* Benchmark Table */}
            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                      <th className="pb-3 w-10">#</th>
                      <th className="pb-3 w-40">Category</th>
                      <th className="pb-3">Query & Ground Truth</th>
                      <th className="pb-3 w-64">Vector RAG Baseline</th>
                      <th className="pb-3 w-64">SetuBrain FalkorDB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {benchmarks.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-800/30 transition-all">
                        <td className="py-3.5 font-mono text-slate-500">{item.id}</td>
                        <td className="py-3.5 font-mono text-slate-400 text-[11px]">{item.category}</td>
                        <td className="py-3.5 pr-4 space-y-1">
                          <div className="font-bold text-white text-xs">{item.query}</div>
                          <div className="text-[11px] text-slate-400">
                            <span className="text-indigo-400 font-semibold font-mono">Truth:</span> {item.groundTruth}
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 space-y-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-800/40 text-[10px] font-mono font-bold">
                            <XCircle className="w-3 h-3" />
                            <span>FAIL (0/1)</span>
                          </span>
                          <div className="text-[11px] text-slate-300">{item.vectorRag.returned}</div>
                          <div className="text-[10px] text-red-400/80 italic">{item.vectorRag.failureReason}</div>
                        </td>
                        <td className="py-3.5 space-y-1">
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>PASS (1/1)</span>
                          </span>
                          <div className="text-[11px] text-slate-200">{item.setuBrain.returned}</div>
                          <div className="text-[10px] text-emerald-400/80 font-mono">↳ {item.setuBrain.resolutionMechanic}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 6: AGENT EPISODIC MEMORY TRAIL                                    */}
        {/* ====================================================================== */}
        {activeTab === 'memory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <span>Agent Episodic Session Memory Feed</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Persistent multi-turn episode logs stored across user query sessions in the Company Brain.
                </p>
              </div>
              <button
                onClick={refreshAuxiliaryData}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
              {episodes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No episodes recorded yet. Execute queries in the Knowledge Engine tab to log agent interactions!
                </div>
              ) : (
                episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-4 text-xs hover:border-slate-700 transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-indigo-400 text-[11px] font-bold">{ep.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-mono">
                          Tenant: {ep.tenantId}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          ep.status === 'SUCCESS' || ep.status === 'SME_PUBLISHED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : ep.status === 'CONFLICT_HALTED'
                            ? 'bg-red-950 text-red-400 border border-red-800/40'
                            : 'bg-purple-950 text-purple-400 border border-purple-800/40'
                        }`}>
                          {ep.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">{ep.cypherLatencyMs}ms</span>
                      </div>
                      <div className="font-semibold text-white">{ep.query}</div>
                      <div className="text-slate-400 text-[11px]">{ep.summary}</div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono whitespace-nowrap">
                      {new Date(ep.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ====================================================================== */}
        {/* TAB 7: MCP TOOL INSPECTOR (TRACK 01)                                   */}
        {/* ====================================================================== */}
        {activeTab === 'mcp' && <McpInspector />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        SetuBrain • FalkorDB Multi-Tenant Graph Engine • Y Combinator Company Brain RFS Solution
      </footer>
    </div>
  );
}
