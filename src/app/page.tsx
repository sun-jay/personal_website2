'use client';

import { useState, useEffect } from 'react';
import ScrollSnapRotatingCardMobile from '@/components/ScrollSnapRotatingCardMobile';
import ScrollSnapRotatingCardDesktop from '@/components/ScrollSnapRotatingCardDesktop';

export default function Home() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the screen is mobile size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is a common breakpoint for mobile/desktop
    };

    // Check on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <ScrollSnapRotatingCardMobile /> : <ScrollSnapRotatingCardDesktop />;
}
