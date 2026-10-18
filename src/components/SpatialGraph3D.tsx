'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  X,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

interface SpatialGraph3DProps {
  tenantId: string;
  trapType?: string;
  isGpuApproved?: boolean;
  curatorStatus?: 'DETECTED' | 'RESOLVED';
}

interface Graph3DNode {
  id: string;
  name: string;
  type: 'Department' | 'Procedure' | 'Application' | 'Policy' | 'Contact' | 'Decision' | 'Document';
  val: number;
  color: string;
  status?: string;
  description: string;
  details?: Record<string, string | number>;
  x?: number;
  y?: number;
  z?: number;
}

interface Graph3DLink {
  source: string;
  target: string;
  label: string;
  color: string;
  particles?: number;
  dashed?: boolean;
}

interface ForceGraph3DInstance {
  graphData: (data: { nodes: Graph3DNode[]; links: Graph3DLink[] }) => ForceGraph3DInstance;
  nodeLabel: (fn: (node: Graph3DNode) => string) => ForceGraph3DInstance;
  nodeColor: (fn: (node: Graph3DNode) => string) => ForceGraph3DInstance;
  nodeVal: (fn: (node: Graph3DNode) => number) => ForceGraph3DInstance;
  linkColor: (fn: (link: Graph3DLink) => string) => ForceGraph3DInstance;
  linkWidth: (fn: (link: Graph3DLink) => number) => ForceGraph3DInstance;
  linkDirectionalParticles: (fn: (link: Graph3DLink) => number) => ForceGraph3DInstance;
  linkDirectionalParticleSpeed: (fn: (link: Graph3DLink) => number) => ForceGraph3DInstance;
  linkDirectionalParticleWidth: (val: number) => ForceGraph3DInstance;
  onNodeClick: (fn: (node: Graph3DNode) => void) => ForceGraph3DInstance;
  backgroundColor: (color: string) => ForceGraph3DInstance;
  showNavInfo: (show: boolean) => ForceGraph3DInstance;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
  };
  cameraPosition: (
    pos: { x: number; y: number; z: number },
    lookAt?: { x: number; y: number; z: number },
    ms?: number
  ) => ForceGraph3DInstance;
  width: (w: number) => ForceGraph3DInstance;
  height: (h: number) => ForceGraph3DInstance;
  _destructor?: () => void;
}

