import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads, clickEvents, products } from "@/db/schema";
import { eq } from "drizzle-orm";

// Handles free-product downloads:
//  - Records a download_click for analytics
//  - Stores a lead (name/email/phone) so the admin can follow up
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productName, name, email, phone } = body;

    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }

    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(productId)))
      .get();

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Track the download click
    await db.insert(clickEvents).values({
      productId: product.id,
      productName: product.name,
      eventType: "download_click",
      source: "website",
      referrer: req.headers.get("referer") || null,
    });

    // Lead capture: store a lead whenever the free form was filled in.
    // Every FREE download goes through the name/email/phone form, so this
    // runs regardless of the per-product leadCaptureRequired toggle.
    if (name && email && phone) {
      await db.insert(leads).values({
        name,
        email,
        phone,
        purpose: "Free product download",
        category: "freebie",
        productId: product.id,
        productName: product.name,
        message: null,
        source: "free_download",
        status: "new",
      });
    }

    return NextResponse.json({
      success: true,
      downloadUrl: product.downloadUrl || null,
      deliveryMethod: product.deliveryMethod,
    });
  } catch (err) {
    console.error("Download error", err);
    return NextResponse.json({ error: "Failed to process download" }, { status: 500 });
  }
}
