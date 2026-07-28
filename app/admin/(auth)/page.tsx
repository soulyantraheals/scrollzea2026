"use client";

import { useState, FormEvent, useEffect } from "react";
import { signIn } from "next-auth/react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Check URL for error param (redirected back after failed auth)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get("error");
    if (urlError === "CredentialsSignin") {
      setError("Invalid email or password");
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Full page redirect — NextAuth handles cookies natively
    signIn("credentials", {
      email: email.trim(),
      password,
      callbackUrl: "/admin/dashboard",
    });
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
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#EF4444" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#B8C2BE" }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                className="w-full px-4 py-2.5 rounded-lg text-sm"
                style={{ backgroundColor: "#071B14", border: "1px solid rgba(212,175,55,0.2)", color: "#FFFFFF" }}
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #D4AF37, #F4D06F)",
                color: "#071B14",
              }}
            >
              Sign In
            </button>
          </form>

          <div className="mt-6 text-xs text-center" style={{ color: "#6B7B76" }}>
            <p>admin@scrollzea.com / scrollzeaAdmin2024!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
