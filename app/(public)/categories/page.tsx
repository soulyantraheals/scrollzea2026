export const dynamic = "force-dynamic";
import Link from "next/link";
import { db } from "@/lib/db";
import { categories, products } from "@/db/schema";
import { eq, asc, sql, and } from "drizzle-orm";

export default async function CategoriesPage() {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.status, "active"))
    .orderBy(asc(categories.sortOrder))
    .all();

  const categoriesWithCounts = await Promise.all(
    allCategories.map(async (cat) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(and(eq(products.categoryId, cat.id), eq(products.status, "published")))
        .get();
      return { ...cat, productCount: count?.count || 0 };
    })
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8" style={{ color: "var(--text-primary)" }}>Categories</h1>
        {categoriesWithCounts.length === 0 ? (
          <p className="text-center py-16" style={{ color: "var(--text-muted)" }}>No categories available yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoriesWithCounts.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="glass-card p-8 text-center group animate-fade-in-up"
              >
                <div className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300"
                  style={{ backgroundColor: "var(--accent-glow)" }}>
                  {cat.icon || "📁"}
                </div>
                <h2 className="text-xl font-semibold mt-4" style={{ color: "var(--text-primary)" }}>{cat.name}</h2>
                {cat.description && (
                  <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>{cat.description}</p>
                )}
                <p className="text-sm font-medium mt-3" style={{ color: "var(--accent-gold)" }}>
                  {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
