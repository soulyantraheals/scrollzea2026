"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: {
    id: number;
    name: string;
    slug: string;
    shortDescription: string | null;
    productType: string;
    price: number;
    discountPrice: number | null;
    featured: number;
    bestSeller: number;
    images?: Array<{ imageUrl: string; isPrimary: number }>;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const primaryImage = product.images?.find((i) => i.isPrimary) || product.images?.[0];
  // price = selling price (shown big), discountPrice = original/MRP (struck through)
  const hasDiscount =
    product.discountPrice && product.discountPrice > product.price;
  const isFree = product.price === 0 && product.productType === "FREE";
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.discountPrice! - product.price) / product.discountPrice!) * 100
      )
    : 0;

  const getCTAText = () => {
    switch (product.productType) {
      case "FREE":
        return "Get Free";
      case "PREBOOK":
        return "Pre-book Now";
      case "CUSTOM_QUOTE":
        return "Request Quote";
      default:
        return "Buy Now";
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="product-card">
        {/* Image */}
        <div className="aspect-[4/3] relative overflow-hidden" style={{ backgroundColor: "var(--bg-secondary)" }}>
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ color: "var(--text-dim)" }}>
              <svg className="h-12 w-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.bestSeller ? (
              <Badge variant="best-seller">🏆 Best Seller</Badge>
            ) : null}
            {product.featured ? (
              <Badge variant="featured">Featured</Badge>
            ) : null}
            {isFree && <Badge variant="free">FREE</Badge>}
            {discountPercent > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: "rgba(239,68,68,0.15)", color: "#EF4444" }}>
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Type Badge */}
          <div className="absolute top-2 right-2">
            {product.productType === "PREBOOK" && (
              <Badge variant="prebook">Pre-book</Badge>
            )}
            {product.productType === "READY_MADE" && !isFree && (
              <Badge>Ready</Badge>
            )}
            {product.productType === "CUSTOM_QUOTE" && (
              <Badge variant="prebook">Custom</Badge>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="p-5">
          <h3 className="font-semibold line-clamp-1" style={{ color: "var(--text-primary)" }}>
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-sm mt-1.5 line-clamp-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            {isFree ? (
              <span className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>FREE</span>
            ) : (
              <>
                <span className="text-lg font-bold" style={{ color: "var(--accent-gold)" }}>
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm line-through" style={{ color: "var(--text-dim)" }}>
                    {formatPrice(product.discountPrice!)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div
            className="mt-4 px-4 py-2.5 rounded-xl text-sm font-semibold text-center transition-all"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
              color: "var(--bg-primary)",
            }}
          >
            {getCTAText()}
          </div>
        </div>
      </div>
    </Link>
  );
}
