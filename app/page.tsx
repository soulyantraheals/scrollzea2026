export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { products, categories, websiteSettings } from "@/db/schema";
import { eq, desc, sql, asc } from "drizzle-orm";
import { ProductCard } from "@/components/public/ProductCard";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/utils";

async function getHomepageData() {
  try {
    const allSettings = await db.select().from(websiteSettings).all();
    const settingsMap: Record<string, string> = {};
    allSettings.forEach((s) => {
      settingsMap[s.key] = s.value || "";
    });

    const activeCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.status, "active"))
      .orderBy(asc(categories.sortOrder))
      .all();

    const featuredProducts = await db
      .select()
      .from(products)
      .where(
        sql`${products.featured} = 1 AND ${products.status} = 'published'`
      )
      .orderBy(desc(products.createdAt))
      .limit(8)
      .all();

    const bestSellers = await db
      .select()
      .from(products)
      .where(
        sql`(${products.bestSeller} = 1 OR ${products.featured} = 1) AND ${products.status} = 'published'`
      )
      .orderBy(desc(products.bestSeller))
      .limit(5)
      .all();

    const freeProducts = await db
      .select()
      .from(products)
      .where(
        sql`${products.productType} = 'FREE' AND ${products.status} = 'published'`
      )
      .orderBy(desc(products.createdAt))
      .limit(4)
      .all();

    const readyMade = await db
      .select()
      .from(products)
      .where(
        sql`${products.productType} = 'READY_MADE' AND ${products.status} = 'published'`
      )
      .orderBy(desc(products.createdAt))
      .limit(4)
      .all();

    // Attach primary image to each product
    const attachImages = async (products: any[]) => {
      const { productImages } = await import("@/db/schema");
      return Promise.all(
        products.map(async (p) => {
          const imgs = await db
            .select()
            .from(productImages)
            .where(eq(productImages.productId, p.id))
            .orderBy(productImages.sortOrder)
            .all();
          return { ...p, images: imgs };
        })
      );
    };

    return {
      settings: settingsMap,
      categories: activeCategories,
      featuredProducts: await attachImages(featuredProducts),
      bestSellers: await attachImages(bestSellers),
      freeProducts: await attachImages(freeProducts),
      readyMade: await attachImages(readyMade),
    };
  } catch {
    return {
      settings: {},
      categories: [],
      featuredProducts: [],
      bestSellers: [],
      freeProducts: [],
      readyMade: [],
    };
  }
}

export default async function HomePage() {
  const data = await getHomepageData();
  const { settings, categories, featuredProducts, bestSellers, freeProducts, readyMade } = data;

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Digital Products.{' '}
              <span className="text-indigo-600">Creative Solutions.</span>
              {' '}Built for You.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl">
              Discover ready-to-use digital products, free resources, and custom digital solutions
              designed to make your digital journey simpler, smarter, and more creative.
            </p>
            <div className="flex flex-wrap gap-4 mt-8">
              <Link href="/products">
                <Button size="lg" className="text-base px-8">
                  Explore Products
                </Button>
              </Link>
              <Link href="/services">
                <Button size="lg" variant="outline" className="text-base px-8">
                  Build Something Custom
                </Button>
              </Link>
            </div>
          </div>
        </div>
        {/* Decorative gradient */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl" />
      </section>

      {/* Featured Categories */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Categories</h2>
            <Link href="/categories" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="p-6 rounded-xl border border-gray-100 text-center hover:border-indigo-200 hover:shadow-md transition-all bg-white group"
              >
                <div className="w-12 h-12 mx-auto rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 text-xl group-hover:bg-indigo-100 transition-colors">
                  {cat.icon || "📁"}
                </div>
                <h3 className="font-medium text-gray-900 mt-3 text-sm">{cat.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Best Sellers</h2>
              <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Free Resources */}
      {freeProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Free Resources</h2>
            <Link href="/freebies" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {freeProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Ready-Made Products */}
      {readyMade.length > 0 && (
        <section className="bg-gray-50 py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Ready-to-Use Digital Products</h2>
              <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {readyMade.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Ready-made flow */}
          <div className="p-8 rounded-2xl border border-gray-100 bg-white">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xl mb-4">
              🛒
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Ready-Made Products</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">Browse</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">Choose</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">Pay</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-lg font-medium">Get Product</span>
            </div>
          </div>

          {/* Custom services flow */}
          <div className="p-8 rounded-2xl border border-gray-100 bg-white">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl mb-4">
              🎨
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom Services</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">Choose Service</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">Pre-book (30%)</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">Development</span>
              <span className="text-gray-300">→</span>
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg font-medium">Delivery</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Scrollzea */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-14">Why Scrollzea</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📦", title: "Ready-to-Use Products", desc: "Instant access to digital products that you can use right away." },
              { icon: "🎯", title: "Custom Digital Solutions", desc: "Tailored services built specifically for your needs." },
              { icon: "🔒", title: "Secure Payments", desc: "Pay securely through Razorpay or PayPal. Your data is protected." },
              { icon: "💬", title: "Professional Support", desc: "Get help when you need it. We're here to assist you." },
              { icon: "⚡", title: "Digital-First Experience", desc: "Fast, seamless, and optimized for the modern digital world." },
              { icon: "🤝", title: "Easy Communication", desc: "Connect with us via WhatsApp, email, or our contact form." },
            ].map((item) => (
              <div key={item.title} className="p-6 rounded-xl bg-white border border-gray-100">
                <span className="text-3xl">{item.icon}</span>
                <h3 className="font-semibold text-gray-900 mt-3">{item.title}</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900">Let's Create Something Great Together</h2>
          <p className="mt-4 text-lg text-gray-600">
            Have a project in mind? Get in touch and let's discuss how Scrollzea can bring your ideas to life.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
            <a href="https://wa.me/91" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline">Chat on WhatsApp</Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
