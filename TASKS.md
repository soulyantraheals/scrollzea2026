# 📋 Scrollzea — Project Tasks & Guide

> **Scrollzea** — Digital Products & Creative Digital Solutions Platform
> Kolkata, West Bengal, India

---

## 📑 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Business Model Summary](#2-business-model-summary)
3. [File Structure & What Each Part Does](#3-file-structure--what-each-part-does)
4. [Admin Guide: How to Run Your Business](#4-admin-guide-how-to-run-your-business)
5. [Product Types Explained](#5-product-types-explained)
6. [Payment Configuration Guide](#6-payment-configuration-guide)
7. [Analytics & Performance Tracking](#7-analytics--performance-tracking)
8. [Database Schema Reference (Plain English)](#8-database-schema-reference-plain-english)
9. [How to Deploy (GitHub → Vercel)](#9-how-to-deploy-github--vercel)
10. [How to Modify the Project Later](#10-how-to-modify-the-project-later)
11. [How to Migrate to PostgreSQL](#11-how-to-migrate-to-postgresql)
12. [Troubleshooting](#12-troubleshooting)
13. [Future Feature Ideas](#13-future-feature-ideas)

---

## 1. Project Overview

Scrollzea is a complete digital business platform built with:

- **Frontend & Backend:** Next.js 15 (single app — both website and admin panel)
- **Database:** Turso (serverless SQLite, free 9GB storage)
- **ORM:** Drizzle ORM (makes future PostgreSQL migration easy)
- **Authentication:** NextAuth.js v5 (admin login + customer accounts)
- **Image Storage:** Uploadthing (free 2GB tier)
- **Email:** Resend (free 100 emails/day)
- **Payments:** Razorpay + PayPal (external links, no complex integration)
- **AI Chatbot:** Built-in rule-based (no external API needed — uses your database)
- **Deployment:** GitHub + Vercel (free tier, automatic from Git)

### What Scrollzea Does

| Feature | Description |
|---|---|
| **Sell Digital Products** | Ready-made apps, PDFs, e-books, wallpapers, templates |
| **Give Free Products** | Free resources with optional email/phone capture for leads |
| **Pre-book Custom Services** | Website dev, app dev, logo design — with 30% advance |
| **Capture Leads** | Contact form, service enquiries, freebie downloads |
| **Customer Accounts** | Users can register, save favorites, view order history |
| **Guest Checkout** | Buy without creating an account |
| **Admin Panel** | Full product, category, lead, order, and settings management |
| **Analytics Dashboard** | See clicks, sales, best/worst products, conversion rates |
| **AI Chatbot** | Answers customer questions using live product data |
| **Email Notifications** | New lead alerts sent to srollzea@gmail.com |

---

## 2. Business Model Summary

Scrollzea has **4 product types**:

### 🔵 READY_MADE (Ready-to-buy digital products)
- Customer browses → buys → gets product
- Price: any amount (including ₹0 for free)
- Example: Android app, PDF guide, wallpaper pack

### 🟢 FREE (Free digital products)
- Price is always ₹0
- Optional: collect customer name/email/phone before download
- Example: Free PDF, free template, free wallpaper

### 🟡 PREBOOK (Custom services with advance)
- Customer sees total price + 30% advance required
- Pays advance → lead created → admin contacts customer
- Example: Website development, logo design, custom app

### 🟠 CUSTOM_QUOTE (Services with flexible pricing)
- Shows "Request a Quote" instead of a fixed price
- Customer fills form → lead created → admin discusses pricing
- Example: Complex custom software, large projects

---

## 3. File Structure & What Each Part Does

```
scrollzea/
│
├── app/                          # 👉 THIS IS THE MAIN APPLICATION
│   │
│   ├── (public)/                 # Public website pages (customers see these)
│   │   ├── page.tsx              # HOMEPAGE — hero, categories, products, sections
│   │   ├── products/             # Product listing + detail pages
│   │   ├── categories/           # Category browsing
│   │   ├── freebies/             # Free products listing
│   │   ├── services/             # Custom services listing
│   │   ├── about/                # About Scrollzea page
│   │   ├── contact/              # Contact form page
│   │   ├── auth/                 # Customer login/register pages
│   │   ├── account/              # Customer account (favorites, orders)
│   │   ├── privacy/              # Privacy policy page
│   │   ├── terms/                # Terms & conditions page
│   │   ├── refund/               # Refund policy page
│   │   └── layout.tsx            # Public website layout (header + footer)
│   │
│   ├── admin/                    # 👉 ADMIN PANEL (protected, login required)
│   │   ├── page.tsx              # DASHBOARD — stats, charts, recent data
│   │   ├── login/                # Admin login page
│   │   ├── products/             # Product management (add/edit/delete)
│   │   ├── categories/           # Category management
│   │   ├── leads/                # Lead management (view/filter/update status)
│   │   ├── orders/               # Order management
│   │   ├── projects/             # Custom project tracking
│   │   ├── customers/            # Customer list
│   │   ├── settings/             # Website settings editor
│   │   ├── chatbot/              # AI chatbot configuration
│   │   └── analytics/            # Click tracking & performance reports
│   │
│   └── api/                      # 👉 API ROUTES (server-side only, never in browser)
│       ├── auth/                 # NextAuth authentication endpoints
│       ├── products/             # Product data API
│       ├── categories/           # Category data API
│       ├── contact/              # Contact form submission
│       ├── chatbot/              # AI chatbot message processing
│       ├── track/                # Click tracking + download tracking
│       ├── admin/                # Admin CRUD operations
│       └── uploadthing/          # File upload endpoint
│
├── components/                   # 👉 REUSABLE COMPONENTS
│   ├── ui/                       # Basic UI pieces (buttons, cards, inputs, etc.)
│   ├── public/                   # Public website components (product cards, sections)
│   └── admin/                    # Admin panel components (tables, forms, charts)
│
├── lib/                          # 👉 CORE LIBRARIES & CONFIG
│   ├── db.ts                     # Database connection (Turso)
│   ├── auth.ts                   # NextAuth configuration
│   ├── email.ts                  # Email sending (Resend)
│   └── utils.ts                  # Helper functions
│
├── db/                           # 👉 DATABASE SCHEMA & MIGRATIONS
│   └── schema.ts                 # All database table definitions (Drizzle)
│
├── public/                       # Static files (favicon, robots.txt, etc.)
│
├── middleware.ts                  # 👉 SECURITY — protects /admin routes
├── next.config.ts                 # Next.js configuration
├── tailwind.config.ts             # Styling configuration
├── package.json                   # Dependencies & scripts
├── .env.example                   # Required environment variables (copy to .env)
├── tsconfig.json                  # TypeScript configuration
│
├── TASKS.md                      # 👈 THIS FILE — project guide
├── README.md                     # Quick-start readme
├── ARCHITECTURE.md               # Technical architecture overview
├── DEVELOPMENT.md                # Developer setup guide
│
└── docs/                         # Documentation
    └── superpowers/
        └── specs/                # Design specifications
```

---

## 4. Admin Guide: How to Run Your Business

### 4.1 Accessing the Admin Panel

1. Go to `https://scrollzea.vercel.app/admin`
2. Log in with your admin email and password
3. You'll see the **Dashboard** with stats

### 4.2 Adding a New Product

```
Admin → Products → "Add New Product"
```

**Step 1: Basic Information**
- **Product Name** — e.g., "Premium Logo Design Pro"
- **Slug** — URL-friendly version (auto-generated, you can edit it)
  - Example: `premium-logo-design-pro`
- **Short Description** — Quick summary (shows on product cards)
- **Full Description** — Detailed product info
- **Category** — Select from existing categories
- **Product Type** — Choose: READY_MADE / FREE / PREBOOK / CUSTOM_QUOTE

**Step 2: Pricing**
- **Price** — Set your price (₹0 for free products)
- **Discount Price** — Optional sale/discounted price (leave blank if none)
- **Pricing Model** — fixed / starting_at / custom_quote
- **Advance Percentage** — Default 30% (for PREBOOK products)

**Step 3: Images**
- Upload main product image
- Add additional gallery images if needed

**Step 4: Payment Options**
- Check which payment methods to enable:
  - ☐ Razorpay → Enter Razorpay payment link
  - ☐ PayPal → Enter PayPal payment link
  - ☐ WhatsApp → Enter WhatsApp number/URL
- You can select ANY combination (1, 2, or all 3)

**Step 5: Visibility**
- ☑ Published — Makes product visible on website
- ☑ Featured — Shows on homepage featured section
- ☑ Best Seller — Marks as best seller
- ☑ Lead Capture Required — For free products, show form before download

**Step 6: Delivery**
- Choose delivery method: download / external_link / manual / contact

**Step 7: SEO**
- SEO Title — Custom browser tab title
- SEO Description — Custom search result description

**Step 8:** Click **Save** — product appears on website immediately.

### 4.3 Editing a Product

```
Admin → Products → Click product name or "Edit" button
```
Make changes and click **Save**. Changes reflect on website immediately.

### 4.4 Deleting a Product

```
Admin → Products → Click delete icon → Confirm
```
⚠️ This permanently removes the product and its images.

### 4.5 Managing Categories

```
Admin → Categories
```
- **Add Category** — Name, slug, description, icon
- **Edit Category** — Change name, reorder, enable/disable
- **Delete Category** — Only if no products are using it

### 4.6 Viewing Leads

```
Admin → Leads
```
Leads come from:
- Contact form submissions
- Free product downloads (if lead capture is enabled)
- Pre-book enquiries
- Custom quote requests

**Lead Statuses:**
| Status | Meaning |
|---|---|
| **New** | Fresh lead, not yet contacted |
| **Contacted** | You've reached out to them |
| **Qualified** | They're interested, viable customer |
| **Converted** | They became a customer |
| **Closed** | No further action needed |
| **Spam** | Fake/bot submission |

**Actions:**
- Click lead to view full details
- Change status using dropdown
- Add internal notes (only you see these)
- Delete spam leads

### 4.7 Managing Orders

```
Admin → Orders
```
Shows all completed purchases. You can:
- View order details
- Update payment status (pending/paid/failed/refunded)
- Update order status (pending/processing/completed/cancelled)

### 4.8 Custom Projects

```
Admin → Projects
```
For PREBOOK services. Shows:
- Customer details
- Total price, advance paid, remaining amount
- Project status (pre_booked → requirements_pending → in_progress → review → completed)
- Update status as project progresses
- Add internal notes

### 4.9 Updating Website Settings

```
Admin → Settings
```

**What you can change without any coding:**
| Setting | What It Does |
|---|---|
| Site Name | Your business name everywhere on the site |
| Site Description | Tagline shown in footer and SEO |
| Business Email | srollzea@gmail.com |
| Business Location | Kolkata, West Bengal, India |
| Facebook URL | Link to your Facebook page |
| Instagram URL | Link to your Instagram |
| WhatsApp Number | Default WhatsApp contact |
| Default Advance % | 30% for pre-book products |
| Lead Notification Email | Where new lead emails go |
| Meta Title | Browser tab title / SEO |
| Meta Description | SEO description |
| Footer Copyright | Copyright text in footer |
| AI Chatbot Enable | Turn chatbot on/off |
| AI Welcome Message | Chatbot's first message |

### 4.10 Configuring the AI Chatbot

```
Admin → Chatbot
```
- Enable/disable the chatbot
- Edit the welcome message
- The chatbot automatically uses your latest product data from the database
- No coding needed to update what the AI knows

### 4.11 Viewing Analytics

```
Admin → Analytics
```

**What you can see:**
| Section | What It Shows |
|---|---|
| **Overview** | Total clicks, sales, leads, revenue |
| **Top Products** | Best performing products by clicks and sales |
| **Bottom Products** | Products with 0 clicks/sales — helps decide what to improve or remove |
| **Clicks by Method** | How many people clicked Razorpay vs PayPal vs WhatsApp |
| **Clicks Over Time** | Line chart showing daily/weekly click trends |
| **Conversion Rate** | What % of clicks turn into sales or leads per product |
| **Sales Report** | Revenue, order count, average order value |

> 💡 **Tip:** Check "Bottom Products" regularly. If a product has 0 clicks after weeks, consider:
> - Improving its thumbnail/name
> - Lowering the price
> - Moving it to "Featured"
> - Removing it if it's not working

---

## 5. Product Types Explained

### 🟢 READY_MADE — "Buy Now" Button
**Use for:** Products that exist and can be delivered immediately.

| Setting | Value Example |
|---|---|
| Product Type | `READY_MADE` |
| Price | ₹2,999 |
| Payment Options | Razorpay + PayPal |
| CTA Button | "Buy Now" |

**Flow:** Customer clicks Buy Now → sees payment options → clicks Razorpay/PayPal → pays → gets product.

### 🆓 FREE — "Get Free" Button  
**Use for:** Freebies, free PDFs, free wallpapers.

| Setting | Value Example |
|---|---|
| Product Type | `FREE` |
| Price | ₹0 |
| Lead Capture | ON (collects name/email before download) |
| CTA Button | "Get Free" or "Get Free Resource" |

**Flow:** Customer clicks → if lead capture is ON, form appears → fills form → gets download link.

### 🔵 PREBOOK — "Pre-book Now" Button
**Use for:** Custom services requiring 30% advance.

| Setting | Value Example |
|---|---|
| Product Type | `PREBOOK` |
| Price | ₹50,000 |
| Advance % | 30% |
| Payment Options | Razorpay + WhatsApp |
| CTA Button | "Pre-book Now" |

**Flow:** Customer sees product → sees "Total: ₹50,000 | 30% Advance: ₹15,000" → clicks Pre-book Now → pays advance → lead created → you contact them.

### 🟠 CUSTOM_QUOTE — "Request Quote" Button
**Use for:** Services where price varies per project.

| Setting | Value Example |
|---|---|
| Product Type | `CUSTOM_QUOTE` |
| Price | ₹0 (or starting from) |
| Pricing Model | `starting_at` or `custom_quote` |
| CTA Button | "Request a Quote" |

**Flow:** Customer clicks → contact form opens with product pre-selected → you receive lead → discuss price.

---

## 6. Payment Configuration Guide

### Per-Product Payment Setup

Each product can have its own payment configuration. Here's how:

### Razorpay Only
```
Product: Premium PDF Guide
Price: ₹499
☑ Razorpay → Link: https://rzp.io/...
☐ PayPal
☐ WhatsApp
```
Customer sees: **1 button** → "Pay with Razorpay"

### PayPal Only
```
Product: E-book International
Price: $9.99
☐ Razorpay
☑ PayPal → Link: https://paypal.me/...
☐ WhatsApp
```
Customer sees: **1 button** → "Pay with PayPal"

### WhatsApp Only
```
Product: Custom Logo Design
Price: ₹10,000
☐ Razorpay
☐ PayPal
☑ WhatsApp → Link: https://wa.me/...
```
Customer sees: **1 button** → "Chat on WhatsApp"

### All Three Methods
```
Product: Premium Android App
Price: ₹2,999
☑ Razorpay → Link: https://rzp.io/...
☑ PayPal → Link: https://paypal.me/...
☑ WhatsApp → Link: https://wa.me/...
```
Customer sees: **3 buttons** → "Pay with Razorpay" / "Pay with PayPal" / "Chat on WhatsApp"

### How to Get Payment Links

**Razorpay:**
1. Log in to razorpay.com
2. Go to Payment Links → Create Payment Link
3. Set amount, description
4. Copy the link → paste in admin panel

**PayPal:**
1. Log in to paypal.com
2. Create a payment link or PayPal.Me link
3. Copy → paste in admin panel

**WhatsApp:**
```
https://wa.me/91XXXXXXXXXX?text=Hello%20Scrollzea%2C%20I%20am%20interested%20in...
```
Replace `91XXXXXXXXXX` with your WhatsApp number (with country code).

---

## 7. Analytics & Performance Tracking

### How Click Tracking Works

When a customer clicks "Pay with Razorpay" (or any payment button):
1. The click is **logged in the database** (product, payment method, timestamp)
2. Then the customer is **redirected** to the actual payment page

This means we count every click without interfering with the payment.

### What Gets Tracked

| Event | When It Happens |
|---|---|
| `razorpay_click` | Customer clicked Razorpay button |
| `paypal_click` | Customer clicked PayPal button |
| `whatsapp_click` | Customer clicked WhatsApp button |
| `download_click` | Customer downloaded a free product |
| `view_detail` | Customer viewed a product detail page |

### How to Use Analytics Data

**Find your best products:**
```
Admin → Analytics → Top Products
```
→ Shows which products get the most clicks and sales
→ 🔥 Make more products like these!

**Find underperformers:**
```
Admin → Analytics → Bottom Products
```
→ Shows products with 0 clicks and 0 sales
→ Either improve them or remove them

**Understand payment preference:**
```
Admin → Analytics → Clicks by Method
```
→ Shows whether customers prefer Razorpay, PayPal, or WhatsApp
→ Helps you focus on the right payment options

**Track trends:**
```
Admin → Analytics → Clicks Over Time
```
→ Line chart shows if your business is growing week over week

---

## 8. Database Schema Reference (Plain English)

Your data is stored in these tables. Think of them as Excel sheets:

### 📦 Products Table
Each row = one product. Stores: name, price, type, description, images, status.

### 📂 Categories Table
Each row = one category. Stores: name, description, sort order.

### 🖼️ Product Images Table
Each row = one image linked to a product. Multiple images per product.

### 💳 Payment Options Table
Each row = one payment method for one product (Razorpay/PayPal/WhatsApp + the link).

### 👤 Customers Table
Each row = one customer who registered an account. Stores: name, email, password (hashed).

### ❤️ Favorites Table
Each row = one customer's favorite product. Links customer_id to product_id.

### 📋 Orders Table
Each row = one order/purchase. Stores: product, customer, amount, payment status.

### 📝 Leads Table
Each row = one contact form submission or service enquiry. Stores: name, email, message, status.

### 🏗️ Custom Projects Table
Each row = one pre-booked service project. Stores: advance amount, remaining, project status.

### 👆 Click Events Table
Each row = one click on a payment/download button. Stores: product, event type, timestamp.

### ⚙️ Website Settings Table
Each row = one configuration setting (key + value). Stores: site name, social links, etc.

---

## 9. How to Deploy (GitHub → Vercel)

### First Time Setup

**Step 1: Create GitHub Repository**
1. Go to github.com → New Repository
2. Name: `scrollzea`
3. Private repository
4. Don't initialize with README

**Step 2: Push Code to GitHub**
```bash
cd scrollzea
git init
git add .
git commit -m "Initial commit - Scrollzea digital products platform"
git remote add origin https://github.com/YOUR_USERNAME/scrollzea.git
git push -u origin main
```

**Step 3: Set Up Turso Database**
1. Sign up at turso.tech (free tier)
2. Install Turso CLI: `npm install -g @libsql/cli`
3. Create database: `turso db create scrollzea`
4. Get database URL: `turso db show scrollzea`
5. Generate auth token: `turso db tokens create scrollzea`
6. Run migrations: `npm run db:push`

**Step 4: Set Up Uploadthing**
1. Sign up at uploadthing.com (free tier)
2. Create a new app
3. Copy App ID and Secret

**Step 5: Set Up Resend**
1. Sign up at resend.com (free tier)
2. Verify your domain
3. Get API key

**Step 6: Deploy to Vercel**
1. Go to vercel.com → Add New Project
2. Import your GitHub repository (scrollzea)
3. Add environment variables (see .env.example)
4. Deploy! 🚀

**Step 7: Create Admin Account**
1. Visit your deployed site
2. Go to `/api/setup` (first visit only — creates admin account)
3. Log in at `/admin/login`

### Updating After Changes
```bash
git add .
git commit -m "Description of changes"
git push
```
Vercel automatically deploys the new version! ✅

---

## 10. How to Modify the Project Later

### 10.1 Changing Website Colors/Design
Edit `tailwind.config.ts` or update CSS variables in `app/globals.css`.

### 10.2 Adding a New Public Page
1. Create folder in `app/(public)/[page-name]/`
2. Create `page.tsx` file
3. Add link in navigation (edit components in `components/public/`)

### 10.3 Adding a New Product Type
1. Add new type to `product_type` enum in `db/schema.ts`
2. Add its CTA logic in the product card component
3. Run `npm run db:push` to update database

### 10.4 Adding a New Field to Products
1. Add column in `db/schema.ts` products table
2. Add form field in `components/admin/ProductForm.tsx`
3. Display on product page
4. Run `npm run db:push`

### 10.5 Adding a New Admin Setting
1. Add key in website_settings table via admin panel (Settings page)
2. Use `getSetting('key_name')` function to read it anywhere in the app

### 10.6 Changing the AI Chatbot Behavior
Edit the chatbot logic in `app/api/chatbot/route.ts`:
- Add new intent patterns
- Change response formats
- Add new data sources

---

## 11. How to Migrate to PostgreSQL

When Scrollzea grows and you need more power:

1. **Create a Neon database** (neon.tech — free tier available)
2. **Update lib/db.ts** to use `@neondatabase/serverless` instead of `@libsql/client`
3. **Drizzle handles the rest** — same schema, same queries
4. **Run:** `npm run db:push` to create tables in PostgreSQL
5. **Export data** from Turso, import to Neon
6. **Update .env** with new database URL
7. **Deploy** — done! ✅

**No code changes needed** because Drizzle ORM abstracts the database differences.

---

## 12. Troubleshooting

### Website Shows Blank/Error
- Check Vercel deployment logs
- Verify environment variables are set in Vercel dashboard
- Run `npm run build` locally to check for errors

### Admin Login Not Working
- Check `AUTH_SECRET` environment variable
- Ensure admin account exists in database
- Check database connection

### Images Not Showing
- Verify Uploadthing keys in environment
- Check if image URL is stored correctly in database
- Try re-uploading the image

### Contact Form Not Sending Email
- Verify Resend API key
- Check spam folder at srollzea@gmail.com
- Test with `npm run dev` locally

### Products Not Appearing on Website
- Check if product status is "published"
- Check if product has a category assigned
- Check database connection

### AI Chatbot Not Responding
- Verify chatbot is enabled in Admin → Chatbot Settings
- Check if products exist in database (chatbot uses product data)
- Try refreshing the page

### Analytics Showing No Data
- Click tracking only works after customers click buttons
- Visit your own site and click some buttons to generate test data
- Verify `click_events` table exists

### Database Connection Issues
- Run `turso db show scrollzea` to check database status
- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in .env
- Check if you've exceeded free tier limits

---

## 13. Future Feature Ideas

Ready to add when you want:

| Feature | Complexity | Benefit |
|---|---|---|
| ✅ Coupon/Discount Codes | Medium | Promotions & marketing |
| ✅ Customer Reviews | Medium | Social proof, trust |
| ✅ WhatsApp Order Notifications | Easy | Real-time alerts |
| ✅ Blog/CMS | Medium | SEO content marketing |
| ✅ Newsletter Signup | Easy | Email marketing list |
| ✅ Multi-language Support | Hard | Reach non-English customers |
| ✅ Digital File Delivery via Email | Easy | Automated product delivery |
| ✅ Affiliate/Referral System | Hard | Customer acquisition |
| ✅ GST Invoice Generation | Medium | Legal compliance |
| ✅ Abandoned Cart Recovery | Medium | Recover lost sales |
| ✅ SMS Notifications | Medium | Higher open rates |

---

> **💡 Need Help?**
> - **Email:** srollzea@gmail.com
> - **Location:** Kolkata, West Bengal, India
> - **GitHub:** Your private repository
> - **Vercel:** Deployment dashboard
