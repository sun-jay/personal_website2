'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import TribalStartupOverlay from '@/components/tribal/TribalStartupOverlay';
import Background from '@/components/Background';

// Use dynamic imports with no SSR to prevent hydration issues
const ScrollSnapRotatingCardMobile = dynamic(
  () => import('@/components/ScrollSnapRotatingCardMobile'),
  { ssr: false },
);

const ScrollSnapRotatingCardDesktop = dynamic(
  () => import('@/components/ScrollSnapRotatingCardDesktop'),
  { ssr: false },
);

export default function Home() {
  const [mounted, setMounted] = useState(false);

  // Card-drop gating is *timing-only*: the mobile card waits for the startup
  // overlay's split before it animates in, but viewport gating (which card +
  // overlay is visible at all) is handled by CSS classes below so we don't
  // get a one-frame flicker from useMediaQuery's deferred resolution.
  const [mobileCardCanDrop, setMobileCardCanDrop] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Background video is rendered from the very first paint so its bytes
  // start streaming in immediately. The startup overlay covers it on mobile;
  // on desktop the fade-in is the entrance, so `forceFade` is gated by a
  // CSS-driven media-query check (no JS isMobile state).
  const bgLayer = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    >
      {/* Mobile background — no forced fade (instant pop after split). */}
      <div className="block md:hidden" style={{ position: 'absolute', inset: 0 }}>
        <Background src="/alt.mp4" borderRadius="0" />
      </div>
      {/* Desktop background — always fade in, even when cached. */}
      <div className="hidden md:block" style={{ position: 'absolute', inset: 0 }}>
        <Background src="/alt.mp4" borderRadius="0" forceFade />
      </div>
    </div>
  );

  // Avoid a flash of the wrong content during hydration. Cards/overlay don't
  // render until React has mounted on the client.
  if (!mounted) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgb(245, 242, 231)',
        }}
      >
        {bgLayer}
      </div>
    );
  }

  return (
    <div>
      {bgLayer}

      {/* Startup overlay — visible only on mobile (CSS gate). */}
      <div className="block md:hidden">
        <TribalStartupOverlay onSplitStart={() => setMobileCardCanDrop(true)} />
      </div>

      {/* Mobile card — drops in only after the overlay splits. */}
      <div className="block md:hidden">
        <ScrollSnapRotatingCardMobile shouldDrop={mobileCardCanDrop} />
      </div>

      {/* Desktop card — drops in immediately. */}
      <div className="hidden md:block">
        <ScrollSnapRotatingCardDesktop shouldDrop />
      </div>
    </div>
  );
}
