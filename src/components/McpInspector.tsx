'use client';

import React, { useState } from 'react';
import { Terminal, Play, CheckCircle2, Copy, Check, RefreshCw } from 'lucide-react';

interface McpTool {
  name: string;
  description: string;
  defaultParams: Record<string, unknown>;
}

const MCP_SAMPLE_TOOLS: McpTool[] = [
  {
    name: 'setubrain_verify_policy_path',
    description: 'Traverses the multi-tenant FalkorDB graph to return verified non-superseded policies',
    defaultParams: {
      tenantId: 'tenant_acme',
      query: 'How do I purchase software?',
    },
  },
  {
    name: 'setubrain_compile_skill_md',
    description: 'Compiles graph traversal facts into an executable SKILL.md for autonomous agents',
    defaultParams: {
      tenantId: 'tenant_acme',
      procedureId: 'PROC-SAAS-01',
    },
  },
  {
    name: 'setubrain_curator_conflict_scan',
    description: 'Scans the knowledge graph topology for contradictory policies or active conflict flags',
    defaultParams: {
      tenantId: 'tenant_acme',
    },
  },
  {
    name: 'setubrain_route_to_sme',
    description: 'Resolves the authoritative Subject Matter Expert contact for an unverified department or topic',
    defaultParams: {
      tenantId: 'tenant_acme',
      departmentSlug: 'engineering',
    },
  },
];

export default function McpInspector() {
  const [selectedTool, setSelectedTool] = useState<McpTool>(MCP_SAMPLE_TOOLS[0]);
  const [paramsJson, setParamsJson] = useState<string>(
    JSON.stringify(MCP_SAMPLE_TOOLS[0].defaultParams, null, 2)
  );
  const [loading, setLoading] = useState(false);
  const [mcpResponse, setMcpResponse] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSelectTool = (tool: McpTool) => {
    setSelectedTool(tool);
    setParamsJson(JSON.stringify(tool.defaultParams, null, 2));
    setMcpResponse(null);
  };

  const handleExecuteMcpCall = async () => {
    setLoading(true);
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(paramsJson);
    } catch {
      setMcpResponse(JSON.stringify({ error: 'Invalid JSON parameters' }, null, 2));
      setLoading(false);
      return;
    }

    const payload = {
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: selectedTool.name,
        arguments: parsedArgs,
      },
    };

    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setMcpResponse(JSON.stringify(data, null, 2));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Network error';
      setMcpResponse(JSON.stringify({ error: msg }, null, 2));
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = () => {
    if (mcpResponse) {
      navigator.clipboard.writeText(mcpResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-5">
      <div className="p-5 sm:p-6 rounded-xl bg-[#111114] border border-white/[0.08] shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-white/[0.08] flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white flex items-center space-x-2">
                <span>Model Context Protocol (MCP) Server Inspector</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/[0.08] font-mono">
                  Track 01 • Live JSON-RPC 2.0
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Test how autonomous AI agents invoke SetuBrain as an MCP tool provider (`/api/mcp`) to act on connected FalkorDB data.
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-500 font-mono">Endpoint: /api/mcp</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Tool Selector & Request Payload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block">
              Select Registered MCP Tool
            </label>
            <div className="space-y-2">
              {MCP_SAMPLE_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all cursor-pointer ${
                    selectedTool.name === tool.name
                      ? 'bg-zinc-800 border-white/20 text-white shadow-sm'
                      : 'bg-[#0c0c0e] border-white/[0.06] text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  <div className="font-mono font-medium text-[11px] text-zinc-200">{tool.name}</div>
                  <div className="text-[10px] text-zinc-400 line-clamp-1">{tool.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                JSON-RPC Arguments
              </label>
              <span className="text-[10px] text-zinc-500 font-mono">Editable Payload</span>
            </div>
            <textarea
              rows={6}
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              className="w-full bg-[#0c0c0e] p-3 rounded-lg border border-white/[0.08] font-mono text-xs text-zinc-200 focus:outline-none focus:border-zinc-400"
            />
            <button
              onClick={handleExecuteMcpCall}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-950 text-xs font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer border border-zinc-700/60 dark:border-transparent"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute MCP Tool Call</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Response JSON */}
        <div className="lg:col-span-7">
          <div className="p-5 rounded-xl bg-[#111114] border border-white/[0.08] space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1.5 pr-2 border-r border-zinc-700/60">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block shadow-sm shadow-red-500/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block shadow-sm shadow-amber-500/30" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block shadow-sm shadow-emerald-500/30" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>JSON-RPC 2.0 Response Payload</span>
                </span>
              </div>
              {mcpResponse && (
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-[11px] text-zinc-300 border border-white/[0.08] transition-all cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-zinc-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <pre className="bg-[#0c0c0e] p-4 rounded-lg border border-white/[0.06] text-[11px] font-mono text-zinc-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed shadow-inner">
              {mcpResponse || `// Click 'Execute MCP Tool Call' above to inspect live JSON-RPC 2.0 response from /api/mcp`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
