export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  paymentOptions,
  productFeatures,
  faqs,
  productReviews,
  productPerfectFor,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { ProductGallery } from "@/components/public/ProductGallery";
import { YouTubeEmbed } from "@/components/public/YouTubeEmbed";
import { OfferSection } from "@/components/public/OfferSection";
import { PurchaseCta } from "@/components/public/PurchaseCta";
import { formatMoney } from "@/lib/money";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .get();
  if (!product || product.status !== "published") return null;

  const [images, payments, features, productFaqs, reviews, perfectFor] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder).all(),
    db.select().from(paymentOptions).where(eq(paymentOptions.productId, product.id)).all(),
    db.select().from(productFeatures).where(eq(productFeatures.productId, product.id)).orderBy(productFeatures.sortOrder).all(),
    db.select().from(faqs).where(eq(faqs.productId, product.id)).orderBy(faqs.sortOrder).all(),
    db.select().from(productReviews).where(eq(productReviews.productId, product.id)).orderBy(productReviews.sortOrder).all(),
    db.select().from(productPerfectFor).where(eq(productPerfectFor.productId, product.id)).orderBy(productPerfectFor.sortOrder).all(),
  ]);

  return { ...product, images, paymentOptions: payments, features, faqs: productFaqs, reviews, perfectFor };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: product.seoTitle || `${product.name} — Scrollzea`,
    description: product.seoDescription || product.shortDescription || "",
  };
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" style={{ color: "var(--accent-gold)" }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className="h-4 w-4" fill={rating >= s ? "currentColor" : "none"} viewBox="0 0 20 20" stroke="currentColor" strokeWidth={1}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="glass-card group open:border-[var(--border-gold-hover)]">
      <summary className="flex justify-between items-center cursor-pointer py-5 px-6 list-none">
        <span className="font-medium text-sm pr-4" style={{ color: "var(--text-primary)" }}>{q}</span>
        <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--accent-gold)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-6 pb-5 border-t" style={{ borderColor: "var(--border-gold)" }}>
        <p className="text-sm pt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>{a}</p>
      </div>
    </details>
  );
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const isFree = product.productType === "FREE" && product.price === 0;
  const enabledFeatures = product.features?.filter((f: any) => f.enabled !== 0) || [];
  const enabledFaqs = product.faqs?.filter((f: any) => f.enabled !== 0) || [];
  const enabledReviews = product.reviews?.filter((r: any) => r.enabled !== 0) || [];
  const enabledPerfectFor = product.perfectFor?.filter((p: any) => p.enabled !== 0) || [];

  const reviewCount = enabledReviews.length;
  const avgRating =
    reviewCount > 0
      ? enabledReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / reviewCount
      : 0;

  const hasDiscount = !!product.discountPrice && product.discountPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.discountPrice! - product.price) / product.discountPrice!) * 100)
    : 0;

  const purchaseProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productType: product.productType,
    price: product.price,
    advancePercentage: product.advancePercentage,
    deliveryMethod: product.deliveryMethod,
    downloadUrl: product.downloadUrl,
    leadCaptureRequired: product.leadCaptureRequired,
    ctaText: product.ctaText,
    secondaryCtaText: product.secondaryCtaText,
    secondaryCtaUrl: product.secondaryCtaUrl || "",
    whatsappMessage: product.whatsappMessage,
    paymentOptions: product.paymentOptions || [],
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Back link */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-80"
          style={{ color: "var(--text-muted)" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to All Products
        </Link>

        {/* ═══════════ 1. HERO ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Image */}
          <ProductGallery images={product.images || []} alt={product.name} />

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {isFree && <Badge variant="free">FREE</Badge>}
              {product.productType === "PREBOOK" && <Badge variant="prebook">Pre-book</Badge>}
              {product.productType === "CUSTOM_QUOTE" && <Badge variant="prebook">Custom</Badge>}
              {product.bestSeller ? <Badge variant="best-seller">🏆 Best Seller</Badge> : null}
              {product.featured ? <Badge variant="featured">Featured</Badge> : null}
              {hasDiscount && (
                <span
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444" }}
                >
                  -{discountPercent}% OFF
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight" style={{ color: "var(--text-primary)" }}>
              {product.name}
            </h1>

            {product.shortDescription && (
              <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {product.shortDescription}
              </p>
            )}

            {/* Rating summary (from real reviews) */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-3 mt-5">
                <StarRow rating={Math.round(avgRating)} />
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                  <strong style={{ color: "var(--text-primary)" }}>{avgRating.toFixed(1)}</strong> out of 5 · Based on {reviewCount}{" "}
                  {reviewCount === 1 ? "review" : "reviews"}
                </span>
              </div>
            )}

            {/* Compact purchase box (existing purchase area) */}
            <div
              className="mt-6 p-6 rounded-2xl"
              style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-gold)" }}
            >
              {isFree ? (
                <p className="text-2xl font-bold mb-3" style={{ color: "var(--accent-gold)" }}>FREE</p>
              ) : (
                <div className="flex items-baseline gap-3 mb-3">
                  <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {formatMoney(product.price, product.currency)}
                  </p>
                  {hasDiscount && (
                    <p className="text-lg line-through" style={{ color: "var(--text-dim)" }}>
                      {formatMoney(product.discountPrice!, product.currency)}
                    </p>
                  )}
                </div>
              )}

              <PurchaseCta product={purchaseProduct} size="lg" compact />
            </div>

            {/* Quick trust chips */}
            <div className="flex flex-wrap gap-3 mt-6 text-xs" style={{ color: "var(--text-dim)" }}>
              {["⚡ Instant Access", "🔒 Secure Payment", "✅ Lifetime Updates", "💬 WhatsApp Support"].map((chip) => (
                <span
                  key={chip}
                  className="px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ 2. PRODUCT DETAILS / CONTENT ═══════════ */}
        {(product.description || enabledFeatures.length > 0) && (
          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {product.description && (
                <div>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    About This Product
                  </h2>
                  <div className="leading-relaxed whitespace-pre-line text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
                    {product.description}
                  </div>
                </div>
              )}
              {enabledFeatures.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
                    ✅ Everything You Need
                  </h2>
                  <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
                    All this ships with your purchase — instantly.
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {enabledFeatures.map((f: any) => (
                      <li
                        key={f.id}
                        className="flex items-start gap-2.5 text-sm rounded-xl p-3"
                        style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
                      >
                        <span className="mt-0.5 shrink-0" style={{ color: "var(--accent-gold)" }}>✓</span>
                        <span style={{ color: "var(--text-primary)" }}>{f.feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ 3. WATCH YOUTUBE VIDEO ═══════════ */}
        {product.youtubeEnabled === 1 && product.youtubeUrl && (
          <div className="mt-14">
            <div className="max-w-2xl">
              <YouTubeEmbed
                url={product.youtubeUrl}
                buttonText={product.youtubeButtonText || "Watch YouTube Video"}
                title={product.youtubeVideoTitle || undefined}
              />
            </div>
          </div>
        )}

        {/* ═══════════ 4. FAQ ═══════════ */}
        {enabledFaqs.length > 0 && (
          <div className="mt-16 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {enabledFaqs.map((faq: any) => (
                <FaqItem key={faq.id} q={faq.question} a={faq.answer} />
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ 5. LIMITED TIME OFFER / PRICING ═══════════ */}
        <div className="mt-16">
          <OfferSection
            product={{
              ...purchaseProduct,
              discountPrice: product.discountPrice,
              showLimitedOffer: product.showLimitedOffer,
              offerLabel: product.offerLabel,
              paymentDescription: product.paymentDescription,
              socialProofText: product.socialProofText,
              currency: product.currency,
              urgencyEnabled: product.urgencyEnabled,
              showFireSymbol: product.showFireSymbol,
              urgencyText: product.urgencyText,
              expiresAt: product.expiresAt,
            }}
          />
        </div>

        {/* ═══════════ 6. PERFECT FOR ═══════════ */}
        {enabledPerfectFor.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
              Perfect For
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {enabledPerfectFor.map((p: any) => (
                <div
                  key={p.id}
                  className="glass-card p-6 text-center hover:-translate-y-1 transition-all"
                >
                  <p className="font-semibold" style={{ color: "var(--accent-gold)" }}>✦</p>
                  <p className="font-semibold mt-2" style={{ color: "var(--text-primary)" }}>{p.title}</p>
                  {p.description && (
                    <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>{p.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ 7. CUSTOMER REVIEWS ═══════════ */}
        {reviewCount > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: "var(--text-primary)" }}>
              Customer Reviews
            </h2>

            {/* Rating summary — automatically calculated */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div
                className="rounded-2xl px-8 py-5 text-center"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)" }}
              >
                <p className="text-4xl font-extrabold" style={{ color: "var(--accent-gold)" }}>
                  {avgRating.toFixed(1)}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>out of 5</p>
              </div>
              <div className="text-center sm:text-left">
                <StarRow rating={Math.round(avgRating)} />
                <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
                  Based on {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
              {enabledReviews.map((r: any) => (
                <div
                  key={r.id}
                  className="glass-card p-6 flex flex-col"
                >
                  <StarRow rating={Number(r.rating) || 0} />
                  <p className="text-sm mt-4 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
                    &ldquo;{r.reviewText}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t" style={{ borderColor: "var(--border-gold)" }}>
                    <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{r.customerName}</p>
                    {r.company && <p className="text-xs mt-0.5" style={{ color: "var(--text-dim)" }}>{r.company}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ 8. FINAL CTA (existing purchase area) ═══════════ */}
        <div
          className="mt-20 rounded-3xl p-10 text-center"
          style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-gold)" }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            Ready to get {product.name}?
          </h2>
          <p className="mt-2 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
            {product.paymentDescription || "Get instant access today."}
          </p>
          <div className="mt-8 max-w-xs mx-auto">
            <PurchaseCta product={purchaseProduct} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
