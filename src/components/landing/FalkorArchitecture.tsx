'use client';

import React, { useState } from 'react';
import { Database, Copy, Check, ShieldCheck, Layers } from 'lucide-react';

function renderHighlightedCypher(cypher: string) {
  const lines = cypher.split('\n');
  return (
    <div className="space-y-1 font-mono text-xs leading-relaxed select-all">
      {lines.map((line, lIdx) => {
        if (line.trim().startsWith('//')) {
          return <div key={lIdx} className="text-zinc-500 italic">{line}</div>;
        }
        const tokens = line.split(/(\b(?:MATCH|OPTIONAL MATCH|WHERE|RETURN|WITH|ORDER BY|LIMIT|CREATE|SET|AND|OR|AS|GROUP BY|DESC|ASC|IN)\b|:\w+|\[:[A-Za-z0-9_]+\]|\$[A-Za-z0-9_]+|'[^']*'|"[^"]*"|\(|\)|-[^->]*-?>|<-?[^-]*-)/g);
        return (
          <div key={lIdx}>
            {tokens.map((token, tIdx) => {
              if (/^(MATCH|OPTIONAL MATCH|WHERE|RETURN|WITH|ORDER BY|LIMIT|CREATE|SET|AND|OR|AS|GROUP BY|DESC|ASC|IN)$/.test(token)) {
                return <span key={tIdx} className="text-purple-400 font-bold">{token}</span>;
              }
              if (token.startsWith(':') && !token.startsWith('::')) {
                return <span key={tIdx} className="text-sky-300 font-semibold">{token}</span>;
              }
              if (token.startsWith('[:') || token.startsWith('-[')) {
                return <span key={tIdx} className="text-emerald-400 font-semibold">{token}</span>;
              }
              if (token.startsWith('$')) {
                return <span key={tIdx} className="text-amber-300 font-semibold">{token}</span>;
              }
              if ((token.startsWith("'") && token.endsWith("'")) || (token.startsWith('"') && token.endsWith('"'))) {
                return <span key={tIdx} className="text-emerald-300">{token}</span>;
              }
              if (token === '(' || token === ')' || token === '{' || token === '}') {
                return <span key={tIdx} className="text-zinc-500 font-bold">{token}</span>;
              }
              if (token.includes('->') || token.includes('<-')) {
                return <span key={tIdx} className="text-emerald-400 font-semibold">{token}</span>;
              }
              return <span key={tIdx} className="text-zinc-300">{token}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function FalkorArchitecture() {
  const [copied, setCopied] = useState(false);

  const sampleCypher = `// FalkorDB Multi-Tenant Policy Traversal
MATCH (t:Tenant {id: 'tenant_acme'})-[:CONTAINS]->(d:Department {slug: 'finance'})
MATCH (d)-[:RESPONSIBLE_FOR]->(proc:Procedure {id: 'PROC-SAAS-01'})
MATCH (proc)-[:USES_APP]->(app:Application {name: 'Ramp'})
MATCH (proc)-[:GOVERNED_BY]->(pol:Policy)
WHERE pol.status = 'ACTIVE'
OPTIONAL MATCH (pol)-[:SUPERSEDES]->(stale:Policy)
RETURN d.name AS department,
       proc.title AS procedure,
       app.name AS application,
       pol.title AS activePolicy,
       stale.title AS supersededPolicy;`;

  const copyCode = () => {
    navigator.clipboard.writeText(sampleCypher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: '01',
      title: 'Scattered Sources',
      desc: 'Notion wikis, Slack threads, Jira tickets, and signed PDF policies.',
    },
    {
      num: '02',
      title: 'Entity & Relationship Ingestion',
      desc: 'Entities mapped into Department, Procedure, Application, and Policy nodes.',
    },
    {
      num: '03',
      title: 'FalkorDB Graph Engine',
      desc: 'Multi-tenant openCypher graph index with isolated tenant key namespaces.',
    },
    {
      num: '04',
      title: 'Deterministic Traversal',
      desc: 'Edge-following queries that traverse 4+ hops without losing ownership.',
    },
    {
      num: '05',
      title: 'Policy Validation & Execution',
      desc: 'Supersession checks, contradiction detection, and SKILL.md compilation.',
    },
  ];

  return (
    <section id="architecture" className="py-20 lg:py-28 relative overflow-hidden bg-[#060608] border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>FALKORDB KNOWLEDGE CORE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How FalkorDB Powers the{' '}
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-300 to-zinc-400 bg-clip-text text-transparent">
              Company Brain Architecture
            </span>
          </h2>
          <p className="text-sm sm:text-base text-zinc-400">
            FalkorDB is not a vector store wrapper. It is an in-memory graph database executing native openCypher queries across multi-tenant corporate relationship networks.
          </p>
        </div>

        {/* 5-Step Pipeline Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-14">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-5 rounded-xl bg-[#0c0c0e]/95 border border-white/[0.08] relative group hover:border-white/[0.2] transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <div className="text-2xl font-mono font-black text-zinc-600 group-hover:text-emerald-400 transition-colors mb-3">
                {step.num}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-sans mb-1.5">{step.title}</h4>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Code + Schema Visual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Code Box (7 cols) */}
          <div className="lg:col-span-7 rounded-2xl bg-[#070709] border border-white/[0.08] shadow-2xl overflow-hidden">
            {/* Terminal Top Bar */}
            {/* Terminal Top Bar */}
            <div className="px-5 py-3.5 bg-zinc-900/90 border-b border-white/[0.08] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-zinc-400 pl-2">falkordb-traversal.cyp</span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center space-x-1.5 text-xs font-mono text-zinc-400 hover:text-white px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-all cursor-pointer border border-white/[0.06]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Cypher' : 'Copy Query'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="p-5 overflow-x-auto text-xs font-mono leading-relaxed select-all">
              {renderHighlightedCypher(sampleCypher)}
            </div>
          </div>

          {/* Right: Key Schema Benefits (5 cols) */}
          <div className="lg:col-span-5 space-y-3.5">
            <div className="p-5 rounded-xl bg-[#0c0c0e]/95 border border-white/[0.08] space-y-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold">
                <Database className="w-4 h-4" />
                <span>NATIVE OPENCYPHER</span>
              </div>
              <h4 className="text-sm font-bold text-white">Declarative Graph Pattern Matching</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Formulate continuous relationship traversals from high-level department goals down to specific SaaS apps and signed policy constraints.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0c0e]/95 border border-white/[0.08] space-y-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>IMMUTABLE SUPERSEDENCE</span>
              </div>
              <h4 className="text-sm font-bold text-white">No Accidental Policy Amnesia</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Old policies are never blindly overwritten. They are retained as audit historical nodes with explicit <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded text-xs font-mono border border-white/[0.08]">[:SUPERSEDES]</code> directed edges.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0c0c0e]/95 border border-white/[0.08] space-y-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-center space-x-2 text-purple-400 font-mono text-xs font-semibold">
                <Layers className="w-4 h-4" />
                <span>MULTI-TENANT NAMESPACES</span>
              </div>
              <h4 className="text-sm font-bold text-white">Isolated Tenant Subgraphs</h4>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Each company gets an independent graph key. Acme Corp queries never cross boundary wires into Globex Inc memory.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
