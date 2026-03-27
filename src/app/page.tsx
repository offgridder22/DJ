"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import PlayerScreen from "@/components/PlayerScreen";
import TracklistScreen from "@/components/TracklistScreen";

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    startY.current = e.clientY;
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      const diff = startY.current - e.clientY;
      setDragOffset(diff);
    },
    [isDragging]
  );

  const handlePointerUp = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 80;
    if (dragOffset > threshold && currentScreen === 0) {
      setCurrentScreen(1);
    } else if (dragOffset < -threshold && currentScreen === 1) {
      setCurrentScreen(0);
    }
    setDragOffset(0);
  }, [isDragging, dragOffset, currentScreen]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 30 && currentScreen === 0) {
        setCurrentScreen(1);
      } else if (e.deltaY < -30 && currentScreen === 1) {
        setCurrentScreen(0);
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [currentScreen]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0a0a0a]">
      <div
        className="relative w-[393px] h-[852px] bg-black rounded-[55px] overflow-hidden border border-gray-800 shadow-2xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ touchAction: "none" }}
      >
        {/* Notch */}
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[126px] h-[37px] bg-black rounded-full z-50" />

        <div
          className="absolute inset-0"
          style={{
            transform: `translateY(${
              currentScreen === 0
                ? isDragging
                  ? Math.max(-dragOffset * 0.3, -100)
                  : 0
                : isDragging
                ? -844 + Math.min(-dragOffset * 0.3, 100)
                : -844
            }px)`,
            transition: isDragging ? "none" : "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
          }}
        >
          <div className="h-[852px]">
            <PlayerScreen />
          </div>
          <div className="h-[852px]">
            <TracklistScreen onBack={() => setCurrentScreen(0)} />
          </div>
        </div>

        {/* Home indicator */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[134px] h-[5px] bg-gray-400 rounded-full z-50" />
      </div>
    </div>
  );
}
