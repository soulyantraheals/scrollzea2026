import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, leads, orders } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const totalProducts = await db.select({ count: sql<number>`count(*)` }).from(products).get();
  const publishedProducts = await db.select({ count: sql<number>`count(*)` }).from(products).where(eq(products.status, "published")).get();
  const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(leads).get();
  const newLeads = await db.select({ count: sql<number>`count(*)` }).from(leads).where(eq(leads.status, "new")).get();
  const totalOrders = await db.select({ count: sql<number>`count(*)` }).from(orders).get();
  const revenueResult = await db.select({ total: sql<number>`coalesce(sum(total_amount), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")).get();

  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5).all();
  const recentLeads = await db.select().from(leads).orderBy(desc(leads.createdAt)).limit(5).all();

  return NextResponse.json({
    stats: {
      totalProducts: totalProducts?.count || 0,
      publishedProducts: publishedProducts?.count || 0,
      totalLeads: totalLeads?.count || 0,
      newLeads: newLeads?.count || 0,
      totalOrders: totalOrders?.count || 0,
      totalRevenue: revenueResult?.total || 0,
    },
    recentOrders,
    recentLeads,
  });
}
