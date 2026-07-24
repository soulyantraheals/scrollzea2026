"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Sign In</h1>
        <p className="text-gray-500 text-center mt-2 text-sm">Sign in to access your account and favorites.</p>
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-8">
          <div className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
            <Button className="w-full">Sign In</Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-indigo-600 hover:underline">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
