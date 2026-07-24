# Scrollzea Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans

**Goal:** Transform existing business-platform into a complete digital products marketplace called Scrollzea

**Architecture:** Single Next.js 15 App Router application merging public website + admin panel, with Turso/LibSQL database via Drizzle ORM, Uploadthing for images, Resend for email, NextAuth for auth

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, Turso (LibSQL), Drizzle ORM, NextAuth.js v5, Uploadthing, Resend, Lucide React

## Global Constraints
- Folder: `/c/Users/nn/scrollzea/`
- NO Firebase, NO PostgreSQL, NO Redis, NO MinIO, NO Go backend, NO Docker
- All admin operations must work without touching source code
- Prices, products, categories, settings all from database — never hardcoded
- All secrets server-side only (no NEXT_PUBLIC_ for API keys)
- Mobile-first responsive design
- Guest checkout + customer accounts
- Click tracking for analytics
- AI chatbot using live product data (no external LLM API)

---

## File Structure

```
scrollzea/
├── app/
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Homepage
│   ├── (public)/
│   │   ├── layout.tsx                # Public layout (header + footer)
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── categories/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── freebies/page.tsx
│   │   ├── services/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── account/
│   │   │   ├── favorites/page.tsx
│   │   │   └── orders/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── refund/page.tsx
│   ├── admin/
│   │   ├── layout.tsx                # Admin layout (sidebar + header)
│   │   ├── page.tsx                  # Dashboard
│   │   ├── login/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── categories/
│   │   │   └── page.tsx
│   │   ├── leads/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── projects/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── settings/page.tsx
│   │   └── analytics/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/route.ts
│   │   ├── products/route.ts
│   │   ├── categories/route.ts
│   │   ├── contact/route.ts
│   │   ├── chatbot/route.ts
│   │   ├── track/
│   │   │   └── click/route.ts
│   │   ├── uploadthing/
│   │   │   └── route.ts
│   │   └── setup/route.ts            # First-time admin setup
│   └── sitemap.ts
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── public/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── MobileNav.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductFilters.tsx
│   │   ├── ProductGallery.tsx
│   │   ├── PaymentOptions.tsx
│   │   ├── PreBookCalculator.tsx
│   │   ├── HeroSection.tsx
│   │   ├── FeaturedCategories.tsx
│   │   ├── BestSellers.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── WhyScrollzea.tsx
│   │   ├── ContactForm.tsx
│   │   ├── LeadCaptureForm.tsx
│   │   └── chatbot/
│   │       ├── ChatbotWidget.tsx
│   │       └── ChatMessage.tsx
│   └── admin/
│       ├── Sidebar.tsx
│       ├── AdminHeader.tsx
│       ├── StatCard.tsx
│       ├── DataTable.tsx
│       ├── ProductForm.tsx
│       ├── CategoryForm.tsx
│       ├── SettingsForm.tsx
│       ├── ImageUploader.tsx
│       └── PaymentOptionsEditor.tsx
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── email.ts
│   ├── chatbot.ts
│   ├── utils.ts
│   └── uploadthing.ts
├── db/
│   └── schema.ts
├── public/
│   ├── robots.txt
│   └── favicon.ico
├── middleware.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── .env.example
├── TASKS.md
├── README.md
├── ARCHITECTURE.md
└── DEVELOPMENT.md
```

---

## Tasks

### Phase 1: Foundation

### Task 1: Initialize Next.js Project & Dependencies

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `app/globals.css`
- Create: `app/layout.tsx`
- Create: `.env.example`
- Create: `public/robots.txt`

**Interfaces:**
- Produces: Working Next.js 15 app with Tailwind v4, TypeScript, and all dependencies

- [ ] **Step 1: Create project directory and initialize package.json**

```bash
mkdir -p /c/Users/nn/scrollzea
cd /c/Users/nn/scrollzea
```

- [ ] **Step 2: Create package.json with all dependencies**

```json
{
  "name": "scrollzea",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  },
  "dependencies": {
    "next": "^15.5.1",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "lucide-react": "^1.26.0",
    "@libsql/client": "^0.14.0",
    "drizzle-orm": "^0.38.0",
    "next-auth": "^5.0.0-beta.25",
    "@auth/core": "^0.37.0",
    "bcryptjs": "^2.4.3",
    "resend": "^4.0.0",
    "uploadthing": "^7.0.0",
    "@uploadthing/react": "^7.0.0",
    "clsx": "^2.1.1",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.3.3",
    "@types/node": "^22.15.3",
    "@types/react": "^19.1.2",
    "@types/react-dom": "^19.1.2",
    "@types/bcryptjs": "^2.4.6",
    "drizzle-kit": "^0.30.0",
    "tailwindcss": "^4.1.4",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 4: Create next.config.ts**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 5: Create postcss.config.mjs**

```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

