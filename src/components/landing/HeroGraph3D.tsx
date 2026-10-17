'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  RotateCcw,
  Play,
  Pause,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Check
} from 'lucide-react';

interface HeroNode {
  id: string;
  name: string;
  type: 'Department' | 'Procedure' | 'Application' | 'Policy' | 'Person' | 'Evidence';
  val: number;
  color: string;
  status: 'VERIFIED' | 'STALE' | 'CONFLICT' | 'ACTIVE';
  description: string;
  metadata?: Record<string, string>;
  x?: number;
  y?: number;
  z?: number;
}

interface HeroLink {
  source: string;
  target: string;
  label: string;
  color: string;
  particles?: number;
}

interface ForceGraphInstance {
  graphData: (data: { nodes: HeroNode[]; links: HeroLink[] }) => ForceGraphInstance;
  nodeLabel: (fn: (node: HeroNode) => string) => ForceGraphInstance;
  nodeColor: (fn: (node: HeroNode) => string) => ForceGraphInstance;
  nodeVal: (fn: (node: HeroNode) => number) => ForceGraphInstance;
  linkColor: (fn: (link: HeroLink) => string) => ForceGraphInstance;
  linkWidth: (fn: (link: HeroLink) => number) => ForceGraphInstance;
  linkDirectionalParticles: (fn: (link: HeroLink) => number) => ForceGraphInstance;
  linkDirectionalParticleSpeed: (fn: (link: HeroLink) => number) => ForceGraphInstance;
  linkDirectionalParticleWidth: (val: number) => ForceGraphInstance;
  onNodeClick: (fn: (node: HeroNode) => void) => ForceGraphInstance;
  backgroundColor: (color: string) => ForceGraphInstance;
  showNavInfo: (show: boolean) => ForceGraphInstance;
  controls: () => {
    autoRotate: boolean;
    autoRotateSpeed: number;
  };
  cameraPosition: (
    pos: { x: number; y: number; z: number },
    lookAt?: { x: number; y: number; z: number },
    ms?: number
  ) => ForceGraphInstance;
  width: (w: number) => ForceGraphInstance;
  height: (h: number) => ForceGraphInstance;
  _destructor?: () => void;
}

