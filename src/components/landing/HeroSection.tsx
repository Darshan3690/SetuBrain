'use client';

import React from 'react';
import HeroGraph3D from './HeroGraph3D';
import { ArrowRight, ShieldCheck, GitBranch, UserCheck } from 'lucide-react';

interface HeroSectionProps {
  onLaunchConsole: () => void;
}

export default function HeroSection({ onLaunchConsole }: HeroSectionProps) {
  return (
    <section className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[650px] h-[550px] bg-gradient-to-tr from-white/[0.03] via-sky-500/[0.04] to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Cinematic Narrative */}
          <div className="lg:col-span-5 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracking-wide">COMPANY KNOWLEDGE, CONNECTED</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.12]">
              SetuBrain:{' '}
              <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Where Scattered Company Knowledge
              </span>{' '}
              Meets{' '}
              <span className="bg-gradient-to-r from-white via-cyan-200 to-emerald-300 bg-clip-text text-transparent">
                Deterministic AI Execution.
              </span>{' '}
              <span className="text-zinc-400 font-sans font-medium text-2xl sm:text-3xl">
                सेतु
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-sans max-w-xl">
              Stop trusting vector search hallucinations. SetuBrain uses FalkorDB to turn policies,
              procedures, and human expertise into a governed knowledge graph—verifying multi-hop evidence,
              following <code className="text-emerald-300 bg-zinc-900 px-1 py-0.5 rounded text-xs font-mono border border-white/[0.08]">[:SUPERSEDES]</code> edges,
              and halting contradictions before execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onLaunchConsole}
                className="flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#traps"
                className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 text-zinc-200 text-sm font-medium border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
              >
                <span>Explore the 5 Enterprise Traps</span>
              </a>
            </div>

            {/* 3 Small Capability Indicators */}
            <div className="pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-zinc-400 font-mono">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Evidence-first answers</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <GitBranch className="w-4 h-4 text-sky-400" />
                <span>Graph-native reasoning</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Human SME escalation</span>
              </div>
            </div>
          </div>

          {/* Right Column: WebGL Interactive 3D Knowledge Graph */}
          <div className="lg:col-span-7">
            <HeroGraph3D />
          </div>
        </div>
      </div>
    </section>
  );
}
