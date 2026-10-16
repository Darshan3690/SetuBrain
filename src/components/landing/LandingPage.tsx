'use client';

import React, { useState } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import TelemetryStrip from './TelemetryStrip';
import RetrievalComparison from './RetrievalComparison';
import EnterpriseTrapLab from './EnterpriseTrapLab';
import FalkorArchitecture from './FalkorArchitecture';
import SkillCompilerSection from './SkillCompilerSection';
import BenchmarkSection from './BenchmarkSection';
import McpSection from './McpSection';
import LandingFooter from './LandingFooter';

interface LandingPageProps {
  onLaunchConsole: () => void;
}

export default function LandingPage({ onLaunchConsole }: LandingPageProps) {
  const [activeTenant, setActiveTenant] = useState('tenant_acme');

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <LandingNavbar
        onLaunchConsole={onLaunchConsole}
        activeTenant={activeTenant}
        onSelectTenant={setActiveTenant}
      />
      <main className="flex-1">
        <HeroSection onLaunchConsole={onLaunchConsole} />
        <TelemetryStrip />
        <RetrievalComparison />
        <EnterpriseTrapLab onLaunchConsole={onLaunchConsole} />
        <FalkorArchitecture />
        <SkillCompilerSection />
        <BenchmarkSection />
        <McpSection />
      </main>
      <LandingFooter onLaunchConsole={onLaunchConsole} />
    </div>
  );
}
