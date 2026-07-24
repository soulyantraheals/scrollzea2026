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
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const isFree = product.price === 0 && product.productType === "FREE";
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.price - product.discountPrice!) / product.price) * 100
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

  const getCtaColor = () => {
    switch (product.productType) {
      case "FREE":
        return "bg-emerald-600 hover:bg-emerald-700";
      case "PREBOOK":
        return "bg-blue-600 hover:bg-blue-700";
      case "CUSTOM_QUOTE":
        return "bg-amber-600 hover:bg-amber-700";
      default:
        return "bg-indigo-600 hover:bg-indigo-700";
    }
  };

  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-gray-200">
        {/* Image */}
        <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
              <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
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
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-3">
            {isFree ? (
              <span className="text-lg font-bold text-emerald-600">FREE</span>
            ) : (
              <>
                <span className="text-lg font-bold text-gray-900">
                  {hasDiscount
                    ? formatPrice(product.discountPrice!)
                    : formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatPrice(product.price)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* CTA */}
          <div
            className={`mt-3 px-4 py-2 rounded-lg text-white text-sm font-medium text-center transition-all ${getCtaColor()}`}
          >
            {getCTAText()}
          </div>
        </div>
      </div>
    </Link>
  );
}
