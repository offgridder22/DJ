"use client";

import { useMemo, useRef, useEffect } from "react";

interface WaveformProps {
  bars: number[];
  progress: number;
}

const BAR_W       = 2;
const BAR_WA      = 3;
const GAP         = 5;
const STEP        = BAR_W + GAP;
const TRAIL       = 10;
const FADE_RADIUS = 32;

// Pure — safe outside component
function seeded(n: number): number {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function getColor(pastDist: number): string {
  if (pastDist < 0)     return "rgba(170,185,200,0.20)";
  if (pastDist === 0)   return "#e11d48";
  if (pastDist > TRAIL) return "rgba(255,255,255,0.75)";
  const t = pastDist / TRAIL;
  const r = Math.round(225 + (255 - 225) * t);
  const g = Math.round(29  + (255 - 29)  * t);
  const b = Math.round(72  + (255 - 72)  * t);
  return `rgb(${r},${g},${b})`;
}

export default function Waveform({ bars, progress }: WaveformProps) {
  const totalBars    = bars.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const barEls       = useRef<(HTMLDivElement | null)[]>([]);

  // Always-fresh refs — read by the persistent RAF without re-creating it
  const progressRef     = useRef(progress);
  const displayBarsRef  = useRef<number[]>([]);
  progressRef.current = progress;

  const displayBars = useMemo(() => {
    if (totalBars === 0) {
      return Array.from({ length: 300 }, (_, i) =>
        Math.max(4,
          6
          + seeded(i)        * 18
          + seeded(i * 7.3)  * 8
          + Math.sin(i * 0.11) * 5
        )
      );
    }
    return bars.map((h, i) => Math.max(4, h + seeded(i * 3.7) * 6 - 3));
  }, [bars, totalBars]);

  displayBarsRef.current = displayBars;

  // Single persistent RAF — never restarts, reads latest values via refs
  useEffect(() => {
    let animId: number;

    const render = () => {
      const container = containerRef.current;
      if (!container) { animId = requestAnimationFrame(render); return; }

      const prog = progressRef.current;
      const brs  = displayBarsRef.current;
      const len  = brs.length;

      const exactIndex   = prog * len;
      const currentIndex = Math.floor(exactIndex);
      const t            = Date.now() / 1000;

      // Scroll container
      container.style.transform = `translateX(${-(exactIndex * STEP) - BAR_W / 2}px)`;

      const half = Math.ceil(200 / STEP) + TRAIL + 2;
      const from = Math.max(0, currentIndex - half);
      const to   = Math.min(barEls.current.length - 1, currentIndex + half);

      for (let j = from; j <= to; j++) {
        const el = barEls.current[j];
        if (!el) continue;

        const pastDist = currentIndex - j;
        const absDist  = Math.abs(j - currentIndex);

        // Lens attenuation
        const fade  = Math.cos((Math.PI / 2) * Math.min(1, absDist / FADE_RADIUS)) ** 1.8;
        const baseH = brs[j] ?? 4;

        // Idle micro-breathing — each bar has its own frequency + phase
        const idleFreq  = 0.5 + seeded(j * 13.7) * 0.6;
        const idlePhase = seeded(j * 5.3) * Math.PI * 2;
        const idleAmp   = pastDist === 0 ? 0.07 : 0.028;
        const idle      = 1 + Math.sin(t * idleFreq + idlePhase) * idleAmp;

        const finalH = Math.max(4, (baseH / 44) * 100 * fade * idle);

        el.style.height          = `${finalH}%`;
        el.style.backgroundColor = getColor(pastDist);
        el.style.width           = pastDist === 0 ? `${BAR_WA}px` : `${BAR_W}px`;

        // Glow on active bar only
        el.style.boxShadow = pastDist === 0
          ? "0 0 7px 2px rgba(225, 29, 72, 0.55)"
          : "";
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []); // runs once — persistent

  return (
    <div className="h-[60px] w-full px-4 overflow-hidden relative">
      <div
        ref={containerRef}
        className="flex items-center absolute inset-y-0"
        style={{ left: "50%", gap: `${GAP}px` }}
      >
        {displayBars.map((height, i) => (
          <div
            key={i}
            ref={(el) => { barEls.current[i] = el; }}
            className="rounded-full shrink-0"
            style={{
              width: `${BAR_W}px`,
              height: `${(height / 44) * 100}%`,
              backgroundColor: "rgba(170,185,200,0.20)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
