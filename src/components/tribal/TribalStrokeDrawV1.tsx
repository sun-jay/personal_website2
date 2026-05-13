'use client';

import React from 'react';
import {
  BODY_PATHS,
  DIAMOND_PATH,
  RIGHT_BODY_TRANSFORM,
  LEFT_BODY_TRANSFORM,
  RIGHT_DIAMOND_TRANSFORM,
  LEFT_DIAMOND_TRANSFORM,
} from './paths';

interface TribalStrokeDrawProps {
  perPathMs?: number;
  staggerMs?: number;
  playKey?: number | string;
  size?: number | string;
}

/**
 * Variant 2 — Stroke Draw (improved).
 *
 * Each path is drawn in three layers:
 *   1. Tracer:  bright cyan stroke with strong drop-shadow, draws first, then
 *               fades out — this is the "wet ink leading edge".
 *   2. Underlay: thin white stroke, draws just behind the tracer, persists
 *                until the fill takes over.
 *   3. Fill:    the actual white shape, fades in after the stroke completes.
 *
 * `pathLength={1}` lets us animate `stroke-dashoffset` from 1 → 0 without
 * measuring real path lengths in JS.
 */
export default function TribalStrokeDraw({
  perPathMs = 900,
  staggerMs = 110,
  playKey,
  size = '100%',
}: TribalStrokeDrawProps) {
  const wrapperKey = `stroke-${playKey ?? 0}`;

  const strokePath = (
    d: string,
    delay: number,
    keySuffix: string,
    isDiamond = false,
  ) => {
    const tracerColor = isDiamond ? '#E1F5FE' : '#80DEEA';
    const underlayColor = isDiamond ? '#B3E5FC' : '#ffffff';
    const fillColor = isDiamond ? '#4FC3F7' : '#ffffff';
    // strokeWidth values here are in PATH-LOCAL coords (10× viewBox units
    // because of the scale(0.1) group transform), so 6 → 0.6 viewBox.
    return (
      <React.Fragment key={keySuffix}>
        {/* Underlay — settles to a thin white line */}
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke={underlayColor}
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0.7,
            animation: `tribal-underlay ${perPathMs}ms cubic-bezier(.55,.1,.25,1) ${delay + 60}ms forwards`,
          }}
        />
        {/* Tracer — bright leading edge */}
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke={tracerColor}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0,
            animation: `tribal-tracer ${perPathMs}ms cubic-bezier(.55,.1,.25,1) ${delay}ms forwards`,
          }}
        />
        {/* Fill — the resting shape */}
        <path
          d={d}
          fill={fillColor}
          style={{
            fillOpacity: 0,
            animation: `tribal-fill 450ms ease-out ${delay + perPathMs * 0.72}ms forwards`,
          }}
        />
      </React.Fragment>
    );
  };

  // Slight non-linear stagger feels more organic than a flat per-index delay.
  const bodyDelay = (i: number) => Math.round(i * staggerMs * (1 + i * 0.04));
  const diamondDelay = Math.round(3 * staggerMs * 1.12);

  return (
    <div key={wrapperKey} style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        @keyframes tribal-tracer {
          0%   { stroke-dashoffset: 1; opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes tribal-underlay {
          0%   { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes tribal-fill {
          0%   { fill-opacity: 0; }
          100% { fill-opacity: 1; }
        }
      `}</style>
      <svg
        viewBox="0 0 450 450"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter:
            'drop-shadow(0 0 4px #4FC3F7) drop-shadow(0 0 14px #29B6F6) drop-shadow(0 0 28px rgba(2,136,209,0.55))',
          overflow: 'visible',
        }}
      >
        <g transform={RIGHT_BODY_TRANSFORM}>
          {BODY_PATHS.map((d, i) => strokePath(d, bodyDelay(i), `r-${i}`))}
        </g>
        <g transform={LEFT_BODY_TRANSFORM}>
          {BODY_PATHS.map((d, i) => strokePath(d, bodyDelay(i), `l-${i}`))}
        </g>
        <g transform={RIGHT_DIAMOND_TRANSFORM}>
          {strokePath(DIAMOND_PATH, diamondDelay, 'rd', true)}
        </g>
        <g transform={LEFT_DIAMOND_TRANSFORM}>
          {strokePath(DIAMOND_PATH, diamondDelay, 'ld', true)}
        </g>
      </svg>
    </div>
  );
}
