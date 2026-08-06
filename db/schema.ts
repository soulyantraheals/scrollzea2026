// db/schema.ts - Complete database schema for Scrollzea
import { sqliteTable, text, integer, real, uniqueIndex } from "drizzle-orm/sqlite-core";

// Admin Users
export const adminUsers = sqliteTable("admin_users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("admin"),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Customers (user accounts)
export const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  phone: text("phone"),
  isGuest: integer("is_guest").notNull().default(1),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Categories
export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  imageUrl: text("image_url"),
  parentId: integer("parent_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").notNull().default("active"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Products
export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  shortDescription: text("short_description"),
  description: text("description"),
  productType: text("product_type", { enum: ["READY_MADE", "FREE", "PREBOOK", "CUSTOM_QUOTE"] }).notNull(),
  categoryId: integer("category_id"),
  price: real("price").notNull().default(0),
  discountPrice: real("discount_price"),
  advancePercentage: real("advance_percentage").notNull().default(30),
  pricingModel: text("pricing_model", { enum: ["fixed", "starting_at", "custom_quote"] }).notNull().default("fixed"),
  status: text("status", { enum: ["draft", "published", "archived"] }).notNull().default("draft"),
  featured: integer("featured").notNull().default(0),
  bestSeller: integer("best_seller").notNull().default(0),
  leadCaptureRequired: integer("lead_capture_required").notNull().default(0),
  downloadUrl: text("download_url"),
  deliveryMethod: text("delivery_method", { enum: ["download", "external_link", "manual", "contact"] }).notNull().default("manual"),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  whatsappMessage: text("whatsapp_message"),

  // Pricing & Offer
  originalPrice: real("original_price"),
  salePrice: real("sale_price"),
  currency: text("currency").notNull().default("INR"),
  showLimitedOffer: integer("show_limited_offer").notNull().default(0),
  offerLabel: text("offer_label").notNull().default("Limited Time Offer"),
  paymentDescription: text("payment_description").notNull().default("One-time payment · Lifetime access · No subscriptions"),
  ctaText: text("cta_text").notNull().default("Get Instant Access Now"),
  socialProofText: text("social_proof_text").notNull().default("Join 50,000+ satisfied customers"),

  // Urgency / Countdown
  urgencyEnabled: integer("urgency_enabled").notNull().default(0),
  showFireSymbol: integer("show_fire_symbol").notNull().default(1),
  urgencyText: text("urgency_text").notNull().default("Hurry! Offer Ends In"),
  expiresAt: text("expires_at"),

  // YouTube Video
  youtubeEnabled: integer("youtube_enabled").notNull().default(0),
  youtubeUrl: text("youtube_url"),
  youtubeButtonText: text("youtube_button_text").notNull().default("Watch YouTube Video"),
  youtubeVideoTitle: text("youtube_video_title"),

  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Product Images
export const productImages = sqliteTable("product_images", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  imageUrl: text("image_url").notNull(),
  isPrimary: integer("is_primary").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Product Features
export const productFeatures = sqliteTable("product_features", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  feature: text("feature").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled").notNull().default(1),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Payment Options
export const paymentOptions = sqliteTable("payment_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  provider: text("provider", { enum: ["RAZORPAY", "PAYPAL", "WHATSAPP"] }).notNull(),
  paymentUrl: text("payment_url"),
  enabled: integer("enabled").notNull().default(1),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Leads
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  purpose: text("purpose"),
  category: text("category"),
  productId: integer("product_id"),
  productName: text("product_name"),
  message: text("message"),
  source: text("source"),
  status: text("status", { enum: ["new", "contacted", "qualified", "converted", "closed", "spam"] }).notNull().default("new"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Orders
export const orders = sqliteTable("orders", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  orderNumber: text("order_number").notNull().unique(),
  customerId: integer("customer_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  productId: integer("product_id").notNull(),
  productName: text("product_name").notNull(),
  totalAmount: real("total_amount").notNull(),
  advanceAmount: real("advance_amount").default(0),
  remainingAmount: real("remaining_amount").default(0),
  paymentProvider: text("payment_provider"),
  paymentReference: text("payment_reference"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  orderStatus: text("order_status", { enum: ["pending", "paid", "processing", "completed", "cancelled"] }).notNull().default("pending"),
  isPrebook: integer("is_prebook").notNull().default(0),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Custom Projects
export const customProjects = sqliteTable("custom_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  leadId: integer("lead_id"),
  productId: integer("product_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  totalPrice: real("total_price").notNull(),
  advancePercentage: real("advance_percentage").notNull().default(30),
  advanceAmount: real("advance_amount").notNull(),
  amountPaid: real("amount_paid").notNull().default(0),
  remainingAmount: real("remaining_amount").notNull(),
  paymentProvider: text("payment_provider"),
  paymentReference: text("payment_reference"),
  paymentStatus: text("payment_status", { enum: ["pending", "paid", "failed", "refunded"] }).notNull().default("pending"),
  projectStatus: text("project_status", { enum: ["pre_booked", "requirements_pending", "in_progress", "review", "completed", "cancelled"] }).notNull().default("pre_booked"),
  customerNotes: text("customer_notes"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Favorites
export const favorites = sqliteTable("favorites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  customerId: integer("customer_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: text("created_at").notNull().default("datetime('now')"),
}, (table) => ({
  uniqueFav: uniqueIndex("unique_fav").on(table.customerId, table.productId),
}));

// Click Events (Analytics)
export const clickEvents = sqliteTable("click_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id"),
  productName: text("product_name"),
  eventType: text("event_type", {
    enum: ["razorpay_click", "paypal_click", "whatsapp_click", "download_click", "view_detail", "share"],
  }).notNull(),
  source: text("source"),
  referrer: text("referrer"),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Website Settings
export const websiteSettings = sqliteTable("website_settings", {
  key: text("key").primaryKey(),
  value: text("value"),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// Chatbot Settings
export const chatbotSettings = sqliteTable("chatbot_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default("datetime('now')"),
});

// FAQs
export const faqs = sqliteTable("faqs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id"),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  enabled: integer("enabled").notNull().default(1),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Product Reviews
export const productReviews = sqliteTable("product_reviews", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  customerName: text("customer_name").notNull(),
  company: text("company"),
  rating: integer("rating").notNull().default(5),
  reviewText: text("review_text").notNull(),
  enabled: integer("enabled").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});

// Perfect For
export const productPerfectFor = sqliteTable("product_perfect_for", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  enabled: integer("enabled").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});
