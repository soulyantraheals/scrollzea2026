"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CustomerRegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-900">Create Account</h1>
        <p className="text-gray-500 text-center mt-2 text-sm">Save favorites and track orders.</p>
        <div className="mt-8 bg-white rounded-xl border border-gray-100 p-8">
          <div className="space-y-4">
            <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
            <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" />
            <Button className="w-full">Create Account</Button>
          </div>
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-600 hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
