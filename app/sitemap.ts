export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://scrollzea.vercel.app";

  const allProducts = await db
    .select({ slug: products.slug, updatedAt: products.updatedAt })
    .from(products)
    .where(eq(products.status, "published"))
    .all();

  const allCategories = await db
    .select({ slug: categories.slug })
    .from(categories)
    .where(eq(categories.status, "active"))
    .all();

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/freebies`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];

  const productPages = allProducts.map((p) => ({
    url: `${baseUrl}/products/${p.slug}`,
    lastModified: new Date(p.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryPages = allCategories.map((c) => ({
    url: `${baseUrl}/categories/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...productPages, ...categoryPages];
}
