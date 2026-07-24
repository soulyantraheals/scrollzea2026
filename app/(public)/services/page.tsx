export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { products, productImages } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { ProductCard } from "@/components/public/ProductCard";

export default async function ServicesPage() {
  const services = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.status, "published"),
        or(eq(products.productType, "PREBOOK"), eq(products.productType, "CUSTOM_QUOTE"))
      )
    )
    .orderBy(desc(products.createdAt))
    .all();

  const servicesWithImages = await Promise.all(
    services.map(async (p) => {
      const imgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(productImages.sortOrder)
        .all();
      return { ...p, images: imgs };
    })
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Custom Digital Services</h1>
        <p className="text-gray-600 mt-2">
          Pre-book custom digital services with a 30% advance. We'll build what you need.
        </p>
      </div>

      {servicesWithImages.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">No services listed yet. Contact us for custom requirements.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesWithImages.map((service) => (
            <ProductCard key={service.id} product={service} />
          ))}
        </div>
      )}
    </div>
  );
}
