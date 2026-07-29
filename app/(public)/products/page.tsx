export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";
import { ProductCard } from "@/components/public/ProductCard";
import { ProductsSearchBar } from "@/components/public/ProductsSearchBar";

interface Props {
  searchParams: Promise<{ category?: string; type?: string; search?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category, type, search } = await searchParams;

  let conditions = [eq(products.status, "published")];
  if (category) conditions.push(eq(products.categoryId, parseInt(category)));
  if (type) conditions.push(eq(products.productType, type as any));
  if (search) {
    conditions.push(
      sql`(${products.name} LIKE ${`%${search}%`} OR ${products.shortDescription} LIKE ${`%${search}%`})`
    );
  }

  const allProducts = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(desc(products.createdAt))
    .all();

  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.status, "active"))
    .orderBy(asc(categories.sortOrder))
    .all();

  // Attach images
  const productsWithImages = await Promise.all(
    allProducts.map(async (p) => {
      const imgs = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(productImages.sortOrder)
        .all();
      return { ...p, images: imgs };
    })
  );

  const isActive = (flag: boolean) => flag;
  const activeStyle = { backgroundColor: "var(--accent-gold)", color: "var(--bg-primary)" };
  const inactiveStyle = { backgroundColor: "var(--bg-card)", color: "var(--text-muted)" };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-6" style={{ color: "var(--text-primary)" }}>All Products</h1>

        {/* Search */}
        <ProductsSearchBar initialSearch={search || ""} />

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href="/products"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={!category && !type ? activeStyle : inactiveStyle}
          >
            All
          </a>
          {allCategories.map((cat) => (
            <a
              key={cat.id}
              href={`/products?category=${cat.id}`}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
              style={category === String(cat.id) ? activeStyle : inactiveStyle}
            >
              {cat.name}
            </a>
          ))}
          <a
            href="/products?type=FREE"
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-80"
            style={type === "FREE" ? { backgroundColor: "#059669", color: "#FFFFFF" } : inactiveStyle}
          >
            Free
          </a>
        </div>

        {productsWithImages.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ color: "var(--text-muted)" }}>No products found.</p>
          </div>
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
