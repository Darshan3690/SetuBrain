'use client';

import React, { useState } from 'react';
import { FileCode2, Copy, Check, Download, Sparkles } from 'lucide-react';

export default function SkillCompilerSection() {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  const skillContent = `---
name: acme-saas-procurement-executor
description: Autonomously executes compliant SaaS software purchases under Acme Corp policy
version: 1.2.0
tenant_id: tenant_acme
falkordb_graph_key: tenant_acme
provenance_doc: DOC-FIN-2026
effective_date: 2026-01-01
---

# Acme Corp — SaaS Purchase Skill (Governed)

## 1. Verified Policy Rules (from FalkorDB)
- **Governing Policy**: \`POL-FIN-2026\` (Software & SaaS Procurement Policy)
- **Target Application**: Ramp Virtual Corporate Card (\`APP-RAMP\`)
- **Self-Serve Limit**: Purchases under **$500/month** are pre-authorized for team leads.
- **Contract Threshold**: Software contracts exceeding **$5,000/year** require VP of Finance approval.

## 2. Authorized Approvers
- Primary Contact: \`Priya Sharma\` (VP of Finance, priya@acme.com)
- Department: \`Finance (DEPT-FIN)\`

## 3. Ordered Execution Steps
1. Verify software vendor is not listed on Security Disallowed Registry (\`POL-SEC-101\`).
2. Generate single-use virtual card via Ramp API with exact monthly budget cap.
3. If annual spend > $5,000, trigger automated approval request to Priya Sharma before card activation.
4. Record transaction event in FalkorDB episodic memory graph for compliance audit.

## 4. Deterministic Escalation
- If software category is Cloud Compute / GPU clusters, halt execution and route to \`Marcus Vance\` (\`DEPT-ENG\`).`;

  const handleCopy = () => {
    navigator.clipboard.writeText(skillContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([skillContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'SKILL.md');
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  const handleRecompile = () => {
    setIsCompiling(true);
    setTimeout(() => setIsCompiling(false), 800);
  };

  return (
    <section id="skill-compiler" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GRAPH-TO-AGENT CODEGEN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One-Click{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              SKILL.md Compiler
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            AI agents shouldn&apos;t just read raw text. SetuBrain dynamically compiles verified Cypher paths into executable, standardized <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded font-mono text-xs border border-white/[0.08]">SKILL.md</code> instructions for Antigravity, Claude Code, and autonomous AI runtimes.
          </p>
        </div>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Input Graph Subgraph (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-2xl bg-[#0c0c0e]/95 border border-white/[0.08] space-y-4 shadow-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                <span className="text-xs font-mono text-zinc-400">GRAPH INPUT SUBGRAPH:</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  ✓ VERIFIED GRAPH PATH
                </span>
              </div>

              {/* Node Chips */}
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    <span className="text-white font-bold">Department(Finance)</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">DEPT-FIN</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between text-xs font-mono shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-300 font-bold">Procedure(SaaS Purchase)</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">PROC-SAAS-01</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-white font-bold">Application(Ramp)</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">APP-RAMP</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-emerald-500/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-emerald-300 font-bold">Policy(POL-FIN-2026)</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">ACTIVE v2.4</span>
                </div>

                <div className="p-3 rounded-lg bg-zinc-900/80 border border-white/[0.06] flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-white font-bold">Approver(Priya Sharma)</span>
                  </div>
                  <span className="text-zinc-500 text-[11px]">SME-PRIYA</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleRecompile}
                disabled={isCompiling}
                className="w-full py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/[0.08] text-xs font-mono font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-md"
              >
                <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isCompiling ? 'animate-spin' : ''}`} />
                <span>{isCompiling ? 'Re-compiling from FalkorDB...' : 'Re-compile SKILL.md from Graph'}</span>
              </button>
            </div>
          </div>

          {/* Right: Syntax-Highlighted Output Editor (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
            {/* Editor Top Bar */}
            <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-mono text-white font-bold">acme-saas-procurement/SKILL.md</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                  Executable Agent Spec
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-all cursor-pointer border border-white/[0.06]"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs font-mono transition-all cursor-pointer shadow-sm"
                >
                  {downloaded ? <Check className="w-3.5 h-3.5 text-zinc-950" /> : <Download className="w-3.5 h-3.5" />}
                  <span>{downloaded ? 'Downloaded' : 'Download'}</span>
                </button>
              </div>
            </div>

            {/* Code Body */}
            <div className="p-5 font-mono text-xs text-zinc-300 overflow-x-auto leading-relaxed max-h-[460px] bg-[#070709] select-all">
              <pre>{skillContent}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
