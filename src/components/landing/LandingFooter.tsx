'use client';

import React from 'react';
import { GitBranch, Zap, ExternalLink, ShieldCheck, Heart } from 'lucide-react';

export default function LandingFooter({ onLaunchConsole }: { onLaunchConsole: () => void }) {
  return (
    <footer className="border-t border-white/10 bg-[#030712] relative overflow-hidden">
      {/* FINAL CALL TO ACTION BOX */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-sky-950/40 via-slate-900/60 to-indigo-950/40 border border-white/10 shadow-2xl relative overflow-hidden text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-white/10 text-xs font-mono text-slate-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>FALKORDB HACKATHON 2026</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight max-w-3xl mx-auto leading-tight">
            Build AI agents that know what your company knows—
            <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">
              and when they don&apos;t.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Connect institutional knowledge to traceable, governed execution. Explore the live interactive console on your local FalkorDB instance.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <button
              onClick={onLaunchConsole}
              className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 via-sky-400 to-cyan-400 text-slate-950 font-bold text-sm shadow-xl shadow-sky-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Launch Console Now →
            </button>
            <a
              href="https://github.com/Darshan3690/SetuBrain"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-sm font-medium border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <span>Explore GitHub Repository</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
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
              Created by <strong className="text-white">Darshan Sharma</strong> for WeMakeDevs FalkorDB Hackathon 2026.
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
