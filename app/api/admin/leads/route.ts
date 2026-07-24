import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { leads } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await db.select().from(leads).orderBy(desc(leads.createdAt)).all();
  return NextResponse.json(all);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, status, adminNotes } = await req.json();
  await db.update(leads).set({ status, adminNotes }).where(eq(leads.id, id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(leads).where(eq(leads.id, id));
  return NextResponse.json({ success: true });
}
