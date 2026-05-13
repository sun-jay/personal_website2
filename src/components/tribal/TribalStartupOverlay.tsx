'use client';

import { useEffect, useState } from 'react';
import TribalStrokeDraw from './TribalStrokeDraw';

interface TribalStartupOverlayProps {
  /**
   * Fired the instant the SVG split begins — the consumer can start mounting
   * the underlying page (e.g. the card-drop animation) so it appears as
   * the overlay's halves slide away.
   */
  onSplitStart?: () => void;
  /** Fired once the overlay has fully cleared and unmounted. */
  onComplete?: () => void;
}

// --- Timing (kept in one place) -------------------------------------------
const WHITE_HOLD = 400;            // ms holding pure white at start
const BG_FADE_DUR = 600;           // ms for white → black fade
const TRIBAL_START = WHITE_HOLD + BG_FADE_DUR;
// TribalStrokeDraw's internal animation length, scaled by SVG_SPEED below.
// Baseline (speedScale=1):
//   bodyDelay(9) + perPathMs*2 + diamondOutlineDur + flickerPause + flickerDur
//   = 1346 + 1800 + 540 + 250 + 1500 = 5436ms
const SVG_SPEED = 0.75;                          // 25% shorter than baseline
const TRIBAL_ANIMATION_MS = Math.round(5436 * SVG_SPEED);
const POST_FLICKER_GAP = 100;
// Offset to pass into TribalStrokeDraw — when its inner split begins.
const SPLIT_AFTER = TRIBAL_ANIMATION_MS + POST_FLICKER_GAP;
const SPLIT_DUR = 900;
// Per-path stagger applied to the split — outermost paths leave first.
const SPLIT_STAGGER_MS = 70;
// BODY_PATHS has 10 entries (0..9); the last to slide is index 9.
const FULL_STAGGER_SPAN = 9 * SPLIT_STAGGER_MS;

const SVG_SPLIT_START_AT = TRIBAL_START + SPLIT_AFTER;
const TOTAL_DURATION = SVG_SPLIT_START_AT + FULL_STAGGER_SPAN + SPLIT_DUR;

type Stage = 0 | 1 | 2 | 3 | 4;
//   0 = solid white
//   1 = white → black fading
//   2 = black background, tribal drawing
//   3 = SVG split happening, background fading to transparent
//   4 = unmounted

/**
 * Full-screen startup overlay:
 *   white → fade to black → tribal stroke draw → 100ms beat → SVG splits →
 *   halves slide outward + bg fades to transparent → unmount.
 */
export default function TribalStartupOverlay({
  onSplitStart,
  onComplete,
}: TribalStartupOverlayProps) {
  const [stage, setStage] = useState<Stage>(0);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(window.setTimeout(() => setStage(1), WHITE_HOLD));
    timers.push(window.setTimeout(() => setStage(2), TRIBAL_START));
    timers.push(
      window.setTimeout(() => {
        setStage(3);
        onSplitStart?.();
      }, SVG_SPLIT_START_AT),
    );
    timers.push(
      window.setTimeout(() => {
        setStage(4);
        onComplete?.();
      }, TOTAL_DURATION),
    );
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (stage === 4) return null;

  const bgColor =
    stage === 0 ? '#ffffff' : stage === 3 ? 'transparent' : '#000000';
  const transitionDur =
    stage === 1 ? BG_FADE_DUR : stage === 3 ? SPLIT_DUR : 0;

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: bgColor,
        transition: `background-color ${transitionDur}ms ease-out`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Don't block interaction once the split has started.
        pointerEvents: stage < 3 ? 'auto' : 'none',
        overflow: 'hidden',
      }}
    >
      {stage >= 2 && (
        <div
          style={{
            // Mobile keeps the aggressive 140vmin path; desktop caps at 700px
            // so the figure isn't oversized + clipped on wide screens.
            width: 'min(140vmin, 700px)',
            height: 'min(140vmin, 700px)',
          }}
        >
          <TribalStrokeDraw
            speedScale={SVG_SPEED}
            splitAfterMs={SPLIT_AFTER}
            splitDurationMs={SPLIT_DUR}
            splitStaggerMs={SPLIT_STAGGER_MS}
            splitDistance={400}
          />
        </div>
      )}
    </div>
  );
}
