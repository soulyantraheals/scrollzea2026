"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, Search, Moon, Sun } from "lucide-react";

export function Header() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Track scroll for transparent→solid navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme toggle — light mode by default
  useEffect(() => {
    const stored = localStorage.getItem("scrollzea-theme");
    if (stored === "dark") {
      setDarkMode(true);
    } else {
      setDarkMode(false);
      document.documentElement.classList.add("light-theme");
    }
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        if (!searchQuery) setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchQuery]);

  const doSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSearchOpen(false);
    setSearchQuery("");
    setMobileOpen(false);
    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("scrollzea-theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("light-theme", !next);
  };

  const navLinks = [
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
    { href: "/freebies", label: "Freebies" },
    { href: "/services", label: "Custom Work" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[var(--bg-primary)]/90 backdrop-blur-xl border-b border-[var(--border-gold)] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo + Brand */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <img
              src="/logo.jpg"
              alt="Scrollzea"
              className="h-8 lg:h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="text-lg font-bold text-[var(--text-primary)] hidden sm:inline">Scrollzea</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors duration-200 rounded-lg hover:bg-[var(--accent-glow)]"
              >
                {link.label}
              </Link>
            ))}

            {/* Desktop Search */}
            <div ref={searchContainerRef} className="relative ml-2">
              {searchOpen ? (
                <div className="flex items-center gap-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch(searchQuery)}
                    placeholder="Search products..."
                    className="w-48 lg:w-56 px-3 py-2 rounded-lg text-sm outline-none transition-all"
                    style={{
                      backgroundColor: "var(--bg-card)",
                      border: "1px solid var(--border-gold)",
                      color: "var(--text-primary)",
                    }}
                  />
                  <button
                    onClick={() => doSearch(searchQuery)}
                    className="p-2 rounded-lg text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] transition-all"
                    aria-label="Search"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2.5 rounded-lg border border-[var(--border-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] transition-all duration-200"
                  aria-label="Open search"
                >
                  <Search className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Contact Us */}
            <Link
              href="/contact"
              className="btn-gold ml-2 inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold"
            >
              Contact Us
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="ml-2 p-2.5 rounded-lg border border-[var(--border-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </nav>

          {/* Mobile: Search + Menu */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setSearchOpen(!searchOpen);
                setTimeout(() => searchInputRef.current?.focus(), 100);
              }}
              className="p-2 rounded-lg border border-[var(--border-gold)] text-[var(--accent-gold)]"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--accent-gold)]"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile: Inline Search Bar (when search is open) */}
        {searchOpen && (
          <div className="md:hidden pb-3">
            <div className="flex items-center gap-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && doSearch(searchQuery)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-gold)",
                  color: "var(--text-primary)",
                }}
              />
              <button
                onClick={() => doSearch(searchQuery)}
                className="btn-gold px-4 py-2.5 rounded-lg text-sm font-semibold"
              >
                Search
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border-gold)] bg-[var(--bg-primary)]/95 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-3 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] rounded-lg transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex items-center gap-2">
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="btn-gold flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold"
              >
                Contact Us
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-lg border border-[var(--border-gold)] text-[var(--accent-gold)]"
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
