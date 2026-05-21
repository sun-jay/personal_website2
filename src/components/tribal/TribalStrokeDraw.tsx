'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
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
  /**
   * Uniform multiplier applied to *all* internal durations (stroke draw,
   * diamond outline, flicker, fill fade, pulse, etc.). 1 = default speed,
   * 0.75 = 25% shorter overall, 1.5 = 50% longer.
   */
  speedScale?: number;
  playKey?: number | string;
  size?: number | string;
  /**
   * When set, the figure splits side-to-side at this time (ms after mount)
   * — right half slides right and fades, left half slides left and fades.
   * Useful when this component is the entrance overlay for the homepage.
   */
  splitAfterMs?: number;
  /** How long the split slide lasts in ms (default 800). */
  splitDurationMs?: number;
  /** How far each half slides outward in viewBox units (default 220). */
  splitDistance?: number;
  /**
   * Per-path stagger applied during the split: each body path starts sliding
   * `i * splitStaggerMs` after the base `splitAfterMs`. Defaults to 0 (all paths
   * split simultaneously). With a positive value, the outermost / earliest-drawn
   * paths leave first and the innermost (the main body) leaves last.
   */
  splitStaggerMs?: number;
  /** Fired after the split slide finishes — overlay can use this to unmount. */
  onSplitComplete?: () => void;
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
  perPathMs: perPathMsRaw = 900,
  staggerMs: staggerMsRaw = 110,
  speedScale = 1,
  playKey,
  size = '100%',
  splitAfterMs,
  splitDurationMs = 800,
  splitDistance = 220,
  splitStaggerMs = 0,
  onSplitComplete,
}: TribalStrokeDrawProps) {
  // Scale every internal duration through this multiplier.
  const perPathMs = perPathMsRaw * speedScale;
  const staggerMs = staggerMsRaw * speedScale;
  const T_FILL = 450 * speedScale;
  const T_DIAMOND_OUTLINE = 540 * speedScale;
  const T_FLICKER_GAP = 250 * speedScale;
  const T_FLICKER = 1500 * speedScale;
  const wrapperKey = `stroke-${playKey ?? 0}`;
  const splitEnabled = typeof splitAfterMs === 'number';

  // Stagger indices for the central elements (dot + diamond) so they hang
  // alongside the right body paths conceptually.
  const DOT_SPLIT_INDEX = 1;       // dot leaves with the top wings
  const DIAMOND_SPLIT_INDEX = 4;   // diamond leaves with the head outline

  // The per-path split delays — `splitAfterMs` plus a per-path stagger.
  const baseSplitDelay = splitAfterMs ?? 0;
  const pathSplitDelay = (i: number) => baseSplitDelay + i * splitStaggerMs;
  const dotSplitDelay = baseSplitDelay + DOT_SPLIT_INDEX * splitStaggerMs;
  const diamondSplitDelay = baseSplitDelay + DIAMOND_SPLIT_INDEX * splitStaggerMs;
  const lastSplitDelay = pathSplitDelay(BODY_PATHS.length - 1);

  // Fire onSplitComplete after the LAST staggered slide finishes.
  useEffect(() => {
    if (!splitEnabled || !onSplitComplete) return;
    const id = window.setTimeout(onSplitComplete, lastSplitDelay + splitDurationMs);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey, splitAfterMs, splitDurationMs, splitEnabled, splitStaggerMs]);

  const DEFAULT_STROKE_EASE = 'cubic-bezier(.55,.1,.25,1)';
  // Ease-in for the ribs path — starts slow, accelerates toward the end.
  const EASE_IN = 'cubic-bezier(.42, 0, 1, 1)';

  // Top ball: clean viewBox-space circle (replaces the half-traced BODY_PATHS[0]).
  const TOP_BALL_VB =
    'M225 17 C 227.8 17 230 19.2 230 22 C 230 24.8 227.8 27 225 27 C 222.2 27 220 24.8 220 22 C 220 19.2 222.2 17 225 17 Z';
  // Center diamond: ONE continuous closed path. Sharp apex at each of the four
  // points with sides that bow INWARD (concave kite). Each side is a single
  // cubic; geometry is symmetric by construction.
  const CENTER_DIAMOND_PATH =
    'M2250 3700 C2280 3600 2380 3410 2450 3400 C2380 3390 2280 3200 2250 3100 C2220 3200 2120 3390 2050 3400 C2120 3410 2220 3600 2250 3700 Z';
  // Same outline + a small inner circle subpath. Used ONLY by the flicker fill
  // (evenodd fill-rule) so the pupil is a cutout that's revealed when the fill
  // turns on — never traced as part of the outline.
  const CENTER_DIAMOND_FILL_PATH =
    // Inner pupil: vertically-elongated ellipse. rx=55, ry=80.
    CENTER_DIAMOND_PATH +
    ' M2195 3400 a55 80 0 1 0 110 0 a55 80 0 1 0 -110 0 Z';
  const DIAMOND_GROUP_TRANSFORM = 'translate(0 450) scale(0.1 -0.1)';

  const strokePath = (
    d: string,
    delay: number,
    keySuffix: string,
    isDiamond = false,
    strokeEase: string = DEFAULT_STROKE_EASE,
    durMs: number = perPathMs,
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
            animation: `tribal-underlay ${durMs}ms ${strokeEase} ${delay + 60}ms forwards`,
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
            animation: `tribal-tracer ${durMs}ms ${strokeEase} ${delay}ms forwards`,
          }}
        />
        {/* Fill — the resting shape */}
        <path
          d={d}
          fill={fillColor}
          style={{
            fillOpacity: 0,
            animation: `tribal-fill ${T_FILL}ms ease-out ${delay + durMs * 0.72}ms forwards`,
          }}
        />
      </React.Fragment>
    );
  };

  // Slight non-linear stagger feels more organic than a flat per-index delay.
  const bodyDelay = (i: number) => Math.round(i * staggerMs * (1 + i * 0.04));
  const diamondDelay = Math.round(3 * staggerMs * 1.12);
  const idBase = useId();

  // The second-highest blob is the only path that gets a pen-tip cursor + sparkle trails.
  const CURSOR_INDEX = 1;
  // Right-body / left-body group transforms decomposed so we can map a
  // path-local point (px, py) → viewBox coords directly without parsing SVG transforms.
  // RIGHT_BODY_TRANSFORM = translate(225 450) scale(0.1 -0.1)
  // LEFT_BODY_TRANSFORM  = translate(225 450) scale(-0.1 -0.1)
  const toViewRight = (px: number, py: number) => ({ x: 225 + px * 0.1, y: 450 - py * 0.1 });
  const toViewLeft = (px: number, py: number) => ({ x: 225 - px * 0.1, y: 450 - py * 0.1 });

  // Ref to the hidden defs <path> for the cursor blob — sampled via getPointAtLength.
  const cursorPathRef = useRef<SVGPathElement | null>(null);

  // Particles that fly off the current drawing point on every body path.
  interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    born: number;
    ttl: number;
    size: number;
  }
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let lastSpawn = 0;

    const tick = (now: number) => {
      const elapsed = now - start;

      // Particles fly off the ribs path. While the ribs are drawing, spawn at
      // the leading edge. After the draw completes, keep spawning from random
      // points along the path so the trail continues into the split.
      if (now - lastSpawn >= 30) {
        lastSpawn = now;
        const fresh: Particle[] = [];
        const i = BODY_PATHS.length - 1;
        const delay = bodyDelay(i);
        const dur = perPathMs * 2;
        const localT = (elapsed - delay) / dur;
        if (localT > 0) {
          const el = document.getElementById(`${idBase}-b-${i}`) as SVGPathElement | null;
          if (el) {
            try {
              const len = el.getTotalLength();
              // Leading edge during draw; random along path after.
              const sampleT = localT < 1 ? localT : Math.random();
              const t = sampleT * len;
              const pt = el.getPointAtLength(t);
              const dt = Math.min(len, t + 1);
              const ptn = el.getPointAtLength(dt);
              const tangX = ptn.x - pt.x;
              const tangY = ptn.y - pt.y;
              const norm = Math.hypot(tangX, tangY) || 1;
              const nx = -tangY / norm;
              const ny = tangX / norm;
              const sides = [toViewRight(pt.x, pt.y), toViewLeft(pt.x, pt.y)];
              for (const s of sides) {
                // ~25% bump on velocity + size vs. baseline; everything else unchanged.
                const speedScale = 0.04 + Math.random() * 0.08;
                const sideSign = Math.random() < 0.5 ? -1 : 1;
                const jitter = (Math.random() - 0.5) * 0.4;
                fresh.push({
                  id: ++particleIdRef.current,
                  x: s.x,
                  y: s.y,
                  vx: (nx * sideSign + jitter) * speedScale,
                  // Slight upward bias gives the trail a smoke-curl feel.
                  vy: (ny * sideSign + jitter) * speedScale - 0.018,
                  born: now,
                  ttl: 1000 + Math.random() * 900,
                  size: 0.44 + Math.random() * 0.88,
                });
              }
            } catch {}
          }
        }
        setParticles((prev) => {
          const aged = prev.filter((p) => now - p.born < p.ttl);
          return aged.concat(fresh);
        });
      } else {
        setParticles((prev) => prev.filter((p) => now - p.born < p.ttl));
      }

      // Keep rAF alive past the flicker — through the *last* staggered split
      // wrapper (if enabled) plus a buffer so trailing particles drift off and fade.
      const splitEndMs = splitEnabled ? lastSplitDelay + splitDurationMs : 0;
      const lastEnd = Math.max(
        bodyDelay(BODY_PATHS.length - 1) + perPathMs * 2 + T_FLICKER,
        splitEndMs,
      ) + 2000;
      if (elapsed < lastEnd) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  /** Pen-tip glow circle, follows the referenced path via SMIL animateMotion. */
  const penTip = (pathId: string, delay: number, keySuffix: string, dur = perPathMs) => (
    <circle
      key={keySuffix}
      r={60}
      fill="#E1F5FE"
      opacity={0}
      style={{ filter: 'drop-shadow(0 0 22px #4FC3F7)' }}
    >
      <animateMotion
        dur={`${dur}ms`}
        begin={`${delay}ms`}
        fill="freeze"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        dur={`${dur}ms`}
        begin={`${delay}ms`}
        values="0;1;1;0"
        keyTimes="0;0.12;0.85;1"
        fill="freeze"
      />
    </circle>
  );

  return (
    <div
      key={wrapperKey}
      style={{
        position: 'relative',
        width: size,
        height: size,
        // overflow visible so split halves can fly past the wrapper edges.
        overflow: 'visible',
      }}
    >
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
        @keyframes tribal-split-right {
          0%   { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(var(--split-dist, 220px)); opacity: 0; }
        }
        @keyframes tribal-split-left {
          0%   { transform: translateX(0); opacity: 1; }
          100% { transform: translateX(calc(var(--split-dist, 220px) * -1)); opacity: 0; }
        }
        @keyframes tribal-split-fade {
          /* Snap off instantly at split start so the centered diamond/dot
             don't ghost over the sliding halves. */
          0%   { opacity: 1; }
          1%   { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes tribal-half-reveal {
          /* Hidden during draw + flicker; snaps visible the instant the split begins
             so the diamond halves can slide off with the body. */
          0%   { opacity: 0; }
          1%   { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes tribal-diamond-flicker {
          /* Starts mostly broken (long off beats with rare sparks), then
             ramps into mostly-on with brief drops, finally settles solid. */
          /* --- Mostly OFF phase (0–35%): rare brief sparks --- */
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
          /* --- Transitional phase (35–60%): more on than off --- */
          38%  { fill-opacity: 1; }
          41%  { fill-opacity: 0.1; }
          44%  { fill-opacity: 1; }
          48%  { fill-opacity: 0; }
          52%  { fill-opacity: 1; }
          56%  { fill-opacity: 0.3; }
          /* --- Stabilizing phase (60–100%): brief dips, mostly bright --- */
          62%  { fill-opacity: 1; }
          66%  { fill-opacity: 0.5; }
          70%  { fill-opacity: 1; }
          75%  { fill-opacity: 0.8; }
          80%  { fill-opacity: 1; }
          86%  { fill-opacity: 0.9; }
          92%  { fill-opacity: 1; }
          96%  { fill-opacity: 0.95; }
          100% { fill-opacity: 1; }
        }
        @keyframes tribal-diamond-pulse {
          /* Synced bright pulses on the group's drop-shadow so the glow flashes too. */
          0%, 100% { filter: drop-shadow(0 0 6px #4FC3F7) drop-shadow(0 0 18px #29B6F6) drop-shadow(0 0 32px rgba(2,136,209,0.7)); }
          5%, 18%, 30%, 38%, 44%, 52%, 62%, 70%, 80%, 92% {
            filter: drop-shadow(0 0 10px #B3E5FC) drop-shadow(0 0 28px #4FC3F7) drop-shadow(0 0 56px rgba(41,182,246,0.9));
          }
          7%, 20%, 32%, 48% {
            filter: drop-shadow(0 0 3px #29B6F6) drop-shadow(0 0 6px rgba(2,136,209,0.3));
          }
        }
      `}</style>
      {/* Tightened viewBox — crops the empty padding around the figure so it
          renders larger inside whatever container it's given. */}
      <svg
        viewBox="50 30 350 380"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          // Overall body glow — 30% stronger than the toned-down baseline.
          filter: 'drop-shadow(0 0 2.6px rgba(79,195,247,0.78)) drop-shadow(0 0 8px rgba(41,182,246,0.42))',
          overflow: 'visible',
        }}
      >
        {/* Hidden defs for SMIL mpath references + diamond-half clips. */}
        <defs>
          {BODY_PATHS.map((d, i) => (
            <path
              key={`def-b-${i}`}
              id={`${idBase}-b-${i}`}
              d={d}
              ref={i === CURSOR_INDEX ? cursorPathRef : undefined}
            />
          ))}
          <path id={`${idBase}-d`} d={DIAMOND_PATH} />
          {/* Clip rectangles in objectBoundingBox space so the clip moves with
              whatever transform is applied to the parent (i.e. the split slide). */}
          <clipPath id={`${idBase}-half-right`} clipPathUnits="objectBoundingBox">
            <rect x="0.5" y="0" width="0.5" height="1" />
          </clipPath>
          <clipPath id={`${idBase}-half-left`} clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width="0.5" height="1" />
          </clipPath>
        </defs>
        {/* Right side — each body path gets its own sliding wrapper so they can
            stagger out from outermost (top wings) to innermost (main body). */}
        {BODY_PATHS.map((d, i) => {
          // Skip the half-traced top droplet (i === 0); replaced below by clean ball.
          if (i === 0) return null;
          const splitDelay = pathSplitDelay(i);
          return (
            <g
              key={`r-slide-${i}`}
              style={
                splitEnabled
                  ? ({
                      animation: `tribal-split-right ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${splitDelay}ms forwards`,
                      ['--split-dist' as string]: `${splitDistance}px`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <g transform={RIGHT_BODY_TRANSFORM}>
                {strokePath(
                  d,
                  bodyDelay(i),
                  `r-${i}`,
                  false,
                  i === BODY_PATHS.length - 1 ? 'linear' : DEFAULT_STROKE_EASE,
                  i === BODY_PATHS.length - 1 ? perPathMs * 2 : perPathMs,
                )}
              </g>
            </g>
          );
        })}
        {/* Right half of the diamond — slides at DIAMOND_SPLIT_INDEX timing. */}
        {splitEnabled && (
          <g
            style={{
              animation: `tribal-split-right ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${diamondSplitDelay}ms forwards`,
              ['--split-dist' as string]: `${splitDistance}px`,
            } as React.CSSProperties}
          >
            <g
              clipPath={`url(#${idBase}-half-right)`}
              style={{
                opacity: 0,
                filter:
                  'drop-shadow(0 0 6px #4FC3F7) drop-shadow(0 0 18px #29B6F6) drop-shadow(0 0 32px rgba(2,136,209,0.7))',
                animation: `tribal-half-reveal ${splitDurationMs}ms linear ${diamondSplitDelay}ms forwards`,
              }}
            >
              <g transform={DIAMOND_GROUP_TRANSFORM}>
                <path d={CENTER_DIAMOND_FILL_PATH} fill="#4FC3F7" fillRule="evenodd" />
              </g>
            </g>
          </g>
        )}
        {/* Right half of the top dot — slides at DOT_SPLIT_INDEX timing. */}
        {splitEnabled && (
          <g
            style={{
              animation: `tribal-split-right ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${dotSplitDelay}ms forwards`,
              ['--split-dist' as string]: `${splitDistance}px`,
            } as React.CSSProperties}
          >
            <g
              clipPath={`url(#${idBase}-half-right)`}
              style={{
                opacity: 0,
                animation: `tribal-half-reveal ${splitDurationMs}ms linear ${dotSplitDelay}ms forwards`,
              }}
            >
              <path d={TOP_BALL_VB} fill="#ffffff" />
            </g>
          </g>
        )}
        {/* Left side — mirror of the right side, also staggered. */}
        {BODY_PATHS.map((d, i) => {
          if (i === 0) return null;
          const splitDelay = pathSplitDelay(i);
          return (
            <g
              key={`l-slide-${i}`}
              style={
                splitEnabled
                  ? ({
                      animation: `tribal-split-left ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${splitDelay}ms forwards`,
                      ['--split-dist' as string]: `${splitDistance}px`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              <g transform={LEFT_BODY_TRANSFORM}>
                {strokePath(
                  d,
                  bodyDelay(i),
                  `l-${i}`,
                  false,
                  i === BODY_PATHS.length - 1 ? 'linear' : DEFAULT_STROKE_EASE,
                  i === BODY_PATHS.length - 1 ? perPathMs * 2 : perPathMs,
                )}
              </g>
            </g>
          );
        })}
        {/* Left half of the diamond — staggered at DIAMOND_SPLIT_INDEX. */}
        {splitEnabled && (
          <g
            style={{
              animation: `tribal-split-left ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${diamondSplitDelay}ms forwards`,
              ['--split-dist' as string]: `${splitDistance}px`,
            } as React.CSSProperties}
          >
            <g
              clipPath={`url(#${idBase}-half-left)`}
              style={{
                opacity: 0,
                filter:
                  'drop-shadow(0 0 6px #4FC3F7) drop-shadow(0 0 18px #29B6F6) drop-shadow(0 0 32px rgba(2,136,209,0.7))',
                animation: `tribal-half-reveal ${splitDurationMs}ms linear ${diamondSplitDelay}ms forwards`,
              }}
            >
              <g transform={DIAMOND_GROUP_TRANSFORM}>
                <path d={CENTER_DIAMOND_FILL_PATH} fill="#4FC3F7" fillRule="evenodd" />
              </g>
            </g>
          </g>
        )}
        {/* Left half of the top dot — staggered at DOT_SPLIT_INDEX. */}
        {splitEnabled && (
          <g
            style={{
              animation: `tribal-split-left ${splitDurationMs}ms cubic-bezier(.4,.05,.4,1) ${dotSplitDelay}ms forwards`,
              ['--split-dist' as string]: `${splitDistance}px`,
            } as React.CSSProperties}
          >
            <g
              clipPath={`url(#${idBase}-half-left)`}
              style={{
                opacity: 0,
                animation: `tribal-half-reveal ${splitDurationMs}ms linear ${dotSplitDelay}ms forwards`,
              }}
            >
              <path d={TOP_BALL_VB} fill="#ffffff" />
            </g>
          </g>
        )}
        {/* Clean top-ball + center-diamond, rendered directly in viewBox space.
            Each is wrapped in its own snap-off fade group so it disappears at
            the moment its corresponding sliding-half wrapper becomes visible. */}
        {(() => {
          const lastIdx = BODY_PATHS.length - 1;
          const lastBlobDur = perPathMs * 2;
          const diamondOutlineDelay = bodyDelay(lastIdx) + lastBlobDur;
          const diamondOutlineDur = T_DIAMOND_OUTLINE;
          const flickerDelay = diamondOutlineDelay + diamondOutlineDur + T_FLICKER_GAP;
          const ballDelay = bodyDelay(0);

          return (
            <>
              {/* Top ball — snaps off at dotSplitDelay. */}
              <g
                style={
                  splitEnabled
                    ? ({
                        animation: `tribal-split-fade ${splitDurationMs}ms ease-in ${dotSplitDelay}ms forwards`,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <path
                  d={TOP_BALL_VB}
                  pathLength={1}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth={0.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    opacity: 0.7,
                    animation: `tribal-underlay ${perPathMs}ms ${DEFAULT_STROKE_EASE} ${ballDelay + 60}ms forwards`,
                  }}
                />
                <path
                  d={TOP_BALL_VB}
                  pathLength={1}
                  fill="none"
                  stroke="#80DEEA"
                  strokeWidth={0.9}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    opacity: 0,
                    animation: `tribal-tracer ${perPathMs}ms ${DEFAULT_STROKE_EASE} ${ballDelay}ms forwards`,
                  }}
                />
                <path
                  d={TOP_BALL_VB}
                  fill="#ffffff"
                  style={{
                    fillOpacity: 0,
                    animation: `tribal-fill 450ms ease-out ${ballDelay + perPathMs * 0.72}ms forwards`,
                  }}
                />
              </g>

              {/* Center diamond — snaps off at diamondSplitDelay. */}
              <g
                style={
                  splitEnabled
                    ? ({
                        animation: `tribal-split-fade ${splitDurationMs}ms ease-in ${diamondSplitDelay}ms forwards`,
                      } as React.CSSProperties)
                    : undefined
                }
              >
                <g
                  transform={DIAMOND_GROUP_TRANSFORM}
                  style={{
                    filter:
                      'drop-shadow(0 0 6px #4FC3F7) drop-shadow(0 0 18px #29B6F6) drop-shadow(0 0 32px rgba(2,136,209,0.7))',
                    animation: `tribal-diamond-pulse ${T_FLICKER}ms steps(80, end) ${flickerDelay}ms forwards`,
                  }}
                >
                  <path
                    d={CENTER_DIAMOND_PATH}
                    pathLength={1}
                    fill="none"
                    stroke="#B3E5FC"
                    strokeWidth={5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1,
                      opacity: 0.7,
                      animation: `tribal-underlay ${diamondOutlineDur}ms linear ${diamondOutlineDelay + 60}ms forwards`,
                    }}
                  />
                  <path
                    d={CENTER_DIAMOND_PATH}
                    pathLength={1}
                    fill="none"
                    stroke="#E1F5FE"
                    strokeWidth={9}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{
                      strokeDasharray: 1,
                      strokeDashoffset: 1,
                      opacity: 0,
                      animation: `tribal-tracer ${diamondOutlineDur}ms linear ${diamondOutlineDelay}ms forwards`,
                    }}
                  />
                  <path
                    d={CENTER_DIAMOND_FILL_PATH}
                    fill="#4FC3F7"
                    fillRule="evenodd"
                    style={{
                      fillOpacity: 0,
                      animation: `tribal-diamond-flicker ${T_FLICKER}ms steps(80, end) ${flickerDelay}ms forwards`,
                    }}
                  />
                </g>
              </g>
            </>
          );
        })()}

        {/* Wispy particles trailing off the ribs as they draw — ~25% more pronounced than baseline. */}
        {particles.map((p) => {
          const now = performance.now();
          const dt = now - p.born;
          const age = dt / p.ttl;
          // Slightly stronger peak than the wispy baseline (0.85 → ~1.05 cap).
          const op = age < 0.15 ? (age / 0.15) * 1.05 : Math.max(0, (1 - age) * 1.05);
          const x = p.x + p.vx * dt;
          const y = p.y + p.vy * dt;
          // Growth: baseline 2.2x → ~2.75x.
          const r = p.size * (1 + age * 2.75);
          return (
            <circle
              key={p.id}
              cx={x}
              cy={y}
              r={r}
              fill="#E1F5FE"
              opacity={Math.min(1, op)}
              style={{ filter: `drop-shadow(0 0 ${3.75 + age * 6.25}px #4FC3F7)` }}
            />
          );
        })}
      </svg>
    </div>
  );
}
