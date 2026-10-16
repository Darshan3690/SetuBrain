import { SignIn } from '@clerk/nextjs';
import Link from 'next/link';
import { GitBranch } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-sky-500/10 via-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center space-y-2 relative z-10">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 p-[1px] shadow-lg shadow-sky-500/20 group-hover:shadow-sky-500/40 transition-all">
            <div className="w-full h-full bg-[#030712] rounded-[11px] flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white font-sans">
              SetuBrain
            </span>
            <span className="text-base font-medium text-sky-400 font-sans">
              सेतु
            </span>
          </div>
        </Link>
        <p className="text-xs text-slate-400 font-mono">
          Enterprise Knowledge Graph & Deterministic AI Execution
        </p>
      </div>

      {/* Clerk SignIn Component */}
      <div className="relative z-10 shadow-2xl rounded-3xl border border-white/10 overflow-hidden">
        <SignIn
          appearance={{
            elements: {
              card: 'bg-[#080D18] border-none shadow-none text-white',
              headerTitle: 'text-white',
              headerSubtitle: 'text-slate-400',
              socialButtonsBlockButton: 'bg-slate-900 border border-white/10 text-white hover:bg-slate-800',
              formFieldLabel: 'text-slate-300',
              formFieldInput: 'bg-slate-950 border border-white/10 text-white focus:border-sky-500',
              footerActionLink: 'text-sky-400 hover:text-sky-300',
            },
          }}
        />
      </div>
    </div>
  );
}
