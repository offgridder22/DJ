"use client";

import { useRef, useEffect, useState } from "react";

const tracks = [
  { time: "00:00", artist: "Asake",           title: "Start",    active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "01:29", artist: "Asake & Wizkid", title: "MMS",      active: true,  bookmarked: false, label: "Lungu Boy" },
  { time: "05:09", artist: "Asake",           title: "Mood",     active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "08:00", artist: "Asake",           title: "My Heart", active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "12:30", artist: "Asake", title: "Olorun",            active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "15:40", artist: "Asake", title: "I Believe",         active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "18:55", artist: "Asake", title: "Remember",          active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "22:10", artist: "Asake", title: "Basquiat",          active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "25:30", artist: "Asake", title: "Active",            active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "28:50", artist: "Asake", title: "Lonely At The Top", active: false, bookmarked: false, label: "Lungu Boy" },
  { time: "32:10", artist: "Asake", title: "Only Me",               active: false, bookmarked: false, label: "YBNL / Empire" },
  { time: "35:20", artist: "Asake", title: "2:30",                  active: false, bookmarked: false, label: "Album cut" },
  { time: "38:40", artist: "Asake", title: "Organise",              active: false, bookmarked: false, label: "Afro fusion" },
  { time: "41:50", artist: "Asake", title: "Peace Be Unto You",     active: false, bookmarked: false, label: "Fan favorite" },
  { time: "45:10", artist: "Asake", title: "Terminator",            active: false, bookmarked: false, label: "Hit single" },
  { time: "48:30", artist: "Asake", title: "Joha",                  active: false, bookmarked: false, label: "Club energy" },
  { time: "51:40", artist: "Asake", title: "Nzaza",                 active: false, bookmarked: false, label: "Deep cut" },
  { time: "54:50", artist: "Asake", title: "Dupe",                  active: false, bookmarked: false, label: "Outro vibe" },
];

function timeToSeconds(t: string) {
  const [m, s] = t.split(":").map(Number);
  return m * 60 + s;
}

export default function TracklistScreen({ onBack, isPlaying, currentTime, onTogglePlay, onSeek }: { onBack: () => void; isPlaying: boolean; currentTime: number; onTogglePlay: () => void; onSeek: (time: number) => void }) {
  const previewRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    isPlaying ? video.play() : video.pause();
  }, [isPlaying]);

  const activeIndex = tracks.reduce((acc, track, i) =>
    timeToSeconds(track.time) <= currentTime ? i : acc, 0
  );

  const trackStart = timeToSeconds(tracks[activeIndex].time);
  const nextTrack  = tracks[activeIndex + 1];
  const trackEnd   = nextTrack ? timeToSeconds(nextTrack.time) : trackStart + 210;
  const trackProgress = Math.min(1, Math.max(0, (currentTime - trackStart) / (trackEnd - trackStart)));

  const [bookmarked, setBookmarked] = useState<Set<number>>(
    () => new Set(tracks.map((t, i) => t.bookmarked ? i : -1).filter(i => i >= 0))
  );

  return (
    <div className="relative h-full flex flex-col bg-black screen-entry">

      {/* Video cover — premier enfant flex, collé naturellement au top */}
      <div className="relative w-full h-[270px] shrink-0 overflow-hidden">
        <video
          ref={previewRef}
          src="/LUNGU BOY THE EXPERIENCE.mp4"
          className="absolute inset-0 w-full h-full object-cover z-0"
          muted
          loop
          playsInline
        />
        {/* Gradient top progressif — masque la coupure sous le Dynamic Island */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-transparent z-10" />
        {/* Gradient bas — fondu vers le contenu */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

        {/* Header + progress bar superposés sur la vidéo */}
        <div className="absolute inset-0 px-5 pb-4 flex flex-col justify-end z-20">
          <div className="flex flex-col gap-0.5">
            <p className="text-white/50 text-[10px] uppercase tracking-widest">Now playing</p>
            <p className="text-white text-sm font-semibold">Asake</p>
            <p className="text-white/50 text-xs">Lungu Boy — Los Angeles</p>
          </div>
          <div className="w-full h-[1px] bg-white/20 rounded-full mt-3">
            <div className="h-full bg-white/70 rounded-full" style={{ width: "0.3%" }} />
          </div>
        </div>
      </div>

      {/* Tracklist header */}
      <div className="flex items-center justify-between px-5 mb-3 mt-4">
        <h2 className="text-white text-xl font-bold">Tracklist</h2>
        <button className="flex items-center gap-1.5 bg-white/8 backdrop-blur-sm border border-white/15 rounded-lg px-3 py-1.5 text-white/60 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2 relative">

        {/* Single vertical timeline line passing through all dots */}
        <div className="absolute left-[76px] top-6 bottom-6 w-px bg-gray-700 z-0" />

        {tracks.map((track, i) => (
          <div
            key={i}
            onClick={() => {
              const t = timeToSeconds(track.time);
              onSeek(t);
              if (previewRef.current) previewRef.current.currentTime = t;
            }}
            className={`relative flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer active:opacity-70 overflow-hidden ${
              i === activeIndex ? "bg-white/8 backdrop-blur-sm border border-white/15 rounded-lg" : "rounded-xl"
            }`}
          >
            <span className="text-gray-500 text-xs w-[40px] pt-1 shrink-0">
              {track.time}
            </span>

            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className="w-2 shrink-0 relative z-10 mt-2 flex items-center justify-center">
                <span className={`rounded-full block ${
                  i === activeIndex
                    ? "w-2 h-2 bg-red-500"
                    : i < activeIndex
                    ? "w-1.5 h-1.5 bg-white/70"
                    : "w-1.5 h-1.5 bg-gray-500"
                }`} />
              </span>

              {i === activeIndex && (
                <button onClick={onTogglePlay} className="shrink-0 mt-0.5">
                  {isPlaying ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <polygon points="8,4 20,12 8,20" />
                    </svg>
                  )}
                </button>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm leading-tight">
                  <span className="font-semibold">{track.artist}</span>
                  {track.title && (
                    <span className="text-gray-300"> - {track.title}</span>
                  )}
                </p>
                {track.label && (
                  <p className="text-gray-500 text-xs mt-0.5">{track.label}</p>
                )}
              </div>

              {i === activeIndex && <button
                onClick={() => setBookmarked(prev => {
                  const next = new Set(prev);
                  next.has(i) ? next.delete(i) : next.add(i);
                  return next;
                })}
                className="shrink-0 mt-1 active:opacity-60"
              >
                {bookmarked.has(i) ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#e11d48">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                )}
              </button>}
            </div>

            {/* Progress fill — active track only */}
            {i === activeIndex && (
              <div
                className="absolute bottom-0 left-0 h-[2px] rounded-full bg-red-500/50"
                style={{ width: `${trackProgress * 100}%`, transition: "width 0.4s linear" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Bottom gradient — last track partially visible, no explicit UI */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
    </div>
  );
}
