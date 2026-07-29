export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { products, productImages, paymentOptions, productFeatures, faqs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";
import { ProductDetailClient } from "./ProductDetailClient";
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

  const [images, payments, features, productFaqs] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(productImages.sortOrder).all(),
    db.select().from(paymentOptions).where(eq(paymentOptions.productId, product.id)).all(),
    db.select().from(productFeatures).where(eq(productFeatures.productId, product.id)).orderBy(productFeatures.sortOrder).all(),
    db.select().from(faqs).where(eq(faqs.productId, product.id)).orderBy(faqs.sortOrder).all(),
  ]);

  return { ...product, images, paymentOptions: payments, features, faqs: productFaqs };
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

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  const isFree = product.price === 0 && product.productType === "FREE";
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const advanceAmount = (product.price * product.advancePercentage) / 100;

  const enabledPayments = product.paymentOptions?.filter((p) => p.enabled && p.paymentUrl) || [];

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
            {primaryImage ? (
              <img src={primaryImage.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-dim)" }}>No Image</div>
            )}
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.productType === "FREE" && <Badge variant="free">FREE</Badge>}
              {product.productType === "PREBOOK" && <Badge variant="prebook">Pre-book</Badge>}
              {product.bestSeller ? <Badge variant="best-seller">🏆 Best Seller</Badge> : null}
              {product.featured ? <Badge variant="featured">Featured</Badge> : null}
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold" style={{ color: "var(--text-primary)" }}>{product.name}</h1>

            {product.shortDescription && (
              <p className="mt-4 text-lg leading-relaxed" style={{ color: "var(--text-muted)" }}>{product.shortDescription}</p>
            )}

            {/* Price */}
            <div className="mt-6 p-6 rounded-xl" style={{ backgroundColor: "var(--bg-secondary)" }}>
              {isFree ? (
                <p className="text-3xl font-bold" style={{ color: "var(--accent-gold)" }}>FREE</p>
              ) : (
                <div className="space-y-1">
                  <p className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                    {hasDiscount ? formatPrice(product.discountPrice!) : formatPrice(product.price)}
                  </p>
                  {hasDiscount && (
                    <p className="text-lg line-through" style={{ color: "var(--text-dim)" }}>{formatPrice(product.price)}</p>
                  )}
                </div>
              )}

              {/* Pre-book calculator */}
              {product.productType === "PREBOOK" && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: "rgba(59,130,246,0.1)" }}>
                  <p className="font-medium" style={{ color: "#60A5FA" }}>Pre-book with {product.advancePercentage}% advance</p>
                  <p className="mt-1" style={{ color: "#93C5FD" }}>Total: <strong>{formatPrice(product.price)}</strong></p>
                  <p style={{ color: "#93C5FD" }}>Advance ({product.advancePercentage}%): <strong>{formatPrice(advanceAmount)}</strong></p>
                  <p style={{ color: "#93C5FD" }}>Remaining: <strong>{formatPrice(product.price - advanceAmount)}</strong></p>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div className="mt-6">
                <h2 className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Description</h2>
                <div className="leading-relaxed whitespace-pre-line text-sm" style={{ color: "var(--text-muted)" }}>
                  {product.description}
                </div>
              </div>
            )}

            {/* Payment Options / CTA */}
            <div className="mt-6 space-y-3">
              {enabledPayments.map((pm) => (
                <a
                  key={pm.id}
                  href={pm.paymentUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <div
                    className="w-full py-3 px-6 rounded-xl text-center font-semibold transition-all hover:opacity-90"
                    style={{
                      background: pm.provider === "RAZORPAY"
                        ? "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))"
                        : pm.provider === "PAYPAL"
                        ? "linear-gradient(135deg, #0070BA, #1546A0)"
                        : "linear-gradient(135deg, #25D366, #128C7E)",
                      color: "#FFFFFF",
                    }}
                  >
                    {pm.provider === "RAZORPAY" && "Pay with Razorpay"}
                    {pm.provider === "PAYPAL" && "Pay with PayPal"}
                    {pm.provider === "WHATSAPP" && "Chat on WhatsApp"}
                  </div>
                </a>
              ))}
            </div>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold mb-3" style={{ color: "var(--text-primary)" }}>What's Included</h2>
                <ul className="space-y-2">
                  {product.features.map((f: any) => (
                    <li key={f.id} className="flex items-start gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                      <span className="mt-0.5" style={{ color: "var(--accent-gold)" }}>✓</span>
                      {f.feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* FAQ */}
        {product.faqs?.length > 0 && (
          <div className="mt-16 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>Frequently Asked Questions</h2>
            <div className="space-y-4">
              {product.faqs.map((faq: any) => (
                <details key={faq.id} className="glass-card group open:border-[var(--border-gold-hover)]">
                  <summary className="flex justify-between items-center cursor-pointer py-5 px-6 list-none">
                    <span className="font-medium text-sm pr-4" style={{ color: "var(--text-primary)" }}>{faq.question}</span>
                    <svg className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" style={{ color: "var(--accent-gold)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-5 border-t" style={{ borderColor: "var(--border-gold)" }}>
                    <p className="text-sm pt-4 leading-relaxed" style={{ color: "var(--text-muted)" }}>{faq.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