export default function HeroGraph3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const graphInstanceRef = useRef<ForceGraphInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<HeroNode | null>(null);
  const [isRotating, setIsRotating] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [copiedQuery, setCopiedQuery] = useState(false);

  // High-fidelity Graph Representation of SetuBrain Living Enterprise Graph
  const graphData = useMemo(() => {
    const nodes: HeroNode[] = [
      // Departments
      {
        id: 'DEPT-FIN',
        name: 'Finance',
        type: 'Department',
        val: 18,
        color: '#a855f7', // Purple
        status: 'VERIFIED',
        description: 'Corporate budget, cards & SaaS procurement governance',
        metadata: { owner: 'Priya Sharma (VP Finance)', budget: '$2.4M ARR' },
      },
      {
        id: 'DEPT-ENG',
        name: 'Engineering',
        type: 'Department',
        val: 16,
        color: '#8b5cf6',
        status: 'VERIFIED',
        description: 'Infrastructure, compute clusters & AI platform services',
        metadata: { owner: 'Marcus Vance', quota: '4x H100 Auto' },
      },
      {
        id: 'DEPT-SEC',
        name: 'Security',
        type: 'Department',
        val: 15,
        color: '#ec4899',
        status: 'CONFLICT',
        description: 'Zero-trust endpoints, remote cryptographic wipe & audit',
        metadata: { policy: 'POL-SEC-101 (Immediate)' },
      },
      {
        id: 'DEPT-HR',
        name: 'Human Resources',
        type: 'Department',
        val: 15,
        color: '#f59e0b',
        status: 'CONFLICT',
        description: 'Employee lifecycle, onboarding & departure grace periods',
        metadata: { policy: 'POL-HR-202 (7-Day)' },
      },

      // Procedures
      {
        id: 'PROC-SAAS-01',
        name: 'SaaS Purchase',
        type: 'Procedure',
        val: 14,
        color: '#06b6d4', // Cyan
        status: 'VERIFIED',
        description: 'Standard software procurement workflow via corporate card',
        metadata: { threshold: '$500/mo self-serve', app: 'Ramp' },
      },
      {
        id: 'PROC-GPU-REQ',
        name: 'GPU Allocation',
        type: 'Procedure',
        val: 12,
        color: '#06b6d4',
        status: 'VERIFIED',
        description: 'AI cluster provisioning on Run:ai infrastructure',
        metadata: { limit: 'Up to 8x H100 for 72 hrs' },
      },
      {
        id: 'PROC-WIPE-01',
        name: 'Device Offboarding',
        type: 'Procedure',
        val: 12,
        color: '#fb7185', // Crimson conflict
        status: 'CONFLICT',
        description: 'Offboarding hardware retention vs immediate wipe conflict',
        metadata: { status: 'Curator Agent Resolution Required' },
      },

      // Applications
      {
        id: 'APP-RAMP',
        name: 'Ramp',
        type: 'Application',
        val: 13,
        color: '#38bdf8', // Sky Blue
        status: 'VERIFIED',
        description: 'Spend management & virtual corporate credit card portal',
        metadata: { category: 'Finance', sso: 'Okta Enforced' },
      },
      {
        id: 'APP-RUNAI',
        name: 'Run:ai',
        type: 'Application',
        val: 12,
        color: '#38bdf8',
        status: 'VERIFIED',
        description: 'Dynamic GPU orchestration cluster manager',
        metadata: { cluster: 'us-east-h100-pool' },
      },

      // Policies
      {
        id: 'POL-FIN-2026',
        name: 'POL-FIN-2026',
        type: 'Policy',
        val: 16,
        color: '#34d399', // Emerald
        status: 'VERIFIED',
        description: 'Authoritative Software & SaaS Procurement Policy v2.4',
        metadata: { effective: 'Jan 1, 2026', status: 'ACTIVE' },
      },
      {
        id: 'POL-TRV-2024',
        name: 'POL-TRV-2024 ($150)',
        type: 'Policy',
        val: 11,
        color: '#fbbf24', // Amber stale
        status: 'STALE',
        description: 'Legacy travel lodging policy ($150/night ceiling)',
        metadata: { status: 'SUPERSEDED', supersededBy: 'POL-TRV-2025' },
      },
      {
        id: 'POL-TRV-2025',
        name: 'POL-TRV-2025 ($250)',
        type: 'Policy',
        val: 14,
        color: '#34d399',
        status: 'VERIFIED',
        description: 'Active travel lodging policy ($250/night ceiling)',
        metadata: { status: 'ACTIVE', supersedes: 'POL-TRV-2024' },
      },

      // People / SMEs
      {
        id: 'SME-PRIYA',
        name: 'Priya Sharma',
        type: 'Person',
        val: 13,
        color: '#f59e0b',
        status: 'VERIFIED',
        description: 'VP of Finance • Authorizer for SaaS contracts > $5,000/yr',
        metadata: { email: 'priya@acme.com', role: 'Department SME' },
      },
      {
        id: 'SME-MARCUS',
        name: 'Marcus Vance',
        type: 'Person',
        val: 13,
        color: '#f59e0b',
        status: 'VERIFIED',
        description: 'Principal Infra Architect • Engineering Department SME',
        metadata: { email: 'marcus@acme.com', role: 'Department SME' },
      },

      // Evidence & Documents
      {
        id: 'DOC-FIN-2026',
        name: 'FinanceHandbook.pdf',
        type: 'Evidence',
        val: 11,
        color: '#64748b',
        status: 'VERIFIED',
        description: 'Signed procurement guidelines document stored in Notion',
        metadata: { sha256: '9b8f...21c0', verifiedBy: 'FalkorDB Traversal' },
      },
    ];

    const links: HeroLink[] = [
      // Multi-Hop Path (Finance -> SaaS Proc -> Ramp -> POL-FIN-2026 -> Priya -> Doc)
      { source: 'DEPT-FIN', target: 'PROC-SAAS-01', label: 'RESPONSIBLE_FOR', color: '#38bdf8', particles: 3 },
      { source: 'PROC-SAAS-01', target: 'APP-RAMP', label: 'USES_APP', color: '#38bdf8', particles: 3 },
      { source: 'PROC-SAAS-01', target: 'POL-FIN-2026', label: 'GOVERNED_BY', color: '#34d399', particles: 3 },
      { source: 'POL-FIN-2026', target: 'SME-PRIYA', label: 'APPROVED_BY', color: '#f59e0b', particles: 2 },
      { source: 'POL-FIN-2026', target: 'DOC-FIN-2026', label: 'EVIDENCED_BY', color: '#64748b', particles: 2 },

      // Superseded link (POL-TRV-2025 SUPERSEDES POL-TRV-2024)
      { source: 'DEPT-FIN', target: 'POL-TRV-2025', label: 'OWNS', color: '#34d399', particles: 2 },
      { source: 'POL-TRV-2025', target: 'POL-TRV-2024', label: 'SUPERSEDES', color: '#fbbf24', particles: 2 },

      // Engineering Cluster Flow
      { source: 'DEPT-ENG', target: 'PROC-GPU-REQ', label: 'RESPONSIBLE_FOR', color: '#a855f7', particles: 2 },
      { source: 'PROC-GPU-REQ', target: 'APP-RUNAI', label: 'USES_APP', color: '#38bdf8', particles: 2 },
      { source: 'PROC-GPU-REQ', target: 'SME-MARCUS', label: 'ESCALATES_TO', color: '#f59e0b', particles: 2 },

      // Contradiction / Conflict Links (Security vs HR)
      { source: 'DEPT-SEC', target: 'PROC-WIPE-01', label: 'GOVERNS', color: '#fb7185', particles: 2 },
      { source: 'DEPT-HR', target: 'PROC-WIPE-01', label: 'DISPUTES', color: '#fb7185', particles: 2 },
    ];

    return { nodes, links };
  }, []);

  // Set default selected node to POL-FIN-2026
  useEffect(() => {
    const defaultNode = graphData.nodes.find((n) => n.id === 'POL-FIN-2026');
    if (defaultNode) {
      const timer = setTimeout(() => setSelectedNode(defaultNode), 0);
      return () => clearTimeout(timer);
    }
  }, [graphData]);

  // Dynamic 3D Force Graph WebGL Initialization
  useEffect(() => {
    let isCancelled = false;

    const initGraph = async () => {
      try {
        if (!containerRef.current) return;

        const ForceGraph3DModule = (await import('3d-force-graph')).default;
        if (isCancelled || !containerRef.current) return;

        // Safely destroy previous force graph instance if exists
        if (graphInstanceRef.current && graphInstanceRef.current._destructor) {
          graphInstanceRef.current._destructor();
          graphInstanceRef.current = null;
        }

        while (containerRef.current.firstChild) {
          containerRef.current.removeChild(containerRef.current.firstChild);
        }

        const GraphConstructor = ForceGraph3DModule as unknown as new (el: HTMLElement) => ForceGraphInstance;
        const Graph = new GraphConstructor(containerRef.current)
          .backgroundColor('rgba(3, 7, 18, 0)')
          .width(containerRef.current.clientWidth)
          .height(containerRef.current.clientHeight || 540)
          .showNavInfo(false)
          .graphData(graphData)
          .nodeLabel((node: HeroNode) => `
            <div style="background: rgba(3, 7, 18, 0.95); padding: 8px 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.18); font-family: monospace; color: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
              <div style="font-weight: bold; font-size: 13px; color: ${node.color}">${node.name}</div>
              <div style="color: #38bdf8; font-size: 11px; margin-top: 2px;">Type: ${node.type} • ID: ${node.id}</div>
              <div style="color: #94a3b8; font-size: 10px; margin-top: 4px; max-width: 220px;">${node.description}</div>
              <div style="font-size: 9px; margin-top: 4px; color: ${
                node.status === 'VERIFIED'
                  ? '#34d399'
                  : node.status === 'CONFLICT'
                  ? '#fb7185'
                  : '#fbbf24'
              }; font-weight: bold;">[${node.status}]</div>
            </div>
          `)
          .nodeColor((node: HeroNode) => node.color)
          .nodeVal((node: HeroNode) => node.val)
          .linkColor((link: HeroLink) => link.color)
          .linkWidth(() => 1.8)
          .linkDirectionalParticles((link: HeroLink) => link.particles || 2)
          .linkDirectionalParticleSpeed(() => 0.008)
          .linkDirectionalParticleWidth(2.8)
          .onNodeClick((node: HeroNode) => {
            setSelectedNode(node);
            if (node.x !== undefined && node.y !== undefined && node.z !== undefined) {
              const distance = 85;
              const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);
              Graph.cameraPosition(
                { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
                { x: node.x, y: node.y, z: node.z },
                1200
              );
            }
          });

        Graph.controls().autoRotate = true;
        Graph.controls().autoRotateSpeed = 0.7;

        graphInstanceRef.current = Graph as unknown as ForceGraphInstance;
        setIsReady(true);
      } catch (err) {
        console.error('Failed to initialize Hero 3D WebGL Graph:', err);
      }
    };

    initGraph();

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
  }, [graphData]);

  const toggleRotation = () => {
    if (graphInstanceRef.current) {
      const controls = graphInstanceRef.current.controls();
      controls.autoRotate = !isRotating;
      setIsRotating(!isRotating);
    }
  };

  const handleResetCamera = () => {
    if (graphInstanceRef.current) {
      graphInstanceRef.current.cameraPosition({ x: 0, y: 0, z: 280 }, { x: 0, y: 0, z: 0 }, 1000);
      const defaultNode = graphData.nodes.find((n) => n.id === 'POL-FIN-2026');
      if (defaultNode) setSelectedNode(defaultNode);
    }
  };

  const handleZoom = (inward: boolean) => {
    if (graphInstanceRef.current) {
      const factor = inward ? 0.75 : 1.35;
      const currentPos = { x: 0, y: 0, z: 280 * factor };
      graphInstanceRef.current.cameraPosition(currentPos, { x: 0, y: 0, z: 0 }, 500);
    }
  };

  const copyCypher = () => {
    const cypher = `MATCH (d:Department {id: 'DEPT-FIN'})-[:RESPONSIBLE_FOR]->(p:Procedure)-[:USES_APP]->(a:Application)\nMATCH (p)-[:GOVERNED_BY]->(pol:Policy)\nWHERE pol.status = 'ACTIVE'\nRETURN d.name, p.title, a.name, pol.title;`;
    navigator.clipboard.writeText(cypher);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-3xl bg-[#080D18]/90 border border-white/10 backdrop-blur-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
      {/* Subtle Blueprint Grid Pattern in Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Radial Atmosphere Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-sky-500/15 via-indigo-500/10 to-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* TOP HUD BAR */}
      <div className="relative z-20 px-5 pt-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">GRAPH STATUS CONNECTED</span>
          </div>
        </div>

        {/* Top-Right Badges: Latency & States */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900/80 border border-white/10 text-xs font-mono text-slate-300 shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>FalkorDB Engine:</span>
            <span className="text-cyan-400 font-bold">14.3 ms</span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-900/80 p-1 rounded-xl border border-white/10 text-[10px] font-mono">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 font-medium">
              ● VERIFIED
            </span>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 font-medium">
              ● STALE
            </span>
            <span className="px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-400 font-medium">
              ● CONFLICT
            </span>
          </div>
        </div>
      </div>

      {/* FLOATING LEFT TOOLBAR */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
        <button
          onClick={() => handleZoom(true)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(false)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={toggleRotation}
          className={`p-2 rounded-xl transition-all cursor-pointer ${
            isRotating
              ? 'text-sky-400 bg-sky-500/10 border border-sky-500/20'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={isRotating ? 'Pause Orbit' : 'Resume Orbit'}
        >
          {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={handleResetCamera}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Recenter Camera"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 3D WebGL Canvas Container */}
      <div className="relative w-full flex-1 overflow-hidden z-10">
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-mono text-slate-400 pointer-events-none z-10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping mr-2" />
            Initializing FalkorDB WebGL Graph Canvas...
          </div>
        )}
      </div>

      {/* BOTTOM HUD SECTION: Cypher Telemetry & Selected Node Inspector */}
      <div className="relative z-20 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 pointer-events-none">
        {/* Left Card: Live Cypher Traversal Snippet */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-white/10 backdrop-blur-md font-mono text-xs text-slate-300 pointer-events-auto shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2">
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>LIVE CYPHER TRAVERSAL (4 HOPS)</span>
            </div>
            <button
              onClick={copyCypher}
              className="text-[11px] text-slate-400 hover:text-sky-300 flex items-center space-x-1 cursor-pointer transition-all"
            >
              {copiedQuery ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedQuery ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-[11px] leading-relaxed text-slate-400 select-all overflow-x-auto">
            <span className="text-purple-400">MATCH</span> (d:Department)-[:RESPONSIBLE_FOR]-&gt;(p:Procedure)<br />
            <span className="text-purple-400">MATCH</span> (p)-[:USES_APP]-&gt;(a:Application)-[:GOVERNED_BY]-&gt;(pol:Policy)<br />
            <span className="text-purple-400">WHERE</span> pol.status = <span className="text-emerald-400">&apos;ACTIVE&apos;</span> <span className="text-purple-400">RETURN</span> pol, a;
          </div>
        </div>

        {/* Right Card: Node Detail Inspector */}
        {selectedNode && (
          <div className="p-3.5 rounded-2xl bg-slate-950/85 border border-white/15 backdrop-blur-md pointer-events-auto shadow-2xl flex flex-col justify-between animate-fade-in">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: selectedNode.color }}
                  />
                  <h4 className="text-xs font-bold text-white font-mono">
                    {selectedNode.name}
                  </h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-sky-300 font-mono border border-white/10">
                    {selectedNode.type}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                  {selectedNode.description}
                </p>
              </div>

              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                  selectedNode.status === 'VERIFIED'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                    : selectedNode.status === 'CONFLICT'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                }`}
              >
                ● {selectedNode.status}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Tenant: <span className="text-emerald-400">tenant_acme</span></span>
              <span>ID: <code className="text-slate-300">{selectedNode.id}</code></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
