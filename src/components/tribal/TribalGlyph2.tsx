'use client';

import React from 'react';
import {
  GLYPH2_BODY_PATHS,
  GLYPH2_DIAMOND_PATH,
  GLYPH2_VIEW_W,
  GLYPH2_VIEW_H,
  GLYPH2_RIGHT_TRANSFORM,
  GLYPH2_LEFT_TRANSFORM,
} from './glyph2-paths';

interface TribalGlyph2Props {
  /** Per-path stroke draw duration in ms. */
  perPathMs?: number;
  /** Per-path stagger in ms (top-to-bottom because paths are pre-sorted). */
  staggerMs?: number;
  /** Replay trigger — change to retrigger animations. */
  playKey?: number | string;
  size?: number | string;
  /** When set, skip the entrance animation — paths render fully filled instantly. */
  staticMode?: boolean;
}

/**
 * Second tribal glyph (denser, more ornamental than the first).
 *
 * The body is traced from the RIGHT HALF of the source image only, then
 * rendered twice — once unchanged (right side) and once mirrored about the
 * vertical centerline (left side). Counterparts share path indices, so a
 * single per-index stagger drives both halves in perfect sync.
 *
 * Per path: bright cyan tracer leads, white underlay settles behind, then
 * the fill fades in. After the body finishes, the centered diamond outlines
 * in and flickers cyan to "boot on" like a neon sign.
 */
export default function TribalGlyph2({
  perPathMs = 800,
  staggerMs = 55,
  playKey,
  size = '100%',
  staticMode = false,
}: TribalGlyph2Props) {
  const wrapperKey = `glyph2-${playKey ?? 0}`;

  const STROKE_EASE = 'cubic-bezier(.55,.1,.25,1)';
  const N = GLYPH2_BODY_PATHS.length;
  const bodyEndsAt = (N - 1) * staggerMs + perPathMs;
  const DIAMOND_OUTLINE_DUR = 600;
  const DIAMOND_OUTLINE_DELAY = bodyEndsAt + 150;
  const DIAMOND_FLICKER_DELAY = DIAMOND_OUTLINE_DELAY + DIAMOND_OUTLINE_DUR + 100;

  /** The three drawing layers for one body path at a given delay. */
  const bodyLayers = (d: string, delay: number, key: string) => {
    if (staticMode) {
      return <path key={key} d={d} fill="#ffffff" />;
    }
    return (
      <React.Fragment key={key}>
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="#ffffff"
          strokeWidth={30}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0.7,
            animation: `g2-underlay ${perPathMs}ms ${STROKE_EASE} ${delay + 50}ms forwards`,
          }}
        />
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="#80DEEA"
          strokeWidth={55}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0,
            animation: `g2-tracer ${perPathMs}ms ${STROKE_EASE} ${delay}ms forwards`,
          }}
        />
        <path
          d={d}
          fill="#ffffff"
          style={{
            fillOpacity: 0,
            animation: `g2-fill 450ms ease-out ${delay + perPathMs * 0.72}ms forwards`,
          }}
        />
      </React.Fragment>
    );
  };

  /** Diamond rendering — outline strokes in, then fill flickers on. */
  const diamondLayers = (key: string) => {
    if (staticMode) {
      return <path key={key} d={GLYPH2_DIAMOND_PATH} fill="#4FC3F7" />;
    }
    return (
      <React.Fragment key={key}>
        <path
          d={GLYPH2_DIAMOND_PATH}
          pathLength={1}
          fill="none"
          stroke="#B3E5FC"
          strokeWidth={45}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0.7,
            animation: `g2-underlay ${DIAMOND_OUTLINE_DUR}ms ${STROKE_EASE} ${DIAMOND_OUTLINE_DELAY + 60}ms forwards`,
          }}
        />
        <path
          d={GLYPH2_DIAMOND_PATH}
          pathLength={1}
          fill="none"
          stroke="#E1F5FE"
          strokeWidth={75}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1,
            strokeDashoffset: 1,
            opacity: 0,
            animation: `g2-tracer ${DIAMOND_OUTLINE_DUR}ms ${STROKE_EASE} ${DIAMOND_OUTLINE_DELAY}ms forwards`,
          }}
        />
        <path
          d={GLYPH2_DIAMOND_PATH}
          fill="#4FC3F7"
          style={{
            fillOpacity: 0,
            animation: `g2-diamond-flicker 1200ms steps(60, end) ${DIAMOND_FLICKER_DELAY}ms forwards`,
          }}
        />
      </React.Fragment>
    );
  };

  return (
    <div key={wrapperKey} style={{ position: 'relative', width: size, height: size }}>
      <style>{`
        @keyframes g2-tracer {
          0%   { stroke-dashoffset: 1; opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes g2-underlay {
          0%   { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes g2-fill {
          0%   { fill-opacity: 0; }
          100% { fill-opacity: 1; }
        }
        @keyframes g2-diamond-flicker {
          0%   { fill-opacity: 0; }
          3%   { fill-opacity: 0; }
          5%   { fill-opacity: 1; }
          7%   { fill-opacity: 0; }
          16%  { fill-opacity: 0; }
          18%  { fill-opacity: 0.6; }
          20%  { fill-opacity: 0; }
          28%  { fill-opacity: 0; }
          30%  { fill-opacity: 1; }
          32%  { fill-opacity: 0; }
          38%  { fill-opacity: 1; }
          41%  { fill-opacity: 0.1; }
          44%  { fill-opacity: 1; }
          48%  { fill-opacity: 0; }
          52%  { fill-opacity: 1; }
          56%  { fill-opacity: 0.3; }
          62%  { fill-opacity: 1; }
          66%  { fill-opacity: 0.5; }
          70%  { fill-opacity: 1; }
          75%  { fill-opacity: 0.8; }
          80%  { fill-opacity: 1; }
          100% { fill-opacity: 1; }
        }
      `}</style>
      <svg
        viewBox={`0 0 ${GLYPH2_VIEW_W} ${GLYPH2_VIEW_H}`}
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter:
            'drop-shadow(0 0 3px rgba(79,195,247,0.8)) drop-shadow(0 0 10px rgba(41,182,246,0.55)) drop-shadow(0 0 24px rgba(2,136,209,0.4))',
          overflow: 'visible',
        }}
      >
        {/* Right side */}
        <g transform={GLYPH2_RIGHT_TRANSFORM}>
          {GLYPH2_BODY_PATHS.map((d, i) =>
            bodyLayers(d, i * staggerMs, `r-${i}`),
          )}
          {diamondLayers('rd')}
        </g>
        {/* Left side — mirror of the same paths, same per-index delays so
            counterparts animate in at the EXACT same time. */}
        <g transform={GLYPH2_LEFT_TRANSFORM}>
          {GLYPH2_BODY_PATHS.map((d, i) =>
            bodyLayers(d, i * staggerMs, `l-${i}`),
          )}
          {diamondLayers('ld')}
        </g>
      </svg>
    </div>
  );
}
