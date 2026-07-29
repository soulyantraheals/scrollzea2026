export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { products, productImages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ProductCard } from "@/components/public/ProductCard";

export default async function FreebiesPage() {
  const freeProducts = await db
    .select()
    .from(products)
    .where(and(eq(products.productType, "FREE"), eq(products.status, "published")))
    .orderBy(desc(products.createdAt))
    .all();

  const productsWithImages = await Promise.all(
    freeProducts.map(async (p) => {
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
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>Free Resources</h1>
          <p className="mt-2" style={{ color: "var(--text-muted)" }}>
            Free digital products and resources from Scrollzea. No payment needed.
          </p>
        </div>

        {productsWithImages.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--text-muted)" }}>No free resources available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productsWithImages.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
