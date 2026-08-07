export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { products, categories } from "@/db/schema";
import { eq, desc, asc, sql } from "drizzle-orm";
import { HomeSearchBar } from "@/components/public/HomeSearchBar";

async function getHomepageData() {
  try {
    const activeCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.status, "active"))
      .orderBy(asc(categories.sortOrder))
      .all();

    const featuredProducts = await db
      .select()
      .from(products)
      .where(sql`${products.featured} = 1 AND ${products.status} = 'published'`)
      .orderBy(desc(products.createdAt))
      .limit(8)
      .all();

    // Attach images
    const attachImages = async (items: any[]) => {
      const { productImages } = await import("@/db/schema");
      return Promise.all(
        items.map(async (p) => {
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
      categories: activeCategories,
      featuredProducts: await attachImages(featuredProducts),
    };
  } catch {
    return { categories: [], featuredProducts: [] };
  }
}

export default async function HomePage() {
  const { categories: cats, featuredProducts: featured } = await getHomepageData();

  return (
    <div>
      {/* ───────────── HERO ───────────── */}
      <section className="relative min-h-screen flex items-center hero-gradient overflow-hidden pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--accent-gold)] opacity-[0.03] blur-[140px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent-gold)] opacity-[0.02] blur-[120px]" />
          <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full bg-[var(--accent-gold)] opacity-[0.015] blur-[80px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 w-full relative z-10">
          <div className="max-w-3xl">
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Welcome to <span className="gold-gradient">Scrollzea</span>
            </h1>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-gold)] text-[var(--accent-gold)] text-xs font-medium tracking-wider uppercase mb-6 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
              Digital Products Marketplace
            </div>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Ready-to-Use Digital Products for{" "}
              <span className="gold-gradient">Business, Creators &amp; Developers</span>
            </p>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Buy professional website templates, management systems, Flutter apps, automation tools, and custom digital solutions that save weeks of work.
            </p>

            {/* Search Bar */}
            <div className="mt-8 max-w-lg">
              <HomeSearchBar />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
              <Link
                href="/products"
                className="btn-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold"
              >
                Explore Products
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
              <a
                href="https://wa.me/911234567890?text=Hi%20Scrollzea%2C%20I%20want%20a%20custom%20digital%20solution%20for%20my%20business."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost-gold inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium"
              >
                Build Something Custom
                <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>

            <div className="mt-16 flex flex-wrap items-center gap-6 sm:gap-8 text-sm text-[var(--text-dim)]">
              {[
                "Instant Download",
                "Secure Payment",
                "Premium Quality",
                "WhatsApp Support",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--accent-glow)] flex items-center justify-center">
                    <span className="text-[var(--accent-gold)] text-xs">✓</span>
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURED PRODUCTS ───────────── */}
      <section id="products" className="section-dark-2 py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[var(--accent-gold)] opacity-[0.015] blur-[100px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">What We Offer</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              Featured <span className="gold-gradient">Digital Products</span>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Production-ready templates, apps, and systems — instantly downloadable after purchase.
            </p>
          </div>

          {featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="product-card group animate-fade-in-up"
                  style={{ animationDelay: `${(i % 4) * 100}ms` }}
                >
                  <div className="aspect-[4/3] bg-[var(--bg-secondary)] overflow-hidden rounded-t-[16px]">
                    {product.images?.[0] ? (
                      <img src={product.images[0].imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--accent-glow)] to-transparent flex items-center justify-center">
                        <span className="text-5xl opacity-20">
                          {product.productType === "FREE" ? "🎁" : product.productType === "PREBOOK" ? "🛠" : "📦"}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      {product.productType !== "PAID" && (
                        <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          product.productType === "FREE" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                        }`}>
                          {product.productType}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base text-[var(--text-primary)] line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] mt-1.5 line-clamp-2 leading-relaxed">
                      {product.shortDescription}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border-gold)]/30">
                      <div className="flex items-baseline gap-2">
                        <span className="font-bold text-[var(--accent-gold)]">
                          {product.price === 0 ? "Free" : `₹${product.price.toLocaleString("en-IN")}`}
                        </span>
                        {product.discountPrice && product.discountPrice > product.price && (
                          <span className="text-xs line-through text-[var(--text-dim)]">
                            ₹{product.discountPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-center transition-all"
                        style={{
                          background: product.productType === "FREE" && product.price === 0
                            ? "linear-gradient(135deg, #22C55E, #16A34A)"
                            : "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))",
                          color: "var(--bg-primary)",
                        }}
                      >
                        {product.productType === "FREE" ? "Get Free" : product.productType === "PREBOOK" ? "Pre-book Now" : product.productType === "CUSTOM_QUOTE" ? "Request Quote" : "Buy Now"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-2xl mb-4">📦</div>
              <p className="text-[var(--text-muted)] font-medium">Products coming soon.</p>
              <p className="text-sm text-[var(--text-dim)] mt-1">We're curating something special for you.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="btn-ghost-gold inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-medium"
            >
              View All Products
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ───────────── CATEGORIES ───────────── */}
      {cats.length > 0 && (
        <section className="section-dark py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[var(--accent-gold)] opacity-[0.015] blur-[100px]" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="section-label">Browse By</span>
              <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
                Product <span className="gold-gradient">Categories</span>
              </h2>
              <p className="text-[var(--text-muted)] leading-relaxed">
                Find exactly what you need from our curated categories.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {cats.map((cat, i) => (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="glass-card p-6 sm:p-8 text-center group animate-fade-in-up hover:-translate-y-1"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className="w-14 h-14 mx-auto rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                    {cat.icon || "📁"}
                  </div>
                  <h3 className="font-medium text-sm text-[var(--text-primary)] mt-4">{cat.name}</h3>
                  <p className="text-xs text-[var(--text-dim)] mt-1 hidden group-hover:block transition-all">Browse →</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section className="section-dark-2 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">Simple Process</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              How It <span className="gold-gradient">Works</span>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Get started in minutes, not days.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Browse Products", desc: "Explore our collection of templates, apps, systems, and automation tools." },
              { num: "02", title: "Purchase Securely", desc: "Pay using Razorpay or PayPal — your payment is always protected." },
              { num: "03", title: "Instant Access", desc: "Receive download access immediately after payment confirmation." },
              { num: "04", title: "Get Support", desc: "We help you install, configure, and use every product you buy." },
            ].map((step, i) => (
              <div
                key={step.num}
                className="glass-card p-8 animate-fade-in-up hover:-translate-y-1"
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className="step-number">{step.num}</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mt-5">{step.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── WHY SCROLLZEA ───────────── */}
      <section className="section-dark py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">Why Choose Us</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              Built for <span className="gold-gradient">Professionals</span>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Every product is production-ready, tested, and backed by real support.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: "⚡", title: "Production Ready", desc: "Not demo files or starter kits — fully functional products you can use immediately." },
              { icon: "🚀", title: "Fast Delivery", desc: "Instant downloads for digital products and quick turnaround on custom orders." },
              { icon: "📱", title: "Mobile Optimized", desc: "Every product works seamlessly on phones, tablets, and desktops." },
              { icon: "💬", title: "Real Support", desc: "Direct assistance via WhatsApp and email, from real people who know the product." },
            ].map((item, i) => (
              <div
                key={item.title}
                className="glass-card p-8 animate-fade-in-up text-center hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent-glow)] flex items-center justify-center text-3xl">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-lg mt-5">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TESTIMONIALS ───────────── */}
      <section className="section-dark-2 py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[var(--accent-gold)] opacity-[0.015] blur-[120px]" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">Testimonials</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              What Clients <span className="gold-gradient">Say</span>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Trusted by businesses, creators, and developers worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Amit S.", role: "Business Owner", text: "The hostel management system transformed our operations. Installation was smooth and the support team was incredibly helpful." },
              { name: "Priya R.", role: "Freelance Designer", text: "I purchased the portfolio template — clean code, great design, easy to customize. Highly recommended." },
              { name: "Rahul K.", role: "Startup Founder", text: "Custom app development was seamless. They understood our requirements and delivered ahead of schedule." },
            ].map((t, i) => (
              <div
                key={t.name}
                className="glass-card p-8 animate-fade-in-up hover:-translate-y-1"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-1 text-[var(--accent-gold)] mb-4">
                  {[...Array(5)].map((_, s) => (
                    <svg key={s} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-[var(--border-gold)]/30">
                  <p className="font-semibold text-sm text-[var(--text-primary)]">{t.name}</p>
                  <p className="text-xs text-[var(--text-dim)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section className="section-dark py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="section-label">FAQ</span>
            <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
              Frequently Asked <span className="gold-gradient">Questions</span>
            </h2>
            <p className="text-[var(--text-muted)] leading-relaxed">
              Everything you need to know about Scrollzea.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: "What types of products does Scrollzea offer?", a: "We offer ready-to-use digital products including website templates, Flutter apps, management systems (hostel, hospital, inventory), automation tools, and custom development services." },
              { q: "How do I receive my purchase?", a: "After successful payment, you get instant download access. For custom projects, we deliver the completed work within the agreed timeline." },
              { q: "Can I request modifications to a product?", a: "Ready-made products are sold as-is. However, we offer custom development services for tailored solutions." },
              { q: "What payment methods are accepted?", a: "We accept Razorpay (UPI, cards, netbanking) and PayPal for international customers. All transactions are secure." },
              { q: "Do you provide support after purchase?", a: "Yes! Every purchase includes support via WhatsApp and email. We help with installation, setup, and troubleshooting." },
              { q: "What is the pre-book process for custom projects?", a: "Pre-book with 30% advance, we start development, and you pay the remaining 70% on delivery. Contact us to discuss your project." },
            ].map((faq, i) => (
              <details
                key={i}
                className="glass-card group open:border-[var(--border-gold-hover)] animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                  <span className="font-medium text-sm text-[var(--text-primary)] pr-4">{faq.q}</span>
                  <svg className="h-4 w-4 text-[var(--accent-gold)] shrink-0 transition-transform duration-200 group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 border-t border-[var(--border-gold)]/30">
                  <p className="text-sm text-[var(--text-muted)] pt-4 leading-relaxed">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="section-dark-2 py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[var(--accent-gold)] opacity-[0.02] blur-[160px]" />
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <span className="section-label">Get Started</span>
          <h2 className="text-3xl lg:text-4xl font-bold mt-6 mb-4">
            Ready to Build Something <span className="gold-gradient">Great?</span>
          </h2>
          <p className="text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
            Browse our products or tell us about your custom project. We're here to help.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-10">
            <Link
              href="/products"
              className="btn-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold"
            >
              Browse Products
            </Link>
            <a
              href="https://wa.me/911234567890?text=Hi%20Scrollzea%2C%20I%20want%20a%20custom%20digital%20solution%20for%20my%20business."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost-gold inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium"
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
