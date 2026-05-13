'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery from '@/hooks/useMediaQuery';
import TribalStartupOverlay from '@/components/tribal/TribalStartupOverlay';
import Background from '@/components/Background';

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

  // The Background video is rendered at the page level on every render
  // (including before `mounted` flips), so it starts loading + playing as
  // soon as the page mounts. The startup overlay covers it during the SVG
  // animation; the moment the overlay splits open the video is already there.
  const bgLayer = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      <Background src="/alt.mp4" borderRadius="0" />
    </div>
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
        {bgLayer}
      </div>
    );
  }

  return (
    <div>
      {bgLayer}
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
