"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface PaymentOption {
  label: string;
  icon: string;
  paymentUrl: string;
  enabled: boolean;
}

interface PaymentOptionsEditorProps {
  options: PaymentOption[];
  onChange: (options: PaymentOption[]) => void;
  /** Product slug, used to build the copyable success-page URL. */
  slug: string;
}

export function humanizeProvider(provider: string): string {
  const map: Record<string, string> = {
    RAZORPAY: "Razorpay",
    PAYPAL: "PayPal",
    WHATSAPP: "WhatsApp",
    GUMROAD: "Gumroad",
    SUPER_PROFILE: "Super Profile",
  };
  if (map[provider]) return map[provider];
  return provider.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function providerDefaultIcon(provider: string): string {
  const map: Record<string, string> = {
    RAZORPAY: "💳",
    PAYPAL: "🅿️",
    WHATSAPP: "💬",
    GUMROAD: "🛍️",
    SUPER_PROFILE: "✨",
  };
  return map[provider] || "🔗";
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-gold)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  padding: "9px 14px",
  width: "100%",
  fontSize: "0.85rem",
  outline: "none",
};
const fieldLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.78rem",
  fontWeight: 500,
  marginBottom: "5px",
  display: "block",
};

export function PaymentOptionsEditor({ options, onChange, slug }: PaymentOptionsEditorProps) {
  const [copied, setCopied] = useState(false);

  const successUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/products/${slug}/success`;

  const copySuccessUrl = () => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(successUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => setCopied(false));
  };

  const addOption = () => onChange([...options, { label: "", icon: "🔗", paymentUrl: "", enabled: true }]);
  const updateOption = (index: number, field: keyof PaymentOption, value: any) =>
    onChange(options.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  const removeOption = (index: number) => onChange(options.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...options];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Add any provider (Gumroad, Razorpay, PayPal, Super Profile, …). Customers pick one from the button dropdown.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4" /> Add Provider
        </Button>
      </div>

      {options.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--text-dim)" }}>
          No providers yet. Click "Add Provider" to add one.
        </p>
      ) : (
        options.map((opt, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-gold)",
              opacity: opt.enabled ? 1 : 0.55,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" style={{ color: "var(--text-muted)" }} aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === options.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" style={{ color: "var(--text-muted)" }} aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>#{i + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opt.enabled}
                    onChange={(e) => updateOption(i, "enabled", e.target.checked)}
                    className="rounded w-4 h-4"
                    style={{ accentColor: "var(--accent-gold)" }}
                  />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Enabled</span>
                </label>
                <button type="button" onClick={() => removeOption(i)} className="p-1.5 rounded hover:bg-red-50" style={{ color: "#EF4444" }} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: "1 1 20%" }}>
                <label style={fieldLabelStyle}>Icon (emoji)</label>
                <input type="text" value={opt.icon} onChange={(e) => updateOption(i, "icon", e.target.value)} placeholder="🛍️" style={inputBaseStyle} />
              </div>
              <div style={{ flex: "1 1 30%" }}>
                <label style={fieldLabelStyle}>Name</label>
                <input type="text" value={opt.label} onChange={(e) => updateOption(i, "label", e.target.value)} placeholder="Gumroad" required style={inputBaseStyle} />
              </div>
              <div style={{ flex: "1 1 40%" }}>
                <label style={fieldLabelStyle}>Link (URL)</label>
                <input type="text" value={opt.paymentUrl} onChange={(e) => updateOption(i, "paymentUrl", e.target.value)} placeholder="https://gumroad.com/l/..." required style={inputBaseStyle} />
              </div>
            </div>
          </div>
        ))
      )}

      <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid var(--border-gold)" }}>
        <p className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
          To bring customers back after paying, paste this success-page URL into each provider&apos;s dashboard (Gumroad → success URL, Razorpay → redirect, etc.).
        </p>
        <Button type="button" variant="outline" size="sm" onClick={copySuccessUrl}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy success page URL"}
        </Button>
      </div>
    </div>
  );
}