export default function SpatialGraph3D({
  tenantId,
  trapType,
  isGpuApproved = false,
  curatorStatus = 'DETECTED'
}: SpatialGraph3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<ForceGraph3DInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Graph3DNode | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Generate Graph Data based on Tenant and Active Traversal State
  const graphData = useMemo(() => {
    const isAcme = tenantId === 'tenant_acme';

    if (isAcme) {
      const isTrap1 = trapType === 'trap1_multihop';
      const isTrap2 = trapType === 'trap2_superseded';

      const nodes: Graph3DNode[] = [
        // Departments
        { id: 'DEPT-FIN', name: 'Finance', type: 'Department', val: 14, color: '#6366f1', description: 'Corporate budget, cards & SaaS procurement' },
        { id: 'DEPT-ENG', name: 'Engineering', type: 'Department', val: 14, color: '#8b5cf6', description: 'Cloud infrastructure & compute cluster quotas' },
        { id: 'DEPT-SEC', name: 'Security', type: 'Department', val: 14, color: '#ec4899', description: 'Zero-trust endpoints & remote cryptographic wipe' },
        { id: 'DEPT-HR', name: 'HR', type: 'Department', val: 14, color: '#f59e0b', description: 'Employee lifecycle & offboarding grace periods' },
        { id: 'DEPT-OPS', name: 'Operations', type: 'Department', val: 14, color: '#06b6d4', description: 'Customer billing exceptions & SLA outage credits' },

        // Procedures
        { id: 'PROC-SAAS-01', name: 'SaaS Purchase', type: 'Procedure', val: isTrap1 ? 14 : 10, color: '#3b82f6', description: 'Software procurement up to $500/mo' },
        { id: 'PROC-TRV-02', name: 'Hotel Booking', type: 'Procedure', val: isTrap2 ? 14 : 10, color: '#10b981', description: 'Navan travel policy ($250/night)' },
        {
          id: 'PROC-ENG-GPU',
          name: isGpuApproved ? 'GPU Quota (Published)' : 'GPU Quota (Unpublished)',
          type: 'Procedure',
          val: isGpuApproved ? 11 : 7,
          color: isGpuApproved ? '#10b981' : '#64748b',
          status: isGpuApproved ? 'APPROVED' : 'UNPUBLISHED',
          description: isGpuApproved ? '8x H100 GPU cluster quota approved by Marcus Vance' : 'Awaiting SME approval via Marcus Vance'
        },
        { id: 'PROC-SEC-03', name: 'Device Offboard', type: 'Procedure', val: 10, color: '#ef4444', description: 'Remote wipe protocol upon employee termination' },
        { id: 'PROC-OPS-05', name: 'Refund Workflow', type: 'Procedure', val: 10, color: '#06b6d4', description: 'SLA credit exception audit trail' },

        // Applications
        { id: 'APP-RAMP', name: 'Ramp', type: 'Application', val: 8, color: '#38bdf8', description: 'Corporate spend & virtual credit card portal' },
        { id: 'APP-NAVAN', name: 'Navan', type: 'Application', val: 8, color: '#10b981', description: 'Corporate travel & hotel lodging platform' },
        { id: 'APP-CROWD', name: 'CrowdStrike', type: 'Application', val: 8, color: '#ec4899', description: 'Cryptographic remote endpoint wipe agent' },
        { id: 'APP-STRIPE', name: 'Stripe Portal', type: 'Application', val: 8, color: '#06b6d4', description: 'Customer billing portal & invoice adjustor' },

        // Policies
        { id: 'POL-FIN-2026', name: 'POL-FIN-2026 ($500)', type: 'Policy', val: 9, color: '#6366f1', status: 'ACTIVE', description: '2026 SaaS Procurement Policy ($500/mo cap)' },
        { id: 'POL-EXP-2026', name: 'POL-EXP-2026 ($250)', type: 'Policy', val: 9, color: '#10b981', status: 'ACTIVE', description: '2026 Lodging Policy ($250/night max limit)' },
        { id: 'POL-EXP-2024', name: 'POL-EXP-2024 ($150)', type: 'Policy', val: 6, color: '#64748b', status: 'SUPERSEDED', description: 'Legacy 2024 lodging policy (Superseded & Rejected)' },
        { id: 'POL-SEC-101', name: 'POL-SEC-101 (0-hr)', type: 'Policy', val: 9, color: '#ef4444', status: 'ACTIVE', description: 'Mandatory 0-hour immediate cryptographic laptop wipe' },
        {
          id: 'POL-HR-202',
          name: 'POL-HR-202 (7-day)',
          type: 'Policy',
          val: 8,
          color: curatorStatus === 'RESOLVED' ? '#64748b' : '#f59e0b',
          status: curatorStatus === 'RESOLVED' ? 'SUPERSEDED' : 'CONFLICT',
          description: curatorStatus === 'RESOLVED' ? 'HR 7-day grace period (Superseded by Curator Resolution)' : 'HR 7-day tax document retrieval grace period'
        },

        // Contacts (SMEs)
        { id: 'SME-PRIYA', name: 'Priya Sharma', type: 'Contact', val: 8, color: '#f43f5e', description: 'Head of Finance & SaaS Approver (priya@acme.corp)' },
        { id: 'SME-MARCUS', name: 'Marcus Vance', type: 'Contact', val: 8, color: '#8b5cf6', description: 'Staff Infrastructure Lead (marcus@acme.corp)' },
        { id: 'SME-ALEX', name: 'Alex Rivera', type: 'Contact', val: 8, color: '#ec4899', description: 'Head of InfoSec (alex@acme.corp)' },
        { id: 'SME-SARAH', name: 'Sarah Chen', type: 'Contact', val: 8, color: '#f59e0b', description: 'Director of HR PeopleOps (sarah@acme.corp)' },

        // Decision Provenance
        { id: 'DEC-901', name: 'DEC-901 Exception', type: 'Decision', val: 8, color: '#06b6d4', description: 'Executive SLA Outage Credit ($1,200 approved exception)' },
        { id: 'DOC-SLACK-901', name: 'Slack Thread #ops-outage', type: 'Document', val: 7, color: '#38bdf8', description: 'Primary evidence thread with VP Operations sign-off' }
      ];

      const links: Graph3DLink[] = [
        // Finance Path
        { source: 'DEPT-FIN', target: 'PROC-SAAS-01', label: 'RESPONSIBLE_FOR', color: '#6366f1', particles: 4 },
        { source: 'PROC-SAAS-01', target: 'APP-RAMP', label: 'USES_APP', color: '#38bdf8', particles: 4 },
        { source: 'PROC-SAAS-01', target: 'POL-FIN-2026', label: 'GOVERNED_BY', color: '#6366f1', particles: 4 },
        { source: 'PROC-SAAS-01', target: 'SME-PRIYA', label: 'APPROVED_BY', color: '#f43f5e', particles: 4 },

        // Travel / Supersession Path
        { source: 'DEPT-FIN', target: 'PROC-TRV-02', label: 'RESPONSIBLE_FOR', color: '#6366f1', particles: 2 },
        { source: 'PROC-TRV-02', target: 'APP-NAVAN', label: 'USES_APP', color: '#10b981', particles: 3 },
        { source: 'PROC-TRV-02', target: 'POL-EXP-2026', label: 'GOVERNED_BY', color: '#10b981', particles: 4 },
        { source: 'POL-EXP-2026', target: 'POL-EXP-2024', label: 'SUPERSEDES', color: '#10b981', particles: 4 },

        // Engineering / GPU Path
        { source: 'DEPT-ENG', target: 'PROC-ENG-GPU', label: 'RESPONSIBLE_FOR', color: isGpuApproved ? '#10b981' : '#64748b', particles: isGpuApproved ? 4 : 0 },
        { source: 'PROC-ENG-GPU', target: 'SME-MARCUS', label: 'APPROVED_BY', color: '#8b5cf6', particles: isGpuApproved ? 4 : 0 },

        // Security vs HR Conflict / Resolution
        { source: 'DEPT-SEC', target: 'PROC-SEC-03', label: 'RESPONSIBLE_FOR', color: '#ef4444', particles: 2 },
        { source: 'PROC-SEC-03', target: 'APP-CROWD', label: 'USES_APP', color: '#ec4899', particles: 2 },
        { source: 'PROC-SEC-03', target: 'POL-SEC-101', label: 'GOVERNED_BY', color: '#ef4444', particles: 3 },
        { source: 'DEPT-HR', target: 'POL-HR-202', label: 'RESPONSIBLE_FOR', color: '#f59e0b', particles: 2 },
        {
          source: 'POL-SEC-101',
          target: 'POL-HR-202',
          label: curatorStatus === 'RESOLVED' ? 'SUPERSEDES' : 'CONFLICTS_WITH',
          color: curatorStatus === 'RESOLVED' ? '#10b981' : '#ef4444',
          particles: curatorStatus === 'RESOLVED' ? 4 : 6
        },

        // Operations / Decision Provenance Path
        { source: 'DEPT-OPS', target: 'PROC-OPS-05', label: 'RESPONSIBLE_FOR', color: '#06b6d4', particles: 2 },
        { source: 'PROC-OPS-05', target: 'APP-STRIPE', label: 'USES_APP', color: '#06b6d4', particles: 2 },
        { source: 'DEC-901', target: 'PROC-OPS-05', label: 'EXEMPLIFIES', color: '#06b6d4', particles: 3 },
        { source: 'DEC-901', target: 'DOC-SLACK-901', label: 'SUPPORTED_BY', color: '#38bdf8', particles: 4 }
      ];

      return { nodes, links };
    } else {
      // Globex Inc Topology (European Subsidiary)
      const nodes: Graph3DNode[] = [
        { id: 'GLOBEX-FIN', name: 'Globex Finance', type: 'Department', val: 14, color: '#8b5cf6', description: 'European subsidiary budget & Brex accounts' },
        { id: 'GLOBEX-ENG', name: 'Globex Engineering', type: 'Department', val: 14, color: '#3b82f6', description: 'Berlin infrastructure cluster' },
        { id: 'PROC-GLX-01', name: 'Globex SaaS Purchase', type: 'Procedure', val: 10, color: '#8b5cf6', description: 'Brex spend approval up to €100/mo' },
        { id: 'APP-BREX', name: 'Brex', type: 'Application', val: 8, color: '#f59e0b', description: 'Globex corporate spend card' },
        { id: 'POL-GLX-2026', name: 'POL-GLX-2026 (€100)', type: 'Policy', val: 9, color: '#8b5cf6', status: 'ACTIVE', description: 'Globex 2026 Software Cap (€100/mo)' },
        { id: 'SME-HANS', name: 'Hans Gruber', type: 'Contact', val: 8, color: '#ec4899', description: 'VP Finance Globex (hans@globex.de)' }
      ];

      const links: Graph3DLink[] = [
        { source: 'GLOBEX-FIN', target: 'PROC-GLX-01', label: 'RESPONSIBLE_FOR', color: '#8b5cf6', particles: 4 },
        { source: 'PROC-GLX-01', target: 'APP-BREX', label: 'USES_APP', color: '#f59e0b', particles: 4 },
        { source: 'PROC-GLX-01', target: 'POL-GLX-2026', label: 'GOVERNED_BY', color: '#8b5cf6', particles: 4 },
        { source: 'PROC-GLX-01', target: 'SME-HANS', label: 'APPROVED_BY', color: '#ec4899', particles: 4 }
      ];

      return { nodes, links };
    }
  }, [tenantId, trapType, isGpuApproved, curatorStatus]);

  const { theme } = useTheme();

  // Update graphData dynamically when tenant, trap or status changes
  useEffect(() => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.graphData(graphData);
    }
  }, [graphData]);

  // Update canvas background when theme changes
  useEffect(() => {
    if (graphInstanceRef.current) {
      const bg = theme === 'light' ? '#f8fafc' : '#030712';
      graphInstanceRef.current.backgroundColor(bg);
    }
  }, [theme]);

  // Initialize 3D WebGL Force Graph once on mount
  useEffect(() => {
    let isCancelled = false;

    const initGraph = async () => {
      if (!containerRef.current) return;

      try {
        // Dynamically import 3d-force-graph to avoid SSR issues in Next.js
        const ForceGraph3DModule = (await import('3d-force-graph')).default;

        if (isCancelled || !containerRef.current) return;

        if (graphInstanceRef.current && graphInstanceRef.current._destructor) {
          graphInstanceRef.current._destructor();
          graphInstanceRef.current = null;
        }

        // Safely clear any leftover raw DOM canvas nodes
        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        const width = containerRef.current.clientWidth || 800;
        const height = containerRef.current.clientHeight || 520;
        const currentBg = theme === 'light' ? '#f8fafc' : '#030712';

        // Initialize WebGL Force Graph
        const GraphConstructor = ForceGraph3DModule as unknown as new (el: HTMLElement) => ForceGraph3DInstance;
        const Graph = new GraphConstructor(containerRef.current)
          .width(width)
          .height(height)
          .backgroundColor(currentBg)
          .showNavInfo(false)
          .graphData(graphData)
          .nodeLabel((node: Graph3DNode) => `
            <div style="background: ${theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(3, 7, 18, 0.9)'}; padding: 8px 12px; border-radius: 10px; border: 1px solid ${theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}; box-shadow: 0 10px 30px rgba(0,0,0,0.2); font-family: monospace; color: ${theme === 'light' ? '#0f172a' : '#fff'};">
              <div style="font-weight: bold; font-size: 13px;">${node.name}</div>
              <div style="color: #0284c7; font-size: 11px; margin-top: 2px;">${node.type} • ID: ${node.id}</div>
              <div style="color: ${theme === 'light' ? '#475569' : '#94a3b8'}; font-size: 10px; margin-top: 4px; max-width: 220px;">${node.description}</div>
              ${node.status ? `<div style="font-size: 9px; margin-top: 4px; color: ${node.status === 'SUPERSEDED' ? '#ef4444' : '#10b981'}; font-weight: bold;">[${node.status}]</div>` : ''}
            </div>
          `)
          .nodeColor((node: Graph3DNode) => node.color)
          .nodeVal((node: Graph3DNode) => node.val)
          .linkColor((link: Graph3DLink) => link.color)
          .linkWidth(() => 1.6)
          .linkDirectionalParticles((link: Graph3DLink) => link.particles || 2)
          .linkDirectionalParticleSpeed(() => 0.007)
          .linkDirectionalParticleWidth(2.5)
          .onNodeClick((node: Graph3DNode) => {
            setSelectedNode(node);
            // Smoothly glide camera toward the clicked node
            if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
              const distance = 80;
              const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
              Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                { x: node.x, y: node.y, z: node.z },
                1200
              );
            }
          });

        // Set camera orbit rotation
        Graph.controls().autoRotate = true;
        Graph.controls().autoRotateSpeed = 0.6;

        graphInstanceRef.current = Graph as unknown as ForceGraph3DInstance;
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize 3D Force Graph:', err);
      }
    };

    initGraph();

    // Window resize observer
    const handleResize = () => {
      if (containerRef.current && graphInstanceRef.current) {
        graphInstanceRef.current.width(containerRef.current.clientWidth);
        graphInstanceRef.current.height(containerRef.current.clientHeight);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isCancelled = true;
      window.removeEventListener('resize', handleResize);
      if (graphInstanceRef.current && graphInstanceRef.current._destructor) {
        graphInstanceRef.current._destructor();
        graphInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Toggle Auto Rotation
  const toggleRotation = () => {
    if (graphInstanceRef.current) {
      const controls = graphInstanceRef.current.controls();
      controls.autoRotate = !isRotating;
      setIsRotating(!isRotating);
    }
  };

  // Reset Camera View
  const handleResetCamera = () => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.cameraPosition({ x: 0, y: 0, z: 280 }, { x: 0, y: 0, z: 0 }, 1000);
      setSelectedNode(null);
    }
  };

  // Zoom In / Out
  const handleZoom = (inward: boolean) => {
    if (graphInstanceRef.current) {
      // Zoom by moving camera closer
      const factor = inward ? 0.75 : 1.35;
      const currentPos = { x: 0, y: 0, z: 280 * factor };
      graphInstanceRef.current.cameraPosition(currentPos, { x: 0, y: 0, z: 0 }, 500);
    }
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-slate-950/70 shadow-2xl backdrop-blur-2xl">
      {/* Top Header / HUD */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-lg text-xs font-mono text-slate-200">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold text-white">Spatial 3D Graph Orbit</span>
            <span className="text-[10px] text-cyan-300 px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800/40">
              WebGL 60FPS
            </span>
          </div>
          <div className="hidden sm:flex items-center px-2.5 py-1.5 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/5 text-[11px] font-mono text-slate-400">
            {graphData.nodes.length} Nodes • {graphData.links.length} Directed Links
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1.5 pointer-events-auto bg-slate-900/80 backdrop-blur-xl p-1 rounded-xl border border-white/10 shadow-lg">
          <button
            onClick={toggleRotation}
            title={isRotating ? 'Pause Rotation' : 'Start Auto-Rotate'}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button
            onClick={() => handleZoom(true)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleZoom(false)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetCamera}
            title="Reset Perspective"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Selected Node Spatial HUD Drawer */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-auto bg-slate-900/90 backdrop-blur-2xl border border-indigo-500/30 p-4 rounded-2xl shadow-2xl animate-fade-in flex items-start justify-between gap-4">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedNode.color }} />
              <span className="text-sm font-bold text-white">{selectedNode.name}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {selectedNode.type}
              </span>
              {selectedNode.status && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  selectedNode.status === 'SUPERSEDED'
                    ? 'bg-red-950/80 text-red-300 border border-red-800/40'
                    : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40'
                }`}>
                  {selectedNode.status}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
            <div className="text-[11px] font-mono text-indigo-400 pt-1">
              FalkorDB Node ID: <code className="text-white bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{selectedNode.id}</code>
            </div>
          </div>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 3D Force Graph WebGL Canvas Area */}
      <div className="w-full h-[520px] relative overflow-hidden">
        {/* Pure Canvas Container - React must never render children inside this div */}
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Loading Overlay Sibling */}
        {!isReady && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 text-xs font-mono space-y-2 z-10">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span>Initializing FalkorDB WebGL Spatial Engine...</span>
          </div>
        )}
      </div>

      {/* Canvas Footnote */}
      <div className="px-5 py-2.5 bg-slate-950/80 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <span className="flex items-center space-x-1.5">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Interactive 3D Orbit: Drag to rotate • Scroll to zoom • Click node to focus</span>
        </span>
        <span className="text-indigo-400">FalkorDB Multi-Tenant Spatial Graph</span>
      </div>
    </div>
  );
}
