"use client";

import { useMemo } from "react";

interface WaveformProps {
  bars: number[];
  progress: number;
}

const VISIBLE_BARS = 60;
const CENTER = Math.floor(VISIBLE_BARS / 2);

export default function Waveform({ bars, progress }: WaveformProps) {
  const totalBars = bars.length;
  const currentIndex = totalBars > 0 ? Math.floor(progress * totalBars) : 0;

  const visibleSlice = useMemo(() => {
    const start = currentIndex - CENTER;
    const result: { height: number; color: string }[] = [];

    for (let i = 0; i < VISIBLE_BARS; i++) {
      const barIndex = start + i;
      let height: number;

      if (totalBars === 0) {
        // Audio not loaded yet — show placeholder bars
        height = 6 + Math.sin(i * 0.5) * 4;
      } else if (barIndex >= 0 && barIndex < totalBars) {
        height = bars[barIndex];
      } else {
        height = 4;
      }

      let color: string;
      if (i === CENTER) {
        color = "#e11d48";
      } else if (i < CENTER) {
        const ratio = i / CENTER;
        const r = Math.round(225 * ratio);
        const g = Math.round(29 * ratio);
        const b = Math.round(72 * ratio);
        color = `rgb(${r},${g},${b})`;
      } else {
        color = "rgba(255,255,255,0.3)";
      }

      result.push({ height, color });
    }

    return result;
  }, [bars, totalBars, currentIndex]);

  return (
    <div className="flex items-center gap-[2px] h-[50px] w-full px-4">
      {visibleSlice.map((bar, i) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: `${bar.height}px`,
            backgroundColor: bar.color,
            minWidth: "2px",
          }}
        />
      ))}
    </div>
  );
}
