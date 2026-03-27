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

export default function PlayerScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bars, setBars] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const audio = new Audio("/default-track.mp3");
    audioRef.current = audio;

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration);
    });

    const audioContext = new AudioContext();
    fetch("/default-track.mp3")
      .then((res) => res.arrayBuffer())
      .then((buf) => audioContext.decodeAudioData(buf))
      .then((decoded) => {
        setBars(analyzeAudio(decoded));
      });

    return () => {
      audio.pause();
      cancelAnimationFrame(animRef.current);
      audioContext.close();
    };
  }, []);

  const updateProgress = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
    }
    animRef.current = requestAnimationFrame(updateProgress);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      cancelAnimationFrame(animRef.current);
    } else {
      audio.play();
      animRef.current = requestAnimationFrame(updateProgress);
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, updateProgress]);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(
      0,
      Math.min(audio.duration, audio.currentTime + seconds)
    );
    setCurrentTime(audio.currentTime);
    setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
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
    <div className="relative h-full flex flex-col bg-black">
      {/* Cover Image + Header + Artist Info */}
      <div className="relative w-full aspect-[4/3]">
        <img
          src="https://i.scdn.co/image/ab67616d0000b273e3a09e6b4e4c1f8a1f7e8a5c"
          alt="Kaaris Zoo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 pt-12 pb-2 z-10">
          <div className="flex items-center gap-0">
            <span
              className="text-white text-lg tracking-tight"
              style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
            >
              vol
            </span>
            <span
              className="text-red-500 text-lg"
              style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
            >
              |
            </span>
            <span
              className="text-white text-lg tracking-tight"
              style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
            >
              me
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white">
              <img src="/icons/bookmark.svg" alt="Bookmark" width={22} height={22} />
            </button>
            <button className="text-white">
              <img src="/icons/arrow.down.svg" alt="Download" width={22} height={22} />
            </button>
          </div>
        </div>

        {/* Artist Info overlaid on image */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-5 z-10">
          <h1
            className="text-white text-[32px] leading-tight"
            style={{ fontFamily: "var(--font-manrope)", fontWeight: 700 }}
          >
            Kaaris
          </h1>
          <div className="flex items-center justify-between mt-1">
            <span
              className="text-gray-300 text-sm"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              Zoo
            </span>
            <span
              className="text-gray-300 text-sm tabular-nums"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Time Indicator */}
      <div className="flex justify-center mt-5">
        <span
          className="bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full tabular-nums"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Waveform */}
      <div className="mt-3 px-2">
        <Waveform bars={bars} progress={progress} />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-10 mt-6 px-6">
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
          className="w-16 h-16 rounded-full border-2 border-white/30 flex items-center justify-center active:opacity-60"
        >
          {isPlaying ? (
            <img src="/icons/pause.svg" alt="Pause" width={28} height={28} />
          ) : (
            <img src="/icons/play.fill.svg" alt="Play" width={28} height={28} />
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
      </div>

      {/* Swipe hint */}
      <div className="flex justify-center mt-auto mb-8">
        <div className="flex flex-col items-center gap-1 animate-pulse">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </div>
      </div>
    </div>
  );
}
