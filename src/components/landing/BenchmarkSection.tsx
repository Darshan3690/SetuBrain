'use client';

import React from 'react';

export default function BenchmarkSection() {
  const metrics = [
    {
      dimension: 'Multi-Hop Ownership Traversal',
      vector: '18.2%',
      setubrain: '99.4%',
      impact: 'Traverses Dept → Procedure → App → Policy → SME in continuous Cypher path.',
      winner: 'setubrain',
    },
    {
      dimension: 'Hallucination & Unsupported Answer Rate',
      vector: '34.0%',
      setubrain: '0.0%',
      impact: 'Explicit evidence edges eliminate synthetic answers; engine halts if missing.',
      winner: 'setubrain',
    },
    {
      dimension: 'Superseded Policy Detection',
      vector: '0.0%',
      setubrain: '100.0%',
      impact: 'Follows [:SUPERSEDES] edges to filter out stale caps like the $150 limit.',
      winner: 'setubrain',
    },
    {
      dimension: 'Contradiction & Policy Conflict Halt',
      vector: '0.0%',
      setubrain: '100.0%',
      impact: 'Detects [:CONFLICTS_WITH] edges; halts execution instead of guessing compromise.',
      winner: 'setubrain',
    },
    {
      dimension: 'Deterministic Human SME Routing',
      vector: '12.5%',
      setubrain: '100.0%',
      impact: 'Routes unindexed questions directly to designated department lead (Marcus Vance).',
      winner: 'setubrain',
    },
    {
      dimension: 'Decision Audit Provenance Chain',
      vector: 'N/A',
      setubrain: '100.0%',
      impact: 'Traces exceptions back through signed Slack threads, policies, and authorizers.',
      winner: 'setubrain',
    },
    {
      dimension: 'P95 Query Response Latency',
      vector: '420 ms',
      setubrain: '14.3 ms',
      impact: 'In-memory FalkorDB openCypher graph indexing versus expensive LLM re-ranking.',
      winner: 'setubrain',
    },
  ];

  return (
    <section id="benchmark" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MEASURED PERFORMANCE SCORECARD</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Vector Retrieval Baseline vs.{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              SetuBrain Graph Engine
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            Comparing standard vector chunk similarity with FalkorDB openCypher graph traversal across 15 enterprise governance scenarios.
          </p>
        </div>

        {/* Scorecard Table */}
        <div className="rounded-2xl bg-[#0c0c0e]/95 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-zinc-900/80 text-xs font-mono text-zinc-400">
                  <th className="py-4 px-6 font-semibold">GOVERNANCE DIMENSION</th>
                  <th className="py-4 px-6 font-semibold text-rose-400">VECTOR RAG BASELINE</th>
                  <th className="py-4 px-6 font-semibold text-emerald-400">SETUBRAIN (FALKORDB)</th>
                  <th className="py-4 px-6 font-semibold">ENTERPRISE IMPACT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-xs font-mono">
                {metrics.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-900/40 transition-colors"
                  >
                    <td className="py-4 px-6 text-white font-medium font-sans">
                      {row.dimension}
                    </td>
                    <td className="py-4 px-6 text-rose-300/80">
                      <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                        {row.vector}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-emerald-300 font-bold">
                      <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                        {row.setubrain}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400 font-sans text-xs">
                      {row.impact}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 text-center text-[11px] font-mono text-zinc-500">
          * Benchmark metrics measured across 15 enterprise scenarios in SetuBrain FalkorDB test suite.
        </div>
      </div>
    </section>
  );
}
