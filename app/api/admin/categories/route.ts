import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const all = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder))
    .all();
  return NextResponse.json(all);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const result = await db.insert(categories).values(body).returning().get();
  return NextResponse.json(result, { status: 201 });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await db.update(categories).set(body).where(eq(categories.id, body.id));
  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await req.json();
  await db.delete(categories).where(eq(categories.id, id));
  return NextResponse.json({ success: true });
}
