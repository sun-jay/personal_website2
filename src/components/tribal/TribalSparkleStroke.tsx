'use client';

import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  BODY_PATHS,
  DIAMOND_PATH,
  RIGHT_BODY_TRANSFORM,
  LEFT_BODY_TRANSFORM,
  RIGHT_DIAMOND_TRANSFORM,
  LEFT_DIAMOND_TRANSFORM,
} from './paths';

interface TribalSparkleStrokeProps {
  perPathMs?: number;
  staggerMs?: number;
  playKey?: number | string;
  size?: number | string;
}

interface TrailSparkle {
  id: number;
  /** viewBox space x/y in [0..450] */
  x: number;
  y: number;
  /** velocity in viewBox units per ms */
  vx: number;
  vy: number;
  size: number;
  born: number;
  ttl: number;
}

// Group transforms broken down so we can map path-local → viewBox space
// without parsing the SVG transform strings at runtime.
const TRANSFORMS = {
  rightBody: { tx: 225, ty: 450, sx: 0.1, sy: -0.1 },
  leftBody: { tx: 225, ty: 450, sx: -0.1, sy: -0.1 },
  rightDiamond: { tx: 0, ty: 450, sx: 0.1, sy: -0.1 },
  leftDiamond: { tx: 450, ty: 450, sx: -0.1, sy: -0.1 },
} as const;

type SideKey = keyof typeof TRANSFORMS;

function applyXform(px: number, py: number, key: SideKey) {
  const t = TRANSFORMS[key];
  return { x: t.tx + px * t.sx, y: t.ty + py * t.sy };
}

/**
 * Variant 5 — Sparkle Stroke (combined).
 *
 * Marries the improved stroke draw with the sparkle rain:
 *   • Tracer + underlay + fill, per-path stagger top→bottom.
 *   • A bright "pen-tip" circle rides the leading edge of every active path
 *     via SVG `<animateMotion>` + `<mpath>`. It's mirrored on the left side
 *     by re-using the same motion inside the mirrored group transform.
 *   • A rAF loop samples each pen-tip's current viewBox position via
 *     `getPointAtLength` and spawns small drifting sparkle trails behind it.
 *   • Ambient sparkles fall in the background throughout, then fade.
 */
