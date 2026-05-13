'use client';

import React, { useMemo, useEffect, useState } from 'react';
import TribalBase from './TribalBase';
import { BODY_PATHS } from './paths';

interface Sparkle {
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  driftX: number;
}

interface TribalSparkleRainProps {
  durationMs?: number;
  playKey?: number | string;
  size?: number | string;
  sparkleCount?: number;
}

/**
 * Variant 3 — Sparkle Rain.
 * A flurry of cyan sparkles falls from above. Where each sparkle lands, it
 * leaves the design's pixels behind. Implemented as a top→bottom mask wipe
 * synchronized with raining particles. The particles fade after landing.
 */
export default function TribalSparkleRain({
  durationMs = 2200,
  playKey,
  size = '100%',
  sparkleCount = 50,
}: TribalSparkleRainProps) {
  // Generate sparkle positions deterministically per playKey
  const sparkles: Sparkle[] = useMemo(() => {
    const arr: Sparkle[] = [];
    // Simple seeded RNG so the sparkles are stable per playKey
    const seed = (typeof playKey === 'number' ? playKey : String(playKey ?? '').length) || 1;
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < sparkleCount; i++) {
      arr.push({
        x: 60 + rand() * 330, // mostly within design width
        y: rand() * 450,
        size: 1 + rand() * 2.2,
        delay: rand() * durationMs * 0.8,
        duration: 700 + rand() * 600,
        driftX: (rand() - 0.5) * 30,
      });
    }
    return arr;
  }, [playKey, sparkleCount, durationMs]);

  // Sync the design reveal with the rain — wipe top-to-bottom at the same speed
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let id: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      setProgress(t);
      if (t < 1) id = requestAnimationFrame(tick);
    };
    setProgress(0);
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [durationMs, playKey]);

  const wipeY = progress * 450;
  const fadeEdge = 24;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        @keyframes sparkle-fall {
          0%   { transform: translate(var(--dx-from), -40px) scale(0.4); opacity: 0; }
          15%  { opacity: 1; }
          80%  { opacity: 0.9; transform: translate(var(--dx-to), 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx-to), 6px) scale(0.8); }
        }
        .tribal-sparkle {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #4FC3F7 45%, rgba(79,195,247,0) 75%);
          pointer-events: none;
          will-change: transform, opacity;
          animation: sparkle-fall var(--dur) cubic-bezier(.4,.05,.5,1) var(--delay) forwards;
        }
      `}</style>

      <TribalBase
        size={size}
        style={{
          WebkitMaskImage: `linear-gradient(to bottom, white 0%, white ${(wipeY - fadeEdge) / 4.5}%, transparent ${wipeY / 4.5}%, transparent 100%)`,
          maskImage: `linear-gradient(to bottom, white 0%, white ${(wipeY - fadeEdge) / 4.5}%, transparent ${wipeY / 4.5}%, transparent 100%)`,
          position: 'absolute',
          inset: 0,
        }}
      />

      {/* Sparkles rendered as HTML divs in viewBox-relative percent space */}
      <div
        key={`s-${playKey}`}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          // Match the SVG viewBox aspect for percentage-based positioning
        }}
      >
        {sparkles.map((sp, i) => (
          <span
            key={i}
            className="tribal-sparkle"
            style={{
              left: `${(sp.x / 450) * 100}%`,
              top: `${(sp.y / 450) * 100}%`,
              width: sp.size * 4,
              height: sp.size * 4,
              filter: `drop-shadow(0 0 ${sp.size * 2}px #4FC3F7)`,
              ['--dur' as string]: `${sp.duration}ms`,
              ['--delay' as string]: `${sp.delay}ms`,
              ['--dx-from' as string]: `${-sp.driftX}px`,
              ['--dx-to' as string]: `${sp.driftX}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
