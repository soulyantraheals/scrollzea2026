"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const csrfFetched = useRef(false);

  // Fetch CSRF token on page load
  useEffect(() => {
    if (csrfFetched.current) return;
    csrfFetched.current = true;

    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        setCsrfToken(data.csrfToken);
      })
      .catch(() => {});
  }, []);

  // Show error from URL param
  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "CredentialsSignin") {
      setError("Invalid email or password");
    } else if (err === "MissingCSRF") {
      setError("Session expired. Please try again.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!csrfToken) {
      setError("Still loading... please try again.");
      return;
    }

    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const res = await fetch("/api/auth/callback/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          csrfToken,
          callbackUrl: "/admin/dashboard",
          email: formData.get("email") as string,
          password: formData.get("password") as string,
        }),
      });

      if (res.ok) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        // Check if redirected to login page with error
        const text = await res.text();
        if (text.includes("CredentialsSignin") || text.includes("error")) {
          setError("Invalid email or password");
        } else {
          setError("Login failed. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#071B14" }}>
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="Scrollzea" className="h-14 w-auto mx-auto mb-4" />
          <h1 className="text-2xl font-bold" style={{ color: "#D4AF37" }}>Admin Panel</h1>
          <p className="text-sm mt-1" style={{ color: "#B8C2BE" }}>Sign in to manage your store</p>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ backgroundColor: "#0D241D", border: "1px solid rgba(212,175,55,0.15)" }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg text-sm text-center" style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#B8C2BE" }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="srollzea@gmail.com"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: "#071B14", border: "1px solid rgba(212,175,55,0.2)", color: "#FFFFFF" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#B8C2BE" }}>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: "#071B14", border: "1px solid rgba(212,175,55,0.2)", color: "#FFFFFF" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !csrfToken}
              className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #F4D06F)",
                color: "#071B14",
              }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-xs text-center" style={{ color: "#6B7B76" }}>
            Use: srollzea@gmail.com / scrollzeaAdmin2024!
          </div>
        </div>
      </div>
    </div>
  );
}
