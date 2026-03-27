"use client";

const tracks = [
  {
    time: "00:00",
    artist: "Tiga & Audion",
    title: "Love Don't Dance Here Anymore",
    label: "Turbo Recordings",
    active: false,
    bookmarked: false,
  },
  {
    time: "05:23",
    artist: "Calvin Harris",
    title: "Summer (Extended Mix)",
    label: "",
    active: false,
    bookmarked: false,
  },
  {
    time: "09:50",
    artist: "Sade",
    title: "Kiss of Life (Kaytranada Edit)",
    label: "Panema",
    active: true,
    bookmarked: false,
  },
  {
    time: "15:35",
    artist: "Mara TK & Flamingosis",
    title: "Feel It",
    label: "Panema",
    active: false,
    bookmarked: false,
  },
  {
    time: "22:21",
    artist: "Kaytranada",
    title: "Lite Spots",
    label: "XL Recordings",
    active: false,
    bookmarked: true,
  },
  {
    time: "27:48",
    artist: "AlunaGeorge",
    title: "Turn Up the Love",
    label: "Degmination",
    active: false,
    bookmarked: false,
  },
  {
    time: "32:15",
    artist: "The Internet",
    title: "Girl (ft. Kaytranada)",
    label: "Odd Future",
    active: false,
    bookmarked: false,
  },
  {
    time: "35:42",
    artist: "The Internet",
    title: "Girl (ft. Kaytranada)",
    label: "",
    active: false,
    bookmarked: false,
  },
];

export default function TracklistScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="h-full flex flex-col bg-black">
      {/* Header */}
      <div className="px-5 pt-12 pb-3">
        <button onClick={onBack} className="text-white mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-white text-2xl font-bold">Kaytranada</h1>
        <p className="text-gray-400 text-sm mt-0.5">Boiler Room — London</p>
        <p className="text-gray-500 text-xs mt-0.5">00:24 / 01:32:44</p>
      </div>

      {/* Mini cover with progress */}
      <div className="px-5 mb-4">
        <div className="relative w-full h-[100px] rounded-xl overflow-hidden">
          <img
            src="https://picsum.photos/seed/dj/800/600"
            alt="Kaytranada performing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
        {/* Progress bar */}
        <div className="w-full h-[3px] bg-gray-700 mt-2 rounded-full">
          <div className="h-full bg-red-600 rounded-full" style={{ width: "0.3%" }} />
        </div>
      </div>

      {/* Tracklist header */}
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-white text-xl font-bold">Tracklist</h2>
        <button className="flex items-center gap-1.5 border border-gray-600 rounded-full px-3 py-1.5 text-gray-300 text-xs">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export
        </button>
      </div>

      {/* Track list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2">
        {tracks.map((track, i) => (
          <div
            key={i}
            className={`flex items-start gap-3 px-3 py-3 rounded-xl ${
              track.active ? "bg-gray-800/60" : ""
            }`}
          >
            <span className="text-gray-500 text-xs w-[40px] pt-1 shrink-0">
              {track.time}
            </span>

            <div className="flex items-start gap-2 flex-1 min-w-0">
              <span className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                track.active ? "bg-red-500" : "bg-red-500"
              }`} />

              {track.active && (
                <button className="shrink-0 mt-0.5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <polygon points="8,4 20,12 8,20" />
                  </svg>
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

              {track.bookmarked && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#e11d48" className="shrink-0 mt-1">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
