export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { categories, products, productImages } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/public/ProductCard";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const category = await db
    .select()
    .from(categories)
    .where(eq(categories.slug, slug))
    .get();

  if (!category) notFound();

  const categoryProducts = await db
    .select()
    .from(products)
    .where(
      and(eq(products.categoryId, category.id), eq(products.status, "published"))
    )
    .orderBy(desc(products.createdAt))
    .all();

  const productsWithImages = await Promise.all(
    categoryProducts.map(async (p) => {
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>{category.name}</h1>
          {category.description && (
            <p className="mt-2" style={{ color: "var(--text-muted)" }}>{category.description}</p>
          )}
        </div>

        {productsWithImages.length === 0 ? (
          <p className="text-center py-16" style={{ color: "var(--text-muted)" }}>No products in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsWithImages.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
