import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteSettings } from "@/db/schema";

export async function GET() {
  const all = await db.select().from(websiteSettings).all();
  const settingsMap: Record<string, string> = {};
  all.forEach((s) => {
    settingsMap[s.key] = s.value || "";
  });
  return NextResponse.json(settingsMap);
}
