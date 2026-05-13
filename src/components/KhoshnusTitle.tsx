'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { Manuscript } from 'khoshnus';

interface KhoshnusTitleProps {
  text: string;
  svgId: string;
  viewBoxWidth?: number;
  viewBoxHeight?: number;
  fontFamily?: string;
  fontSize?: string;
  fontStyle?: string;
  fontWeight?: number | string;
  letterSpacing?: string;
  textY?: string | number;
  textDominantBaseline?: string;
  strokeDashoffset?: number;
  endStrokeWidth?: number;
  color?: string;
  eachLetterDelay?: number;
  delayOperation?: number;
  /**
   * Skip the handwriting intro animation — text appears in its final filled state
   * immediately. Useful when an outer entrance sequence already handles the reveal.
   */
  disableIntro?: boolean;
  style?: CSSProperties;
}

export default function KhoshnusTitle({
  text,
  svgId,
  viewBoxWidth = 600,
  viewBoxHeight = 100,
  fontFamily = 'var(--font-instrument-serif), serif',
  fontSize = '58px',
  fontStyle = 'italic',
  fontWeight = 400,
  letterSpacing = '0.02em',
  textY = '0',
  textDominantBaseline = 'text-before-edge',
  strokeDashoffset = 500,
  endStrokeWidth = 1.4,
  color = 'white',
  eachLetterDelay = 110,
  delayOperation = 200,
  disableIntro = false,
  style,
}: KhoshnusTitleProps) {
  const writtenRef = useRef(false);

  useEffect(() => {
    if (writtenRef.current) return;
    writtenRef.current = true;

    if (!document.querySelector('style')) {
      document.head.appendChild(document.createElement('style'));
    }

    const manuscript = new Manuscript({
      svgId,
      font: fontFamily,
      fontSize,
      start: {
        startStrokeDashoffset: strokeDashoffset,
        startStroke: color,
        startStrokeWidth: 0.0000000001,
        startFill: 'transparent',
      },
      end: {
        endStrokeDashoffset: 0,
        endStroke: 'transparent',
        endStrokeWidth,
        endFill: color,
      },
      // When the intro is disabled, all durations collapse to ~0 so the text
      // jumps straight to its end state (filled, no stroke).
      durations: disableIntro
        ? { strokeDashoffsetDuration: 1, strokeWidthDuration: 1, strokeDuration: 1, fillDuration: 1 }
        : {
            strokeDashoffsetDuration: 1400,
            strokeWidthDuration: 500,
            strokeDuration: 1400,
            fillDuration: 1400,
          },
    });

    manuscript.write(text, {
      writeConfiguration: {
        eachLetterDelay: disableIntro ? 0 : eachLetterDelay,
        delayOperation: disableIntro ? 0 : delayOperation,
      },
      textElementAttributes: {
        x: '50%',
        y: String(textY),
        textAnchor: 'middle',
        dominantBaseline: textDominantBaseline,
        fontSize,
      },
    });
  }, []);

  return (
    <svg
      id={svgId}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        width: '100%',
        height: '100%',
        overflow: 'visible',
        fontStyle,
        fontWeight,
        letterSpacing,
        ...style,
      }}
    />
  );
}
