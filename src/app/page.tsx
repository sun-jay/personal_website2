'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery from '@/hooks/useMediaQuery';
import TribalStartupOverlay from '@/components/tribal/TribalStartupOverlay';

// Use dynamic imports with no SSR to prevent hydration issues
const ScrollSnapRotatingCardMobile = dynamic(
  () => import('@/components/ScrollSnapRotatingCardMobile'),
  { ssr: false }
);

const ScrollSnapRotatingCardDesktop = dynamic(
  () => import('@/components/ScrollSnapRotatingCardDesktop'),
  { ssr: false }
);

export default function Home() {
  // Use custom hook for media query detection
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [mounted, setMounted] = useState(false);
  // Defer mounting the card components until the startup overlay's split
  // begins — that way the card's existing drop animation fires the moment
  // the figure splits apart and reveals the page. Desktop skips the overlay
  // entirely, so showCard starts true there.
  const [showCard, setShowCard] = useState(false);
  // The tribal startup overlay is mobile-only.
  const showOverlay = mounted && isMobile;
  // Once we know we're on desktop, just show the card straight away.
  useEffect(() => {
    if (mounted && !isMobile) setShowCard(true);
  }, [mounted, isMobile]);

  // Handle mounting state to prevent flash of wrong component
  useEffect(() => {
    setMounted(true);
  }, []);

  // The hidden video element is rendered on EVERY render (including before
  // `mounted` flips), so the browser starts fetching `/alt.mp4` from the
  // very first paint — in parallel with the SVG startup animation rather
  // than after it.
  const bgPrefetch = (
    <video
      src="/alt.mp4"
      preload="auto"
      muted
      playsInline
      aria-hidden
      tabIndex={-1}
      style={{
        position: 'fixed',
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: 'none',
        top: -9999,
        left: -9999,
      }}
    />
  );

  // Show nothing during initial mount to prevent flash of wrong component
  if (!mounted) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgb(245, 242, 231)',
      }}>
        {bgPrefetch}
      </div>
    );
  }

  return (
    <div>
      {bgPrefetch}
      {showOverlay && (
        <TribalStartupOverlay onSplitStart={() => setShowCard(true)} />
      )}
      {showCard && (
        <>
          <div style={{ display: isMobile ? 'block' : 'none' }}>
            <ScrollSnapRotatingCardMobile />
          </div>
          <div style={{ display: isMobile ? 'none' : 'block' }}>
            <ScrollSnapRotatingCardDesktop />
          </div>
        </>
      )}
    </div>
  );
}
