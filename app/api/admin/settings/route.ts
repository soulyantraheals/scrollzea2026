import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteSettings } from "@/db/schema";
import { auth } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(websiteSettings).all();
  const settingsMap: Record<string, string> = {};
  all.forEach((s) => { settingsMap[s.key] = s.value || ""; });
  return NextResponse.json(settingsMap);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(websiteSettings)
      .values({ key, value: value as string })
      .onConflictDoUpdate({
        target: websiteSettings.key,
        set: { value: value as string },
      });
  }

  return NextResponse.json({ success: true });
}
