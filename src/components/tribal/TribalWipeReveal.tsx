'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import TribalBase from './TribalBase';

interface TribalWipeRevealProps {
  /** Total wipe duration in ms */
  durationMs?: number;
  /** Trigger key — when changed, replays the animation */
  playKey?: number | string;
  size?: number | string;
}

/**
 * Variant 1 — Pure Wipe.
 * A bright cyan scan line slides from the top of the canvas down to the
 * bottom, revealing the design as it passes. Implemented with an SVG <mask>
 * whose height we animate via React state on each frame.
 */
export default function TribalWipeReveal({
  durationMs = 1800,
  playKey,
  size = '100%',
}: TribalWipeRevealProps) {
  const maskId = useId();
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(t);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    setProgress(0);
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [durationMs, playKey]);

  const wipeY = progress * 450;
  // Soft gradient edge — the leading 30 SVG units fade in instead of
  // a hard cut, so the scan line feels luminous instead of paper-edged.
  const fadeEdge = 30;
  const revealStops = (
    <linearGradient id={`${maskId}-grad`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="white" stopOpacity="1" />
      <stop offset={`${Math.max(0, (wipeY - fadeEdge) / 450)}`} stopColor="white" stopOpacity="1" />
      <stop offset={`${Math.min(1, wipeY / 450)}`} stopColor="white" stopOpacity="0" />
      <stop offset="1" stopColor="white" stopOpacity="0" />
    </linearGradient>
  );

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg
        viewBox="0 0 450 450"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
      >
        <defs>{revealStops}</defs>
      </svg>
      <TribalBase
        size={size}
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, white 0%, white ${(wipeY - fadeEdge) / 450 * 100}%, transparent ${wipeY / 450 * 100}%, transparent 100%)`,
          maskImage: `linear-gradient(to bottom, white 0%, white ${(wipeY - fadeEdge) / 450 * 100}%, transparent ${wipeY / 450 * 100}%, transparent 100%)`,
          position: 'absolute',
          inset: 0,
        }}
      />
      {progress < 1 && (
        <svg
          viewBox="0 0 450 450"
          width={size}
          height={size}
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {/* The luminous scan line itself */}
          <line
            x1={0}
            y1={wipeY}
            x2={450}
            y2={wipeY}
            stroke="#80DEEA"
            strokeWidth={1.5}
            style={{ filter: 'drop-shadow(0 0 6px #4FC3F7) drop-shadow(0 0 14px #29B6F6)' }}
          />
          {/* A soft trailing haze just above the line */}
          <rect
            x={0}
            y={Math.max(0, wipeY - 18)}
            width={450}
            height={18}
            fill="url(#scan-haze)"
            opacity={0.65}
          />
          <defs>
            <linearGradient id="scan-haze" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#4FC3F7" stopOpacity="0.7" />
              <stop offset="1" stopColor="#4FC3F7" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      )}
    </div>
  );
}
