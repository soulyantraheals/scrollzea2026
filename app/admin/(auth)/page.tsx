"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Check if already authenticated — redirect to dashboard
  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((session) => {
        if (session?.user) {
          router.replace("/admin/dashboard");
        }
      })
      .catch(() => {});
  }, [router]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Step 1: Get CSRF token — this also sets the CSRF cookie in the browser
    fetch("/api/auth/csrf")
      .then((r) => r.json())
      .then((data) => {
        // Step 2: Submit a native HTML form with the CSRF token
        // Native form submission includes cookies automatically
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "/api/auth/callback/credentials";
        form.style.display = "none";

        const addField = (name: string, value: string) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = name;
          input.value = value;
          form.appendChild(input);
        };

        addField("csrfToken", data.csrfToken);
        addField("email", email.trim());
        addField("password", password);
        addField("callbackUrl", "/admin/dashboard");

        document.body.appendChild(form);
        form.submit();
        // On success, browser redirects to /admin/dashboard
        // On failure, browser redirects to /admin?error=CredentialsSignin
      })
      .catch(() => {
        setError("Could not connect to server. Please try again.");
        setLoading(false);
      });
  };

  // Show URL error param (redirected back after failed login)
  useEffect(() => {
    const urlError = new URLSearchParams(window.location.search).get("error");
    if (urlError) {
      if (urlError === "CredentialsSignin") {
        setError("Invalid email or password");
      } else {
        setError("Login failed: " + urlError);
      }
      // Clean URL
      window.history.replaceState({}, "", "/admin");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-indigo-600">Scrollzea</h1>
          <p className="text-gray-500 mt-2">Admin Sign In</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="srollzea@gmail.com"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