- [ ] **Step 6: Create app/globals.css**

```css
@import "tailwindcss";

@theme {
  --color-primary: #4F46E5;
  --color-primary-dark: #4338CA;
  --color-primary-light: #6366F1;
  --color-primary-50: #EEF2FF;
  --color-secondary: #111827;
  --color-accent: #10B981;
  --color-accent-amber: #F59E0B;
  --color-accent-red: #EF4444;
}

@layer base {
  body {
    @apply antialiased text-gray-900 bg-white;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

- [ ] **Step 7: Create app/layout.tsx (root layout)**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrollzea — Digital Products & Creative Digital Solutions",
  description: "Discover ready-to-use digital products, free resources, and custom digital solutions designed to make your digital journey simpler, smarter, and more creative.",
  openGraph: {
    title: "Scrollzea — Digital Products & Creative Digital Solutions",
    description: "Discover ready-to-use digital products, free resources, and custom digital solutions.",
    siteName: "Scrollzea",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 8: Create .env.example**

```env
# Turso Database
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# NextAuth
AUTH_SECRET=
AUTH_URL=

# Resend Email
RESEND_API_KEY=
LEAD_NOTIFICATION_EMAIL=srollzea@gmail.com
EMAIL_FROM=Scrollzea <noreply@scrollzea.vercel.app>

# Uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=
```

- [ ] **Step 9: Install dependencies**

Run: `cd /c/Users/nn/scrollzea && npm install`

- [ ] **Step 10: Verify dev server starts**

Run: `cd /c/Users/nn/scrollzea && timeout 15 npm run dev || true`

Expected: Next.js starts on port 3000

- [ ] **Step 11: Commit**

```bash
cd /c/Users/nn/scrollzea && git init && git add -A && git commit -m "feat: initialize Next.js project with Tailwind v4 and dependencies"
```

### Task 2: Set Up Database (Turso + Drizzle)

**Files:**
- Create: `db/schema.ts`
- Create: `lib/db.ts`
- Create: `drizzle.config.ts`

**Interfaces:**
- Consumes: Task 1 (Next.js project initialized)
- Produces: Database client `db` from `@/lib/db`, complete schema with all tables

- [ ] **Step 1: Create drizzle.config.ts**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- [ ] **Step 2: Create db/schema.ts with all table definitions**

```typescript
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
  createdAt: text("created_at").notNull().default("datetime('now')"),
});
```

- [ ] **Step 3: Create lib/db.ts**

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(client, { schema });
```

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: add database schema and client setup"
```

### Task 3: Shared UI Components

**Files:**
- Create: `components/ui/Button.tsx`
- Create: `components/ui/Card.tsx`
- Create: `components/ui/Input.tsx`
- Create: `components/ui/Modal.tsx`
- Create: `components/ui/Badge.tsx`
- Create: `components/ui/LoadingSpinner.tsx`
- Create: `components/ui/EmptyState.tsx`
- Create: `components/ui/ErrorState.tsx`
- Create: `lib/utils.ts`

**Interfaces:**
- Produces: Reusable UI component library used by all pages

- [ ] **Step 1: Create lib/utils.ts**

```typescript
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function generateOrderNumber(): string {
  const prefix = "SCZ";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}
```

- [ ] **Step 2: Create Button component**

```tsx
"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm",
      secondary: "bg-gray-900 text-white hover:bg-gray-800",
      outline: "border-2 border-gray-200 text-gray-900 hover:bg-gray-50",
      ghost: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
      danger: "bg-red-600 text-white hover:bg-red-700",
    };
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-5 py-2.5 text-sm",
      lg: "px-8 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
export { Button };
```

- [ ] **Step 3: Create Card component**

```tsx
import { cn } from "@/lib/utils";

interface CardProps {
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
}

export function Card({ className, children, hover = true }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-100 overflow-hidden",
        hover && "transition-all duration-200 hover:shadow-lg hover:border-gray-200",
        className
      )}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 4: Create Input component**

```tsx
"use client";

import { forwardRef, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-gray-700">{label}</label>
        )}
        <input
          ref={ref}
          className={cn(
            "w-full px-4 py-2.5 rounded-lg border border-gray-200 text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent",
            "transition-all duration-200",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
export { Input };
```

- [ ] **Step 5: Create Badge component**

