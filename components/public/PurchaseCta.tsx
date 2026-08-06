"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

interface PaymentOption {
  id: number;
  provider: string;
  paymentUrl: string | null;
  enabled: number;
}

interface PurchaseCtaProps {
  product: {
    id: number;
    name: string;
    productType: string;
    price: number;
    advancePercentage: number;
    deliveryMethod: string;
    downloadUrl: string | null;
    leadCaptureRequired: number;
    ctaText: string;
    whatsappMessage?: string | null;
    paymentOptions: PaymentOption[];
  };
  size?: "sm" | "lg";
  /** Hide the "or pay with" provider row (used in compact hero placement). */
  compact?: boolean;
}

const providerEvent: Record<string, string> = {
  RAZORPAY: "razorpay_click",
  PAYPAL: "paypal_click",
  WHATSAPP: "whatsapp_click",
};

const providerLabel: Record<string, string> = {
  RAZORPAY: "Pay with Razorpay",
  PAYPAL: "Pay with PayPal",
  WHATSAPP: "Chat on WhatsApp",
};

const providerColors: Record<string, { background: string; color: string }> = {
  RAZORPAY: { background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))", color: "#FFFFFF" },
  PAYPAL: { background: "linear-gradient(135deg, #0070BA, #1546A0)", color: "#FFFFFF" },
  WHATSAPP: { background: "linear-gradient(135deg, #25D366, #128C7E)", color: "#FFFFFF" },
};

function track(productId: number, productName: string, eventType: string, source = "website") {
  fetch("/api/track/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, productName, eventType, source }),
  }).catch(() => {});
}

export function PurchaseCta({ product, size = "lg", compact = false }: PurchaseCtaProps) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });

  const enabledPayments =
    product.paymentOptions?.filter((p) => p.enabled && p.paymentUrl) || [];
  const isFree = product.productType === "FREE" && product.price === 0;
  const ctaLabel = product.ctaText || "Get Instant Access Now";

  const btnBase: React.CSSProperties = {
    width: "100%",
    padding: size === "lg" ? "16px 24px" : "12px 20px",
    borderRadius: "14px",
    fontSize: size === "lg" ? "1.05rem" : "0.95rem",
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    border: "none",
    cursor: "pointer",
    transition: "transform .15s ease, box-shadow .15s ease",
    textDecoration: "none",
    color: "#FFFFFF",
  };

  // ---- FREE products: download flow ----
  if (isFree) {
    const handleDownload = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/api/products/download", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            productName: product.name,
            ...(product.leadCaptureRequired ? leadForm : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Something went wrong");
          return;
        }
        if (data.downloadUrl) {
          window.open(data.downloadUrl, "_blank");
        } else {
          setDownloadUrl(data.downloadUrl); // null → show thank-you state
        }
      } catch {
        setError("Failed to process download");
      } finally {
        setLoading(false);
      }
    };

    if (product.leadCaptureRequired && !downloadUrl && !loading) {
      return (
        <div className="space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleDownload();
            }}
            className="space-y-3"
          >
            <input
              type="text"
              placeholder="Your name *"
              value={leadForm.name}
              onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
            />
            <input
              type="email"
              placeholder="Your email *"
              value={leadForm.email}
              onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
            />
            <input
              type="tel"
              placeholder="Your phone / WhatsApp *"
              value={leadForm.phone}
              onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })}
              required
              className="w-full px-4 py-3 rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
            />
            {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {ctaLabel}
            </button>
          </form>
          <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
            Enter your details to get instant access.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {downloadUrl || !product.leadCaptureRequired ? (
          <button
            onClick={handleDownload}
            disabled={loading}
            style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {ctaLabel}
          </button>
        ) : (
          <div
            className="text-center py-4 px-4 rounded-xl text-sm"
            style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
          >
            ✅ Thank you! We&apos;ve received your details. We&apos;ll send your download link shortly.
          </div>
        )}
        {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
        {product.deliveryMethod === "manual" && !product.downloadUrl && (
          <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
            We&apos;ll deliver this free resource to you via WhatsApp / email.
          </p>
        )}
      </div>
    );
  }

  // ---- CUSTOM_QUOTE ----
  if (product.productType === "CUSTOM_QUOTE") {
    return (
      <a
        href="/contact"
        onClick={() => track(product.id, product.name, "whatsapp_click")}
        style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
      >
        Request a Quote
      </a>
    );
  }

  // ---- PREBOOK: advance calculator + CTA ----
  if (product.productType === "PREBOOK") {
    const pct = product.advancePercentage || 30;
    const advance = Math.round((product.price * pct) / 100);
    const primary = enabledPayments[0];
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Pre-book with <strong style={{ color: "var(--accent-gold)" }}>{pct}% advance</strong>
          </p>
          <p style={{ color: "var(--text-primary)" }}>
            Total: <strong>₹{product.price.toLocaleString("en-IN")}</strong> · Advance:{" "}
            <strong>₹{advance.toLocaleString("en-IN")}</strong>
          </p>
        </div>
        {primary ? (
          <a
            href={primary.paymentUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track(product.id, product.name, providerEvent[primary.provider] || "whatsapp_click")}
            style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
          >
            Pre-book Now — Pay Advance
          </a>
        ) : (
          <a
            href="/contact"
            style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
          >
            Pre-book Now
          </a>
        )}
      </div>
    );
  }

  // ---- PAID (READY_MADE) ----
  const primary = enabledPayments[0];
  if (!primary) {
    return (
      <a
        href="/contact"
        style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
      >
        Contact Us to Purchase
      </a>
    );
  }

  return (
    <div className="space-y-3">
      <a
        href={primary.paymentUrl || "#"}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => track(product.id, product.name, providerEvent[primary.provider] || "razorpay_click")}
        style={{ ...btnBase, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
      >
        {ctaLabel}
      </a>
      {enabledPayments.length > 1 && !compact && (
        <div className="pt-1">
          <p className="text-xs text-center mb-2" style={{ color: "var(--text-dim)" }}>
            or pay with:
          </p>
          <div className="grid grid-cols-1 gap-2">
            {enabledPayments.map((pm) => (
              <a
                key={pm.id}
                href={pm.paymentUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track(product.id, product.name, providerEvent[pm.provider] || "razorpay_click")}
                style={{
                  ...btnBase,
                  padding: "12px 20px",
                  fontSize: "0.9rem",
                  background: providerColors[pm.provider]?.background || "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
                }}
              >
                {providerLabel[pm.provider] || pm.provider}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
