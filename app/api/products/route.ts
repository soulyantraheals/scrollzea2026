import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, categories, productImages } from "@/db/schema";
import { eq, desc, asc, sql, and } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "50");
  const offset = parseInt(searchParams.get("offset") || "0");

  let conditions = [eq(products.status, "published")];

  if (category) {
    conditions.push(eq(products.categoryId, parseInt(category)));
  }
  if (type) {
    conditions.push(eq(products.productType, type as any));
  }
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
    .limit(limit)
    .offset(offset)
    .all();

  // Attach images
  const result = await Promise.all(
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

  return NextResponse.json({ products: result });
}
