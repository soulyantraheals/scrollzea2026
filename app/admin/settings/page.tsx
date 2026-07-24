"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingFields = [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "site_description", label: "Site Description", type: "textarea" },
    { key: "business_email", label: "Business Email", type: "email" },
    { key: "business_location", label: "Business Location", type: "text" },
    { key: "facebook_url", label: "Facebook URL", type: "url" },
    { key: "instagram_url", label: "Instagram URL", type: "url" },
    { key: "whatsapp_number", label: "WhatsApp Number", type: "text" },
    { key: "default_advance_percentage", label: "Default Advance %", type: "number" },
    { key: "lead_notification_email", label: "Lead Notification Email", type: "email" },
    { key: "ai_chatbot_enabled", label: "AI Chatbot Enabled (1=yes, 0=no)", type: "number" },
    { key: "ai_welcome_message", label: "AI Welcome Message", type: "textarea" },
    { key: "auto_best_sellers_enabled", label: "Auto Best Sellers (1=yes, 0=no)", type: "number" },
    { key: "best_sellers_count", label: "Best Sellers Display Count", type: "number" },
    { key: "meta_title", label: "SEO Meta Title", type: "text" },
    { key: "meta_description", label: "SEO Meta Description", type: "textarea" },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Website Settings</h1>
        <Button onClick={saveAll} loading={saving}>
          {saved ? "Saved! ✅" : "Save All Settings"}
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-6">
        {settingFields.map((field) => (
          <div key={field.key}>
            {field.type === "textarea" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <textarea
                  value={settings[field.key] || ""}
                  onChange={(e) => updateSetting(field.key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <Input
                label={field.label}
                type={field.type}
                value={settings[field.key] || ""}
                onChange={(e) => updateSetting(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
