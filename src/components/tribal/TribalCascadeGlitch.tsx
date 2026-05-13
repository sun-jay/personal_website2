'use client';

import React from 'react';
import TribalBase from './TribalBase';
import { BODY_PATHS } from './paths';

interface TribalCascadeGlitchProps {
  perPathMs?: number;
  staggerMs?: number;
  playKey?: number | string;
  size?: number | string;
}

/**
 * Variant 4 — Cascade Glitch.
 * Each path snaps in with a brief electric "flash" then settles. Paths trigger
 * in order from top to bottom of the design. Pure CSS keyframes, indexed
 * delay via a CSS custom property.
 */
export default function TribalCascadeGlitch({
  perPathMs = 500,
  staggerMs = 110,
  playKey,
  size = '100%',
}: TribalCascadeGlitchProps) {
  const wrapperKey = `glitch-${playKey ?? 0}`;
  return (
    <div key={wrapperKey} style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        @keyframes tribal-glitch-in {
          0%   { opacity: 0; transform: translateY(-12px) scale(0.6); filter: brightness(2.5); fill: #B3E5FC; }
          40%  { opacity: 1; transform: translateY(2px) scale(1.05); filter: brightness(3); fill: #80DEEA; }
          60%  { transform: translateY(-1px) scale(0.99); filter: brightness(1.6); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: brightness(1); fill: #ffffff; }
        }
        .tribal-glitch-path {
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
          animation: tribal-glitch-in var(--dur) cubic-bezier(.2,1.4,.4,1) var(--delay) forwards;
        }
        @keyframes tribal-glitch-diamond {
          0%   { opacity: 0; transform: scale(0); filter: brightness(3); }
          50%  { opacity: 1; transform: scale(1.4); filter: brightness(2.4); }
          100% { opacity: 1; transform: scale(1); filter: brightness(1); }
        }
        .tribal-glitch-diamond {
          opacity: 0;
          transform-origin: center;
          transform-box: fill-box;
          animation: tribal-glitch-diamond var(--dur) cubic-bezier(.2,1.4,.4,1) var(--delay) forwards;
        }
      `}</style>
      <TribalBase
        size={size}
        bodyPathProps={(i) => ({
          className: 'tribal-glitch-path',
          style: {
            ['--dur' as string]: `${perPathMs}ms`,
            ['--delay' as string]: `${i * staggerMs}ms`,
          } as React.CSSProperties,
        })}
        diamondPathProps={() => ({
          className: 'tribal-glitch-diamond',
          style: {
            ['--dur' as string]: `${perPathMs}ms`,
            // Diamond drops in roughly with the head cluster
            ['--delay' as string]: `${Math.floor(BODY_PATHS.length / 3) * staggerMs}ms`,
          } as React.CSSProperties,
        })}
      />
    </div>
  );
}
