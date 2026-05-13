'use client';

import React from 'react';
import type { CSSProperties, SVGAttributes } from 'react';
import {
  BODY_PATHS,
  DIAMOND_PATH,
  RIGHT_BODY_TRANSFORM,
  LEFT_BODY_TRANSFORM,
  RIGHT_DIAMOND_TRANSFORM,
  LEFT_DIAMOND_TRANSFORM,
} from './paths';

interface TribalBaseProps {
  bodyFill?: string;
  diamondFill?: string;
  bodyPathProps?: (i: number, side: 'right' | 'left') => SVGAttributes<SVGPathElement>;
  diamondPathProps?: (side: 'right' | 'left') => SVGAttributes<SVGPathElement>;
  style?: CSSProperties;
  className?: string;
  size?: number | string;
}

/**
 * Renders the tribal design SVG with white body + cyan diamond and a neon-blue
 * drop-shadow afterglow. Each path can be individually customized via
 * `bodyPathProps` / `diamondPathProps` so animation variants can attach refs,
 * inline styles, classes, etc.
 */
export default function TribalBase({
  bodyFill = '#ffffff',
  diamondFill = '#4FC3F7',
  bodyPathProps,
  diamondPathProps,
  style,
  className,
  size = '100%',
}: TribalBaseProps) {
  return (
    <svg
      viewBox="0 0 450 450"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{
        filter:
          'drop-shadow(0 0 4px #4FC3F7) drop-shadow(0 0 12px #29B6F6) drop-shadow(0 0 28px rgba(2, 136, 209, 0.55))',
        overflow: 'visible',
        ...style,
      }}
    >
      <g transform={RIGHT_BODY_TRANSFORM} fill={bodyFill} stroke="none">
        {BODY_PATHS.map((d, i) => (
          <path key={`r-${i}`} d={d} {...(bodyPathProps?.(i, 'right') ?? {})} />
        ))}
      </g>
      <g transform={LEFT_BODY_TRANSFORM} fill={bodyFill} stroke="none">
        {BODY_PATHS.map((d, i) => (
          <path key={`l-${i}`} d={d} {...(bodyPathProps?.(i, 'left') ?? {})} />
        ))}
      </g>
      <g transform={RIGHT_DIAMOND_TRANSFORM} fill={diamondFill} stroke="none">
        <path d={DIAMOND_PATH} {...(diamondPathProps?.('right') ?? {})} />
      </g>
      <g transform={LEFT_DIAMOND_TRANSFORM} fill={diamondFill} stroke="none">
        <path d={DIAMOND_PATH} {...(diamondPathProps?.('left') ?? {})} />
      </g>
    </svg>
  );
}
