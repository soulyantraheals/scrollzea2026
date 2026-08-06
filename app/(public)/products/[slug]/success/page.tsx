export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatMoney } from "@/lib/money";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ provider?: string; ref?: string }>;
}

export default async function PurchaseSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { provider, ref } = await searchParams;

  const product = await db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) notFound();

  const isFree = product.productType === "FREE" && product.price === 0;
  const hasDiscount = !!product.discountPrice && product.discountPrice > product.price;
  const whatsappHref = product.whatsappMessage
    ? `https://wa.me/?text=${encodeURIComponent(`${product.whatsappMessage} — ${product.name}`)}`
    : "/contact";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl p-8 sm:p-10 text-center" style={{ backgroundColor: "var(--bg-card)", border: "2px solid var(--border-gold-hover)", boxShadow: "0 0 60px var(--accent-glow)" }}>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isFree ? "Download Confirmed" : "Purchase Confirmed"}
          </h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
            {product.name}
            {provider ? ` · via ${provider}` : ""}
            {ref ? ` · Ref: ${ref}` : ""}
          </p>

          {!isFree && (
            <div className="mt-6 flex items-end justify-center gap-3">
              <span className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                {formatMoney(product.price, product.currency)}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through mb-0.5" style={{ color: "var(--text-dim)" }}>
                  {formatMoney(product.discountPrice!, product.currency)}
                </span>
              )}
            </div>
          )}

          {product.deliveryMethod === "download" && product.downloadUrl && (
            <div className="mt-6">
              <a
                href={product.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", padding: "14px 28px", borderRadius: "12px", fontWeight: 700, color: "#FFFFFF", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))", textDecoration: "none" }}
              >
                ⬇️ Download your product
              </a>
            </div>
          )}

          <div className="mt-8 space-y-2 text-left rounded-2xl p-6" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-gold)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>What happens next?</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {product.paymentDescription || (isFree ? "Your download is ready above." : "You'll receive your access details shortly.")}
            </p>
            <a href={whatsappHref} target={whatsappHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block text-sm font-semibold mt-2" style={{ color: "var(--accent-gold)" }}>
              💬 Need help? Chat with support on WhatsApp
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/products/${product.slug}`} style={{ display: "inline-flex", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-card)", border: "1px solid var(--border-gold)", textDecoration: "none" }}>
              ← Back to {product.name}
            </Link>
            <Link href="/products" style={{ display: "inline-flex", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, color: "#FFFFFF", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))", textDecoration: "none" }}>
              Browse more products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
