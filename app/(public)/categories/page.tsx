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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Categories</h1>
      {categoriesWithCounts.length === 0 ? (
        <p className="text-gray-500 text-center py-16">No categories available yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesWithCounts.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="p-8 rounded-xl border border-gray-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all group"
            >
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center text-2xl group-hover:bg-indigo-100 transition-colors">
                {cat.icon || "📁"}
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mt-4">{cat.name}</h2>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-2">{cat.description}</p>
              )}
              <p className="text-sm text-indigo-600 font-medium mt-3">
                {cat.productCount} product{cat.productCount !== 1 ? "s" : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
