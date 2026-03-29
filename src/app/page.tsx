"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import PlayerScreen from "@/components/PlayerScreen";
import TracklistScreen from "@/components/TracklistScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startY       = useRef(0);
  const lastY        = useRef(0);
  const lastMoveTime = useRef(0);
  const velocityY    = useRef(0);
  const togglePlayRef = useRef<() => void>(() => {});
  const seekRef       = useRef<(time: number) => void>(() => {});

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current    = e.clientY;
    lastY.current     = e.clientY;
    lastMoveTime.current = Date.now();
    velocityY.current = 0;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const now = Date.now();
      const dt  = now - lastMoveTime.current;
      if (dt > 0) velocityY.current = (lastY.current - e.clientY) / dt;
      lastY.current     = e.clientY;
      lastMoveTime.current = now;
      setDragOffset(startY.current - e.clientY);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold  = 60;
    const vThreshold = 0.35; // px/ms — flick detection
    const v = velocityY.current;
    if ((dragOffset > threshold || v > vThreshold) && currentScreen === 0) {
      setCurrentScreen(1);
    } else if ((dragOffset < -threshold || v < -vThreshold) && currentScreen === 1) {
      setCurrentScreen(0);
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, currentScreen]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 30 && currentScreen === 0)  setCurrentScreen(1);
      else if (e.deltaY < -30 && currentScreen === 1) setCurrentScreen(0);
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentScreen]);

  // 0 = fully on player, 1 = fully on tracklist
  const t = (() => {
    if (currentScreen === 0)
      return isDragging ? Math.max(0, Math.min(1, dragOffset / 160)) : 0;
    return isDragging ? Math.max(0, Math.min(1, 1 + dragOffset / 160)) : 1;
  })();

  const spring = "transform 0.55s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.42s ease, filter 0.42s ease";

  const sharedLayer: React.CSSProperties = {
    WebkitBackfaceVisibility: "hidden",
    backfaceVisibility: "hidden",
    willChange: "transform, opacity, filter",
  };

  const playerStyle: React.CSSProperties = {
    ...sharedLayer,
    opacity:    Math.max(0, 1 - t * 2),
    transform:  `scale(${1 - t * 0.05}) translateY(${-t * 22}px)`,
    filter:     `blur(${t * 14}px)`,
    transition: isDragging ? "none" : spring,
    pointerEvents: currentScreen === 0 ? "auto" : "none",
  };

  const tracklistStyle: React.CSSProperties = {
    ...sharedLayer,
    opacity:    Math.max(0, t * 1.55 - 0.12),
    transform:  `translateY(${(1 - t) * 48}px)`,
    filter:     `blur(${(1 - t) * 10}px)`,
    transition: isDragging ? "none" : spring,
    pointerEvents: currentScreen === 1 ? "auto" : "none",
  };

  return (
    <div className="flex items-center justify-center min-h-[100dvh] bg-black md:bg-[#0a0a0a]">
      <div
        className="relative w-full h-[100dvh] bg-black overflow-hidden
                   md:w-[393px] md:h-[852px] md:rounded-[55px] md:border md:border-gray-800 md:shadow-2xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{
          touchAction: "none",
          transform: "translateZ(0)",
          WebkitBackfaceVisibility: "hidden",
          backfaceVisibility: "hidden",
          isolation: "isolate",
        }}
      >
        {/* Dynamic Island — desktop mockup only (real device has its own) */}
        <div className="hidden md:block absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-50" />

        {/* Player Screen */}
        <div className="absolute inset-0" style={playerStyle}>
          <PlayerScreen
            onPlayStateChange={setIsPlaying}
            onTimeUpdate={setCurrentTime}
            toggleRef={togglePlayRef}
            seekRef={seekRef}
          />
        </div>

        {/* Tracklist Screen */}
        <div className="absolute inset-0" style={tracklistStyle}>
          <TracklistScreen
            onBack={() => setCurrentScreen(0)}
            isPlaying={isPlaying}
            currentTime={currentTime}
            onTogglePlay={() => togglePlayRef.current()}
            onSeek={(time) => seekRef.current(time)}
          />
        </div>

        {/* Home indicator — desktop mockup only */}
        <div className="hidden md:block absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-gray-400 rounded-full z-50" />
      </div>
    </div>
  );
}
