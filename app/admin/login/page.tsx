"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Show error from URL params (e.g. ?error=CredentialsSignin)
  const urlError = typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("error")
    : null;

  // On mount, show errors from redirect params and clean URL
  if (urlError && typeof window !== "undefined" && !error && !loading) {
    const msg = urlError === "CredentialsSignin"
      ? "Invalid email or password"
      : urlError === "MissingCSRF"
      ? "Session expired. Please try again."
      : "Login failed. Please check your credentials.";
    setError(msg);
    window.history.replaceState({}, "", "/admin/login");
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Get CSRF token first via fetch (handles cookie too)
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        const csrfToken = data.csrfToken;
        // Build and submit a native form with CSRF token
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/callback/credentials";
        form.style.display = "none";

        const addField = (name: string, value: string) => {
          const i = document.createElement("input");
          i.type = "hidden";
          i.name = name;
          i.value = value;
          form.appendChild(i);
        };

        addField("csrfToken", csrfToken);
        addField("email", email);
        addField("password", password);
        addField("callbackUrl", "/admin");

        document.body.appendChild(form);
        form.submit();
      })
      .catch(() => {
        setError("Could not connect to server. Please try again.");
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">Scrollzea Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your store</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="srollzea@gmail.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
