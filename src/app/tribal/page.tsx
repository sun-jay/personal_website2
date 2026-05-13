'use client';

import { useState } from 'react';
import TribalWipeReveal from '@/components/tribal/TribalWipeReveal';
import TribalStrokeDraw from '@/components/tribal/TribalStrokeDraw';
import TribalSparkleRain from '@/components/tribal/TribalSparkleRain';
import TribalCascadeGlitch from '@/components/tribal/TribalCascadeGlitch';
import TribalSparkleStroke from '@/components/tribal/TribalSparkleStroke';
import TribalGlyph2 from '@/components/tribal/TribalGlyph2';

type Variant = {
  id: string;
  title: string;
  blurb: string;
  render: (playKey: number) => React.ReactNode;
};

const VARIANTS: Variant[] = [
  {
    id: 'glyph2',
    title: 'Glyph II',
    blurb:
      'New, denser traced glyph (42 paths). Builds inward — flourishes first, body last — then the eye flickers on.',
    render: (k) => <TribalGlyph2 playKey={k} />,
  },
  {
    id: 'sparkle-stroke',
    title: 'Sparkle Stroke',
    blurb:
      'The combined version — pen-tip glow rides each path, sparkles trail behind, ambient rain fills the space.',
    render: (k) => <TribalSparkleStroke playKey={k} />,
  },
  {
    id: 'stroke',
    title: 'Stroke Draw',
    blurb:
      'Wet-ink draw: bright cyan tracer leads, white underlay settles behind, fill fades in last. After the diamond settles, the figure splits side-to-side.',
    render: (k) => (
      <TribalStrokeDraw
        playKey={k}
        // Flicker ends ≈ 5436ms; 100ms beat before splitting.
        splitAfterMs={5536}
        splitDurationMs={900}
        splitDistance={240}
      />
    ),
  },
  {
    id: 'wipe',
    title: 'Wipe Reveal',
    blurb: 'A luminous scan line wipes top→bottom, revealing the design as it passes.',
    render: (k) => <TribalWipeReveal playKey={k} />,
  },
  {
    id: 'sparkle',
    title: 'Sparkle Rain',
    blurb: 'Cyan sparkles fall from above; the design materializes in their wake.',
    render: (k) => <TribalSparkleRain playKey={k} />,
  },
  {
    id: 'glitch',
    title: 'Cascade Glitch',
    blurb: 'Each path snaps into place with a bright glitch flash, top to bottom.',
    render: (k) => <TribalCascadeGlitch playKey={k} />,
  },
];

export default function TribalShowcasePage() {
  const [keys, setKeys] = useState<Record<string, number>>(() =>
    Object.fromEntries(VARIANTS.map((v) => [v.id, 0])),
  );
  const replay = (id: string) =>
    setKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  const replayAll = () =>
    setKeys((prev) =>
      Object.fromEntries(Object.entries(prev).map(([k, v]) => [k, v + 1])),
    );

  return (
    <div
      style={{
        height: '100vh',
        background:
          'radial-gradient(ellipse at center, #0b1e2c 0%, #050a10 70%, #000000 100%)',
        color: '#E0F7FA',
        fontFamily: 'var(--font-instrument-serif), serif',
        padding: '48px 24px 80px',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 32,
            flexWrap: 'wrap',
            gap: 16,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 'clamp(40px, 6vw, 72px)',
                fontStyle: 'italic',
                fontWeight: 400,
                margin: 0,
                color: '#E1F5FE',
                textShadow: '0 0 12px rgba(79, 195, 247, 0.5)',
              }}
            >
              Tribal Load-Ins
            </h1>
            <p
              style={{
                marginTop: 8,
                fontFamily: 'Varela Round, sans-serif',
                color: '#81D4FA',
                fontStyle: 'normal',
                fontSize: 15,
              }}
            >
              Five React variants. Click any tile to replay; the button top-right replays all.
            </p>
          </div>
          <button
            onClick={replayAll}
            style={{
              padding: '12px 22px',
              background: 'rgba(79, 195, 247, 0.08)',
              color: '#E1F5FE',
              border: '1px solid rgba(79,195,247,0.4)',
              borderRadius: 12,
              fontFamily: 'Varela Round, sans-serif',
              fontSize: 14,
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 0 24px rgba(79,195,247,0.15)',
            }}
          >
            ↻ Replay all
          </button>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24,
          }}
        >
          {VARIANTS.map((v) => (
            <div
              key={v.id}
              onClick={() => replay(v.id)}
              style={{
                position: 'relative',
                background:
                  'linear-gradient(160deg, rgba(2,12,22,0.85), rgba(0,0,0,0.95))',
                border: '1px solid rgba(79,195,247,0.18)',
                borderRadius: 20,
                padding: 24,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, transform 0.15s ease',
                boxShadow: '0 12px 40px rgba(0,0,0,0.6), inset 0 0 60px rgba(79,195,247,0.03)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(79,195,247,0.5)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(79,195,247,0.18)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1 / 1',
                  marginBottom: 16,
                }}
              >
                {v.render(keys[v.id])}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                <h2
                  style={{
                    fontSize: 24,
                    fontStyle: 'italic',
                    fontWeight: 400,
                    margin: 0,
                    color: '#E1F5FE',
                  }}
                >
                  {v.title}
                </h2>
                <span
                  style={{
                    fontFamily: 'Varela Round, sans-serif',
                    fontSize: 12,
                    color: '#4FC3F7',
                    opacity: 0.8,
                  }}
                >
                  click to replay
                </span>
              </div>
              <p
                style={{
                  marginTop: 6,
                  fontFamily: 'Varela Round, sans-serif',
                  fontSize: 14,
                  color: '#B3E5FC',
                  opacity: 0.78,
                  fontStyle: 'normal',
                  lineHeight: 1.5,
                }}
              >
                {v.blurb}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
