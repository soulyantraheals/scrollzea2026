"use client";

import { useState, useEffect, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Show error from URL param
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "CredentialsSignin") {
      setError("Invalid email or password");
    } else if (err === "MissingCSRF") {
      setError("Session expired. Please try again.");
    }
    // Clean error from URL
    if (err) {
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/admin/dashboard",
      });

      if (result?.ok && !result?.error) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Connection error. Please check your network and try again.");
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
                autoComplete="email"
                inputMode="email"
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
                autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: "#071B14", border: "1px solid rgba(212,175,55,0.2)", color: "#FFFFFF" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
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
