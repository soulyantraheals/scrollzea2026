import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Each product gets a relevant image based on its category/type
const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
  "expense-tracker-pro": [
    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  ],
  "flutter-business-dashboard": [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop",
  ],
  "food-delivery-app": [
    "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
  ],
  "custom-mobile-app": [
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1526498464235-1af9ec6e4c2a?w=600&h=400&fit=crop",
  ],
  "invoice-generator-pdf": [
    "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop",
  ],
  "invoice-tracker-excel": [
    "https://images.unsplash.com/photo-1535320903710-d993d3d502e3?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
  ],
  "billing-inventory-system": [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1553413077-190dd305871b?w=600&h=400&fit=crop",
  ],
  "logo-brand-identity": [
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
  ],
  "social-media-templates": [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&h=400&fit=crop",
  ],
  "brand-style-guide": [
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&h=400&fit=crop",
  ],
  "minimal-resume-template": [
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&h=400&fit=crop",
  ],
  "business-plan-template": [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop",
  ],
  "digital-marketing-guide": [
    "https://images.unsplash.com/photo-1432889821006-3149403b3f1f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop",
  ],
  "professional-website-design": [
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&h=400&fit=crop",
  ],
  "ecommerce-store-setup": [
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=400&fit=crop",
  ],
  "nextjs-portfolio-template": [
    "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop",
  ],
  "admin-dashboard-template": [
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
  ],
  "hostel-management-system": [
    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&h=400&fit=crop",
  ],
  "hospital-management-system": [
    "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&h=400&fit=crop",
  ],
  "ultimate-notion-dashboard": [
    "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&h=400&fit=crop",
  ],
  "instagram-carousel-templates": [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=600&h=400&fit=crop",
    "https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=600&h=400&fit=crop",
  ],
};

export async function GET() {
  const allProducts = await db.select({
    id: products.id,
    slug: products.slug,
    name: products.name,
  }).from(products).all();

  const results = { added: 0, skipped: 0, errors: [] as string[] };

  for (const p of allProducts) {
    const images = PRODUCT_IMAGE_MAP[p.slug];
    if (!images) {
      results.skipped++;
      continue;
    }

    // Check if product already has images
    const existing = await db
      .select({ count: sql<number>`count(*)` })
      .from(productImages)
      .where(eq(productImages.productId, p.id!))
      .get();

    if (existing && existing.count! > 0) {
      results.skipped++;
      continue;
    }

    try {
      for (let i = 0; i < images.length; i++) {
        await db.insert(productImages).values({
          productId: p.id!,
          imageUrl: images[i],
          isPrimary: i === 0 ? 1 : 0,
          sortOrder: i,
        });
      }
      results.added++;
    } catch (err) {
      results.errors.push(`${p.name}: ${err}`);
    }
  }

  return NextResponse.json({
    message: results.added > 0 ? "Images added!" : "No new images added",
    results,
  });
}
