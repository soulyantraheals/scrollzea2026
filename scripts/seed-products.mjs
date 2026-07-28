// Run: node scripts/seed-products.mjs
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
if (!url) {
  console.error("Set TURSO_DATABASE_URL env var");
  process.exit(1);
}

const db = createClient({ url });

async function seed() {
  console.log("🌱 Seeding products...\n");

  // Get categories
  const cats = await db.execute("SELECT id, slug, name FROM categories WHERE status = 'active'");
  const catMap = {};
  cats.rows.forEach((c) => { catMap[c.slug] = c.id; });

  // Check existing products
  const existing = await db.execute("SELECT slug FROM products");
  const existingSlugs = new Set(existing.rows.map((r) => r.slug));

  const products = [
    // ── Mobile Apps ──
    { name: "Expense Tracker Pro", slug: "expense-tracker-pro", shortDesc: "Full-featured expense tracking mobile app template — ready to brand and publish.", desc: "A complete React Native mobile app template for tracking daily expenses, managing budgets, and generating spending reports.\n\n• Add/Edit/Delete expenses by category\n• Monthly and yearly spending reports\n• Budget management with alerts\n• Dark mode & light mode\n• Export to CSV", type: "READY_MADE", cat: "mobile-apps", price: 2499, discount: 1499, featured: 1, best: 1, delivery: "download" },
    { name: "Flutter Business Dashboard", slug: "flutter-business-dashboard", shortDesc: "Flutter-based business dashboard with analytics, charts, and team management.", desc: "A powerful Flutter dashboard template for managing business metrics on the go.\n\n• Real-time analytics & charts\n• Team management module\n• Sales & revenue tracking\n• Customer database\n• Cross-platform (iOS + Android)", type: "READY_MADE", cat: "mobile-apps", price: 3499, discount: 2499, featured: 1, best: 1, delivery: "download" },
    { name: "Food Delivery App Template", slug: "food-delivery-app", shortDesc: "Complete food delivery app template with user, restaurant, and admin panels.", desc: "A full-stack food delivery app template built with Flutter & Node.js.\n\n• User app with order tracking\n• Restaurant dashboard\n• Admin panel\n• Push notifications\n• Payment integration", type: "READY_MADE", cat: "mobile-apps", price: 4999, discount: 3499, featured: 1, delivery: "download" },
    { name: "Custom Android/iOS App", slug: "custom-mobile-app", shortDesc: "Get a custom mobile app built for your business — React Native or Flutter.", desc: "We build custom mobile applications tailored to your business needs.\n\n• Requirements gathering & UI/UX design\n• React Native or Flutter development\n• API integration\n• App store submission assistance\n• 30 days post-launch support", type: "PREBOOK", cat: "mobile-apps", price: 25000, discount: null, featured: 1, delivery: "manual" },

    // ── Desktop Software ──
    { name: "Invoice Generator — PDF Tool", slug: "invoice-generator-pdf", shortDesc: "Desktop app to create, save and print professional invoices instantly.", desc: "A lightweight Windows/macOS desktop app built with Electron.\n\n• Customizable invoice templates\n• Add your logo, business info, and tax details\n• Save as PDF or print directly\n• Track invoice history\n• Multi-currency support", type: "READY_MADE", cat: "desktop-software", price: 1999, discount: 999, featured: 1, delivery: "download" },
    { name: "Invoice Tracker — Excel Template", slug: "invoice-tracker-excel", shortDesc: "Smart Excel workbook to track invoices, payments, and outstanding dues.", desc: "A powerful Excel template for freelancers and small businesses.\n\n• Track invoices sent and received\n• Auto-calculate totals and GST\n• Payment status dashboard\n• Monthly summary charts\n• Works on Excel 2016+ and Google Sheets", type: "READY_MADE", cat: "desktop-software", price: 799, discount: 499, delivery: "download" },
    { name: "Billing & Inventory System", slug: "billing-inventory-system", shortDesc: "Complete desktop billing and inventory management system for retail shops.", desc: "A full-featured desktop application for managing sales, inventory, and billing.\n\n• POS billing interface\n• Stock management with low-stock alerts\n• Purchase order management\n• Sales reports & analytics\n• GST invoice generation\n• Supplier & customer database", type: "READY_MADE", cat: "desktop-software", price: 5999, discount: 3999, featured: 1, best: 1, delivery: "download" },

    // ── Design & Branding ──
    { name: "Logo & Brand Identity Design", slug: "logo-brand-identity", shortDesc: "Professional logo design + brand kit (business cards, social graphics).", desc: "Complete brand identity package for your business.\n\n• 3 unique logo concepts\n• 2 rounds of revisions\n• Business card design\n• Social media profile graphics\n• Brand color palette & font guide\n• Final files in PNG, SVG, PDF", type: "PREBOOK", cat: "design-branding", price: 8000, discount: null, featured: 1, best: 1, delivery: "manual" },
    { name: "Social Media Post Templates", slug: "social-media-templates", shortDesc: "10 ready-to-use Instagram & Facebook post templates (Figma).", desc: "A set of 10 beautifully designed social media post templates.\n\n• Editable in Figma (free account)\n• 1080×1080 px square format\n• Includes stories template\n• Pastel, bold, and minimal styles\n• Free download", type: "FREE", cat: "design-branding", price: 0, discount: null, delivery: "download" },
    { name: "Brand Style Guide Template", slug: "brand-style-guide", shortDesc: "Professional brand style guide template in PDF & Figma formats.", desc: "A comprehensive brand style guide template to document your brand identity.\n\n• Logo usage guidelines\n• Color palette documentation\n• Typography specifications\n• Brand voice & tone guide\n• Print & digital applications", type: "READY_MADE", cat: "design-branding", price: 1499, discount: 999, delivery: "download" },

    // ── E-books & PDFs ──
    { name: "Minimal Resume Template", slug: "minimal-resume-template", shortDesc: "Clean, ATS-friendly resume template in PDF & DOCX formats.", desc: "Professionally designed minimal resume template.\n\n• ATS-friendly layout\n• Available in PDF and DOCX\n• Easy to edit in Word or Google Docs\n• One-page and two-page variants included\n• Free for personal and commercial use", type: "FREE", cat: "ebooks-pdfs", price: 0, discount: null, delivery: "download" },
    { name: "Business Plan Template", slug: "business-plan-template", shortDesc: "Comprehensive business plan template with financial projections.", desc: "A detailed business plan template for startups and established businesses.\n\n• Executive summary section\n• Market analysis framework\n• Financial projection worksheets\n• Pitch deck outline\n• Investor-ready format", type: "READY_MADE", cat: "ebooks-pdfs", price: 999, discount: 599, delivery: "download" },
    { name: "Digital Marketing Guide", slug: "digital-marketing-guide", shortDesc: "Complete digital marketing strategy guide with actionable frameworks.", desc: "An all-in-one digital marketing guide for business owners.\n\n• SEO fundamentals\n• Social media strategy\n• Email marketing playbook\n• Content marketing frameworks\n• Analytics & KPI tracking", type: "READY_MADE", cat: "ebooks-pdfs", price: 499, discount: 299, delivery: "download" },

    // ── Web Development ──
    { name: "Professional Website Design", slug: "professional-website-design", shortDesc: "Custom website design & development — business, portfolio, or e-commerce.", desc: "Get a stunning, high-performance website built for your brand.\n\n• Modern, responsive design\n• SEO-optimized structure\n• Fast loading & mobile-first\n• CMS integration (optional)\n• Contact forms & Google Maps", type: "PREBOOK", cat: "web-development", price: 15000, discount: null, featured: 1, delivery: "manual" },
    { name: "E-Commerce Store Setup", slug: "ecommerce-store-setup", shortDesc: "Fully functional e-commerce store with payment gateway integration.", desc: "Complete e-commerce solution tailored to your products.\n\n• Product catalog management\n• Shopping cart & checkout\n• Razorpay / PayPal integration\n• Order tracking dashboard\n• Mobile-responsive design", type: "CUSTOM_QUOTE", cat: "web-development", price: 0, discount: null, delivery: "contact" },
    { name: "Next.js Portfolio Template", slug: "nextjs-portfolio-template", shortDesc: "Modern portfolio website template built with Next.js and Tailwind CSS.", desc: "A premium portfolio template for creative professionals.\n\n• Built with Next.js 15 & Tailwind CSS\n• Dark/light theme\n• Project showcase with filtering\n• Blog section included\n• SEO optimized\n• Fully responsive", type: "READY_MADE", cat: "web-development", price: 1999, discount: 1299, featured: 1, delivery: "download" },
    { name: "Admin Dashboard Template", slug: "admin-dashboard-template", shortDesc: "Complete admin dashboard template with analytics, tables, and charts.", desc: "A production-ready admin dashboard template.\n\n• Built with React & Tailwind\n• Analytics dashboard\n• User management UI\n• Data tables with filtering\n• Multiple chart types\n• Dark & light mode", type: "READY_MADE", cat: "web-development", price: 2499, discount: 1799, featured: 1, delivery: "download" },
    { name: "Hostel Management System", slug: "hostel-management-system", shortDesc: "Complete web-based hostel management system with room booking and billing.", desc: "A full-featured hostel management web application.\n\n• Room allocation & tracking\n• Student database management\n• Fee collection & receipts\n• Staff management module\n• Dashboard with analytics\n• Complaint management", type: "READY_MADE", cat: "web-development", price: 9999, discount: 6999, featured: 1, best: 1, delivery: "download" },
    { name: "Hospital Management System", slug: "hospital-management-system", shortDesc: "Complete hospital management system with patient records and appointments.", desc: "A comprehensive hospital management web application.\n\n• Patient registration & history\n• Appointment scheduling\n• Doctor & staff management\n• Pharmacy inventory\n• Billing & insurance processing\n• Lab report management", type: "READY_MADE", cat: "web-development", price: 14999, discount: 9999, featured: 1, best: 1, delivery: "download" },

    // ── Social Media ──
    { name: "Ultimate Notion Dashboard", slug: "ultimate-notion-dashboard", shortDesc: "All-in-one Notion template for personal productivity & project management.", desc: "Comprehensive Notion dashboard template.\n\n• Task & project management\n• Habit tracker\n• Goal setting with OKRs\n• Finance tracker\n• Content calendar\n• Journal & notes", type: "FREE", cat: "social-media", price: 0, discount: null, delivery: "download" },
    { name: "Instagram Carousel Templates", slug: "instagram-carousel-templates", shortDesc: "20 editable Instagram carousel templates in Canva format.", desc: "Eye-catching Instagram carousel templates for content creators.\n\n• 20 unique designs\n• Editable in Canva (free)\n• Includes story highlights\n• Brand color customization\n• Ready-to-post format", type: "READY_MADE", cat: "social-media", price: 499, discount: 299, delivery: "download" },
  ];

  let count = 0;
  for (const p of products) {
    if (existingSlugs.has(p.slug)) {
      console.log(`  ⏩ Skipping existing: ${p.name}`);
      continue;
    }

    const catId = catMap[p.cat] || null;
    const now = new Date().toISOString();

    const result = await db.execute({
      sql: `INSERT INTO products (name, slug, short_description, description, product_type, category_id, price, discount_price, advance_percentage, pricing_model, status, featured, best_seller, delivery_method, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 30, 'fixed', 'published', ?, ?, ?, ?, ?) RETURNING id`,
      args: [p.name, p.slug, p.shortDesc, p.desc, p.type, catId, p.price, p.discount, p.featured || 0, p.best || 0, p.delivery, now, now],
    });

    const prodId = result.rows[0].id;
    console.log(`  ✅ Created: ${p.name} (₹${p.price})`);

    if (p.type === "FREE") {
      await db.execute({
        sql: "INSERT INTO product_features (product_id, feature, sort_order) VALUES (?, ?, ?)",
        args: [prodId, "Free download", 0],
      });
    }

    count++;
  }

  console.log(`\n✨ Done! ${count} new products added.`);
}

seed().catch((e) => { console.error("Seed failed:", e); process.exit(1); });
