import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { clickEvents, orders, products } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const totalClicks = await db.select({ count: sql<number>`count(*)` }).from(clickEvents).get();
  const totalSales = await db.select({ count: sql<number>`count(*)` }).from(orders).where(eq(orders.paymentStatus, "paid")).get();
  const revenue = await db.select({ total: sql<number>`coalesce(sum(total_amount), 0)` }).from(orders).where(eq(orders.paymentStatus, "paid")).get();
  const clicksWithOrders = await db.select({ count: sql<number>`count(distinct product_id)` }).from(orders).where(eq(orders.paymentStatus, "paid")).get();

  // Top products by click count
  const topProducts = await db
    .select({
      id: clickEvents.productId,
      name: clickEvents.productName,
      clickCount: sql<number>`count(*)`,
    })
    .from(clickEvents)
    .where(sql`${clickEvents.productId} IS NOT NULL`)
    .groupBy(clickEvents.productId)
    .orderBy(desc(sql`count(*)`))
    .limit(10)
    .all();

  // Bottom products (all published products with click data)
  const allProducts = await db
    .select({ id: products.id, name: products.name })
    .from(products)
    .where(eq(products.status, "published"))
    .all();

  const bottomProducts = await Promise.all(
    allProducts.map(async (p) => {
      const clickCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(clickEvents)
        .where(eq(clickEvents.productId, p.id))
        .get();
      const saleCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(and(eq(orders.productId, p.id), eq(orders.paymentStatus, "paid")))
        .get();
      return { ...p, clickCount: clickCount?.count || 0, saleCount: saleCount?.count || 0 };
    })
  );

  const sortedBottom = bottomProducts
    .filter((p) => p.clickCount === 0)
    .slice(0, 5);

  // Clicks by method
  const clicksByMethod = await db
    .select({
      method: clickEvents.eventType,
      count: sql<number>`count(*)`,
    })
    .from(clickEvents)
    .groupBy(clickEvents.eventType)
    .orderBy(desc(sql`count(*)`))
    .all();

  const conversionRate = totalClicks?.count
    ? Math.round(((totalSales?.count || 0) / totalClicks.count) * 100)
    : 0;

  return NextResponse.json({
    totalClicks: totalClicks?.count || 0,
    totalSales: totalSales?.count || 0,
    totalRevenue: revenue?.total || 0,
    conversionRate,
    topProducts,
    bottomProducts: sortedBottom,
    clicksByMethod,
  });
}
