'use client';

import React, { useState } from 'react';
import { Network, ZoomIn, ZoomOut, RotateCcw, Info } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface GraphTopologyProps {
  tenantId: string;
  trapType?: string;
  isGpuApproved?: boolean;
  curatorStatus?: 'DETECTED' | 'RESOLVED';
}

interface NodeCoord {
  id: string;
  label: string;
  type: 'Department' | 'Procedure' | 'Application' | 'Policy' | 'Contact' | 'Decision' | 'Document';
  x: number;
  y: number;
  color: string;
  description: string;
  status?: string;
}

interface EdgeCoord {
  from: string;
  to: string;
  label: string;
  color: string;
  dashed?: boolean;
  pulsing?: boolean;
}

export default function GraphTopologyMap({ tenantId, trapType, isGpuApproved, curatorStatus }: GraphTopologyProps) {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedNode, setSelectedNode] = useState<NodeCoord | null>(null);
  const [zoom, setZoom] = useState(1);

  // Nodes for Acme Corp
  const acmeNodes: NodeCoord[] = [
    { id: 'DEPT-FIN', label: 'Finance', type: 'Department', x: 80, y: 80, color: '#6366f1', description: 'Corporate budgets & expense management' },
    { id: 'DEPT-ENG', label: 'Engineering', type: 'Department', x: 80, y: 220, color: '#8b5cf6', description: 'Cloud infrastructure & compute clusters' },
    { id: 'DEPT-SEC', label: 'Security', type: 'Department', x: 80, y: 360, color: '#ec4899', description: 'Zero-trust endpoints & remote laptop wipe' },
    { id: 'DEPT-HR', label: 'HR', type: 'Department', x: 80, y: 480, color: '#f59e0b', description: 'Employee lifecycle & offboarding' },
    { id: 'DEPT-OPS', label: 'Operations', type: 'Department', x: 80, y: 600, color: '#06b6d4', description: 'Customer billing exceptions & SLA credits' },

    // Procedures
    { id: 'PROC-SAAS-01', label: 'SaaS Purchase', type: 'Procedure', x: 280, y: 80, color: '#3b82f6', description: 'Software budget request up to $500/mo' },
    { id: 'PROC-TRV-02', label: 'Hotel Booking', type: 'Procedure', x: 280, y: 150, color: '#10b981', description: 'Navan lodging cap ($250/night)' },
    { id: 'PROC-ENG-GPU', label: isGpuApproved ? 'GPU Quota (Live)' : 'GPU Quota (Unpublished)', type: 'Procedure', x: 280, y: 220, color: isGpuApproved ? '#10b981' : '#64748b', description: '8x H100 GPU quota workflow' },
    { id: 'PROC-SEC-03', label: 'Device Offboard', type: 'Procedure', x: 280, y: 420, color: '#ef4444', description: 'Remote wipe procedure upon termination' },
    { id: 'PROC-OPS-05', label: 'Refund Workflow', type: 'Procedure', x: 280, y: 600, color: '#06b6d4', description: 'Stripe SLA credit exception' },

    // Apps & Policies
    { id: 'APP-RAMP', label: 'Ramp', type: 'Application', x: 480, y: 50, color: '#3b82f6', description: 'Corporate card & spend portal' },
    { id: 'POL-FIN-2026', label: 'POL-FIN-2026', type: 'Policy', x: 480, y: 110, color: '#6366f1', description: 'SaaS Spend Policy v3.0 (Active)' },
    { id: 'APP-NAVAN', label: 'Navan', type: 'Application', x: 480, y: 170, color: '#10b981', description: 'Travel booking platform' },
    { id: 'POL-EXP-2026', label: 'POL-EXP-2026 ($250)', type: 'Policy', x: 480, y: 230, color: '#10b981', description: 'Active 2026 travel lodging policy' },
    { id: 'POL-EXP-2024', label: 'POL-EXP-2024 ($150)', type: 'Policy', x: 680, y: 230, color: '#94a3b8', status: 'SUPERSEDED', description: 'Legacy 2024 travel policy (Rejected)' },
    { id: 'POL-SEC-101', label: 'POL-SEC-101 (0-hr)', type: 'Policy', x: 480, y: 380, color: '#ef4444', description: 'Zero-Trust 0-hour endpoint wipe mandate' },
    { id: 'POL-HR-202', label: 'POL-HR-202 (7-day)', type: 'Policy', x: 480, y: 460, color: '#f59e0b', description: 'HR 7-day tax document retrieval grace period' },
    { id: 'APP-CROWD', label: 'CrowdStrike', type: 'Application', x: 680, y: 380, color: '#ec4899', description: 'Endpoint cryptographic wipe tool' },
    { id: 'POL-OPS-300', label: 'POL-OPS-300', type: 'Policy', x: 480, y: 600, color: '#06b6d4', description: 'Enterprise SLA credit policy' },
    { id: 'DEC-901', label: 'DEC-901 ($1,500)', type: 'Decision', x: 680, y: 550, color: '#38bdf8', description: 'Approved refund exception for CloudScale Inc' },
    { id: 'DOC-SLACK-901', label: 'Slack #exec-approvals', type: 'Document', x: 680, y: 650, color: '#a855f7', description: 'Evidence thread from Oct 2, 2026' },

    // SMEs
    { id: 'SME-PRIYA', label: 'Priya Sharma (VP)', type: 'Contact', x: 680, y: 110, color: '#818cf8', description: 'VP Finance (priya@acme.com)' },
    { id: 'SME-MARCUS', label: 'Marcus Vance', type: 'Contact', x: 480, y: 300, color: '#a78bfa', description: 'Principal Infra Architect (marcus@acme.com)' },
  ];

  // Globex Nodes
  const globexNodes: NodeCoord[] = [
    { id: 'GLX-FIN', label: 'Globex Finance', type: 'Department', x: 100, y: 200, color: '#a855f7', description: 'Globex EU Treasury' },
    { id: 'GLX-PROC-01', label: 'Brex Spend Proc', type: 'Procedure', x: 300, y: 200, color: '#a855f7', description: 'Auto-approved under €100/mo' },
    { id: 'APP-BREX', label: 'Brex', type: 'Application', x: 500, y: 150, color: '#a855f7', description: 'Corporate card for Globex' },
    { id: 'GLX-POL-2026', label: 'Globex Spend Policy', type: 'Policy', x: 500, y: 250, color: '#a855f7', description: 'Strict spend policy v1.0' },
    { id: 'SME-HANS', label: 'Hans Gruber (CFO)', type: 'Contact', x: 700, y: 200, color: '#c084fc', description: 'CFO Globex (hans@globex.io)' },
  ];

  const nodes = tenantId === 'tenant_globex' ? globexNodes : acmeNodes;

  // Edges for Acme
  const acmeEdges: EdgeCoord[] = [
    { from: 'DEPT-FIN', to: 'PROC-SAAS-01', label: ':RESPONSIBLE_FOR', color: '#6366f1' },
    { from: 'PROC-SAAS-01', to: 'APP-RAMP', label: ':USES_APP', color: '#3b82f6' },
    { from: 'PROC-SAAS-01', to: 'POL-FIN-2026', label: ':GOVERNED_BY', color: '#6366f1' },
    { from: 'POL-FIN-2026', to: 'SME-PRIYA', label: ':APPROVED_BY', color: '#818cf8' },

    { from: 'DEPT-FIN', to: 'PROC-TRV-02', label: ':RESPONSIBLE_FOR', color: '#10b981' },
    { from: 'PROC-TRV-02', to: 'APP-NAVAN', label: ':USES_APP', color: '#10b981' },
    { from: 'PROC-TRV-02', to: 'POL-EXP-2026', label: ':GOVERNED_BY', color: '#10b981' },
    { from: 'POL-EXP-2026', to: 'POL-EXP-2024', label: ':SUPERSEDES', color: '#f59e0b', dashed: true },

    { from: 'DEPT-ENG', to: 'PROC-ENG-GPU', label: ':RESPONSIBLE_FOR', color: '#8b5cf6', dashed: !isGpuApproved },
    { from: 'DEPT-ENG', to: 'SME-MARCUS', label: ':REPRESENTS', color: '#a78bfa' },

    { from: 'DEPT-SEC', to: 'PROC-SEC-03', label: ':RESPONSIBLE_FOR', color: '#ec4899' },
    { from: 'DEPT-HR', to: 'PROC-SEC-03', label: ':RESPONSIBLE_FOR', color: '#f59e0b' },
    { from: 'PROC-SEC-03', to: 'APP-CROWD', label: ':USES_APP', color: '#ef4444' },
    { from: 'PROC-SEC-03', to: 'POL-SEC-101', label: ':GOVERNED_BY', color: '#ef4444' },
    { from: 'PROC-SEC-03', to: 'POL-HR-202', label: ':GOVERNED_BY', color: '#f59e0b' },
    {
      from: 'POL-SEC-101',
      to: 'POL-HR-202',
      label: curatorStatus === 'RESOLVED' ? ':SUPERSEDES (Curator)' : ':CONFLICTS_WITH',
      color: curatorStatus === 'RESOLVED' ? '#10b981' : '#ef4444',
      pulsing: curatorStatus !== 'RESOLVED',
    },

    { from: 'DEPT-OPS', to: 'PROC-OPS-05', label: ':RESPONSIBLE_FOR', color: '#06b6d4' },
    { from: 'PROC-OPS-05', to: 'POL-OPS-300', label: ':GOVERNED_BY', color: '#06b6d4' },
    { from: 'DEC-901', to: 'POL-OPS-300', label: ':BASED_ON', color: '#38bdf8' },
    { from: 'POL-OPS-300', to: 'DOC-SLACK-901', label: ':EVIDENCED_BY', color: '#a855f7' },
    { from: 'POL-OPS-300', to: 'SME-PRIYA', label: ':APPROVED_BY', color: '#818cf8' },
  ];

  // Globex Edges
  const globexEdges: EdgeCoord[] = [
    { from: 'GLX-FIN', to: 'GLX-PROC-01', label: ':RESPONSIBLE_FOR', color: '#a855f7' },
    { from: 'GLX-PROC-01', to: 'APP-BREX', label: ':USES_APP', color: '#a855f7' },
    { from: 'GLX-PROC-01', to: 'GLX-POL-2026', label: ':GOVERNED_BY', color: '#a855f7' },
    { from: 'GLX-POL-2026', to: 'SME-HANS', label: ':APPROVED_BY', color: '#c084fc' },
  ];

  const edges = tenantId === 'tenant_globex' ? globexEdges : acmeEdges;

  // Determine active highlights based on trapType
  const isNodeActive = (id: string) => {
    if (trapType === 'trap1_multihop') {
      return id === 'DEPT-FIN' || id === 'PROC-SAAS-01' || id === 'APP-RAMP' || id === 'POL-FIN-2026' || id === 'SME-PRIYA' || id === 'GLX-FIN' || id === 'GLX-PROC-01' || id === 'APP-BREX' || id === 'GLX-POL-2026' || id === 'SME-HANS';
    }
    if (trapType === 'trap2_superseded') {
      return id === 'DEPT-FIN' || id === 'PROC-TRV-02' || id === 'APP-NAVAN' || id === 'POL-EXP-2026' || id === 'POL-EXP-2024';
    }
    if (trapType === 'trap3_conflict' || trapType === 'trap3_conflict_resolved') {
      return id === 'DEPT-SEC' || id === 'DEPT-HR' || id === 'PROC-SEC-03' || id === 'POL-SEC-101' || id === 'POL-HR-202' || id === 'APP-CROWD';
    }
    if (trapType === 'trap4_missing_knowledge' || trapType === 'trap4_sme_published') {
      return id === 'DEPT-ENG' || id === 'PROC-ENG-GPU' || id === 'SME-MARCUS';
    }
    if (trapType === 'trap5_provenance') {
      return id === 'DEC-901' || id === 'POL-OPS-300' || id === 'DOC-SLACK-901' || id === 'SME-PRIYA' || id === 'DEPT-OPS' || id === 'PROC-OPS-05';
    }
    return false;
  };

  return (
    <div className="rounded-3xl bg-slate-900/70 border border-slate-800 shadow-xl p-5 space-y-3.5 backdrop-blur-md relative overflow-hidden">
      {/* Topology Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
        <div className="flex items-center space-x-2">
          <Network className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
            FalkorDB Visual Topology Map ({nodes.length} Nodes, {edges.length} Edges)
          </span>
        </div>

        {/* Aligned Controls */}
        <div className="flex items-center space-x-1.5 self-end sm:self-auto bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setZoom(z => Math.min(1.4, z + 0.1))}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setZoom(1); setSelectedNode(null); }}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs transition-all cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Explicit Top Legend Bar - Prevents Canvas Collisions */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs font-mono shadow-inner">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500/50 inline-block" />
            <span>Active Traversal</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 inline-block" />
            <span>Conflict / Superseded</span>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-slate-400 text-[11px]">
          <Info className="w-3.5 h-3.5 text-indigo-400" />
          <span>Click any node to inspect</span>
        </span>
      </div>

      {/* SVG Canvas */}
      <div className={`relative w-full h-80 ${isLight ? 'bg-slate-100/90 border-slate-300' : 'bg-slate-950/80 border-slate-800/80'} rounded-2xl border overflow-auto scrollbar-none flex items-center justify-center transition-colors`}>
        <svg
          viewBox="0 0 820 720"
          className="w-full h-full transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
        >
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
            </marker>
            <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#6366f1" />
            </marker>
            <marker id="arrow-supersedes" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
            </marker>
            <marker id="arrow-conflict" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
            </marker>
          </defs>

          {/* Render Edges */}
          {edges.map((e, idx) => {
            const fromNode = nodes.find(n => n.id === e.from);
            const toNode = nodes.find(n => n.id === e.to);
            if (!fromNode || !toNode) return null;

            const isEdgeActive = isNodeActive(fromNode.id) && isNodeActive(toNode.id);
            const markerType = e.label.includes('CONFLICT')
              ? 'url(#arrow-conflict)'
              : e.label.includes('SUPERSEDES')
              ? 'url(#arrow-supersedes)'
              : isEdgeActive
              ? 'url(#arrow-active)'
              : 'url(#arrow)';

            const midX = (fromNode.x + toNode.x) / 2;
            const midY = (fromNode.y + toNode.y) / 2;

            return (
              <g key={idx} className="group">
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isEdgeActive ? (e.label.includes('CONFLICT') ? '#ef4444' : '#6366f1') : '#334155'}
                  strokeWidth={isEdgeActive ? 2.5 : 1.2}
                  strokeDasharray={e.dashed ? '4,4' : undefined}
                  markerEnd={markerType}
                  className={e.pulsing ? 'animate-pulse' : ''}
                />
                <text
                  x={midX}
                  y={midY - 4}
                  textAnchor="middle"
                  fill={isEdgeActive ? '#e2e8f0' : '#64748b'}
                  fontSize="8"
                  fontFamily="monospace"
                  className="select-none pointer-events-none"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* Render Nodes */}
          {nodes.map((n) => {
            const active = isNodeActive(n.id);
            const isSuperseded = n.status === 'SUPERSEDED';

            return (
              <g
                key={n.id}
                onClick={() => setSelectedNode(n)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Glow ring when active */}
                {active && (
                  <circle
                    cx={n.x}
                    cy={n.y}
                    r="24"
                    fill="none"
                    stroke={n.color}
                    strokeWidth="3"
                    opacity="0.6"
                    className="animate-ping"
                  />
                )}

                <circle
                  cx={n.x}
                  cy={n.y}
                  r="16"
                  fill="#0f172a"
                  stroke={isSuperseded ? '#ef4444' : active ? '#ffffff' : n.color}
                  strokeWidth={active ? 2.5 : 1.5}
                  strokeDasharray={isSuperseded ? '3,3' : undefined}
                />

                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                  className="select-none pointer-events-none"
                >
                  {n.type.substring(0, 3).toUpperCase()}
                </text>

                <text
                  x={n.x}
                  y={n.y + 28}
                  textAnchor="middle"
                  fill={active ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#475569' : '#cbd5e1')}
                  fontSize="10"
                  fontWeight={active ? 'bold' : 'normal'}
                  className="select-none pointer-events-none"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 bg-slate-900/95 border border-indigo-500/40 p-3 rounded-xl shadow-2xl backdrop-blur-md flex items-center justify-between text-xs animate-fade-in z-20">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white">{selectedNode.label}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-indigo-400">
                  {selectedNode.type} • {selectedNode.id}
                </span>
                {selectedNode.status && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-red-950 text-red-300">
                    {selectedNode.status}
                  </span>
                )}
              </div>
              <p className="text-slate-300 text-[11px]">{selectedNode.description}</p>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
