import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        productType: products.productType,
      })
      .from(products)
      .where(
        sql`(${products.status} = 'published' AND (${products.name} LIKE ${`%${q}%`} OR ${products.shortDescription} LIKE ${`%${q}%`}))`
      )
      .orderBy(desc(products.featured), desc(products.createdAt))
      .limit(6)
      .all();

    return NextResponse.json(results);
  } catch {
    return NextResponse.json([]);
  }
}