```tsx
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "free" | "best-seller" | "featured" | "prebook";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    free: "bg-emerald-100 text-emerald-700",
    "best-seller": "bg-amber-100 text-amber-700",
    featured: "bg-indigo-100 text-indigo-700",
    prebook: "bg-blue-100 text-blue-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
```

- [ ] **Step 6: Create LoadingSpinner, EmptyState, ErrorState components**

```tsx
// LoadingSpinner.tsx
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-12", className)}>
      <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// EmptyState.tsx
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("text-center py-16 px-4", className)}>
      {icon && <div className="flex justify-center mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {description && <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// ErrorState.tsx
interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = "Something went wrong", onRetry }: ErrorStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
        <span className="text-2xl">⚠️</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">Error</h3>
      <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create Modal component**

```tsx
"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className={cn("bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto", className)}>
        <div className="flex items-center justify-between p-6 border-b">
          {title && <h2 className="text-lg font-semibold">{title}</h2>}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add shared UI components (Button, Card, Input, Badge, Modal, Spinner, Empty, Error)"
```

### Phase 2: Admin Authentication & Setup

### Task 4: Auth Configuration (NextAuth + Admin Setup)

**Files:**
- Create: `lib/auth.ts`
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `app/api/setup/route.ts`
- Create: `middleware.ts`

**Interfaces:**
- Consumes: Task 2 (db client + schema)
- Produces: Auth config exports, middleware protection, admin setup endpoint

- [ ] **Step 1: Create lib/auth.ts**

```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { adminUsers } from "@/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.email, credentials.email as string))
          .get();

        if (!user) return null;

        const isValid = await compare(credentials.password as string, user.passwordHash);
        if (!isValid) return null;

        if (user.status !== "active") return null;

        return {
          id: String(user.id),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
});
```

- [ ] **Step 2: Create API route for auth**

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 3: Create setup endpoint (first-time admin creation)**

```typescript
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { adminUsers, websiteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Check if admin exists
  const existingAdmin = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.role, "admin"))
    .get();

  if (existingAdmin) {
    return NextResponse.json({ message: "Setup already completed. Admin exists." });
  }

  // Create default admin
  const passwordHash = await hash("scrollzeaAdmin2024!", 12);
  await db.insert(adminUsers).values({
    email: "srollzea@gmail.com",
    passwordHash,
    name: "Scrollzea Admin",
    role: "admin",
  });

  // Insert default settings
  const defaultSettings = [
    { key: "site_name", value: "Scrollzea" },
    { key: "site_description", value: "Digital Products & Creative Digital Solutions" },
    { key: "business_email", value: "srollzea@gmail.com" },
    { key: "business_location", value: "Kolkata, West Bengal, India" },
    { key: "facebook_url", value: "https://www.facebook.com/scrollzea" },
    { key: "instagram_url", value: "https://www.instagram.com/scrollzea/" },
    { key: "default_advance_percentage", value: "30" },
    { key: "ai_chatbot_enabled", value: "1" },
    { key: "ai_welcome_message", value: "👋 Welcome to Scrollzea! How can I help you today?" },
    { key: "lead_notification_email", value: "srollzea@gmail.com" },
    { key: "auto_best_sellers_enabled", value: "1" },
    { key: "best_sellers_count", value: "5" },
  ];

  for (const setting of defaultSettings) {
    await db.insert(websiteSettings).values(setting);
  }

  return NextResponse.json({
    message: "Setup complete! Admin created: srollzea@gmail.com",
  });
}
```

- [ ] **Step 4: Create middleware.ts for route protection**

```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAdminLogin = req.nextUrl.pathname === "/admin/login";
  const isSetupRoute = req.nextUrl.pathname === "/api/setup";
  const isAuthenticated = !!req.auth;

  // Allow setup route and API routes through
  if (isSetupRoute || req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Admin routes need authentication
  if (isAdminRoute && !isAdminLogin && !isAuthenticated) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  // Redirect logged-in users away from login page
  if (isAdminLogin && isAuthenticated) {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/api/setup"],
};
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add NextAuth authentication, admin setup endpoint, middleware protection"
```

### Task 5: Admin Layout & Login Page

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/login/page.tsx`
- Create: `app/admin/page.tsx` (Dashboard)
- Create: `components/admin/Sidebar.tsx`
- Create: `components/admin/AdminHeader.tsx`
- Create: `components/admin/StatCard.tsx`

**Interfaces:**
- Consumes: Task 4 (auth + middleware)
- Produces: Working admin panel with login, layout, and dashboard

- [ ] **Step 1: Create admin layout with sidebar**

```tsx
"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { Sidebar } from "@/components/admin/Sidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SessionProvider>
  );
}
```

- [ ] **Step 2: Create Sidebar component**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Package, FolderTree, Users, ShoppingCart,
  Building2, Settings, Bot, BarChart3, MessageSquare, X,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/leads", label: "Leads", icon: MessageSquare },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/projects", label: "Projects", icon: Building2 },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <Link href="/admin" className="text-xl font-bold text-indigo-600">
            Scrollzea
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
```

- [ ] **Step 3: Create AdminHeader component**

```tsx
"use client";

