"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const purposes = [
  "Ready-Made App", "Mobile App", "Desktop Application", "Website Development",
  "Logo Design", "Branding & Design", "PDF / E-book", "Stories",
  "Wallpapers", "Freebies", "Custom Digital Product", "General Enquiry",
  "Partnership", "Other",
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    purpose: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact_page" }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "", purpose: "", message: "" });
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Failed to submit form. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Contact Scrollzea</h1>
        <p className="text-gray-600 mt-2">
          Have a question or want to discuss a project? Send us a message.
        </p>
      </div>

      {success ? (
        <div className="p-8 bg-emerald-50 rounded-2xl text-center">
          <p className="text-2xl mb-2">✅</p>
          <h2 className="text-xl font-semibold text-emerald-800">Thank You!</h2>
          <p className="text-emerald-600 mt-2">
            We've received your message and will get back to you soon.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setSuccess(false)}>
            Send Another Message
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <Input
            label="Full Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder="Your name"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email *"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="your@email.com"
            />
            <Input
              label="Mobile Number *"
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
              placeholder="+91 98765 43210"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Purpose / Category
            </label>
            <select
              value={form.purpose}
              onChange={(e) => setForm({ ...form, purpose: e.target.value })}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select a purpose</option>
              {purposes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Message
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tell us about your project or enquiry..."
            />
          </div>
          <Button type="submit" loading={loading} size="lg">
            Send Message
          </Button>
        </form>
      )}

      <div className="mt-12 p-6 bg-gray-50 rounded-xl">
        <h2 className="font-semibold text-gray-900 mb-3">Other Ways to Reach Us</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p>📧 srollzea@gmail.com</p>
          <p>📍 Kolkata, West Bengal, India</p>
          <p>
            <a href="https://www.facebook.com/scrollzea" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Facebook</a>
            {' | '}
            <a href="https://www.instagram.com/scrollzea/" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">Instagram</a>
          </p>
        </div>
      </div>
    </div>
  );
}
