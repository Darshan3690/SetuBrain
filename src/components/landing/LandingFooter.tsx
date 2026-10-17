'use client';

import React from 'react';
import { GitBranch, ExternalLink } from 'lucide-react';

export default function LandingFooter({ onLaunchConsole }: { onLaunchConsole: () => void }) {
  return (
    <footer className="border-t border-white/[0.08] bg-[#060608] relative overflow-hidden">
      {/* FINAL CALL TO ACTION BOX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="p-8 sm:p-14 rounded-2xl bg-zinc-900/90 border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.7)] relative overflow-hidden text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-950/80 border border-white/[0.08] text-xs font-mono text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>FALKORDB HACKATHON 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Build AI agents that know what your company knows—
            <span className="bg-gradient-to-r from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              and when they don&apos;t.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Connect institutional knowledge to traceable, governed execution. Explore the live interactive console on your local FalkorDB instance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={onLaunchConsole}
              className="px-7 py-3 rounded-xl bg-white text-zinc-950 font-semibold text-sm shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:bg-zinc-200 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Launch Console Now →
            </button>
            <a
              href="https://github.com/Darshan3690/SetuBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium border border-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
            >
              <span>Explore GitHub Repository</span>
              <ExternalLink className="w-4 h-4 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>

      {/* FOOTER BOTTOM BAR */}
      <div className="border-t border-white/5 py-10 text-xs font-sans text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand Info */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-white">
              <GitBranch className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-white font-sans text-sm">SetuBrain (सेतु)</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 font-mono border border-sky-500/20">
                  FalkorDB Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                The Graph-Powered Bridge Between Scattered Company Knowledge and Reliable AI Execution
              </p>
            </div>
          </div>

          {/* Attribution & Disclosure */}
          <div className="text-center md:text-right space-y-1">
            <p className="text-[11px] text-slate-400 font-mono">
              Created by <strong className="text-white">Darshan Rajput</strong> for WeMakeDevs FalkorDB Hackathon 2026.
            </p>
            <p className="text-[10px] text-slate-500">
              MIT License • AI-assisted frontend with human system architecture & Cypher verification.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
