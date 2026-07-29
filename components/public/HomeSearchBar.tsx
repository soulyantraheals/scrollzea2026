"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function HomeSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ name: string; slug: string; price: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchSuggestions = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setSuggestions(data.slice(0, 6));
      setShowSuggestions(true);
    } catch {
      setSuggestions([]);
    }
    setLoading(false);
  };

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setShowSuggestions(false);
    setQuery("");
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => fetchSuggestions(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-gold)",
              color: "var(--text-primary)",
            }}
          />
        </div>
        <button
          onClick={() => doSearch(query)}
          className="btn-gold px-5 py-3 rounded-xl text-sm font-semibold shrink-0"
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50 shadow-xl"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-gold)",
          }}
        >
          {suggestions.map((p) => (
            <button
              key={p.slug}
              onClick={() => {
                setShowSuggestions(false);
                setQuery("");
                router.push(`/products/${p.slug}`);
              }}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-[var(--accent-glow)]"
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                {p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}
              </span>
            </button>
          ))}
          <button
            onClick={() => doSearch(query)}
            className="w-full px-4 py-3 text-center text-sm font-medium transition-colors"
            style={{
              color: "var(--accent-gold)",
              borderTop: "1px solid var(--border-gold)",
            }}
          >
            View all results →
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border-gold)", borderTopColor: "var(--accent-gold)" }} />
        </div>
      )}
    </div>
  );
}