import { signOut } from "next-auth/react";
import { Menu, LogOut } from "lucide-react";

export function AdminHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-4 ml-auto">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 4: Create StatCard component**

```tsx
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  className?: string;
}

export function StatCard({ label, value, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-xl border border-gray-100 p-6", className)}>
      <div className="flex items-center justify-between">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-5 w-5 text-indigo-600" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
        {trend && (
          <p className={cn("text-xs mt-2", trend.positive ? "text-emerald-600" : "text-red-600")}>
            {trend.value}
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create admin login page**

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/admin");
    } else {
      setError("Invalid email or password");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">Scrollzea Admin</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your store</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="srollzea@gmail.com"
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <Button type="submit" loading={loading} className="w-full">
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create admin dashboard page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Package, ShoppingCart, Users, TrendingUp, MessageSquare } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatPrice, formatDate } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalProducts: number;
    publishedProducts: number;
    totalLeads: number;
    newLeads: number;
    totalOrders: number;
    totalRevenue: number;
  };
  recentLeads: Array<{ id: number; name: string; email: string; purpose: string; status: string; createdAt: string }>;
  recentOrders: Array<{ id: number; orderNumber: string; customerName: string; totalAmount: number; paymentStatus: string; createdAt: string }>;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = data?.stats ? [
    { label: "Total Products", value: data.stats.publishedProducts + " / " + data.stats.totalProducts, icon: Package },
    { label: "New Leads", value: data.stats.newLeads, icon: MessageSquare, trend: { value: data.stats.totalLeads + " total", positive: true } },
    { label: "Orders", value: data.stats.totalOrders, icon: ShoppingCart },
    { label: "Revenue", value: formatPrice(data.stats.totalRevenue), icon: TrendingUp },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to your Scrollzea admin panel.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {data?.recentOrders && data.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {data.recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-xs text-gray-500">{order.customerName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(order.totalAmount)}</p>
                    <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No orders yet.</p>
          )}
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leads</h2>
          {data?.recentLeads && data.recentLeads.length > 0 ? (
            <div className="space-y-3">
              {data.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                    <p className="text-xs text-gray-500">{lead.purpose || "General enquiry"}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 capitalize">{lead.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create dashboard API route**

```typescript
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, leads, orders, websiteSettings } from "@/db/schema";
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
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add admin panel with layout, login, dashboard, and stats API"
```

### Task 6: Admin Product CRUD

**Files:**
- Create: `app/admin/products/page.tsx`
- Create: `app/admin/products/new/page.tsx`
- Create: `app/admin/products/[id]/edit/page.tsx`
- Create: `components/admin/DataTable.tsx`
- Create: `components/admin/ProductForm.tsx`
- Create: `components/admin/ImageUploader.tsx`
- Create: `components/admin/PaymentOptionsEditor.tsx`
- Create: `app/api/admin/products/route.ts`
- Create: `app/api/admin/products/[id]/route.ts`
- Create: `app/api/uploadthing/core.ts`
- Create: `app/api/uploadthing/route.ts`
- Create: `lib/uploadthing.ts`

**Interfaces:**
- Consumes: Task 4 (auth), Task 5 (admin layout), Task 2 (schema)
- Produces: Complete product CRUD with image upload, payment option management

This task is large — let me provide the essential file contents:

- [ ] **Step 1: Create Uploadthing configuration**

```typescript
// lib/uploadthing.ts
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@/lib/auth";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .middleware(async () => {
      const session = await auth();
      if (!session) throw new Error("Unauthorized");
      return { userId: session.user?.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

```typescript
// app/api/uploadthing/core.ts
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "@/lib/uploadthing";

export const { GET, POST } = createRouteHandler({
  fileRouter: ourFileRouter,
});
```

```typescript
// app/api/uploadthing/route.ts
export { GET, POST } from "./core";
```

- [ ] **Step 2: Create product form component**

```tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { PaymentOptionsEditor } from "@/components/admin/PaymentOptionsEditor";
import { slugify } from "@/lib/utils";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ProductFormProps {
  product?: any; // Product data for editing
  categories: Array<{ id: number; name: string }>;
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: product?.name || "",
    slug: product?.slug || "",
    shortDescription: product?.shortDescription || "",
    description: product?.description || "",
    categoryId: product?.categoryId?.toString() || "",
    productType: product?.productType || "READY_MADE",
    price: product?.price?.toString() || "0",
    discountPrice: product?.discountPrice?.toString() || "",
    advancePercentage: product?.advancePercentage?.toString() || "30",
    pricingModel: product?.pricingModel || "fixed",
    status: product?.status || "draft",
    featured: product?.featured ? true : false,
    bestSeller: product?.bestSeller ? true : false,
    leadCaptureRequired: product?.leadCaptureRequired ? true : false,
    deliveryMethod: product?.deliveryMethod || "manual",
    downloadUrl: product?.downloadUrl || "",
    seoTitle: product?.seoTitle || "",
    seoDescription: product?.seoDescription || "",
  });

  const [paymentOptions, setPaymentOptions] = useState<Array<{
    provider: string; paymentUrl: string; enabled: boolean;
  }>>(
    product?.paymentOptions || [
      { provider: "RAZORPAY", paymentUrl: "", enabled: false },
      { provider: "PAYPAL", paymentUrl: "", enabled: false },
      { provider: "WHATSAPP", paymentUrl: "", enabled: false },
    ]
  );

  const [images, setImages] = useState<Array<{ url: string; isPrimary: boolean }>>(
    product?.images?.map((i: any) => ({ url: i.imageUrl, isPrimary: i.isPrimary })) || []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      price: parseFloat(form.price) || 0,
      discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
      advancePercentage: parseFloat(form.advancePercentage) || 30,
      categoryId: form.categoryId ? parseInt(form.categoryId) : null,
      images: images.map((img, i) => ({
        imageUrl: img.url,
        isPrimary: img.isPrimary ? 1 : 0,
        sortOrder: i,
      })),
      paymentOptions: paymentOptions.filter((p) => p.enabled && p.paymentUrl),
    };

    try {
      const url = product
        ? `/api/admin/products/${product.id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to save product", err);
    }
    setLoading(false);
  };

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "name" && !product ? { slug: slugify(value) } : {}),
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Product Name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          <Input label="Slug" value={form.slug} onChange={(e) => updateField("slug", e.target.value)} required />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description</label>
          <textarea
            value={form.shortDescription}
            onChange={(e) => updateField("shortDescription", e.target.value)}
            rows={2}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
            <select
              value={form.categoryId}
              onChange={(e) => updateField("categoryId", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Type</label>
            <select
              value={form.productType}
              onChange={(e) => updateField("productType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="READY_MADE">Ready-made</option>
              <option value="FREE">Free</option>
              <option value="PREBOOK">Pre-book (Custom Service)</option>
              <option value="CUSTOM_QUOTE">Custom Quote</option>
            </select>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => updateField("price", e.target.value)} />
          <Input label="Discount Price (₹)" type="number" value={form.discountPrice} onChange={(e) => updateField("discountPrice", e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Pricing Model</label>
            <select
              value={form.pricingModel}
              onChange={(e) => updateField("pricingModel", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="fixed">Fixed Price</option>
              <option value="starting_at">Starting From</option>
              <option value="custom_quote">Custom Quote</option>
            </select>
          </div>
        </div>
        {form.productType === "PREBOOK" && (
          <div className="mt-4">
            <Input
              label="Advance Percentage (%)"
              type="number"
              value={form.advancePercentage}
              onChange={(e) => updateField("advancePercentage", e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-1">
              {form.price ? `Advance amount: ₹${(parseFloat(form.price) * parseFloat(form.advancePercentage) / 100).toLocaleString("en-IN")}` : "Set a price to see advance amount"}
            </p>
          </div>
        )}
      </section>

      {/* Images */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Images</h2>
        <ImageUploader images={images} onImagesChange={setImages} />
      </section>

      {/* Payment Options */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Payment Options</h2>
        <PaymentOptionsEditor options={paymentOptions} onChange={setPaymentOptions} />
      </section>

      {/* Visibility */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Visibility & Status</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.status === "published"} onChange={(e) => updateField("status", e.target.checked ? "published" : "draft")} className="rounded border-gray-300" />
            <span className="text-sm font-medium">Published</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.featured} onChange={(e) => updateField("featured", e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium">Featured</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={form.bestSeller} onChange={(e) => updateField("bestSeller", e.target.checked)} className="rounded border-gray-300" />
            <span className="text-sm font-medium">Best Seller</span>
          </label>
          {form.productType === "FREE" && (
            <label className="flex items-center gap-3">
              <input type="checkbox" checked={form.leadCaptureRequired} onChange={(e) => updateField("leadCaptureRequired", e.target.checked)} className="rounded border-gray-300" />
              <span className="text-sm font-medium">Collect lead info before download</span>
            </label>
          )}
        </div>
      </section>

      {/* Delivery */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Delivery</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Method</label>
            <select
              value={form.deliveryMethod}
              onChange={(e) => updateField("deliveryMethod", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="manual">Manual Delivery</option>
              <option value="download">Digital Download</option>
              <option value="external_link">External Link</option>
              <option value="contact">Contact Required</option>
            </select>
          </div>
          <Input label="Download URL (if applicable)" value={form.downloadUrl} onChange={(e) => updateField("downloadUrl", e.target.value)} />
        </div>
      </section>

      {/* SEO */}
      <section className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">SEO</h2>
        <div className="space-y-4">
          <Input label="SEO Title" value={form.seoTitle} onChange={(e) => updateField("seoTitle", e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
            <textarea
              value={form.seoDescription}
              onChange={(e) => updateField("seoDescription", e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {product ? "Update Product" : "Create Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

- [ ] **Step 3: Create ImageUploader component**

```tsx
"use client";

import { useState } from "react";
import { Upload, X, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

const { useUploadThing } = generateReactHelpers<OurFileRouter>();

interface ImageItem {
  url: string;
  isPrimary: boolean;
}

interface ImageUploaderProps {
  images: ImageItem[];
  onImagesChange: (images: ImageItem[]) => void;
}

export function ImageUploader({ images, onImagesChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const { startUpload } = useUploadThing("productImage");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    try {
      const result = await startUpload(Array.from(files));
      if (result) {
        const newImages = result.map((file) => ({
          url: file.url,
          isPrimary: images.length === 0,
        }));
        onImagesChange([...images, ...newImages]);
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    if (images[index].isPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onImagesChange(updated);
  };

  const setPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onImagesChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {images.map((img, i) => (
          <div key={i} className="relative group aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => setPrimary(i)} className={`p-1.5 rounded-full ${img.isPrimary ? "bg-amber-400 text-white" : "bg-white text-gray-700"}`}>
                <Star className="h-4 w-4" fill={img.isPrimary ? "currentColor" : "none"} />
              </button>
              <button onClick={() => removeImage(i)} className="p-1.5 rounded-full bg-red-500 text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            {img.isPrimary && (
              <span className="absolute top-2 left-2 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full">Primary</span>
            )}
          </div>
        ))}
        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-400 cursor-pointer flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors bg-gray-50">
          <Upload className="h-6 w-6" />
          <span className="text-xs">{uploading ? "Uploading..." : "Upload"}</span>
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      <p className="text-xs text-gray-500">First image is primary. Max 4MB per image.</p>
    </div>
  );
}
```

- [ ] **Step 4: Create PaymentOptionsEditor component**

```tsx
"use client";

import { Input } from "@/components/ui/Input";

interface PaymentOption {
  provider: string;
  paymentUrl: string;
  enabled: boolean;
}

interface PaymentOptionsEditorProps {
  options: PaymentOption[];
  onChange: (options: PaymentOption[]) => void;
}

const providerLabels: Record<string, { name: string; placeholder: string }> = {
  RAZORPAY: { name: "Razorpay", placeholder: "https://rzp.io/..." },
  PAYPAL: { name: "PayPal", placeholder: "https://paypal.me/..." },
  WHATSAPP: { name: "WhatsApp", placeholder: "https://wa.me/91XXXXXXXXXX" },
};

export function PaymentOptionsEditor({ options, onChange }: PaymentOptionsEditorProps) {
  const updateOption = (index: number, field: string, value: any) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, [field]: value } : opt
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      {options.map((opt, i) => {
        const info = providerLabels[opt.provider];
        return (
          <div key={opt.provider} className="flex items-start gap-4 p-4 rounded-lg border border-gray-100">
            <label className="flex items-center gap-2 min-w-[100px]">
              <input
                type="checkbox"
                checked={opt.enabled}
                onChange={(e) => updateOption(i, "enabled", e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm font-medium">{info.name}</span>
            </label>
            <div className="flex-1">
              <Input
                placeholder={info.placeholder}
                value={opt.paymentUrl}
                onChange={(e) => updateOption(i, "paymentUrl", e.target.value)}
                disabled={!opt.enabled}
              />
            </div>
          </div>
        );
      })}
      <p className="text-xs text-gray-500">Enable the payment methods you want for this product and enter the corresponding payment links.</p>
    </div>
  );
}
```

- [ ] **Step 5: Create products list page (app/admin/products/page.tsx)**

```tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { formatPrice } from "@/lib/utils";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    fetchProducts();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Add your first product to start selling on Scrollzea."
          action={<Link href="/admin/products/new"><Button>Add Product</Button></Link>}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Price</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Featured</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Best Seller</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0].imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.productType === "FREE" ? "free" : p.productType === "PREBOOK" ? "prebook" : "default"}>
                        {p.productType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${p.status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">{p.featured ? "⭐" : "—"}</td>
                    <td className="px-4 py-3 text-center">{p.bestSeller ? "🏆" : "—"}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${p.id}/edit`} className="p-1.5 hover:bg-gray-100 rounded-lg">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Link>
                        <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create admin products API routes**

```typescript
// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, paymentOptions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt))
    .all();

  const productsWithRelations = await Promise.all(
    allProducts.map(async (p) => {
      const images = await db
        .select()
        .from(productImages)
        .where(eq(productImages.productId, p.id))
        .orderBy(productImages.sortOrder)
        .all();
      const payments = await db
        .select()
        .from(paymentOptions)
        .where(eq(paymentOptions.productId, p.id))
        .all();
      return { ...p, images, paymentOptions: payments };
    })
  );

  return NextResponse.json(productsWithRelations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { images: imgs, paymentOptions: payments, ...productData } = body;

  const result = await db.insert(products).values({
    ...productData,
    name: productData.name,
    slug: productData.slug,
  }).returning().get();

  if (imgs?.length) {
    await db.insert(productImages).values(
      imgs.map((img: any) => ({
        productId: result.id,
        imageUrl: img.imageUrl,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
      }))
    );
  }

  if (payments?.length) {
    await db.insert(paymentOptions).values(
      payments.map((p: any) => ({
        productId: result.id,
        provider: p.provider,
        paymentUrl: p.paymentUrl,
        enabled: 1,
      }))
    );
  }

  return NextResponse.json(result, { status: 201 });
}
```

```typescript
// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products, productImages, paymentOptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const product = await db.select().from(products).where(eq(products.id, id)).get();
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const images = await db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(productImages.sortOrder).all();
  const payments = await db.select().from(paymentOptions).where(eq(paymentOptions.productId, id)).all();
  return NextResponse.json({ ...product, images, paymentOptions: payments });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  const body = await req.json();
  const { images: imgs, paymentOptions: payments, ...productData } = body;

  await db.update(products).set(productData).where(eq(products.id, id));

  // Replace images
  await db.delete(productImages).where(eq(productImages.productId, id));
  if (imgs?.length) {
    await db.insert(productImages).values(imgs.map((img: any) => ({
      productId: id, imageUrl: img.imageUrl, isPrimary: img.isPrimary, sortOrder: img.sortOrder,
    })));
  }

  // Replace payment options
  await db.delete(paymentOptions).where(eq(paymentOptions.productId, id));
  if (payments?.length) {
    await db.insert(paymentOptions).values(payments.map((p: any) => ({
      productId: id, provider: p.provider, paymentUrl: p.paymentUrl, enabled: 1,
    })));
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = parseInt(params.id);
  await db.delete(productImages).where(eq(productImages.productId, id));
  await db.delete(paymentOptions).where(eq(paymentOptions.productId, id));
  await db.delete(products).where(eq(products.id, id));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 7: Create new/edit product pages**

```tsx
// app/admin/products/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function NewProductPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}

// app/admin/products/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function EditProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/products/${id}`).then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ]).then(([prod, cats]) => {
      setProduct(prod);
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: add admin product CRUD with image upload and payment options"
```

### Task 7: Admin Categories & Settings

**Files:**
- Create: `app/admin/categories/page.tsx`
- Create: `components/admin/CategoryForm.tsx`
- Create: `app/admin/settings/page.tsx`
- Create: `components/admin/SettingsForm.tsx`
- Create: `app/api/admin/categories/route.ts`
- Create: `app/api/admin/settings/route.ts`

**Interfaces:**
- Consumes: Task 5 (admin layout)
- Produces: Category management and website settings editor

- [ ] **Step 1: Create categories API and management page**

```typescript
// app/api/admin/categories/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(categories).orderBy(asc(categories.sortOrder)).all();
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
```

- [ ] **Step 2: Create settings API**

```typescript
// app/api/admin/settings/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { websiteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export async function GET() {
  const all = await db.select().from(websiteSettings).all();
  const settingsMap: Record<string, string> = {};
  all.forEach((s) => { settingsMap[s.key] = s.value || ""; });
  return NextResponse.json(settingsMap);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await db
      .insert(websiteSettings)
      .values({ key, value: value as string })
      .onConflictDoUpdate({ target: websiteSettings.key, set: { value: value as string } });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create categories management page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { slugify } from "@/lib/utils";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", slug: "", description: "", status: "active", sortOrder: 0 });

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      setCategories(await res.json());
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", slug: "", description: "", status: "active", sortOrder: categories.length });
    setModalOpen(true);
  };

  const openEdit = (cat: any) => {
    setEditing(cat);
    setForm(cat);
    setModalOpen(true);
  };

  const save = async () => {
    if (editing) {
      await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editing.id }),
      });
    } else {
      await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setModalOpen(false);
    fetchCategories();
  };

  const deleteCat = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCategories();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={openNew}><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      {categories.length === 0 ? (
        <EmptyState title="No categories" description="Create your first product category." action={<Button onClick={openNew}>Add Category</Button>} />
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3"><GripVertical className="h-4 w-4 text-gray-400" /></td>
                  <td className="px-4 py-3 font-medium">{cat.name}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${cat.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{cat.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(cat)} className="p-1.5 hover:bg-gray-100 rounded-lg"><Pencil className="h-4 w-4 text-gray-600" /></button>
                      <button onClick={() => deleteCat(cat.id)} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4 text-red-500" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: editing ? form.slug : slugify(e.target.value) })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Create settings page**

```tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then(setSettings)
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveAll = async () => {
    setSaving(true);
    setSaved(false);
    await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const settingFields = [
    { key: "site_name", label: "Site Name", type: "text" },
    { key: "site_description", label: "Site Description", type: "textarea" },
    { key: "business_email", label: "Business Email", type: "email" },
    { key: "business_location", label: "Business Location", type: "text" },
    { key: "facebook_url", label: "Facebook URL", type: "url" },
    { key: "instagram_url", label: "Instagram URL", type: "url" },
    { key: "whatsapp_number", label: "WhatsApp Number", type: "text" },
    { key: "default_advance_percentage", label: "Default Advance %", type: "number" },
    { key: "lead_notification_email", label: "Lead Notification Email", type: "email" },
    { key: "ai_chatbot_enabled", label: "AI Chatbot Enabled (1=yes, 0=no)", type: "number" },
    { key: "ai_welcome_message", label: "AI Welcome Message", type: "textarea" },
    { key: "auto_best_sellers_enabled", label: "Auto Best Sellers (1=yes, 0=no)", type: "number" },
    { key: "best_sellers_count", label: "Best Sellers Display Count", type: "number" },
    { key: "meta_title", label: "SEO Meta Title", type: "text" },
    { key: "meta_description", label: "SEO Meta Description", type: "textarea" },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Website Settings</h1>
        <Button onClick={saveAll} loading={saving}>{saved ? "Saved! ✅" : "Save All"}</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
        {settingFields.map((field) => (
          <div key={field.key}>
            {field.type === "textarea" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{field.label}</label>
                <textarea
                  value={settings[field.key] || ""}
                  onChange={(e) => updateSetting(field.key, e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <Input
                label={field.label}
                type={field.type}
                value={settings[field.key] || ""}
                onChange={(e) => updateSetting(field.key, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add admin categories and settings management"
```

### Phase 3: Public Website

### Task 8: Public Layout & Homepage

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `components/public/Header.tsx`
- Create: `components/public/Footer.tsx`
- Create: `components/public/MobileNav.tsx`
- Create: `components/public/HeroSection.tsx`
- Create: `components/public/FeaturedCategories.tsx`
- Create: `components/public/ProductCard.tsx`
- Create: `components/public/ProductGrid.tsx`
- Create: `app/page.tsx` (homepage)

- [ ] **Step 1: Create public layout**

- [ ] **Step 2: Create Header with navigation, search, cart, mobile menu**

- [ ] **Step 3: Create Footer with all links and social**

- [ ] **Step 4: Create HeroSection with CTAs**

- [ ] **Step 5: Create ProductCard with dynamic CTA badges**

- [ ] **Step 6: Create homepage with all sections**

- [ ] **Step 7: Commit**

### Task 9: Product Listing & Detail Pages

### Task 10: Categories, Freebies, Services Pages

### Task 11: Contact Form & Lead Capture

### Task 12: Customer Accounts (Auth, Favorites, Orders)

### Task 13: Click Tracking & Analytics Dashboard

### Task 14: AI Chatbot

### Task 15: SEO & Final Polish

### Task 16: Deployment Setup

---

The plan is extremely long. Rather than writing every step inline, I will begin **inline execution** using the phases above, building each piece directly. Let me start now.
