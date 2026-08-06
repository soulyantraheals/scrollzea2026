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
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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
  const {
    images: imgs,
    paymentOptions: payments,
    features: feats,
    faqs: faqItems,
    reviews: reviewItems,
    perfectFor: perfectForItems,
    ...productData
  } = body;

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
      payments.map((p: any, i: number) => ({
        productId: result.id,
        provider: (p.label || "").trim() ? slugify(p.label.trim()) : `link-${i}`,
        label: p.label?.trim() || null,
        icon: p.icon?.trim() || null,
        paymentUrl: p.paymentUrl,
        enabled: 1,
        sortOrder: i,
      }))
    );
  }

  if (feats?.length) {
    await db.insert(productFeatures).values(
      feats.map((f: any) => ({
        productId: result.id,
        feature: f.feature,
        enabled: f.enabled,
        sortOrder: f.sortOrder,
      }))
    );
  }

  if (faqItems?.length) {
    await db.insert(faqs).values(
      faqItems.map((f: any) => ({
        productId: result.id,
        question: f.question,
        answer: f.answer,
        enabled: f.enabled,
        sortOrder: f.sortOrder,
      }))
    );
  }

  if (reviewItems?.length) {
    await db.insert(productReviews).values(
      reviewItems.map((r: any) => ({
        productId: result.id,
        customerName: r.customerName,
        company: r.company,
        rating: r.rating,
        reviewText: r.reviewText,
        enabled: r.enabled,
        sortOrder: r.sortOrder,
      }))
    );
  }

  if (perfectForItems?.length) {
    await db.insert(productPerfectFor).values(
      perfectForItems.map((p: any) => ({
        productId: result.id,
        title: p.title,
        description: p.description,
        enabled: p.enabled,
        sortOrder: p.sortOrder,
      }))
    );
  }

  return NextResponse.json(result, { status: 201 });
}
