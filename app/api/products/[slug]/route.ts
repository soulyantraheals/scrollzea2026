import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, paymentOptions, productFeatures, faqs } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .get();

  if (!product || product.status !== "published") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [images, payments, features, productFaqs] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(productImages.sortOrder)
      .all(),
    db
      .select()
      .from(paymentOptions)
      .where(eq(paymentOptions.productId, product.id))
      .all(),
    db
      .select()
      .from(productFeatures)
      .where(eq(productFeatures.productId, product.id))
      .orderBy(productFeatures.sortOrder)
      .all(),
    db
      .select()
      .from(faqs)
      .where(eq(faqs.productId, product.id))
      .orderBy(faqs.sortOrder)
      .all(),
  ]);

  // Get related products (same category)
  let related: any[] = [];
  if (product.categoryId) {
    const { products: pTable } = await import("@/db/schema");
    const { and, sql } = await import("drizzle-orm");
    related = await db
      .select()
      .from(pTable)
      .where(
        and(
          eq(pTable.categoryId, product.categoryId),
          eq(pTable.status, "published"),
          sql`${pTable.id} != ${product.id}`
        )
      )
      .limit(4)
      .all();

    const relatedWithImages = await Promise.all(
      related.map(async (r) => {
        const imgs = await db
          .select()
          .from(productImages)
          .where(eq(productImages.productId, r.id))
          .all();
        return { ...r, images: imgs };
      })
    );
    related = relatedWithImages;
  }

  return NextResponse.json({
    ...product,
    images,
    paymentOptions: payments,
    features,
    faqs: productFaqs,
    related,
  });
}
