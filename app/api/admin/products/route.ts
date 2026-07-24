import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, paymentOptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .all();

  const productsWithRelations = await Promise.all(
    allProducts.map(async (p) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(productImages.sortOrder)
        .all();
      const payments = await db
        .select()
        .from(paymentOptions)
        .where(eq(paymentOptions.productId, p.id))
        .all();
      return { ...p, images, paymentOptions: payments };
    })
  );

  return NextResponse.json(productsWithRelations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { images: imgs, paymentOptions: payments, ...productData } = body;

  const result = await db.insert(products).values(productData).returning().get();

  if (imgs?.length) {
    await db.insert(productImages).values(
      imgs.map((img: any) => ({
        productId: result.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      }))
    );
  }

  if (payments?.length) {
    await db.insert(paymentOptions).values(
      payments.map((p: any) => ({
        productId: result.id,
        provider: p.provider,
        paymentUrl: p.paymentUrl,
        enabled: 1,
      }))
    );
  }

  return NextResponse.json(result, { status: 201 });
}
