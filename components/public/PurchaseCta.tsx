"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface PaymentOption {
  id: number;
  provider: string;
  label: string | null;
  icon: string | null;
  paymentUrl: string | null;
  enabled: number;
  sortOrder?: number;
}

interface PurchaseCtaProps {
  product: {
    id: number;
    slug: string;
    name: string;
    productType: string;
    price: number;
    advancePercentage: number;
    deliveryMethod: string;
    downloadUrl: string | null;
    leadCaptureRequired: number;
    ctaText: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    whatsappMessage?: string | null;
    paymentOptions: PaymentOption[];
  };
  size?: "sm" | "lg";
  compact?: boolean;
}

const typeDefaultCta: Record<string, string> = {
  FREE: "Get Instant Access Now",
  READY_MADE: "Buy Now",
  PREBOOK: "Pre-book Now — Pay Advance",
  CUSTOM_QUOTE: "Request a Quote",
};

const btnBase: React.CSSProperties = {
  width: "100%",
  padding: "16px 24px",
  borderRadius: "14px",
  fontSize: "1.05rem",
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

function track(productId: number, productName: string, eventType: string, source = "website") {
  fetch("/api/track/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, productName, eventType, source }),
  }).catch(() => {});
}

export function PurchaseCta({ product, size = "lg", compact = false }: PurchaseCtaProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const [submitted, setSubmitted] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const enabledPayments =
    (product.paymentOptions || [])
      .filter((p) => p.enabled && p.paymentUrl)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const isFree = product.productType === "FREE" && product.price === 0;
  const ctaLabel = product.ctaText || typeDefaultCta[product.productType] || "Buy Now";
  const secondaryLabel = product.secondaryCtaText || "Contact Us";
  const secondaryUrl = product.secondaryCtaUrl || "/contact";
  const isDownloadable =
    !!product.downloadUrl || product.deliveryMethod === "download" || product.deliveryMethod === "external_link";
  const pad = size === "lg" ? "16px 24px" : "12px 20px";
  const fontSize = size === "lg" ? "1.05rem" : "0.95rem";
  // All FREE CTAs are green; paid / PREBOOK / CUSTOM_QUOTE stay gold.
  const ctaGradient = isFree
    ? "linear-gradient(135deg, #22C55E, #16A34A)"
    : "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))";

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    setSelectedProvider(null);
    try {
      const res = await fetch("/api/products/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          ...leadForm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      setSubmitted(true);
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        setDownloadUrl(data.downloadUrl);
      } else {
        setDownloadUrl(null); // manual delivery → thank-you state
      }
    } catch {
      setError("Failed to process download");
    } finally {
      setLoading(false);
    }
  };

  const chooseProvider = (pm: PaymentOption) => {
    if (!pm.paymentUrl) return;
    window.open(pm.paymentUrl, "_blank", "noopener,noreferrer");
    track(product.id, product.name, "payment_click", pm.label || pm.provider);
    setSelectedProvider(pm.label || pm.provider);
    setOpen(false);
  };

  // FREE downloads always go through the lead form first
  const freeDownloadAction = () => {
    setShowLeadForm(true);
    setOpen(false);
  };

  // Dropdown trigger (used when providers exist and the main action is the menu)
  const dropdownTrigger = (showChevron: boolean) => (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      style={{ ...btnBase, padding: pad, fontSize, background: ctaGradient }}
    >
      {ctaLabel}
      {showChevron && <ChevronDown className="h-4 w-4" style={{ opacity: 0.8 }} />}
    </button>
  );

  const providerMenu = () => (
    <div ref={menuRef} className="relative">
      {dropdownTrigger(true)}
      {open && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)", boxShadow: "0 10px 40px rgba(0,0,0,0.35)" }}
        >
          {enabledPayments.map((pm) => (
            <button
              key={pm.id ?? pm.provider}
              type="button"
              onClick={() => chooseProvider(pm)}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:opacity-90"
              style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-gold)" }}
            >
              <span style={{ fontSize: "1.1rem" }}>{pm.icon || "🔗"}</span>
              <span className="font-medium">{pm.label || pm.provider}</span>
            </button>
          ))}
          {isFree && isDownloadable && (
            <button
              type="button"
              onClick={freeDownloadAction}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:opacity-90"
              style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-gold)" }}
            >
              <span style={{ fontSize: "1.1rem" }}>⬇️</span>
              <span className="font-medium">Download now</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const confirmCard = selectedProvider && (
    <div
      className="rounded-xl p-4 text-sm space-y-2"
      style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
    >
      <p>
        <strong style={{ color: "var(--accent-gold)" }}>{selectedProvider}</strong> opened in a new tab. Complete the payment there, then confirm back here.
      </p>
      <a href={`/products/${product.slug}/success?provider=${encodeURIComponent(selectedProvider)}`} className="block font-semibold" style={{ color: "var(--accent-gold)" }}>
        I&apos;ve completed my payment — confirm →
      </a>
    </div>
  );

  const secondaryButton = (
    <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: "12px 20px", fontSize: "0.9rem", background: "var(--bg-card)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}>
      {secondaryLabel}
    </a>
  );

  // ---- FREE ----
  if (isFree) {
    const freeForm = (
      <form onSubmit={(e) => { e.preventDefault(); handleDownload(); }} className="space-y-3">
        <input type="text" placeholder="Your name *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
        <input type="email" placeholder="Your email *" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
        <input type="tel" placeholder="Your phone / WhatsApp *" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
        {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
        <button type="submit" disabled={loading} style={{ ...btnBase, padding: pad, fontSize, background: ctaGradient }}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
          {ctaLabel}
        </button>
      </form>
    );

    const freeSuccess = (
      <div
        className="text-center py-4 px-4 rounded-xl text-sm space-y-2"
        style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
      >
        {downloadUrl ? (
          <>
            <p>✅ Thank you! Your download is ready.</p>
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="block font-semibold" style={{ color: "#22C55E" }}>
              ⬇️ Download now
            </a>
          </>
        ) : (
          <p>✅ Thank you! We&apos;ve received your details. We&apos;ll send your download link shortly.</p>
        )}
        <a href={`/products/${product.slug}/success?provider=download`} className="block font-semibold" style={{ color: "var(--accent-gold)" }}>
          View confirmation →
        </a>
      </div>
    );

    // After a successful submit, show the download / thank-you state
    if (submitted) {
      return (
        <div className="space-y-3">
          {freeSuccess}
          {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
          {secondaryButton}
        </div>
      );
    }

    // FREE with providers → green dropdown; "Download now" opens the form first
    if (enabledPayments.length > 0) {
      if (showLeadForm) {
        return (
          <div className="space-y-3">
            {freeForm}
            {secondaryButton}
          </div>
        );
      }
      return (
        <div className="space-y-3">
          {providerMenu()}
          {confirmCard}
          {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
          {secondaryButton}
        </div>
      );
    }

    // FREE without providers → form always shows before download
    return (
      <div className="space-y-3">
        {freeForm}
        {product.deliveryMethod === "manual" && !product.downloadUrl && (
          <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
            We&apos;ll deliver this free resource to you via WhatsApp / email.
          </p>
        )}
        {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
        {secondaryButton}
      </div>
    );
  }

  // ---- PREBOOK: advance calculator + CTA ----
  if (product.productType === "PREBOOK") {
    const pct = product.advancePercentage || 30;
    const advance = Math.round((product.price * pct) / 100);
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Pre-book with <strong style={{ color: "var(--accent-gold)" }}>{pct}% advance</strong>
          </p>
          <p style={{ color: "var(--text-primary)" }}>
            Total: <strong>₹{product.price.toLocaleString("en-IN")}</strong> · Advance: <strong>₹{advance.toLocaleString("en-IN")}</strong>
          </p>
        </div>
        {enabledPayments.length > 0 ? providerMenu() : (
          <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
            {ctaLabel}
          </a>
        )}
        {confirmCard}
        {secondaryButton}
      </div>
    );
  }

  // ---- CUSTOM_QUOTE ----
  if (product.productType === "CUSTOM_QUOTE") {
    return (
      <div className="space-y-3">
        {enabledPayments.length > 0 ? providerMenu() : (
          <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
            {ctaLabel}
          </a>
        )}
        {confirmCard}
        {secondaryButton}
      </div>
    );
  }

  // ---- PAID (READY_MADE) ----
  return (
    <div className="space-y-3">
      {enabledPayments.length > 0 ? providerMenu() : (
        <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
          {ctaLabel}
        </a>
      )}
      {confirmCard}
      {secondaryButton}
    </div>
  );
}
