'use client';

import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { Shield, UserCheck, KeyRound, CheckCircle, ChevronDown } from 'lucide-react';

const ROLES = [
  { id: 'EMPLOYEE', label: 'Employee', color: 'text-sky-400 border-sky-500/30 bg-sky-500/10' },
  { id: 'DEPARTMENT_SME', label: 'Department SME', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { id: 'KNOWLEDGE_MANAGER', label: 'Knowledge Manager', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
  { id: 'COMPANY_ADMINISTRATOR', label: 'Company Administrator', color: 'text-amber-400 border-amber-500/30 bg-amber-500/10' },
];

export default function DashboardRoleBanner({ onRoleChange }: { onRoleChange?: (newRole: string) => void }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const [updating, setUpdating] = useState(false);
  const [activeRoleOverride, setActiveRoleOverride] = useState<string | null>(null);

  if (!isLoaded) return null;

  const currentRole = activeRoleOverride || (user?.publicMetadata?.role as string) || 'EMPLOYEE';

  const handleRoleSelect = async (newRole: string) => {
    if (newRole === currentRole) return;
    setUpdating(true);
    setActiveRoleOverride(newRole);
    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (data.ok) {
        if (onRoleChange) onRoleChange(newRole);
      }
    } catch (e) {
      console.error('Role update error:', e);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-2xl bg-slate-900/70 border border-white/10 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
      <div className="flex items-center space-x-3.5">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600/30 to-purple-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-base shadow-inner">
          {isSignedIn && user ? (user.firstName?.[0] || user.username?.[0] || 'U') : 'G'}
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-sm font-semibold text-slate-100">
              {isSignedIn && user
                ? `Welcome back, ${user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress}`
                : 'Guest Mode'}
            </h2>
            {isSignedIn && (
              <span className="flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                <Shield className="w-3 h-3 text-indigo-400" />
                <span>Clerk RBAC</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Active Role: <span className="font-semibold text-sky-400">{currentRole}</span> | Tenant: <span className="text-emerald-400 font-medium">tenant_acme</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
        {isSignedIn ? (
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-[11px] text-slate-400 font-mono pl-1 hidden sm:inline">Switch Role:</span>
            <div className="flex items-center space-x-1">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleRoleSelect(r.id)}
                  disabled={updating}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-medium transition-all ${
                    currentRole === r.id
                      ? `${r.color} border shadow-sm font-bold`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                  title={`Switch active role to ${r.label}`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all cursor-pointer">
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In for RBAC Access</span>
            </button>
          </SignInButton>
        )}

        {currentRole === 'DEPARTMENT_SME' && (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>SME Inbox Unlocked</span>
          </span>
        )}
        {currentRole === 'COMPANY_ADMINISTRATOR' && (
          <span className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-mono font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>SuperAdmin Access</span>
          </span>
        )}
      </div>
    </div>
  );
}
