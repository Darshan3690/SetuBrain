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
    <div className="space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Model Context Protocol (MCP) Server Inspector</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                  Track 01 • Live JSON-RPC 2.0
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Test how autonomous AI agents invoke SetuBrain as an MCP tool provider (`/api/mcp`) to act on connected FalkorDB data.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Endpoint: /api/mcp</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tool Selector & Request Payload */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Select Registered MCP Tool
            </label>
            <div className="space-y-2">
              {MCP_SAMPLE_TOOLS.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs transition-all ${
                    selectedTool.name === tool.name
                      ? 'bg-indigo-600/20 border-indigo-500/60 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="font-mono font-bold text-[11px] text-indigo-300">{tool.name}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1">{tool.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                JSON-RPC Arguments
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Editable Payload</span>
            </div>
            <textarea
              rows={6}
              value={paramsJson}
              onChange={(e) => setParamsJson(e.target.value)}
              className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleExecuteMcpCall}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
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
          <div className="p-5 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>JSON-RPC 2.0 Response Payload</span>
              </span>
              {mcpResponse && (
                <button
                  onClick={handleCopyResponse}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <pre className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] font-mono text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {mcpResponse || `// Click 'Execute MCP Tool Call' above to inspect live JSON-RPC 2.0 response from /api/mcp`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
