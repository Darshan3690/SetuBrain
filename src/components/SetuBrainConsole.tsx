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
  Database,
  CheckCircle2,
  Copy,
  Check,
  Inbox,
  Award,
  Sparkles,
  History,
  XCircle,
  Terminal,
  Globe,
  Crown,
  MessageSquare,
  Send,
  PlusCircle,
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import GraphTopologyMap from '@/components/GraphTopologyMap';
import SpatialGraph3D from '@/components/SpatialGraph3D';
import McpInspector from '@/components/McpInspector';
import DashboardRoleBanner from '@/components/DashboardRoleBanner';
import SetuLogo from '@/components/SetuLogo';
import { useTheme } from '@/components/ThemeProvider';
import {
  useUser,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';

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
    trapNumber: 'TRAP 1',
    label: 'Scenario 1: Software Purchase ($40 Cursor)',
    desc: 'New hire needs software. Verified 4-hop chain: Ramp -> $500 cap -> Priya Sharma',
    query: 'How do I purchase software?',
    badge: '01 · MULTI-HOP'
  },
  {
    id: 'trap2',
    trapNumber: 'TRAP 2',
    label: 'Scenario 2: Outdated PDF Shield',
    desc: 'Blocks stale $150 Notion PDF; returns active 2026 $250 limit via Navan',
    query: 'What is our hotel reimbursement limit?',
    badge: '02 · SUPERSEDED'
  },
  {
    id: 'trap3',
    trapNumber: 'TRAP 3',
    label: 'Scenario 3: Zero-Trust Security Clash',
    desc: 'Catches 0-hr wipe vs 7-day HR rule before AI makes costly mistake',
    query: 'How do we handle laptop wipe on offboarding?',
    badge: '03 · CONFLICT HALT'
  },
  {
    id: 'trap4',
    trapNumber: 'TRAP 4',
    label: 'Scenario 4: Missing Rule (No Guessing!)',
    desc: 'Refuses to hallucinate GPU form; routes to Marcus Vance (Infra Lead)',
    query: 'What is my GPU cluster quota in Engineering?',
    badge: '04 · SME ROUTING'
  },
  {
    id: 'trap5',
    trapNumber: 'TRAP 5',
    label: 'Scenario 5: Audit & Slack Provenance',
    desc: 'Traces DEC-901 refund to #ops-outage Slack thread and VP sign-off',
    query: 'Trace decision DEC-901 refund exception',
    badge: '05 · AUDIT TRAIL'
  }
];

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

function renderHighlightedHop(hop: string) {
  const parts = hop.split(/(\([^)]+\)|-\[[^\]]+\]->|<-?\[[^\]]+\]-?|-+>|<+-)/g);
  return (
    <span className="font-mono text-xs leading-relaxed">
      {parts.map((part, pIdx) => {
        if (part.startsWith('(') && part.endsWith(')')) {
          return <span key={pIdx} className="text-sky-300 font-semibold">{part}</span>;
        }
        if (part.includes('[') || part.includes('->') || part.includes('<-')) {
          return <span key={pIdx} className="text-emerald-400 font-semibold mx-1">{part}</span>;
        }
        return <span key={pIdx} className="text-slate-200">{part}</span>;
      })}
    </span>
  );
}

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  EMPLOYEE: 'Employee',
  DEPARTMENT_SME: 'SME',
  KNOWLEDGE_MANAGER: 'KM',
  COMPANY_ADMINISTRATOR: 'Admin',
};

const TAB_PERMISSIONS: Record<string, string[]> = {
  engine: ['EMPLOYEE', 'DEPARTMENT_SME', 'KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'],
  departments: ['EMPLOYEE', 'DEPARTMENT_SME', 'KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'],
  memory: ['EMPLOYEE', 'DEPARTMENT_SME', 'KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'],
  inbox: ['DEPARTMENT_SME', 'COMPANY_ADMINISTRATOR'],
  curator: ['KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'],
  benchmark: ['KNOWLEDGE_MANAGER', 'COMPANY_ADMINISTRATOR'],
  mcp: ['COMPANY_ADMINISTRATOR'],
  admin: ['COMPANY_ADMINISTRATOR'],
};

