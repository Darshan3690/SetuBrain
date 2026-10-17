'use client';

import React from 'react';
import { XCircle, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export default function RetrievalComparison() {
  return (
    <section id="comparison" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>DETERMINISTIC GOVERNANCE BENCHMARK</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vector Similarity vs.{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              Governed Graph Reasoning
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            When enterprise policies evolve, semantic similarity returns whatever text chunk matches best—even if it was superseded last week. Here is what happens on the exact same question.
          </p>
        </div>

        {/* Common Prompt Box */}
        <div className="mb-10 max-w-2xl mx-auto p-4 rounded-xl bg-[#0c0c0e]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl flex items-center space-x-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Search className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-mono text-zinc-400">TEST QUESTION POSED TO BOTH ENGINES:</div>
            <div className="text-sm sm:text-base font-semibold text-white font-sans mt-0.5">
              &ldquo;What is the current hotel reimbursement limit for employee travel?&rdquo;
            </div>
          </div>
        </div>

        {/* Two-Column Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: NAIVE VECTOR RAG (FLAWED) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0c0e]/95 border border-rose-500/30 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-0.5">
            {/* Top Badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-mono font-semibold">
                  TRADITIONAL VECTOR RETRIEVAL (RAG)
                </span>
                <span className="text-xs font-mono text-rose-400 flex items-center space-x-1">
                  <XCircle className="w-4 h-4" />
                  <span>Silent Drift</span>
                </span>
              </div>

              {/* Retrieval Logic Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-rose-500/20 space-y-2 text-xs font-mono">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>Retrieved Top Chunk (Cosine 0.89):</span>
                    <span className="text-rose-400 font-bold">STALE (2024)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/30 text-rose-200 text-xs italic">
                    &ldquo;Employees traveling for business are reimbursed up to $150 per night for standard hotel lodging...&rdquo;
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                    <div>• Source: <code>Travel_Policy_v1_2024.pdf</code></div>
                    <div>• Supersession Check: <span className="text-rose-400 font-bold">NONE (Vector stores lack edge traversal)</span></div>
                    <div>• Policy Status Verification: <span className="text-rose-400 font-bold">UNCHECKED</span></div>
                  </div>
                </div>

                {/* AI Assistant Output */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">Generated AI Response:</span>
                  <p className="text-xs sm:text-sm text-slate-300">
                    &ldquo;According to Acme Corp travel guidelines, your maximum hotel reimbursement is <strong className="text-rose-300 font-bold">$150 per night</strong>.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Failure Banner */}
            <div className="mt-6 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center space-x-3 text-rose-300 text-xs font-mono font-semibold">
              <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
              <span>OUTDATED SOURCE DETECTED • AI hallucinated obsolete $150 ceiling</span>
            </div>
          </div>

          {/* RIGHT: SETUBRAIN GRAPH GOVERNANCE (VERIFIED) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#0c0c0e]/95 border border-emerald-500/40 relative overflow-hidden flex flex-col justify-between shadow-2xl transition-all duration-300 hover:-translate-y-0.5 shadow-[inset_0_1px_0_0_rgba(16,185,129,0.15)]">
            {/* Top Badge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono font-semibold">
                  SETUBRAIN GOVERNED KNOWLEDGE GRAPH
                </span>
                <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified 100%</span>
                </span>
              </div>

              {/* Traversal Logic Breakdown */}
              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/20 space-y-2 text-xs font-mono">
                  <div className="text-slate-400 flex items-center justify-between">
                    <span>FalkorDB Cypher Traversal Path:</span>
                    <span className="text-emerald-400 font-bold">[:SUPERSEDES] FOLLOWED</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 text-xs font-mono leading-relaxed">
                    <span className="text-purple-400">Department</span>(Finance) &rarr; <br />
                    <span className="text-purple-400">Policy</span>(POL-TRV-2025) <span className="text-cyan-400">-[:SUPERSEDES]-&gt;</span> <span className="text-amber-400">Policy</span>(POL-TRV-2024)<br />
                    <span className="text-emerald-400 font-semibold">&bull; Active Policy Cap: $250/night (Effective Feb 2025)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                    <div>• Active Policy: <code>POL-TRV-2025 (v2.0, APPROVED)</code></div>
                    <div>• Provenance Document: <code>FinanceHandbook_2026.pdf (DOC-FIN-2026)</code></div>
                    <div>• Authorizer: <code>Priya Sharma (VP Finance)</code></div>
                  </div>
                </div>

                {/* AI Assistant Output */}
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/5 space-y-2">
                  <span className="text-[11px] font-mono text-slate-400 uppercase">SetuBrain Verified Response:</span>
                  <p className="text-xs sm:text-sm text-slate-200">
                    &ldquo;The authoritative hotel reimbursement limit is <strong className="text-emerald-300 font-bold">$250 per night</strong> for Tier-1 cities under active policy <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">POL-TRV-2025</code>. The legacy $150 limit was formally superseded in Feb 2025.&rdquo;
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Success Banner */}
            <div className="mt-6 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-3 text-emerald-300 text-xs font-mono font-semibold">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>VERIFIED CYPHER TRAVERSAL • Zero hallucination, full audit trail</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
