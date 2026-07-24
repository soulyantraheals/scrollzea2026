import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { customProjects } from "@/db/schema";
import { desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await db.select().from(customProjects).orderBy(desc(customProjects.createdAt)).all();
  return NextResponse.json(all);
}
