import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, purpose, category, productId, productName, message, source } = body;

    // Validation
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Name, email, and phone are required" },
        { status: 400 }
      );
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Basic phone validation
    const phoneClean = phone.replace(/[\s\-\(\)]/g, "");
    if (phoneClean.length < 10) {
      return NextResponse.json(
        { error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Store lead
    await db.insert(leads).values({
      name,
      email,
      phone,
      purpose: purpose || null,
      category: category || null,
      productId: productId ? parseInt(productId) : null,
      productName: productName || null,
      message: message || null,
      source: source || "contact_form",
      status: "new",
    });

    // In production, send email via Resend here
    // For now, lead is stored and admin can view it

    return NextResponse.json({
      success: true,
      message: "Thank you! We'll get back to you soon.",
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}
