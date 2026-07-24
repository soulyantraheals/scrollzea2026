import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { adminUsers, websiteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const existingAdmin = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.role, "admin"))
    .get();

  if (existingAdmin) {
    return NextResponse.json({ message: "Setup already completed. Admin exists." });
  }

  const passwordHash = await hash("scrollzeaAdmin2024!", 12);
  await db.insert(adminUsers).values({
    email: "srollzea@gmail.com",
    passwordHash,
    name: "Scrollzea Admin",
    role: "admin",
  });

  const defaultSettings = [
    { key: "site_name", value: "Scrollzea" },
    { key: "site_description", value: "Digital Products & Creative Digital Solutions" },
    { key: "business_email", value: "srollzea@gmail.com" },
    { key: "business_location", value: "Kolkata, West Bengal, India" },
    { key: "facebook_url", value: "https://www.facebook.com/scrollzea" },
    { key: "instagram_url", value: "https://www.instagram.com/scrollzea/" },
    { key: "default_advance_percentage", value: "30" },
    { key: "ai_chatbot_enabled", value: "1" },
    { key: "ai_welcome_message", value: "👋 Welcome to Scrollzea! How can I help you today?" },
    { key: "lead_notification_email", value: "srollzea@gmail.com" },
    { key: "auto_best_sellers_enabled", value: "1" },
    { key: "best_sellers_count", value: "5" },
  ];

  for (const setting of defaultSettings) {
    await db.insert(websiteSettings).values(setting);
  }

  return NextResponse.json({
    message: "Setup complete! Admin created: srollzea@gmail.com  |  Password: scrollzeaAdmin2024!",
  });
}
