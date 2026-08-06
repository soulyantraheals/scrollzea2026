"use client";

import { useState } from "react";
import { CountdownTimer } from "./CountdownTimer";
import { PurchaseCta } from "./PurchaseCta";

interface PaymentOption {
  id: number;
  provider: string;
  paymentUrl: string | null;
  enabled: number;
}

interface OfferSectionProps {
  product: {
    id: number;
    name: string;
    productType: string;
    price: number;
    discountPrice: number | null;
    advancePercentage: number;
    deliveryMethod: string;
    downloadUrl: string | null;
    leadCaptureRequired: number;
    ctaText: string;
    whatsappMessage?: string | null;
    showLimitedOffer: number;
    offerLabel: string;
    paymentDescription: string;
    socialProofText: string;
    currency: string;
    urgencyEnabled: number;
    showFireSymbol: number;
    urgencyText: string;
    expiresAt: string | null;
    paymentOptions: PaymentOption[];
  };
}

function moneySymbol(currency: string) {
  if (!currency) return "₹";
  const c = currency.toUpperCase();
  if (c === "USD" || c === "US" || c === "DOLLAR") return "$";
  if (c === "EUR") return "€";
  if (c === "GBP") return "£";
  return "₹";
}

function formatMoney(value: number, currency: string) {
  const sym = moneySymbol(currency);
  if (sym === "₹") return `₹${value.toLocaleString("en-IN")}`;
  return `${sym}${value.toLocaleString("en-US")}`;
}

export function OfferSection({ product }: OfferSectionProps) {
  const [expired, setExpired] = useState(false);

  const showCountdown =
    product.urgencyEnabled === 1 && !!product.expiresAt;
  const isFree = product.productType === "FREE" && product.price === 0;
  const label =
    product.showLimitedOffer === 1
      ? expired
        ? "Offer Ended"
        : product.offerLabel || "Limited Time Offer"
      : null;

  return (
    <section className="relative overflow-hidden py-16 lg:py-20" style={{ backgroundColor: "var(--bg-secondary)" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ backgroundColor: "var(--accent-gold)", opacity: 0.06 }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div
          className="rounded-3xl p-8 sm:p-10 text-center"
          style={{
            backgroundColor: "var(--bg-card)",
            border: "2px solid var(--border-gold-hover)",
            boxShadow: "0 0 60px var(--accent-glow)",
          }}
        >
          {/* Offer label */}
          {label && (
            <p
              className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6"
              style={{
                backgroundColor: expired ? "var(--bg-primary)" : "var(--accent-glow)",
                border: "1px solid var(--border-gold-hover)",
                color: expired ? "var(--text-muted)" : "var(--accent-gold)",
              }}
            >
              {label}
            </p>
          )}

          {/* Price */}
          {product.productType === "CUSTOM_QUOTE" ? (
            <p className="text-4xl sm:text-5xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Custom Quote
            </p>
          ) : isFree ? (
            <p className="text-5xl sm:text-6xl font-extrabold" style={{ color: "var(--accent-gold)" }}>
              FREE
            </p>
          ) : (
            <div className="flex items-end justify-center gap-4">
              <span className="text-5xl sm:text-6xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                {formatMoney(product.price, product.currency)}
              </span>
              {product.discountPrice && product.discountPrice > product.price && (
                <span className="text-2xl sm:text-3xl line-through mb-1" style={{ color: "var(--text-dim)" }}>
                  {formatMoney(product.discountPrice, product.currency)}
                </span>
              )}
            </div>
          )}

          {/* Payment description */}
          {product.paymentDescription && (
            <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
              {product.paymentDescription}
            </p>
          )}

          {/* Countdown */}
          {showCountdown && !isFree && (
            <div className="mt-8">
              <CountdownTimer
                expiresAt={product.expiresAt!}
                urgencyText={product.urgencyText || "Hurry! Offer Ends In"}
                showFireSymbol={product.showFireSymbol === 1}
                onExpired={() => setExpired(true)}
              />
            </div>
          )}

          {/* CTA */}
          <div className="mt-8 max-w-sm mx-auto">
            <PurchaseCta product={product} size="lg" />
          </div>

          {/* Social proof */}
          {product.socialProofText && (
            <p className="mt-5 text-sm font-medium flex items-center justify-center gap-2" style={{ color: "var(--accent-gold)" }}>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              {product.socialProofText}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
