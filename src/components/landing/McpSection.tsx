'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';

export default function McpSection() {
  const [copied, setCopied] = useState(false);
  const [activeTool, setActiveTool] = useState(0);

  const tools = [
    {
      name: 'setubrain_verify_policy_path',
      desc: 'Traverses multi-hop corporate policy chains to verify procedural ownership and active constraints.',
      req: `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "setubrain_verify_policy_path",
    "arguments": {
      "tenantId": "tenant_acme",
      "query": "How do I purchase software?"
    }
  }
}`,
      res: `{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\\"authoritativeAnswer\\": \\"At Acme Corp, new software purchases must be requested through Ramp...\\", \\"trapType\\": \\"trap1_multihop\\"}"
    }]
  }
}`,
    },
    {
      name: 'setubrain_compile_skill_md',
      desc: 'Compiles verified Cypher traversal paths into executable YAML+Markdown SKILL.md specs.',
      req: `{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "setubrain_compile_skill_md",
    "arguments": {
      "tenantId": "tenant_acme",
      "procedureId": "PROC-SAAS-01"
    }
  }
}`,
      res: `{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [{
      "type": "text",
      "text": "---\\nname: acme-saas-procurement-executor\\nversion: 1.2.0\\n...\\n"
    }]
  }
}`,
    },
    {
      name: 'setubrain_curator_conflict_scan',
      desc: 'Scans the tenant graph for contradictory policies connected via [:CONFLICTS_WITH] edges.',
      req: `{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "setubrain_curator_conflict_scan",
    "arguments": {
      "tenantId": "tenant_acme"
    }
  }
}`,
      res: `{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\\"conflictsDetected\\": 1, \\"pairs\\": [{\\"policyA\\": \\"POL-SEC-101\\", \\"policyB\\": \\"POL-HR-202\\", \\"severity\\": \\"HIGH\\"}]}"
    }]
  }
}`,
    },
    {
      name: 'setubrain_route_to_sme',
      desc: 'Deterministically escalates unindexed queries to the designated human Department SME.',
      req: `{
  "jsonrpc": "2.0",
  "id": 4,
  "method": "tools/call",
  "params": {
    "name": "setubrain_route_to_sme",
    "arguments": {
      "tenantId": "tenant_acme",
      "departmentSlug": "engineering",
      "missingTopic": "GPU Quota"
    }
  }
}`,
      res: `{
  "jsonrpc": "2.0",
  "id": 4,
  "result": {
    "content": [{
      "type": "text",
      "text": "{\\"escalationCreated\\": true, \\"smeName\\": \\"Marcus Vance\\", \\"smeEmail\\": \\"marcus@acme.com\\"}"
    }]
  }
}`,
    },
  ];

  const copyPayload = () => {
    navigator.clipboard.writeText(tools[activeTool].req);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="mcp" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MODEL CONTEXT PROTOCOL (TRACK 01)</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Standard JSON-RPC 2.0{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              MCP Server Integration
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Connect Claude Desktop, Cursor, Antigravity, or custom agent frameworks to SetuBrain via official Model Context Protocol endpoints.
          </p>
        </div>

        {/* Flow Visualization */}
        <div className="mb-12 p-4 rounded-xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-mono">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-300">
            <Cpu className="w-4 h-4 text-purple-400" />
            <span>AI Agent (Claude/Antigravity)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-200">
            <Terminal className="w-4 h-4 text-sky-400" />
            <span>MCP Client (JSON-RPC 2.0)</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/[0.08] text-zinc-200">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span>SetuBrain 4 Tools</span>
          </div>
          <ArrowRight className="w-4 h-4 text-zinc-600 hidden sm:inline" />
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-emerald-500/30 text-emerald-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>FalkorDB Governed Graph</span>
          </div>
        </div>

        {/* Interactive Tool Inspector Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Tool Selector (4 cols) */}
          <div className="lg:col-span-4 space-y-2.5">
            <div className="text-xs font-mono text-zinc-400 px-1 mb-1">REGISTERED MCP TOOLS:</div>
            {tools.map((t, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTool(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer ${
                  activeTool === idx
                    ? 'bg-zinc-900 border-white/[0.2] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12),0_10px_25px_rgba(0,0,0,0.5)]'
                    : 'bg-[#0c0c0e]/70 border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${activeTool === idx ? 'bg-emerald-400' : 'bg-zinc-600'}`} />
                  <span className="text-xs font-mono font-bold text-white">{t.name}</span>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans leading-relaxed line-clamp-2">
                  {t.desc}
                </p>
              </button>
            ))}
          </div>

          {/* JSON-RPC Request & Response (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Request Card */}
            <div className="rounded-2xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono text-zinc-300 font-bold">
                  JSON-RPC 2.0 REQUEST (tools/call)
                </span>
                <button
                  onClick={copyPayload}
                  className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all cursor-pointer border border-white/[0.06]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-300 bg-[#070709] overflow-x-auto select-all">
                <pre>{tools[activeTool].req}</pre>
              </div>
            </div>

            {/* Response Card */}
            <div className="rounded-2xl bg-[#0c0c0e]/95 border border-emerald-500/30 shadow-xl overflow-hidden">
              <div className="px-5 py-3 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-bold">
                  GOVERNED MCP RESULT (FalkorDB Verified)
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  HTTP 200 OK
                </span>
              </div>
              <div className="p-4 font-mono text-xs text-zinc-300 bg-[#070709] overflow-x-auto select-all">
                <pre>{tools[activeTool].res}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
