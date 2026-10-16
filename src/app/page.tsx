'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import LandingPage from '@/components/landing/LandingPage';
import SetuBrainConsole from '@/components/SetuBrainConsole';

export default function Page() {
  const { isSignedIn, isLoaded } = useUser();
  const [view, setView] = useState<'landing' | 'console' | null>(null);

  // Sync view based on login state and URL params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlView = params.get('view');
      if (urlView === 'console' || urlView === 'landing') {
        setView(urlView);
        return;
      }
    }

    if (isLoaded) {
      if (isSignedIn) {
        setView('console');
      } else {
        setView('landing');
      }
    }
  }, [isSignedIn, isLoaded]);

  const activeView = view || (isSignedIn ? 'console' : 'landing');

  if (activeView === 'console') {
    return (
      <SetuBrainConsole
        onBackToLanding={() => {
          setView('landing');
          if (typeof window !== 'undefined') {
            window.history.pushState({}, '', '/?view=landing');
          }
        }}
      />
    );
  }

  return (
    <LandingPage
      onLaunchConsole={() => {
        setView('console');
        if (typeof window !== 'undefined') {
          window.history.pushState({}, '', '/?view=console');
        }
      }}
    />
  );
}
