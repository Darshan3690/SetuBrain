'use client';

import React, { useState } from 'react';
import { Zap, Building2, ChevronDown, Menu, X } from 'lucide-react';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import SetuLogo from '@/components/SetuLogo';

interface LandingNavbarProps {
  onLaunchConsole: () => void;
  activeTenant?: string;
  onSelectTenant?: (tenant: string) => void;
}

export default function LandingNavbar({
  onLaunchConsole,
  activeTenant = 'tenant_acme',
  onSelectTenant,
}: LandingNavbarProps) {
  const { isSignedIn } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060608]/85 border-b border-white/[0.08] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & FalkorDB Badge */}
        <div className="flex items-center space-x-3.5">
          <a href="#" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
              <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center p-1.5">
                <SetuLogo size={24} />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                SetuBrain
              </span>
              <span className="text-sm font-medium text-sky-400 font-sans">
                सेतु
              </span>
            </div>
          </a>

          <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs font-mono font-medium">
            <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400" />
            <span>FalkorDB Powered</span>
          </div>
        </div>

        {/* Center: Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-xs font-medium text-slate-300">
          <a
            href="#architecture"
            className="hover:text-white transition-colors py-1"
          >
            Architecture
          </a>
          <a
            href="#comparison"
            className="hover:text-white transition-colors py-1"
          >
            Vector vs Graph
          </a>
          <a
            href="#traps"
            className="hover:text-white transition-colors py-1"
          >
            The 5 Traps
          </a>
          <a
            href="#skill-compiler"
            className="hover:text-white transition-colors py-1"
          >
            SKILL.md Compiler
          </a>
          <a
            href="#mcp"
            className="hover:text-white transition-colors py-1"
          >
            MCP Server
          </a>
          <a
            href="#benchmark"
            className="hover:text-white transition-colors py-1"
          >
            Benchmark
          </a>
        </nav>

        {/* Right: Tenant, Auth & Launch Console CTA */}
        <div className="hidden md:flex items-center space-x-3.5">
          {/* Tenant Selector */}
          <div className="relative">
            <button
              onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/90 border border-white/[0.08] text-xs font-mono text-zinc-300 hover:text-white hover:border-white/20 transition-all cursor-pointer shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeTenant}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
            {tenantDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0c0c0e] border border-white/[0.08] shadow-2xl p-1 z-50 text-xs font-mono">
                <button
                  onClick={() => {
                    if (onSelectTenant) onSelectTenant('tenant_acme');
                    setTenantDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    activeTenant === 'tenant_acme'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  Acme Corp (tenant_acme)
                </button>
                <button
                  onClick={() => {
                    if (onSelectTenant) onSelectTenant('tenant_globex');
                    setTenantDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                    activeTenant === 'tenant_globex'
                      ? 'bg-white/10 text-white font-semibold'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  Globex Inc (tenant_globex)
                </button>
              </div>
            )}
          </div>

          {/* Auth Controls */}
          {!isSignedIn ? (
            <SignInButton mode="modal">
              <button className="px-3.5 py-1.5 text-xs font-medium rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-900 border border-white/[0.08] transition-all cursor-pointer">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <div className="flex items-center space-x-2 pl-1">
              <span className="text-[11px] font-mono text-emerald-400 hidden xl:inline">
                ● RBAC Active
              </span>
              <UserButton />
            </div>
          )}

          {/* Launch Console CTA */}
          <button
            onClick={onLaunchConsole}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <span>Launch Console</span>
            <span className="text-xs">→</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center space-x-2">
          <button
            onClick={onLaunchConsole}
            className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 font-semibold text-xs"
          >
            Console
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-white/[0.08]"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.08] bg-[#060608] px-6 py-4 space-y-3 text-xs font-medium text-zinc-300">
          <a
            href="#architecture"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            Architecture
          </a>
          <a
            href="#comparison"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            Vector vs Graph
          </a>
          <a
            href="#traps"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            The 5 Traps
          </a>
          <a
            href="#skill-compiler"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            SKILL.md Compiler
          </a>
          <a
            href="#mcp"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            MCP Server
          </a>
          <a
            href="#benchmark"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 hover:text-white"
          >
            Benchmark
          </a>
          <div className="pt-3 border-t border-white/10 flex items-center justify-between">
            <span className="text-slate-400 font-mono">Tenant: {activeTenant}</span>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <button className="px-3 py-1 rounded-lg bg-slate-800 text-white">
                  Sign In
                </button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
