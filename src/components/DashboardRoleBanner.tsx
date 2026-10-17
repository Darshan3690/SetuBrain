'use client';

import React, { useState } from 'react';
import { useUser, SignInButton } from '@clerk/nextjs';
import { KeyRound } from 'lucide-react';

const ROLES = [
  { id: 'EMPLOYEE', label: 'Employee' },
  { id: 'DEPARTMENT_SME', label: 'SME' },
  { id: 'KNOWLEDGE_MANAGER', label: 'KM' },
  { id: 'COMPANY_ADMINISTRATOR', label: 'Admin' },
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
    <div className="flex items-center justify-between gap-3 px-4 py-2 h-11 rounded-lg bg-zinc-900/70 border border-white/[0.07] text-xs">
      {/* Left: User identity */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-5 h-5 rounded-md bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-[10px] font-bold text-zinc-300 shrink-0">
          {isSignedIn && user ? (user.firstName?.[0] || user.username?.[0] || 'U') : 'G'}
        </div>
        <span className="text-zinc-200 font-medium truncate">
          {isSignedIn && user
            ? (user.fullName || user.firstName || user.primaryEmailAddress?.emailAddress)
            : 'Guest Workspace'}
        </span>
        <span className="text-zinc-600 hidden sm:inline">·</span>
        <span className="text-zinc-400 hidden sm:inline font-mono text-[11px]">{currentRole}</span>
      </div>

      {/* Right: Role switcher or Sign In */}
      <div className="flex items-center gap-2 shrink-0">
        {isSignedIn ? (
          <div className="flex items-center bg-zinc-950/60 p-0.5 rounded-md border border-white/[0.06]">
            {ROLES.map((r) => (
              <button
                key={r.id}
                onClick={() => handleRoleSelect(r.id)}
                disabled={updating}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  currentRole === r.id
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
                title={`Switch to ${r.id}`}
              >
                {r.label}
              </button>
            ))}
          </div>
        ) : (
          <SignInButton mode="modal">
            <button className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md bg-zinc-100 hover:bg-white text-zinc-950 transition-all cursor-pointer">
              <KeyRound className="w-3 h-3" />
              <span>Sign In</span>
            </button>
          </SignInButton>
        )}
      </div>
    </div>
  );
}
