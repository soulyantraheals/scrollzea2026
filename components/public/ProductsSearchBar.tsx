"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function ProductsSearchBar({ initialSearch }: { initialSearch: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialSearch || "");
  const [suggestions, setSuggestions] = useState<Array<{ name: string; slug: string; price: number }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Sync initialSearch when URL changes externally
  useEffect(() => {
    if (initialSearch !== query) {
      setQuery(initialSearch || "");
    }
  }, [initialSearch]);

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
    if (!trimmed) {
      // Clear search
      const params = new URLSearchParams(window.location.search);
      params.delete("search");
      const newUrl = params.toString() ? `/products?${params}` : "/products";
      router.push(newUrl);
      return;
    }
    setShowSuggestions(false);
    setQuery(trimmed);
    const params = new URLSearchParams(window.location.search);
    params.set("search", trimmed);
    router.push(`/products?${params.toString()}`);
  };

  const clearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    const params = new URLSearchParams(window.location.search);
    params.delete("search");
    const newUrl = params.toString() ? `/products?${params}` : "/products";
    router.push(newUrl);
  };

  return (
    <div ref={ref} className="relative mb-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: "var(--text-dim)" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => fetchSuggestions(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && doSearch(query)}
            placeholder="Search products by name or description..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-gold)",
              color: "var(--text-primary)",
            }}
          />
          {query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full"
              style={{ color: "var(--text-dim)" }}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {loading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="h-3 w-3 rounded-full border-2 animate-spin" style={{ borderColor: "var(--border-gold)", borderTopColor: "var(--accent-gold)" }} />
            </div>
          )}
        </div>
        <button
          onClick={() => doSearch(query)}
          className="btn-gold px-4 py-2.5 rounded-xl text-sm font-semibold"
        >
          Search
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          className="absolute top-full left-0 max-w-md w-full mt-1 rounded-xl overflow-hidden z-50 shadow-xl"
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
              className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors hover:bg-[var(--accent-glow)]"
            >
              <span className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{p.name}</span>
              <span className="text-xs font-semibold" style={{ color: "var(--accent-gold)" }}>
                {p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}
              </span>
            </button>
          ))}
          <button
            onClick={() => doSearch(query)}
            className="w-full px-4 py-2.5 text-center text-sm font-medium transition-colors"
            style={{
              color: "var(--accent-gold)",
              borderTop: "1px solid var(--border-gold)",
            }}
          >
            View all results →
          </button>
        </div>
      )}

      {/* Active search indicator */}
      {initialSearch && (
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>
          Showing results for "<strong style={{ color: "var(--text-primary)" }}>{initialSearch}</strong>"
          <button onClick={clearSearch} className="ml-2 text-xs underline hover:no-underline" style={{ color: "var(--accent-gold)" }}>
            Clear
          </button>
        </p>
      )}
    </div>
  );
}