export default function TribalSparkleStroke({
  perPathMs = 950,
  staggerMs = 120,
  playKey,
  size = '100%',
}: TribalSparkleStrokeProps) {
  const wrapperKey = `sparkle-stroke-${playKey ?? 0}`;
  const idBase = useId();

  // Refs to the right-side body paths so we can sample positions for trails.
  // The left side mirrors via group transform — we don't need separate refs.
  const bodyRefs = useRef<(SVGPathElement | null)[]>([]);
  const diamondRef = useRef<SVGPathElement | null>(null);

  // Trail sparkles spawned at pen-tip positions.
  const [trails, setTrails] = useState<TrailSparkle[]>([]);
  const trailIdRef = useRef(0);

  // Ambient sparkles — generated once per playKey
  const ambient = useMemo(() => {
    const arr: Array<{
      x: number;
      delay: number;
      duration: number;
      size: number;
      drift: number;
    }> = [];
    const seed = Number(playKey ?? 0) || 1;
    let s = seed * 9301 + 49297;
    const rand = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    for (let i = 0; i < 28; i++) {
      arr.push({
        x: 30 + rand() * 390,
        delay: rand() * 1800,
        duration: 1600 + rand() * 1400,
        size: 1 + rand() * 2,
        drift: (rand() - 0.5) * 24,
      });
    }
    return arr;
  }, [playKey]);

  // Slight non-linear stagger feels organic.
  const bodyDelay = (i: number) => Math.round(i * staggerMs * (1 + i * 0.04));
  const diamondDelay = Math.round(3 * staggerMs * 1.12);

  // Sample pen-tip positions per frame and spawn trail sparkles + age existing.
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    let lastSpawn = 0;

    const spawnFor = (
      side: SideKey,
      el: SVGPathElement,
      localT: number,
      now: number,
    ) => {
      try {
        const len = el.getTotalLength();
        const pt = el.getPointAtLength(Math.max(0, Math.min(len, localT * len)));
        const v = applyXform(pt.x, pt.y, side);
        const id = ++trailIdRef.current;
        return {
          id,
          x: v.x,
          y: v.y,
          vx: (Math.random() - 0.5) * 0.02,
          vy: 0.01 + Math.random() * 0.03,
          size: 1.2 + Math.random() * 1.8,
          born: now,
          ttl: 700 + Math.random() * 500,
        } as TrailSparkle;
      } catch {
        return null;
      }
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const newSparkles: TrailSparkle[] = [];

      // Spawn at most every ~28ms per pen tip
      const shouldSpawn = now - lastSpawn >= 28;
      if (shouldSpawn) {
        lastSpawn = now;

        BODY_PATHS.forEach((_, i) => {
          const d = bodyDelay(i);
          const localT = (elapsed - d) / perPathMs;
          if (localT > 0 && localT < 1) {
            const el = bodyRefs.current[i];
            if (el) {
              const r = spawnFor('rightBody', el, localT, now);
              const l = spawnFor('leftBody', el, localT, now);
              if (r) newSparkles.push(r);
              if (l) newSparkles.push(l);
            }
          }
        });

        const ddT = (elapsed - diamondDelay) / perPathMs;
        if (ddT > 0 && ddT < 1 && diamondRef.current) {
          const r = spawnFor('rightDiamond', diamondRef.current, ddT, now);
          const l = spawnFor('leftDiamond', diamondRef.current, ddT, now);
          if (r) newSparkles.push(r);
          if (l) newSparkles.push(l);
        }
      }

      setTrails((prev) => {
        const aged = prev
          .map((s) => ({
            ...s,
            x: s.x + s.vx * 16,
            y: s.y + s.vy * 16,
          }))
          .filter((s) => now - s.born < s.ttl);
        return aged.concat(newSparkles);
      });

      const totalDuration =
        bodyDelay(BODY_PATHS.length - 1) + perPathMs + 800;
      if (elapsed < totalDuration + 1000) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playKey]);

  /** Render the layered stroke (underlay + tracer + fill) for one path. */
  const layerSet = (
    d: string,
    delay: number,
    keyPrefix: string,
    isDiamond = false,
    refSetter?: (el: SVGPathElement | null) => void,
  ) => {
    const tracerColor = isDiamond ? '#E1F5FE' : '#80DEEA';
    const underlayColor = isDiamond ? '#B3E5FC' : '#ffffff';
    const fillColor = isDiamond ? '#4FC3F7' : '#ffffff';
    return (
      <React.Fragment key={keyPrefix}>
        <path
          ref={refSetter}
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
            animation: `ts-underlay ${perPathMs}ms cubic-bezier(.55,.1,.25,1) ${delay + 60}ms forwards`,
          }}
        />
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
            animation: `ts-tracer ${perPathMs}ms cubic-bezier(.55,.1,.25,1) ${delay}ms forwards`,
          }}
        />
        <path
          d={d}
          fill={fillColor}
          style={{
            fillOpacity: 0,
            animation: `ts-fill 450ms ease-out ${delay + perPathMs * 0.72}ms forwards`,
          }}
        />
      </React.Fragment>
    );
  };

  /** Pen-tip glow circle, follows the path via SMIL animateMotion. */
  const penTip = (pathId: string, delay: number, keySuffix: string) => (
    <circle
      key={keySuffix}
      r={70}
      fill="#E1F5FE"
      opacity={0}
      style={{ filter: 'drop-shadow(0 0 22px #4FC3F7)' }}
    >
      <animateMotion
        dur={`${perPathMs}ms`}
        begin={`${delay}ms`}
        fill="freeze"
        rotate="auto"
      >
        <mpath href={`#${pathId}`} />
      </animateMotion>
      <animate
        attributeName="opacity"
        dur={`${perPathMs}ms`}
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
      style={{ position: 'relative', width: size, height: size, overflow: 'hidden' }}
    >
      <style>{`
        @keyframes ts-tracer {
          0%   { stroke-dashoffset: 1; opacity: 0; }
          12%  { opacity: 1; }
          82%  { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
        @keyframes ts-underlay {
          0%   { stroke-dashoffset: 1; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ts-fill {
          0%   { fill-opacity: 0; }
          100% { fill-opacity: 1; }
        }
        @keyframes ts-ambient {
          0%   { transform: translate(var(--dx-from), -28px) scale(0.4); opacity: 0; }
          18%  { opacity: 0.9; }
          80%  { opacity: 0.8; transform: translate(var(--dx-to), 460px) scale(1); }
          100% { opacity: 0; transform: translate(var(--dx-to), 480px) scale(0.8); }
        }
        .ts-ambient {
          position: absolute;
          top: 0;
          border-radius: 50%;
          background: radial-gradient(circle, #ffffff 0%, #4FC3F7 45%, rgba(79,195,247,0) 75%);
          pointer-events: none;
          will-change: transform, opacity;
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
          display: 'block',
        }}
      >
        {/* Hidden path defs for SMIL mpath references */}
        <defs>
          {BODY_PATHS.map((d, i) => (
            <path key={`def-b-${i}`} id={`${idBase}-b-${i}`} d={d} />
          ))}
          <path id={`${idBase}-d`} d={DIAMOND_PATH} />
        </defs>

        {/* Right body — stroke layers + pen tip */}
        <g transform={RIGHT_BODY_TRANSFORM}>
          {BODY_PATHS.map((d, i) =>
            layerSet(d, bodyDelay(i), `r-${i}`, false, (el) => {
              bodyRefs.current[i] = el;
            }),
          )}
          {BODY_PATHS.map((_, i) => penTip(`${idBase}-b-${i}`, bodyDelay(i), `pt-r-${i}`))}
        </g>

        {/* Left body — mirror via transform; SMIL mpath inherits group transform */}
        <g transform={LEFT_BODY_TRANSFORM}>
          {BODY_PATHS.map((d, i) => layerSet(d, bodyDelay(i), `l-${i}`))}
          {BODY_PATHS.map((_, i) => penTip(`${idBase}-b-${i}`, bodyDelay(i), `pt-l-${i}`))}
        </g>

        {/* Diamonds */}
        <g transform={RIGHT_DIAMOND_TRANSFORM}>
          {layerSet(DIAMOND_PATH, diamondDelay, 'rd', true, (el) => {
            diamondRef.current = el;
          })}
          {penTip(`${idBase}-d`, diamondDelay, 'pt-rd')}
        </g>
        <g transform={LEFT_DIAMOND_TRANSFORM}>
          {layerSet(DIAMOND_PATH, diamondDelay, 'ld', true)}
          {penTip(`${idBase}-d`, diamondDelay, 'pt-ld')}
        </g>

        {/* Trail sparkles — rendered in viewBox space */}
        {trails.map((s) => {
          const age = (performance.now() - s.born) / s.ttl;
          const op = Math.max(0, 1 - age);
          const r = s.size * (1 + age * 0.6);
          return (
            <circle
              key={s.id}
              cx={s.x}
              cy={s.y}
              r={r}
              fill="#E1F5FE"
              opacity={op}
              style={{ filter: 'drop-shadow(0 0 6px #4FC3F7)' }}
            />
          );
        })}
      </svg>

      {/* Ambient falling sparkles (HTML divs in % space) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
        }}
        aria-hidden
      >
        {ambient.map((sp, i) => (
          <span
            key={i}
            className="ts-ambient"
            style={{
              left: `${(sp.x / 450) * 100}%`,
              width: sp.size * 4,
              height: sp.size * 4,
              filter: `drop-shadow(0 0 ${sp.size * 2}px #4FC3F7)`,
              animation: `ts-ambient ${sp.duration}ms cubic-bezier(.4,.05,.5,1) ${sp.delay}ms forwards`,
              ['--dx-from' as string]: `${-sp.drift}px`,
              ['--dx-to' as string]: `${sp.drift}px`,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
}
