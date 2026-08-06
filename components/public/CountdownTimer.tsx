"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  expiresAt: string; // absolute ISO timestamp
  urgencyText: string; // e.g. "Hurry! Offer Ends In"
  showFireSymbol: boolean;
  onExpired?: () => void;
}

function pad(n: number) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

export function CountdownTimer({
  expiresAt,
  urgencyText,
  showFireSymbol,
  onExpired,
}: CountdownTimerProps) {
  const target = Date.parse(expiresAt);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = target - now;
  const expired = !isNaN(target) && diff <= 0;

  useEffect(() => {
    if (expired && onExpired) onExpired();
  }, [expired, onExpired]);

  const days = pad(diff > 0 ? diff / 86400000 : 0);
  const hours = pad(diff > 0 ? (diff % 86400000) / 3600000 : 0);
  const minutes = pad(diff > 0 ? (diff % 3600000) / 60000 : 0);
  const seconds = pad(diff > 0 ? (diff % 60000) / 1000 : 0);

  const units = [days, hours, minutes, seconds];

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-sm font-semibold tracking-wide" style={{ color: "var(--accent-gold)" }}>
        {showFireSymbol ? "🔥 " : ""}
        {expired ? "Offer Ended" : urgencyText}
      </p>
      <div className="flex items-center gap-2 sm:gap-3">
        {units.map((unit, i) => (
          <div key={i} className="flex items-center gap-2 sm:gap-3">
            <div
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-bold tabular-nums"
              style={{
                backgroundColor: "var(--bg-primary)",
                border: "1px solid var(--border-gold-hover)",
                color: "var(--text-primary)",
                boxShadow: "0 0 24px var(--accent-glow)",
              }}
            >
              {unit}
            </div>
            {i < units.length - 1 && (
              <span className="text-xl font-bold" style={{ color: "var(--accent-gold)" }}>
                :
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 sm:gap-3">
        {["Days", "Hours", "Mins", "Secs"].map((label, i) => (
          <span key={label} className="w-14 sm:w-16 text-center text-[10px] uppercase tracking-wider" style={{ color: "var(--text-dim)" }}>
            {label}
            {i === 0 ? "" : ""}
          </span>
        ))}
      </div>
    </div>
  );
}
