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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="aspect-square rounded-2xl bg-gray-50 overflow-hidden">
          {primaryImage ? (
            <img src={primaryImage.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">No Image</div>
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

          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">{product.name}</h1>

          {product.shortDescription && (
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">{product.shortDescription}</p>
          )}

          {/* Price */}
          <div className="mt-6 p-6 bg-gray-50 rounded-xl">
            {isFree ? (
              <p className="text-3xl font-bold text-emerald-600">FREE</p>
            ) : (
              <div className="space-y-1">
                <p className="text-3xl font-bold text-gray-900">
                  {hasDiscount ? formatPrice(product.discountPrice!) : formatPrice(product.price)}
                </p>
                {hasDiscount && (
                  <p className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</p>
                )}
              </div>
            )}

            {/* Pre-book calculator */}
            {product.productType === "PREBOOK" && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-1.5 text-sm">
                <p className="text-blue-800 font-medium">Pre-book with {product.advancePercentage}% advance</p>
                <p className="text-blue-700">Total: <strong>{formatPrice(product.price)}</strong></p>
                <p className="text-blue-700">Advance ({product.advancePercentage}%): <strong>{formatPrice(advanceAmount)}</strong></p>
                <p className="text-blue-700">Remaining: <strong>{formatPrice(product.price - advanceAmount)}</strong></p>
              </div>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h2 className="font-semibold text-gray-900 mb-2">Description</h2>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">
                {product.description}
              </div>
            </div>
          )}

          {/* Payment Options */}
          <div className="mt-6 space-y-3">
            {enabledPayments.map((pm) => (
              <a
                key={pm.id}
                href={pm.paymentUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  variant={
                    pm.provider === "RAZORPAY"
                      ? "primary"
                      : pm.provider === "PAYPAL"
                      ? "secondary"
                      : "outline"
                  }
                  className="w-full justify-center"
                >
                  {pm.provider === "RAZORPAY" && "Pay with Razorpay"}
                  {pm.provider === "PAYPAL" && "Pay with PayPal"}
                  {pm.provider === "WHATSAPP" && "Chat on WhatsApp"}
                </Button>
              </a>
            ))}
          </div>

          {/* Features */}
          {product.features?.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-gray-900 mb-3">What's Included</h2>
              <ul className="space-y-2">
                {product.features.map((f: any) => (
                  <li key={f.id} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-emerald-500 mt-0.5">✓</span>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {product.faqs.map((faq: any) => (
              <details key={faq.id} className="group">
                <summary className="flex justify-between items-center cursor-pointer py-4 px-4 rounded-lg bg-gray-50 hover:bg-gray-100">
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <p className="px-4 py-3 text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
