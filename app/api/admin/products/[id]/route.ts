import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, paymentOptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const product = await db
    .select()
    .from(products)
    .where(eq(products.id, id))
    .get();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, id))
    .orderBy(productImages.sortOrder)
    .all();
  const payments = await db
    .select()
    .from(paymentOptions)
    .where(eq(paymentOptions.productId, id))
    .all();
  return NextResponse.json({ ...product, images, paymentOptions: payments });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  const body = await req.json();
  const { images: imgs, paymentOptions: payments, ...productData } = body;

  await db.update(products).set(productData).where(eq(products.id, id));

  await db.delete(productImages).where(eq(productImages.productId, id));
  if (imgs?.length) {
    await db.insert(productImages).values(
      imgs.map((img: any) => ({
        productId: id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      }))
    );
  }

  await db.delete(paymentOptions).where(eq(paymentOptions.productId, id));
  if (payments?.length) {
    await db.insert(paymentOptions).values(
      payments.map((p: any) => ({
        productId: id,
        provider: p.provider,
        paymentUrl: p.paymentUrl,
        enabled: 1,
      }))
    );
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: idStr } = await params;
  const id = parseInt(idStr);
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(paymentOptions).where(eq(paymentOptions.productId, id));
  await db.delete(products).where(eq(products.id, id));

  return NextResponse.json({ success: true });
}
