import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clickEvents } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const { productId, productName, eventType, source } = await req.json();

    if (!productId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await db.insert(clickEvents).values({
      productId: parseInt(productId),
      productName: productName || null,
      eventType,
      source: source || "website",
      referrer: req.headers.get("referer") || null,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Failed to track event" }, { status: 500 });
  }
}
