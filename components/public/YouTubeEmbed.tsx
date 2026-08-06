"use client";

import { useState } from "react";
import { Play } from "lucide-react";

interface YouTubeEmbedProps {
  url: string;
  buttonText: string;
  title?: string;
}

// Extract a YouTube video ID from common URL formats
function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.split("/")[1] || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || null;
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || null;
      return u.searchParams.get("v");
    }
    return null;
  } catch {
    return null;
  }
}

export function YouTubeEmbed({ url, buttonText, title }: YouTubeEmbedProps) {
  const [open, setOpen] = useState(false);
  const videoId = getYouTubeId(url);
  if (!videoId) return null;

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-3 px-6 py-3.5 rounded-xl font-semibold transition-all hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg, #FF0000, #CC0000)",
          color: "#FFFFFF",
          boxShadow: "0 6px 24px rgba(255,0,0,0.25)",
        }}
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
        >
          <Play className="h-4 w-4 ml-0.5 fill-current" />
        </span>
        {open ? "Hide Video" : buttonText || "Watch YouTube Video"}
      </button>
      {title && !open && (
        <p className="mt-2 text-sm" style={{ color: "var(--text-dim)" }}>
          {title}
        </p>
      )}
      {open && (
        <div className="mt-6">
          <div className="relative w-full overflow-hidden rounded-2xl" style={{ aspectRatio: "16/9", backgroundColor: "#000" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title || "YouTube Video"}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
