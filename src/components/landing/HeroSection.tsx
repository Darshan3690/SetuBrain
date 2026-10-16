'use client';

import React from 'react';
import HeroGraph3D from './HeroGraph3D';
import { ArrowRight, ShieldCheck, GitBranch, UserCheck, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  onLaunchConsole: () => void;
}

export default function HeroSection({ onLaunchConsole }: HeroSectionProps) {
  return (
    <section className="relative pt-6 pb-16 lg:pt-12 lg:pb-24 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Column: Asymmetric Cinematic Narrative */}
          <div className="lg:col-span-5 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-slate-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="tracking-wide">COMPANY KNOWLEDGE, CONNECTED</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black text-white tracking-tight leading-[1.12]">
              SetuBrain:{' '}
              <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-indigo-300 bg-clip-text text-transparent">
                Where Scattered Company Knowledge
              </span>{' '}
              Meets{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Deterministic AI Execution.
              </span>{' '}
              <span className="text-sky-400 font-sans font-medium text-2xl sm:text-3xl">
                सेतु
              </span>
            </h1>

            {/* Supporting Copy */}
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans max-w-xl">
              Stop trusting vector search hallucinations. SetuBrain uses FalkorDB to turn policies,
              procedures, and human expertise into a governed knowledge graph—verifying multi-hop evidence,
              following <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded text-xs font-mono border border-white/10">[:SUPERSEDES]</code> edges,
              and halting contradictions before execution.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={onLaunchConsole}
                className="flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/30 hover:shadow-cyan-400/50 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span>Launch Console</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#traps"
                className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <span>Explore the 5 Enterprise Traps</span>
              </a>
            </div>

            {/* 3 Small Capability Indicators */}
            <div className="pt-4 border-t border-white/5 flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-slate-400 font-mono">
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
