"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Waveform from "./Waveform";

function analyzeAudio(audioBuffer: AudioBuffer): number[] {
  const rawData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const totalSeconds = Math.floor(audioBuffer.duration);
  const bars: number[] = [];

  for (let i = 0; i < totalSeconds; i++) {
    const start = i * sampleRate;
    const end = Math.min(start + sampleRate, rawData.length);
    let sumSquares = 0;
    for (let j = start; j < end; j++) {
      sumSquares += rawData[j] * rawData[j];
    }
    const rms = Math.sqrt(sumSquares / (end - start));
    bars.push(rms);
  }

  const max = Math.max(...bars);
  return bars.map((b) => Math.max(4, Math.pow(b / max, 0.6) * 44));
}

export default function PlayerScreen({ onPlayStateChange, onTimeUpdate, toggleRef, seekRef }: { onPlayStateChange?: (playing: boolean) => void; onTimeUpdate?: (time: number) => void; toggleRef?: React.MutableRefObject<() => void>; seekRef?: React.MutableRefObject<(time: number) => void> }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const audioContext = new AudioContext();
    fetch("/LUNGU BOY THE EXPERIENCE.mp4")
      .then((res) => res.arrayBuffer())
      .then((buf) => audioContext.decodeAudioData(buf))
      .then((decoded) => {
        setDuration(decoded.duration);
        setBars(analyzeAudio(decoded));
      });

    return () => {
      cancelAnimationFrame(animRef.current);
      audioContext.close();
    };
  }, []);

  const updateProgress = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      setProgress(video.duration ? video.currentTime / video.duration : 0);
      onTimeUpdate?.(video.currentTime);
    }
    animRef.current = requestAnimationFrame(updateProgress);
  }, [onTimeUpdate]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      cancelAnimationFrame(animRef.current);
    } else {
      video.play();
      animRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
    onPlayStateChange?.(!isPlaying);
  }, [isPlaying, updateProgress, onPlayStateChange]);

  // Expose togglePlay via ref pour les composants frères
  useEffect(() => {
    if (toggleRef) toggleRef.current = togglePlay;
  }, [togglePlay, toggleRef]);

  // Expose seek via ref
  useEffect(() => {
    if (seekRef) seekRef.current = (time: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = time;
      setCurrentTime(time);
      setProgress(video.duration ? time / video.duration : 0);
      onTimeUpdate?.(time);
    };
  }, [seekRef]);

  const skip = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    setCurrentTime(video.currentTime);
    setProgress(video.duration ? video.currentTime / video.duration : 0);
  }, []);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0)
      return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative h-full flex flex-col bg-black screen-entry">

      {/* ── Cover ── */}
      <section className="relative w-full h-[70%] shrink-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/LUNGU BOY THE EXPERIENCE.mp4"
          className="w-full h-full object-cover z-0 hero-video"
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />

        <header
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pb-2 z-20"
          style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}
        >
          <img src="/icons/Logo.svg" alt="Volume" width={72} height={24} />
          <nav className="flex items-center gap-4">
            <button className="text-white">
              <img src="/icons/bookmark.svg" alt="Bookmark" width={22} height={22} />
            </button>
            <button className="text-white">
              <img src="/icons/more_horiz.svg" alt="More" width={22} height={22} />
            </button>
          </nav>
        </header>

        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-20">

          <div className="flex items-end justify-between">
            {/* Gauche : titre + sous-titre */}
            <div>
              <h1
                className="text-white text-[32px] leading-tight"
                style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
              >
                Asake
              </h1>
              <span
                className="text-gray-300 text-sm"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                Lungu Boy
              </span>
            </div>

            {/* Droite : CD + Cover au dessus de 48:28 */}
            <div className="flex flex-col items-end gap-3">
              <div className="relative w-[44px] h-[44px] shrink-0">
                {/* Wrapper : gère uniquement la translation */}
                <div
                  className="absolute inset-0"
                  style={{
                    transform: isPlaying ? "translateX(-18px)" : "translateX(0px)",
                    transition: "transform 0.5s ease",
                  }}
                >
                  {/* Image : gère uniquement la rotation */}
                  <img
                    src="/CD.png"
                    alt="CD"
                    width={44}
                    height={44}
                    className={`rounded-full w-full h-full ${isPlaying ? "cd-spinning" : ""}`}
                  />
                </div>
                <img
                  src="/Cover.png"
                  alt="Cover"
                  width={44}
                  height={44}
                  className="absolute inset-0 rounded-md"
                />
              </div>
              <span
                className="text-gray-300 text-sm tabular-nums"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                48:28
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Current time badge ── */}
      <div className="flex flex-col items-center mt-2">
        <span
          className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full tabular-nums"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {formatTime(currentTime)}
        </span>
        {/* Caret pointant vers la waveform */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid #dc2626",
          }}
        />
      </div>

      {/* ── Waveform ── */}
      <section className="mt-1 px-2">
        <Waveform bars={bars} progress={progress} />
      </section>

      {/* ── Playback controls ── */}
      <nav
        className="flex items-center justify-center gap-10 mt-9 px-6"
        style={{ marginBottom: "max(2.5rem, env(safe-area-inset-bottom))" }}
      >
        <button onClick={() => skip(-15)} className="active:opacity-60">
          <img
            src="/icons/15.arrow.trianglehead.counterclockwise.svg"
            alt="Rewind 15s"
            width={28}
            height={28}
          />
        </button>

        <button
          onClick={togglePlay}
          className="active:opacity-60"
        >
          {isPlaying ? (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
              <polygon points="8,4 20,12 8,20" />
            </svg>
          )}
        </button>

        <button onClick={() => skip(15)} className="active:opacity-60">
          <img
            src="/icons/15.arrow.trianglehead.clockwise.svg"
            alt="Forward 15s"
            width={28}
            height={28}
          />
        </button>
      </nav>

      {/* Bottom gradient — scroll affordance, no explicit UI */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none z-10" />

    </main>
  );
}
