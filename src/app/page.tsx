'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import useMediaQuery from '@/hooks/useMediaQuery';

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
  
  // Handle mounting state to prevent flash of wrong component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show nothing during initial mount to prevent flash of wrong component
  if (!mounted) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e'
      }}>
        {/* Optional loading indicator if desired */}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: isMobile ? 'block' : 'none' }}>
        <ScrollSnapRotatingCardMobile />
      </div>
      <div style={{ display: isMobile ? 'none' : 'block' }}>
        <ScrollSnapRotatingCardDesktop />
      </div>
    </div>
  );
}
