'use client';

import dynamic from 'next/dynamic';

const AnimatedCard = dynamic(() => import('./AnimatedCard'), {
  ssr: false
});

export default function ClientWrapper() {
  return <AnimatedCard />;
} 