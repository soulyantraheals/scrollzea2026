import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, products } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";

export async function GET() {
  const allCategories = await db
    .select()
    .from(categories)
    .where(eq(categories.status, "active"))
    .orderBy(asc(categories.sortOrder))
    .all();

  // Count products per category
  const result = await Promise.all(
    allCategories.map(async (cat) => {
      const count = await db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(
          eq(products.categoryId, cat.id) && eq(products.status, "published")
        )
        .get();
      return { ...cat, productCount: count?.count || 0 };
    })
  );

  return NextResponse.json(result);
}
