'use client';

import React from 'react';
import { Database, ShieldCheck, Terminal, Layers } from 'lucide-react';

export default function TelemetryStrip() {
  const capabilities = [
    {
      title: 'FalkorDB Cypher Engine',
      metric: '14.3 ms P95',
      badge: 'LIVE SOCKET',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      description: 'Sub-millisecond openCypher graph traversal replacing fuzzy semantic chunk lookup.',
      icon: Database,
    },
    {
      title: 'Isolated Tenant Graphs',
      metric: '2 Tenants Active',
      badge: 'HARD BOUNDARY',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      description: 'Acme Corp and Globex Inc graphs segregated at FalkorDB database key level.',
      icon: Layers,
    },
    {
      title: 'MCP Server · JSON-RPC 2.0',
      metric: '4 Native Tools',
      badge: 'ANTHROPIC STANDARD',
      badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      description: 'Standardized Model Context Protocol endpoints queryable by any agent runtime.',
      icon: Terminal,
    },
    {
      title: 'Evidence-First Governance',
      metric: '100% Provenance',
      badge: 'ZERO HALLUCINATION',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      description: 'Every answer is backed by an explicit subgraph chain traced to signed source documents.',
      icon: ShieldCheck,
    },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-[#09090b]/80 backdrop-blur-md py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.06]">
          {capabilities.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className={`flex flex-col justify-between p-4 transition-all duration-300 hover:-translate-y-0.5 ${index > 0 ? 'sm:pl-6' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/[0.08] flex items-center justify-center text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
                    <Icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md border font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                </div>
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <h4 className="text-sm font-bold text-white font-sans">{item.title}</h4>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{item.metric}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed font-sans">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
