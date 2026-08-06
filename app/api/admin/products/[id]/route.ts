import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  products,
  productImages,
  paymentOptions,
  productFeatures,
  faqs,
  productReviews,
  productPerfectFor,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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
  const [images, payments, features, productFaqs, reviews, perfectFor] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.sortOrder).all(),
    db.select().from(paymentOptions).where(eq(paymentOptions.productId, id)).all(),
    db.select().from(productFeatures).where(eq(productFeatures.productId, id)).orderBy(productFeatures.sortOrder).all(),
    db.select().from(faqs).where(eq(faqs.productId, id)).orderBy(faqs.sortOrder).all(),
    db.select().from(productReviews).where(eq(productReviews.productId, id)).orderBy(productReviews.sortOrder).all(),
    db.select().from(productPerfectFor).where(eq(productPerfectFor.productId, id)).orderBy(productPerfectFor.sortOrder).all(),
  ]);
  return NextResponse.json({
    ...product,
    images,
    paymentOptions: payments,
    features,
    faqs: productFaqs,
    reviews,
    perfectFor,
  });
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
  const {
    images: imgs,
    paymentOptions: payments,
    features: feats,
    faqs: faqItems,
    reviews: reviewItems,
    perfectFor: perfectForItems,
    ...productData
  } = body;

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
      payments.map((p: any, i: number) => ({
        productId: id,
        provider: (p.label || "").trim() ? slugify(p.label.trim()) : `link-${i}`,
        label: p.label?.trim() || null,
        icon: p.icon?.trim() || null,
        paymentUrl: p.paymentUrl,
        enabled: 1,
        sortOrder: i,
      }))
    );
  }

  await db.delete(productFeatures).where(eq(productFeatures.productId, id));
  if (feats?.length) {
    await db.insert(productFeatures).values(
      feats.map((f: any) => ({
        productId: id,
        feature: f.feature,
        enabled: f.enabled,
        sortOrder: f.sortOrder,
      }))
    );
  }

  await db.delete(faqs).where(eq(faqs.productId, id));
  if (faqItems?.length) {
    await db.insert(faqs).values(
      faqItems.map((f: any) => ({
        productId: id,
        question: f.question,
        answer: f.answer,
        enabled: f.enabled,
        sortOrder: f.sortOrder,
      }))
    );
  }

  await db.delete(productReviews).where(eq(productReviews.productId, id));
  if (reviewItems?.length) {
    await db.insert(productReviews).values(
      reviewItems.map((r: any) => ({
        productId: id,
        customerName: r.customerName,
        company: r.company,
        rating: r.rating,
        reviewText: r.reviewText,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      }))
    );
  }

  await db.delete(productPerfectFor).where(eq(productPerfectFor.productId, id));
  if (perfectForItems?.length) {
    await db.insert(productPerfectFor).values(
      perfectForItems.map((p: any) => ({
        productId: id,
        title: p.title,
        description: p.description,
        enabled: p.enabled,
        sortOrder: p.sortOrder,
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
  await db.delete(productFeatures).where(eq(productFeatures.productId, id));
  await db.delete(faqs).where(eq(faqs.productId, id));
  await db.delete(productReviews).where(eq(productReviews.productId, id));
  await db.delete(productPerfectFor).where(eq(productPerfectFor.productId, id));
  await db.delete(products).where(eq(products.id, id));

  return NextResponse.json({ success: true });
}
