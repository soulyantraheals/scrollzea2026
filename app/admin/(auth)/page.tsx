"use client";

import { useEffect, useRef } from "react";

export default function AdminLoginPage() {
  const csrfRef = useRef("");
  const formRef = useRef<HTMLFormElement>(null);
  const csrfInputRef = useRef<HTMLInputElement>(null);

  // Fetch CSRF token on page load (this also sets the CSRF cookie)
  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        csrfRef.current = data.csrfToken;
        if (csrfInputRef.current) {
          csrfInputRef.current.value = data.csrfToken;
        }
      })
      .catch(() => {});
  }, []);

  // Show error from URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const err = params.get("error");
    if (err === "CredentialsSignin") {
      alert("Invalid email or password");
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

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
          <form
            ref={formRef}
            action="/api/auth/callback/credentials"
            method="POST"
            className="space-y-4"
          >
            <input ref={csrfInputRef} type="hidden" name="csrfToken" value="" />
            <input type="hidden" name="callbackUrl" value="/admin/dashboard" />
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#B8C2BE" }}>Email</label>
              <input
                type="email"
                name="email"
                placeholder="admin@scrollzea.com"
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
              className="w-full py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-all"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #F4D06F)",
                color: "#071B14",
              }}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-xs text-center" style={{ color: "#6B7B76" }}>
            Use: admin@scrollzea.com / scrollzeaAdmin2024!
          </div>
        </div>
      </div>
    </div>
  );
}