function RbacGuard({
  allowedRoles,
  currentRole,
  moduleName,
  children,
}: {
  allowedRoles: string[];
  currentRole: string;
  moduleName: string;
  children: React.ReactNode;
}) {
  if (!allowedRoles.includes(currentRole)) {
    const roleLabel = ROLE_DISPLAY_NAMES[currentRole] || currentRole;
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl bg-[#111114] border border-white/[0.08] shadow-2xl p-8 space-y-4 my-6">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
          <Lock className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-zinc-200">Access Restricted</h2>
          <p className="text-xs text-zinc-400 max-w-sm">
            Your current role (<span className="font-mono text-zinc-200 font-semibold">{roleLabel}</span>) does not have permission to view {moduleName}.
          </p>
        </div>
        <div className="pt-2">
          <span className="text-[11px] text-zinc-500 font-mono bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/[0.06]">
            Required Role: {allowedRoles.map((r) => ROLE_DISPLAY_NAMES[r] || r).join(' or ')}
          </span>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}

export default function SetuBrainConsole({ onBackToLanding }: { onBackToLanding?: () => void }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoaded, isSignedIn } = useUser();
  const [activeRoleOverride, setActiveRoleOverride] = useState<string | null>(null);
  const activeRole = activeRoleOverride || (user?.publicMetadata?.role as string) || 'EMPLOYEE';
  const [activeTab, setActiveTab] = useState<'engine' | 'inbox' | 'curator' | 'departments' | 'benchmark' | 'memory' | 'mcp' | 'admin'>('engine');

  // Auto-switch to engine if activeTab is not allowed for the new role
  useEffect(() => {
    const allowed = TAB_PERMISSIONS[activeTab]?.includes(activeRole);
    if (!allowed) {
      setActiveTab('engine');
    }
  }, [activeRole, activeTab]);
  const [tenant, setTenant] = useState<'tenant_acme' | 'tenant_globex'>('tenant_acme');
  const [query, setQuery] = useState('How do I purchase software?');
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<TraversalResult | null>(null);
  const [copiedSkill, setCopiedSkill] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [graphViewMode, setGraphViewMode] = useState<'3d' | '2d'>('3d');

  // Phase 2 state
  const [isGpuApproved, setIsGpuApproved] = useState(false);
  const [curatorStatus, setCuratorStatus] = useState<'DETECTED' | 'RESOLVED'>('DETECTED');
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkItem[]>([]);
  const [episodes, setEpisodes] = useState<EpisodeLog[]>([]);

  // Phase 3: Owner & Admin Console state
  const [customTitle, setCustomTitle] = useState('Remote Work & Home Office Monitor Stipend');
  const [customDept, setCustomDept] = useState('Finance');
  const [customApp, setCustomApp] = useState('Navan');
  const [customLimit, setCustomLimit] = useState('$300/year');
  const [customContent, setCustomContent] = useState('Employees can expense up to $300/year for home office monitors, keyboards, and ergonomic gear via Navan. Auto-approved by Priya Sharma.');
  const [customOwner, setCustomOwner] = useState('Priya Sharma');
  const [customOwnerEmail, setCustomOwnerEmail] = useState('priya@acme.com');
  const [publishingPolicy, setPublishingPolicy] = useState(false);
  const [importingDecision, setImportingDecision] = useState<string | null>(null);

  const handlePublishCustomPolicy = async () => {
    setPublishingPolicy(true);
    try {
      const res = await fetch('/api/policy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant,
          title: customTitle,
          department: customDept,
          app: customApp,
          maxLimit: customLimit,
          content: customContent,
          ownerName: customOwner,
          ownerEmail: customOwnerEmail,
        })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Policy "${customTitle}" published live to ${tenant} graph! Now search "Remote work stipend"`);
        refreshAuxiliaryData();
      } else {
        showToast(`Error: ${data.error || 'Failed to publish'}`);
      }
    } catch (err: unknown) {
      showToast(`Error publishing policy: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPublishingPolicy(false);
    }
  };

  const handleImportDecision = async (decId: string, title: string, rationale: string, sourceUrl: string, sourcePlatform: 'Slack' | 'Discord') => {
    setImportingDecision(decId);
    try {
      const res = await fetch('/api/policy/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'import_decision',
          tenantId: tenant,
          decisionId: decId,
          title,
          rationale,
          sourceUrl,
          sourcePlatform,
          approverName: 'Priya Sharma',
        })
      });
      const data = await res.json();
      if (data.ok) {
        showToast(`Decision "${decId}" imported from ${sourcePlatform} with audit link!`);
        refreshAuxiliaryData();
      } else {
        showToast(`Error: ${data.error || 'Failed to import'}`);
      }
    } catch (err: unknown) {
      showToast(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setImportingDecision(null);
    }
  };

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
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 dark:selection:text-white transition-colors">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-zinc-200 dark:border-white/20 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header — Clean 56px Enterprise Bar */}
      <header className="border-b border-zinc-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-xl sticky top-0 z-40 transition-colors">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          {/* Left: Brand + Workspace Breadcrumb */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#111114] border border-white/[0.1] flex items-center justify-center shadow-lg shadow-sky-500/10 p-1 shrink-0">
              <SetuLogo size={20} />
            </div>
            <span className="text-base font-bold tracking-tight text-white shrink-0">SetuBrain</span>
            <span className="text-zinc-600 text-sm select-none hidden sm:inline">/</span>
            <span className="text-sm text-zinc-400 font-medium hidden sm:inline truncate">Workspace</span>
            {onBackToLanding && (
              <button
                onClick={onBackToLanding}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors ml-1 cursor-pointer shrink-0"
              >
                ← Landing
              </button>
            )}
          </div>

          {/* Right: Status + Tenant + Reset + Auth */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Engine Status Dot */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs text-zinc-400">
              <span className={`w-2 h-2 rounded-full ${result?.isLiveEngine ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/40' : 'bg-blue-400'}`} />
              <span className="font-medium">{result?.isLiveEngine ? 'Live Engine' : 'Resilient'}</span>
            </div>

            {/* Clean Segmented Tenant Switcher */}
            <div className="flex items-center bg-zinc-900/80 p-0.5 rounded-lg border border-white/[0.08]">
              <button
                onClick={() => {
                  setTenant('tenant_acme');
                  handleRunQuery(query, 'tenant_acme');
                  refreshAuxiliaryData();
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  tenant === 'tenant_acme'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Acme Corp
              </button>
              <button
                onClick={() => {
                  setTenant('tenant_globex');
                  handleRunQuery(query, 'tenant_globex');
                  refreshAuxiliaryData();
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  tenant === 'tenant_globex'
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Globex Inc
              </button>
            </div>

            {/* Theme Toggle (Dark/Light) */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Dark and Light Mode"
              className="p-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.08] text-zinc-300 hover:text-white transition-all cursor-pointer"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-sky-400" />
              )}
            </button>

            {/* Reset */}
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-white/[0.08] text-xs font-medium text-zinc-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${seeding ? 'animate-spin text-zinc-400' : 'text-zinc-500'}`} />
              <span className="hidden sm:inline">{seeding ? 'Resetting…' : 'Reset'}</span>
            </button>

            {/* Auth Controls */}
            <div className="flex items-center space-x-2 pl-2 border-l border-white/[0.08]">
              {!isSignedIn ? (
                <>
                  <SignInButton mode="modal">
                    <button className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-white transition-colors cursor-pointer">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-sm transition-all cursor-pointer">
                      Get Started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <UserButton />
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation — Linear/Vercel-style underline tabs */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto pb-0 pt-0 scrollbar-none border-t border-white/[0.06] w-full flex-nowrap">
          {[
            { key: 'engine' as const, icon: <GitBranch className="w-3.5 h-3.5" />, label: 'Knowledge Engine', allowedRoles: TAB_PERMISSIONS.engine },
            { key: 'inbox' as const, icon: <Inbox className="w-3.5 h-3.5" />, label: 'SME Inbox', badge: !isGpuApproved ? '1' : undefined, badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30', allowedRoles: TAB_PERMISSIONS.inbox },
            { key: 'curator' as const, icon: <ShieldCheck className="w-3.5 h-3.5" />, label: 'Curator Agent', badge: curatorStatus !== 'RESOLVED' ? '!' : undefined, badgeColor: curatorStatus !== 'RESOLVED' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', allowedRoles: TAB_PERMISSIONS.curator },
            { key: 'departments' as const, icon: <Building2 className="w-3.5 h-3.5" />, label: 'Departments', allowedRoles: TAB_PERMISSIONS.departments },
            { key: 'benchmark' as const, icon: <Award className="w-3.5 h-3.5" />, label: 'Benchmark', badge: '100%', badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30', allowedRoles: TAB_PERMISSIONS.benchmark },
            { key: 'memory' as const, icon: <History className="w-3.5 h-3.5" />, label: 'Memory Log', badge: episodes.length > 0 ? String(episodes.length) : undefined, badgeColor: 'bg-zinc-800 text-zinc-400 border border-white/[0.06]', allowedRoles: TAB_PERMISSIONS.memory },
            { key: 'mcp' as const, icon: <Terminal className="w-3.5 h-3.5" />, label: 'MCP Server', allowedRoles: TAB_PERMISSIONS.mcp },
            { key: 'admin' as const, icon: <Crown className="w-3.5 h-3.5" />, label: 'Admin Console', allowedRoles: TAB_PERMISSIONS.admin },
          ]
            .filter((tab) => tab.allowedRoles.includes(activeRole))
            .map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                if (['inbox', 'curator', 'departments', 'memory', 'admin'].includes(tab.key)) refreshAuxiliaryData();
              }}
              className={`shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium transition-all cursor-pointer border-b-2 ${
                activeTab === tab.key
                  ? 'border-white text-white bg-white/[0.04]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:border-white/[0.1]'
              }`}
            >
              <span className={activeTab === tab.key ? 'text-white' : 'text-zinc-500'}>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold flex items-center justify-center ${
                  tab.badgeColor || 'bg-amber-500/20 text-amber-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 py-5 flex-1 w-full space-y-5">
        {/* Compact Workspace Context Bar */}
        <DashboardRoleBanner
          currentRole={activeRole}
          onRoleChange={(newRole) => setActiveRoleOverride(newRole)}
        />
        {/* ====================================================================== */}
        {/* TAB 1: KNOWLEDGE ENGINE & 5 TRAPS                                      */}
        {/* ====================================================================== */}
        {activeTab === 'engine' && (
          <div className="space-y-5">
            {/* Command Search Bar - Placed First Above Fold */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRunQuery()}
                  placeholder="Ask a corporate policy or procedure question (e.g. 'Can I expense a monitor?' or 'Hotel limit')..."
                  className="w-full bg-[#111114] border border-white/[0.08] focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 shadow-inner transition-colors"
                />
              </div>
              <button
                onClick={() => handleRunQuery()}
                disabled={loading}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-white text-zinc-950 font-semibold rounded-xl text-sm shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-zinc-900" /> : <span>Query Graph</span>}
              </button>
            </div>

            {/* Quick Questions Starter Pills for Employees */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-500 shrink-0">Quick Starters:</span>
              {[
                { label: '💳 Expense Monitor ($350 Cap)', q: 'Can I expense an ergonomic monitor?' },
                { label: '✈️ Hotel Rate Shield ($250)', q: 'What is our hotel reimbursement limit?' },
                { label: '💻 Software Purchase ($40 Cursor)', q: 'How do I purchase software?' },
                { label: '⚡ Request GPU Quota (SME Route)', q: 'What is my GPU cluster quota in Engineering?' },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => {
                    setQuery(pill.q);
                    handleRunQuery(pill.q);
                  }}
                  className="shrink-0 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#111114] hover:bg-zinc-800 border border-white/[0.08] hover:border-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer font-medium shadow-sm"
                >
                  <span>{pill.label}</span>
                </button>
              ))}
            </div>

            {/* Active Employee Routed Escalations Tracker */}
            <div className="p-3.5 rounded-xl bg-[#111114] border border-white/[0.08] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                <div>
                  <span className="font-semibold text-white">My Routed Escalation #ESC-ENG-882</span>
                  <span className="text-zinc-400 ml-2">Topic: GPU Cluster Quota (Engineering)</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-zinc-400">Assigned SME: <strong className="text-zinc-200">Marcus Vance</strong></span>
                <span className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold border ${
                  isGpuApproved
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                }`}>
                  {isGpuApproved ? '✓ APPROVED & IN GRAPH' : '⏳ PENDING SME SIGN-OFF'}
                </span>
              </div>
            </div>

            {/* Real Enterprise Scenarios 1-Click Strip */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Real Enterprise Scenarios (1-Click Demo)</span>
                </h2>
                <span className="text-xs text-zinc-500 hidden sm:inline">Plain-English Stories with FalkorDB Graph & Trap Proof</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-2.5">
                {TRAP_PRESETS.map((preset) => {
                  const isSelected = query === preset.query;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setQuery(preset.query);
                        handleRunQuery(preset.query);
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 relative group overflow-hidden cursor-pointer ${
                        isSelected
                          ? 'bg-[#16161a] border-white/30 ring-1 ring-white/20 shadow-md'
                          : 'bg-[#111114] hover:bg-[#16161a] border-white/[0.07] hover:border-white/[0.15]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[10px] font-mono font-medium tracking-wider px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-white/[0.08]">
                          {preset.badge}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white leading-tight mb-1">{preset.label}</div>
                        <div className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{preset.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Panel */}
            {result && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Authoritative Answer & Trap Resolvers */}
                <div className="lg:col-span-7 space-y-5">
                  {/* Primary Answer Card */}
                  <div className="p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/[0.07]">
                      <div className="flex flex-wrap items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Authoritative Answer</span>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-[11px] font-medium">
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Verified Freshness: Valid through Oct 2027</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {result.latencyMs && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono border border-white/[0.06]">
                            {result.latencyMs}ms
                          </span>
                        )}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono border border-white/[0.06]">
                          Tenant: {result.tenantName}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm leading-relaxed text-zinc-200 whitespace-pre-wrap font-sans">
                      {result.authoritativeAnswer}
                    </div>

                    <div className="pt-2 text-xs text-zinc-400 flex items-center space-x-2 bg-zinc-950/60 p-3 rounded-lg border border-white/[0.06]">
                      <Database className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{result.summary}</span>
                    </div>

                    {result.executedCypher && (
                      <div className="pt-3 border-t border-white/[0.07] space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1.5 pr-2 border-r border-zinc-700/60">
                              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block shadow-sm shadow-red-500/30" />
                              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block shadow-sm shadow-amber-500/30" />
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block shadow-sm shadow-emerald-500/30" />
                            </div>
                            <span className="flex items-center space-x-1.5 text-zinc-300 font-semibold">
                              <Terminal className="w-3.5 h-3.5 text-sky-400" />
                              <span>Executed Parameterized Cypher</span>
                            </span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-900 border border-white/[0.06] text-zinc-400 font-mono">
                            {result.isLiveEngine ? '⚡ FalkorDB Live Cypher Execution' : '🛡️ Resilient In-Memory Graph Query'}
                          </span>
                        </div>
                        {/* High-Contrast Syntax Highlighted Box */}
                        <div className="bg-[#0c0c0e] p-4 rounded-xl border border-white/[0.08] overflow-x-auto shadow-inner text-xs">
                          {renderHighlightedCypher(result.executedCypher)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TRAP 2: Superseded Policies Card */}
                  {result.supersededPolicies && result.supersededPolicies.length > 0 && (
                    <div className="p-5 rounded-xl bg-amber-950/20 border border-amber-800/30 space-y-3">
                      <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Supersession Audit Trail (Legacy Policy Rejected)</span>
                      </div>
                      <div className="space-y-2">
                        {result.supersededPolicies.map((sp, idx) => (
                          <div key={idx} className="bg-zinc-900/80 p-3 rounded-lg border border-amber-900/30 text-xs space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-amber-200">{sp.title}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-950/60 text-rose-300 border border-rose-800/40 font-mono">
                                SUPERSEDED
                              </span>
                            </div>
                            <p className="text-zinc-400">{sp.content}</p>
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
                    <div className="p-5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-rose-400 text-xs font-semibold uppercase tracking-wider">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Curator Agent Alert: Contradiction Flagged</span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-900/50 text-rose-200 font-mono">
                          Execution Halted
                        </span>
                      </div>
                      {result.conflictsDetected.map((conf, idx) => (
                        <div key={idx} className="bg-zinc-900/90 p-4 rounded-lg border border-rose-900/40 space-y-2 text-xs">
                          <div className="text-rose-300 font-semibold">{conf.description}</div>
                          <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                            <div className="p-2 rounded bg-zinc-950 border border-white/[0.06] text-zinc-300">
                              <span className="text-zinc-400 block font-mono text-[10px]">Security Mandate:</span>
                              {conf.policyA}
                            </div>
                            <div className="p-2 rounded bg-zinc-950 border border-white/[0.06] text-zinc-300">
                              <span className="text-zinc-400 block font-mono text-[10px]">HR Policy:</span>
                              {conf.policyB}
                            </div>
                          </div>
                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setActiveTab('curator');
                                refreshAuxiliaryData();
                              }}
                              className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
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
                    <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-800/30 space-y-2">
                      <div className="flex items-center space-x-2 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Curator Resolution Enforced</span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        Zero-Trust Endpoint Wipe (POL-SEC-101) took precedence over HR grace period. Audited by <code className="text-emerald-300 font-mono">CuratorAgent</code>.
                      </p>
                    </div>
                  )}

                  {/* TRAP 4: Deterministic Abstention Card */}
                  {result.abstentionNotice?.isAbstaining && (
                    <div className="p-5 rounded-xl bg-purple-950/20 border border-purple-800/30 space-y-3">
                      <div className="flex items-center space-x-2 text-purple-400 text-xs font-semibold uppercase tracking-wider">
                        <UserCheck className="w-4 h-4" />
                        <span>Deterministic Abstention & Authoritative SME Routing</span>
                      </div>
                      <p className="text-xs text-zinc-300">
                        To prevent hallucinated policies, SetuBrain halted LLM speculation and routed this topic to the Department Subject Matter Expert:
                      </p>
                      {result.abstentionNotice.routedSME && (
                        <div className="bg-zinc-900/80 p-3.5 rounded-lg border border-purple-900/30 flex items-center justify-between">
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
                              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
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
                    <div className="p-5 rounded-xl bg-cyan-950/20 border border-cyan-800/30 space-y-3">
                      <div className="flex items-center space-x-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                        <Layers className="w-4 h-4" />
                        <span>Full Audit Trail & Decision Provenance</span>
                      </div>
                      <div className="bg-zinc-900/80 p-3.5 rounded-lg border border-cyan-900/30 space-y-2 text-xs">
                        <div className="text-cyan-200 font-semibold">{result.decisionProvenance.title}</div>
                        <p className="text-zinc-300">{result.decisionProvenance.rationale}</p>
                        <div className="pt-2 border-t border-zinc-800 flex flex-wrap gap-2 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-white/[0.06]">
                            Policy: {result.decisionProvenance.policy?.properties?.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-white/[0.06]">
                            Evidence: {result.decisionProvenance.sourceDocument?.properties?.title}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-300 border border-white/[0.06]">
                            Approved By: {result.decisionProvenance.authorizer?.properties?.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column: Visual Graph Topology, Live Traversal Path & SKILL.md */}
                <div className="lg:col-span-5 space-y-5">
                  {/* Visualizer Mode Switcher (3D Spatial Orbit vs 2D Topology) */}
                  <div className="flex items-center justify-between bg-[#111114] p-1 rounded-xl border border-white/[0.08]">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setGraphViewMode('3d')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          graphViewMode === '3d'
                            ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Globe className="w-3.5 h-3.5 text-sky-400" />
                        <span>3D Spatial Orbit</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 font-mono">
                          WebGL 3D
                        </span>
                      </button>
                      <button
                        onClick={() => setGraphViewMode('2d')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          graphViewMode === '2d'
                            ? 'bg-zinc-800 text-white shadow-sm border border-white/[0.08]'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        <GitBranch className="w-3.5 h-3.5 text-zinc-300" />
                        <span>2D Schema Map</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-300 font-mono">
                          SVG 2D
                        </span>
                      </button>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500 pr-2 hidden sm:inline">
                      FalkorDB Visualizer
                    </span>
                  </div>

                  {/* Dynamic Visualizer Render */}
                  {graphViewMode === '3d' ? (
                    <SpatialGraph3D
                      tenantId={tenant}
                      trapType={result.trapType}
                      isGpuApproved={isGpuApproved}
                      curatorStatus={curatorStatus}
                    />
                  ) : (
                    <GraphTopologyMap
                      tenantId={tenant}
                      trapType={result.trapType}
                      isGpuApproved={isGpuApproved}
                      curatorStatus={curatorStatus}
                    />
                  )}

                  {/* Graph Traversal Path - High Contrast Monospace Box */}
                  <div className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-4 h-4 text-sky-400" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Live Graph Traversal Path</span>
                      </div>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {result.graphTraversalPath.length} Hops
                      </span>
                    </div>

                    <div className="space-y-2">
                      {result.graphTraversalPath.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-3 text-xs">
                          <div className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08] flex items-center justify-center shrink-0 text-[10px] font-mono mt-0.5 font-bold">
                            {idx + 1}
                          </div>
                          <div className="bg-[#0c0c0e] px-3.5 py-2.5 rounded-lg border border-white/[0.06] text-zinc-200 font-mono text-xs flex-1 break-all leading-relaxed shadow-inner">
                            {renderHighlightedHop(step)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic Compiled SKILL.md */}
                  {result.compiledSkillMd && (
                    <div className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4 relative">
                      <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                        <div className="flex items-center space-x-2">
                          <FileCode2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Compiled SKILL.md</span>
                        </div>
                        <button
                          onClick={handleCopySkill}
                          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 border border-white/[0.08] transition-all cursor-pointer"
                        >
                          {copiedSkill ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Copy Markdown</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="bg-[#0c0c0e] p-4 rounded-lg border border-white/[0.06] font-mono text-[11px] text-zinc-300 max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
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
          <RbacGuard allowedRoles={TAB_PERMISSIONS.inbox} currentRole={activeRole} moduleName="SME Expert Inbox">
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.08] flex items-center justify-center font-bold text-xs">
                      MV
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-white">SME Expert Inbox: Marcus Vance</h2>
                      <p className="text-xs text-zinc-400">
                        Principal Infra Architect • Engineering Department • <code className="text-zinc-300 font-mono">marcus@acme.com</code>
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
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                      ESCALATION #ESC-ENG-882
                    </span>
                    <h3 className="text-base font-semibold text-white">
                      &ldquo;How do I request GPU cluster quota for a hackathon in Engineering?&rdquo;
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Escalated by SetuBrain Deterministic Abstention Handler (Trap 4) due to missing procedure in Department(DEPT-ENG).
                    </p>
                  </div>
                  <span className="text-xs text-zinc-500 font-mono">Oct 15, 2026</span>
                </div>

                <div className="bg-[#0c0c0e] p-4 rounded-lg border border-white/[0.06] space-y-2.5 text-xs">
                  <div className="font-semibold text-zinc-200">Drafted Corporate Policy & Procedure for Approval:</div>
                  <div className="space-y-1 text-zinc-400">
                    <div><strong className="text-zinc-300">Procedure ID</strong>: <code>PROC-ENG-GPU</code> (&ldquo;GPU Cluster Quota & AI Compute Allocation Request&rdquo;)</div>
                    <div><strong className="text-zinc-300">Governing Policy</strong>: <code>POL-ENG-GPU-2026</code> (Version 1.0, APPROVED)</div>
                    <div><strong className="text-zinc-300">Primary Application</strong>: Run:ai Orchestrator (<code>https://runai.infra.acme.internal</code>)</div>
                    <div><strong className="text-zinc-300">Approved Limit</strong>: Up to 8x NVIDIA H100 GPUs auto-approved for 72 hours for hackathons.</div>
                    <div><strong className="text-zinc-300">Escalation Threshold</strong>: Requests exceeding 8 GPUs require Marcus Vance authorization.</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-zinc-400">
                    {isGpuApproved ? (
                      <span className="text-emerald-400 flex items-center space-x-1 font-semibold">
                        <Check className="w-4 h-4" />
                        <span>Live in FalkorDB (Cypher node active in tenant_acme)</span>
                      </span>
                    ) : (
                      <span>Click below to publish this procedure live into the knowledge graph.</span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                    {!isGpuApproved ? (
                      <button
                        onClick={handleApproveGpuProcedure}
                        disabled={loading}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                          activeRole === 'COMPANY_ADMINISTRATOR'
                            ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20'
                            : 'bg-zinc-100 hover:bg-white text-zinc-950'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>
                          {activeRole === 'COMPANY_ADMINISTRATOR'
                            ? 'Approve & Publish (Admin Override) → Graph'
                            : 'Approve & Publish GPU Procedure to Graph as Marcus Vance'}
                        </span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setActiveTab('engine');
                          setQuery('What is my GPU cluster quota in Engineering?');
                          handleRunQuery('What is my GPU cluster quota in Engineering?');
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Test GPU Cluster Quota in Engine →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RbacGuard>
        )}

        {/* ====================================================================== */}
        {/* TAB 3: CURATOR AGENT (CONFLICT RESOLUTION)                            */}
        {/* ====================================================================== */}
        {activeTab === 'curator' && (
          <RbacGuard allowedRoles={TAB_PERMISSIONS.curator} currentRole={activeRole} moduleName="Curator Agent (Conflict Resolution)">
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-rose-400" />
                      <span>Curator Agent • Contradiction Resolution Center</span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Track 02 Agent Coordination: Continuous scan for semantic contradictions across procedures and policies.
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1 rounded-full font-mono border ${
                    curatorStatus === 'RESOLVED'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                  }`}>
                    {curatorStatus === 'RESOLVED' ? 'All Conflicts Resolved' : '1 Active Conflict Detected'}
                  </span>
                </div>
              </div>

              {/* Conflict Resolution Card */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-800/40">
                      CONFLICT #CONF-01 • HIGH RISK
                    </span>
                    <h3 className="text-base font-semibold text-white">
                      Endpoint Offboarding: Zero-Trust Wipe vs. 7-Day HR Grace Period
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Governing Procedure: <code>PROC-SEC-03</code> (Remote Laptop Wipe & Contractor Offboarding)
                    </p>
                  </div>
                </div>

                {/* Side-by-side Contradiction View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#0c0c0e] border border-rose-900/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-rose-300">Security Mandate (POL-SEC-101)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800/40">0-Hour Wipe</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      &ldquo;Security requires immediate 0-hour remote cryptographic wipe via CrowdStrike Falcon the moment a contractor or employee offboarding ticket is filed.&rdquo;
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono">Owner: Elena Rostova (Head of InfoSec)</div>
                  </div>

                  <div className="p-4 rounded-lg bg-[#0c0c0e] border border-amber-900/30 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-300">HR Grace Period (POL-HR-202)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800/40">7-Day Wait</span>
                    </div>
                    <p className="text-zinc-300 leading-relaxed">
                      &ldquo;IT and Security must wait 7 calendar days after final employment date before wiping laptops so departing staff can retrieve personal tax documents.&rdquo;
                    </p>
                    <div className="text-[10px] text-zinc-500 font-mono">Owner: David Kim (HR Compliance Lead)</div>
                  </div>
                </div>

                {/* Resolution Action */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-white/[0.06]">
                  <div className="text-xs text-zinc-400">
                    {curatorStatus === 'RESOLVED' ? (
                      <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                        <Check className="w-4 h-4" />
                        <span>Resolution Active: POL-SEC-101 formally marked as superseding POL-HR-202</span>
                      </span>
                    ) : (
                      <span>Automated agent execution is currently halted on laptop wipe until resolved.</span>
                    )}
                  </div>

                  <div className="w-full sm:w-auto flex justify-end">
                    {curatorStatus === 'DETECTED' ? (
                      <button
                        onClick={handleResolveConflict}
                        disabled={loading}
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
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
                        className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        <span>Test Resolved Laptop Wipe in Engine →</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </RbacGuard>
        )}

        {/* ====================================================================== */}
        {/* TAB 4: DEPARTMENT HEALTH SCORES                                       */}
        {/* ====================================================================== */}
        {activeTab === 'departments' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Department Knowledge Topology & Health</h2>
                <p className="text-xs text-zinc-400">
                  Live governance metrics based on open policy contradictions, SME ownership, and unaddressed escalations.
                </p>
              </div>
              <span className="text-xs text-zinc-500 font-mono">
                Tenant: {tenant === 'tenant_acme' ? 'Acme Corp' : 'Globex Inc'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-medium text-zinc-400">{dept.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold font-mono border ${
                        dept.status === 'HEALTHY'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : dept.status === 'ATTENTION'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        {dept.healthScore}% Health
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-white">{dept.name}</h3>
                      <div className="text-xs text-zinc-400 pt-0.5">
                        Authoritative SME: <span className="text-zinc-200 font-medium">{dept.sme.name}</span> ({dept.sme.role})
                      </div>
                      <div className="text-[11px] text-zinc-500 font-mono">{dept.sme.email}</div>
                    </div>

                    <div className="bg-[#0c0c0e] p-3 rounded-lg border border-white/[0.06] space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Owned Applications:</span>
                        <span className="font-medium text-white">{dept.apps.length > 0 ? dept.apps.join(', ') : 'None'}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Active Procedures:</span>
                        <span className="font-medium text-white">{dept.proceduresCount}</span>
                      </div>
                      <div className="flex items-center justify-between text-zinc-300">
                        <span>Open Conflicts:</span>
                        <span className={`font-semibold ${dept.openConflicts > 0 ? 'text-rose-400' : 'text-zinc-500'}`}>
                          {dept.openConflicts}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06] text-[11px] text-zinc-400 flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`font-semibold ${
                      dept.status === 'HEALTHY' ? 'text-emerald-400' : dept.status === 'ATTENTION' ? 'text-amber-400' : 'text-rose-400'
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
          <RbacGuard allowedRoles={TAB_PERMISSIONS.benchmark} currentRole={activeRole} moduleName="Retrieval Benchmark Suite">
            <div className="space-y-5">
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      <span>Gold Standard 15-Query Enterprise Benchmark</span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Direct side-by-side comparison across all 5 failure modes: Naive Vector RAG vs. SetuBrain FalkorDB.
                    </p>
                  </div>
                </div>

                {/* KPI Scorecards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                  <div className="p-4 rounded-lg bg-rose-950/20 border border-rose-900/30 text-center space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-rose-400 font-mono font-semibold">Naive Vector RAG</div>
                    <div className="text-3xl font-black text-rose-400">26.7%</div>
                    <div className="text-[11px] text-zinc-400">4 / 15 Passed (Hallucinations on traps)</div>
                  </div>

                  <div className="p-4 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-center space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-emerald-400 font-mono font-semibold">SetuBrain FalkorDB</div>
                    <div className="text-3xl font-black text-emerald-400">100.0%</div>
                    <div className="text-[11px] text-zinc-400">15 / 15 Passed (Deterministic accuracy)</div>
                  </div>

                  <div className="p-4 rounded-lg bg-zinc-900/80 border border-white/[0.08] text-center space-y-1">
                    <div className="text-[11px] uppercase tracking-wider text-zinc-300 font-mono font-semibold">Avg Cypher Latency</div>
                    <div className="text-3xl font-black text-white">14.3 ms</div>
                    <div className="text-[11px] text-zinc-400">Native sub-millisecond in-memory graph</div>
                  </div>
                </div>
              </div>

              {/* Benchmark Table */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.07] text-zinc-400 uppercase text-[10px] font-mono tracking-wider">
                        <th className="pb-3 w-10">#</th>
                        <th className="pb-3 w-40">Category</th>
                        <th className="pb-3">Query & Ground Truth</th>
                        <th className="pb-3 w-64">Vector RAG Baseline</th>
                        <th className="pb-3 w-64">SetuBrain FalkorDB</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.06]">
                      {benchmarks.map((item) => (
                        <tr key={item.id} className="hover:bg-zinc-900/40 transition-all">
                          <td className="py-3.5 font-mono text-zinc-500">{item.id}</td>
                          <td className="py-3.5 font-mono text-zinc-400 text-[11px]">{item.category}</td>
                          <td className="py-3.5 pr-4 space-y-1">
                            <div className="font-semibold text-white text-xs">{item.query}</div>
                            <div className="text-[11px] text-zinc-400">
                              <span className="text-zinc-300 font-semibold font-mono">Truth:</span> {item.groundTruth}
                            </div>
                          </td>
                          <td className="py-3.5 pr-4 space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-800/40 text-[10px] font-mono font-bold">
                              <XCircle className="w-3 h-3" />
                              <span>FAIL (0/1)</span>
                            </span>
                            <div className="text-[11px] text-zinc-300">{item.vectorRag.returned}</div>
                            <div className="text-[10px] text-rose-400/80 italic">{item.vectorRag.failureReason}</div>
                          </td>
                          <td className="py-3.5 space-y-1">
                            <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono font-bold">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>PASS (1/1)</span>
                            </span>
                            <div className="text-[11px] text-zinc-200">{item.setuBrain.returned}</div>
                            <div className="text-[10px] text-emerald-400/80 font-mono">↳ {item.setuBrain.resolutionMechanic}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </RbacGuard>
        )}

        {/* ====================================================================== */}
        {/* TAB 6: AGENT EPISODIC MEMORY TRAIL                                    */}
        {/* ====================================================================== */}
        {activeTab === 'memory' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                  <History className="w-5 h-5 text-sky-400" />
                  <span>Agent Episodic Session Memory Feed</span>
                </h2>
                <p className="text-xs text-zinc-400">
                  Persistent multi-turn episode logs stored across user query sessions in the Company Brain.
                </p>
              </div>
              <button
                onClick={refreshAuxiliaryData}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 border border-white/[0.08] transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-3">
              {episodes.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-xs">
                  No episodes recorded yet. Execute queries in the Knowledge Engine tab to log agent interactions!
                </div>
              ) : (
                episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="p-3.5 rounded-lg bg-[#0c0c0e] border border-white/[0.06] flex items-start justify-between gap-4 text-xs hover:border-white/[0.12] transition-all"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-zinc-400 text-[11px] font-medium">{ep.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                          Tenant: {ep.tenantId}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          ep.status === 'SUCCESS' || ep.status === 'SME_PUBLISHED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                            : ep.status === 'CONFLICT_HALTED'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800/40'
                            : 'bg-purple-950 text-purple-400 border border-purple-800/40'
                        }`}>
                          {ep.status}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono">{ep.cypherLatencyMs}ms</span>
                      </div>
                      <div className="font-semibold text-white">{ep.query}</div>
                      <div className="text-zinc-400 text-[11px]">{ep.summary}</div>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
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
        {activeTab === 'mcp' && (
          <RbacGuard allowedRoles={TAB_PERMISSIONS.mcp} currentRole={activeRole} moduleName="Model Context Protocol (MCP) Server">
            <McpInspector />
          </RbacGuard>
        )}

        {/* ====================================================================== */}
        {/* TAB 8: OWNER & ADMIN CONSOLE (LIVE INGEST & POLICY CURATION)          */}
        {/* ====================================================================== */}
        {activeTab === 'admin' && (
          <RbacGuard allowedRoles={TAB_PERMISSIONS.admin} currentRole={activeRole} moduleName="Company Administrator Console">
            <div className="space-y-6">
              {/* Header Banner */}
              <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 text-amber-400 border border-white/[0.08] flex items-center justify-center font-bold">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold text-white tracking-tight flex items-center space-x-2">
                      <span>Owner & Admin Console</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08]">
                        Live FalkorDB Mutations
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Author new corporate policies on the fly, import Slack/Discord decisions with full provenance, and govern supersession ledgers.
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs px-3 py-1 rounded-full bg-zinc-900 text-zinc-300 font-mono border border-white/[0.08]">
                    Tenant: <strong className="text-emerald-400">{tenant}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Grid: 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Live Custom Policy Editor */}
              <div className="lg:col-span-7 space-y-5">
                <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                    <div className="flex items-center space-x-2">
                      <PlusCircle className="w-4 h-4 text-zinc-300" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                        Live Custom Policy Editor
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Writes Cypher MERGE directly to FalkorDB
                    </span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Policy Title</label>
                        <input
                          type="text"
                          value={customTitle}
                          onChange={(e) => setCustomTitle(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-sans"
                          placeholder="e.g. Remote Work & Monitor Stipend"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Responsible Department</label>
                        <select
                          value={customDept}
                          onChange={(e) => setCustomDept(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400 font-sans"
                        >
                          <option value="Finance">Finance (DEPT-FIN)</option>
                          <option value="Engineering">Engineering (DEPT-ENG)</option>
                          <option value="Security">Security (DEPT-SEC)</option>
                          <option value="Human Resources">Human Resources (DEPT-HR)</option>
                          <option value="Operations">Operations (DEPT-OPS)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Application / Portal Used</label>
                        <input
                          type="text"
                          value={customApp}
                          onChange={(e) => setCustomApp(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-sans"
                          placeholder="e.g. Navan, Ramp, Workday"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Auto-Approved Limit / Cap</label>
                        <input
                          type="text"
                          value={customLimit}
                          onChange={(e) => setCustomLimit(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-sans"
                          placeholder="e.g. $300/year"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-medium text-zinc-300">Full Policy Content & Employee Steps</label>
                      <textarea
                        rows={3}
                        value={customContent}
                        onChange={(e) => setCustomContent(e.target.value)}
                        className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg p-3 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-zinc-400 font-sans leading-relaxed text-xs"
                        placeholder="Detailed rules, reimbursement steps, and approval exceptions..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Review Owner / SME</label>
                        <input
                          type="text"
                          value={customOwner}
                          onChange={(e) => setCustomOwner(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400 font-sans"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-zinc-300">Owner Email</label>
                        <input
                          type="email"
                          value={customOwnerEmail}
                          onChange={(e) => setCustomOwnerEmail(e.target.value)}
                          className="w-full bg-[#0c0c0e] border border-white/[0.08] rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-zinc-400 font-sans"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div className="text-[11px] text-zinc-400">
                        ⚡ Creates 4-hop chain: <code className="text-zinc-300 font-mono">(:Dept)-[:RESPONSIBLE_FOR]-&gt;(:Proc)-[:USES_APP]-&gt;(:App)-[:GOVERNED_BY]-&gt;(:Policy)</code>
                      </div>
                      <button
                        onClick={handlePublishCustomPolicy}
                        disabled={publishingPolicy}
                        className="px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-xs shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                      >
                        {publishingPolicy ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Publishing to Graph...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            <span>Publish to Company Brain</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Policy Precedence Ledger */}
                <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                        Active Policy Precedence Ledger
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400">
                      Graph Supersessions Enforced
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 rounded-lg bg-[#0c0c0e] border border-emerald-900/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-emerald-300">POL-EXP-2026 ($250/night via Navan)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">ACTIVE</span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Explicitly supersedes legacy <code className="text-rose-400 line-through">POL-EXP-2024 ($150/night)</code>. AI agents will never cite the deprecated rate.
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0c0c0e] border border-purple-900/20 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-purple-300">POL-SEC-101 (Zero-Trust 0-Hour Wipe)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800">
                          {curatorStatus === 'RESOLVED' ? 'SUPERSEDES HR' : 'FLAGGED CONFLICT'}
                        </span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        {curatorStatus === 'RESOLVED'
                          ? 'Curator Agent established precedence over POL-HR-202 (7-day grace period) for security compliance.'
                          : 'Curator Agent actively freezes automated deprovisioning until conflict resolution is approved.'}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0c0c0e] border border-white/[0.06] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-zinc-200">POL-FIN-2026 ($500 SaaS Procurement)</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-white/[0.08]">ACTIVE</span>
                      </div>
                      <div className="text-zinc-400 text-[11px]">
                        Governed by Ramp application with auto-approval threshold. Contracts &gt;$5,000 route to Priya Sharma.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Curated Slack & Discord Decisions Importer */}
              <div className="lg:col-span-5 space-y-5">
                <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.07]">
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                        Curated Chat & Ticket Importer
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/[0.06]">
                      Slack / Discord
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Convert transient Slack approvals and Discord discussions into permanent graph memory with direct source URLs and audit provenance.
                  </p>

                  <div className="space-y-3 pt-1">
                    {/* Simulated Slack Thread 1 */}
                    <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-white/[0.06] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="font-medium text-white font-mono">Slack #exec-approvals</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">Oct 2, 2026</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/[0.06] text-zinc-300 font-mono text-[11px] space-y-1">
                        <div className="text-zinc-400 font-semibold">@priya (VP Finance):</div>
                        <div>&ldquo;Approved $1,500 cash refund exception for CloudScale Inc. SLA breach logs confirmed 42-min downtime on US-East-1 cluster.&rdquo;</div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-zinc-500">ID: DEC-901 • POL-OPS-300</span>
                        <button
                          onClick={() => handleImportDecision('DEC-901', 'Approved $1,500 Refund for CloudScale Inc', 'Customer experienced 42-minute regional outage. Approved under POL-OPS-300.', 'https://acme.slack.com/archives/C01/p1759401', 'Slack')}
                          disabled={importingDecision === 'DEC-901'}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-[11px] transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50 border border-white/[0.08]"
                        >
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>{importingDecision === 'DEC-901' ? 'Importing...' : 'Live in Brain (Re-sync)'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Simulated Discord Thread 2 */}
                    <div className="p-3.5 rounded-lg bg-[#0c0c0e] border border-white/[0.06] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="font-medium text-white font-mono">Discord #dev-leads</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">Oct 14, 2026</span>
                      </div>
                      <div className="bg-zinc-950 p-2.5 rounded-lg border border-white/[0.06] text-zinc-300 font-mono text-[11px] space-y-1">
                        <div className="text-zinc-400 font-semibold">@marcus (Principal Infra):</div>
                        <div>&ldquo;Hackathon AI squads authorized to spin up 8x H100 SXM5 instances via Run:ai. Auto-deprovision policy set for 72 hours.&rdquo;</div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] font-mono text-zinc-500">ID: DEC-902 • PROC-ENG-GPU</span>
                        <button
                          onClick={() => handleImportDecision('DEC-902', 'Approved 8x H100 GPU Cluster Burst for Hackathon', 'Marcus Vance authorized 8x NVIDIA H100 SXM5 GPUs for 72 hours for internal Hackathon teams.', 'https://discord.com/channels/9812/dev-leads/129381', 'Discord')}
                          disabled={importingDecision === 'DEC-902'}
                          className="px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 font-semibold text-[11px] transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
                        >
                          <PlusCircle className="w-3 h-3" />
                          <span>{importingDecision === 'DEC-902' ? 'Importing...' : '1-Click Ingest into Brain'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </RbacGuard>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-4 text-center text-[11px] text-zinc-500">
        SetuBrain · Graph-Powered Knowledge Engine
      </footer>
    </div>
  );
}
