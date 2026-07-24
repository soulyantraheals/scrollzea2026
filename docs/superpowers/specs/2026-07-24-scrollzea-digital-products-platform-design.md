# Scrollzea — Complete Digital Products Sales Platform Design

## 1. Project Overview

**Scrollzea** is a professional digital products marketplace and custom digital services platform. It combines:
- A **digital product store** (ready-made apps, PDFs, wallpapers, creative content)
- A **free digital resource hub** (free downloads with optional lead capture)
- A **custom digital service studio** (pre-book with 30% advance)
- A **lead generation system** (contact forms, email notifications)
- A **secure admin management system** (complete business control)
- An **AI product assistant** (rules-based chatbot using live product data)
- A **customer accounts system** (favorites, order history, guest checkout)
- A **click tracking & analytics system** (link clicks, sales performance, product insights)

**Business Email:** srollzea@gmail.com
**Location:** Kolkata, West Bengal, India
**Social:** facebook.com/scrollzea, instagram.com/scrollzea

## 2. Architecture

### 2.1 Target Architecture (Single Next.js App)

```
CUSTOMER ──→ Vercel (CDN + Serverless) ──→ scrollzea.vercel.app
                        │
              ┌─────────┼─────────┐
              │         │         │
         Next.js    Next.js    Server
         Static     SSR/ISR    Actions
         (pages)    (pages)    (API)
              │         │         │
              └─────────┼─────────┘
                        │
              ┌─────────┴─────────┐
              │                   │
          Turso (LibSQL)     Uploadthing
          (Database)         (Images)
              │
              │ (via Resend)
              ▼
         srollzea@gmail.com
```

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | Next.js 15 (App Router) | SSR, API routes, server actions, Vercel-native |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS v4 | Already in existing project |
| Database | Turso (LibSQL) | Serverless SQLite, free 9GB, HTTP-based, Vercel-compatible |
| ORM | Drizzle ORM | Type-safe, supports Turso + PostgreSQL migration path |
| Auth | NextAuth.js v5 | Credentials provider for admin; optional email for customers |
| Image Storage | Uploadthing | Free 2GB tier, Next.js integration, image optimization |
| Email | Resend | Free 100/day, React email templates |
| Icons | Lucide React | Already in existing project |
| Payments | Razorpay + PayPal links | Direct external links; no complex integration |
| AI Chatbot | In-memory rule engine | No external API needed; uses live DB data |
| Analytics | Custom (click_events table) | Tracks link clicks, sales, product performance |
| Deployment | GitHub → Vercel | Free tier, automatic CI/CD |

### 2.3 What's Removed vs Existing Project

| Removed | Replaced With |
|---|---|
| Go + Fiber backend | Next.js API routes + Server Actions |
| PostgreSQL | Turso (LibSQL) |
| Redis | Removed (not needed) |
| MinIO | Uploadthing |
| Docker Compose | Vercel serverless |
| Separate admin SPA (Vite) | Next.js `/admin/*` routes |
| Offline-first sync engine | Simplified online-only model |

## 3. Database Schema (Drizzle + Turso/LibSQL)

### 3.1 admin_users
```sql
CREATE TABLE admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 3.2 customers
```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  google_id TEXT UNIQUE,
  is_guest INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 3.3 categories
```sql
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  image_url TEXT,
  parent_id INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (parent_id) REFERENCES categories(id)
);
```

### 3.4 products
```sql
CREATE TABLE products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  description TEXT,
  product_type TEXT NOT NULL CHECK(product_type IN ('READY_MADE', 'FREE', 'PREBOOK', 'CUSTOM_QUOTE')),
  category_id INTEGER,
  price REAL NOT NULL DEFAULT 0,
  discount_price REAL,
  advance_percentage REAL NOT NULL DEFAULT 30,
  pricing_model TEXT NOT NULL DEFAULT 'fixed' CHECK(pricing_model IN ('fixed', 'starting_at', 'custom_quote')),
  whatsapp_message TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published', 'archived')),
  featured INTEGER NOT NULL DEFAULT 0,
  best_seller INTEGER NOT NULL DEFAULT 0,
  lead_capture_required INTEGER NOT NULL DEFAULT 0,
  download_url TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'manual' CHECK(delivery_method IN ('download', 'external_link', 'manual', 'contact')),
  seo_title TEXT,
  seo_description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### 3.5 product_images
```sql
CREATE TABLE product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  image_url TEXT NOT NULL,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 3.6 product_features
```sql
CREATE TABLE product_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  feature TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 3.7 payment_options
```sql
CREATE TABLE payment_options (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN ('RAZORPAY', 'PAYPAL', 'WHATSAPP')),
  payment_url TEXT,
  enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

### 3.8 leads
```sql
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  purpose TEXT,
  category TEXT,
  product_id INTEGER,
  product_name TEXT,
  message TEXT,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'converted', 'closed', 'spam')),
  admin_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.9 orders
```sql
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_number TEXT NOT NULL UNIQUE,
  customer_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  total_amount REAL NOT NULL,
  advance_amount REAL DEFAULT 0,
  remaining_amount REAL DEFAULT 0,
  payment_provider TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  order_status TEXT NOT NULL DEFAULT 'pending' CHECK(order_status IN ('pending', 'paid', 'processing', 'completed', 'cancelled')),
  is_prebook INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.10 custom_projects
```sql
CREATE TABLE custom_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lead_id INTEGER,
  product_id INTEGER,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_price REAL NOT NULL,
  advance_percentage REAL NOT NULL DEFAULT 30,
  advance_amount REAL NOT NULL,
  amount_paid REAL NOT NULL DEFAULT 0,
  remaining_amount REAL NOT NULL,
  payment_provider TEXT,
  payment_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  project_status TEXT NOT NULL DEFAULT 'pre_booked' CHECK(project_status IN ('pre_booked', 'requirements_pending', 'in_progress', 'review', 'completed', 'cancelled')),
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.11 favorites
```sql
CREATE TABLE favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE(customer_id, product_id)
);
```

### 3.12 click_events (NEW — for analytics/tracking)
```sql
CREATE TABLE click_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  product_name TEXT,
  event_type TEXT NOT NULL CHECK(event_type IN (
    'razorpay_click', 'paypal_click', 'whatsapp_click',
    'download_click', 'view_detail', 'share'
  )),
  source TEXT,        -- 'homepage', 'product_page', 'category_page', 'search', 'chatbot'
  referrer TEXT,      -- HTTP referrer if available
  ip_address TEXT,    -- For unique click counting (anonymized)
  user_agent TEXT,    -- For device analytics
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id)
);
```

### 3.13 website_settings
```sql
CREATE TABLE website_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

Default settings keys:
- `site_name` → "Scrollzea"
- `site_description` → "Digital Products & Creative Digital Solutions"
- `business_email` → "srollzea@gmail.com"
- `business_location` → "Kolkata, West Bengal, India"
- `facebook_url` → "https://www.facebook.com/scrollzea"
- `instagram_url` → "https://www.instagram.com/scrollzea/"
- `whatsapp_number` → ""
- `default_advance_percentage` → "30"
- `ai_chatbot_enabled` → "1"
- `ai_welcome_message` → "👋 Welcome to Scrollzea! How can I help you today?"
- `contact_form_enabled` → "1"
- `lead_notification_email` → "srollzea@gmail.com"
- `meta_title` → "Scrollzea — Digital Products & Creative Digital Solutions"
- `meta_description` → "..."
- `footer_copyright` → ""
- `auto_best_sellers_enabled` → "1"
- `best_sellers_count` → "5"

### 3.14 chatbot_settings
```sql
CREATE TABLE chatbot_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

### 3.15 faqs
```sql
CREATE TABLE faqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);
```

## 4. Route Structure (Next.js App Router)

### 4.1 Public Routes

| Route | Type | Description |
|---|---|---|
| `/` | SSR | Homepage — hero, categories, best sellers, new arrivals, freebies, services, how it works, why scrollzea, AI chat, social, contact CTA |
| `/products` | SSR | Product listing with category filter, search, sort |
| `/products/[slug]` | SSR/ISR | Product detail — images, info, price, payment options, pre-booking calc, FAQ |
| `/categories` | SSR | All categories display |
| `/categories/[slug]` | SSR | Products in category |
| `/freebies` | SSR | Free products only |
| `/services` | SSR | Custom/pre-book services only |
| `/about` | Static | About Scrollzea |
| `/contact` | SSR | Contact form |
| `/auth/login` | CSR | Customer login |
| `/auth/register` | CSR | Customer registration |
| `/account/favorites` | CSR | Customer favorites (protected) |
| `/account/orders` | CSR | Customer order history (protected) |
| `/privacy` | Static | Privacy policy |
| `/terms` | Static | Terms & conditions |
| `/refund` | Static | Refund policy |
| `/sitemap.xml` | Generated | SEO sitemap |
| `/robots.txt` | Static | Robots configuration |

### 4.2 Admin Routes (All Protected)

| Route | Type | Description |
|---|---|---|
| `/admin` | CSR | Dashboard — stats, charts, recent data |
| `/admin/login` | CSR | Admin login |
| `/admin/products` | CSR | Product management table |
| `/admin/products/new` | CSR | Product creation form |
| `/admin/products/[id]/edit` | CSR | Product edit form |
| `/admin/categories` | CSR | Category management |
| `/admin/leads` | CSR | Lead management with filters |
| `/admin/orders` | CSR | Order management |
| `/admin/projects` | CSR | Custom project management |
| `/admin/customers` | CSR | Customer list |
| `/admin/settings` | CSR | Website settings |
| `/admin/chatbot` | CSR | AI chatbot settings |
| `/admin/analytics` | CSR | Click tracking & analytics dashboard |

### 4.3 API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | * | NextAuth (admin + customer auth) |
| `/api/products` | GET | Public product listing |
| `/api/products/[id]` | GET | Single product |
| `/api/categories` | GET | Category listing |
| `/api/contact` | POST | Contact form submission |
| `/api/chatbot/message` | POST | AI chatbot message processing |
| `/api/chatbot/products` | GET | Product data for chatbot |
| `/api/track/click` | POST | Log click events for analytics |
| `/api/track/download` | POST | Log free product downloads |
| `/api/admin/*` | * | All admin CRUD operations |
| `/api/uploadthing` | * | Uploadthing file upload |

## 5. Public Website Components

### 5.1 Shared UI Components
- `Button` — variants: primary, secondary, outline, ghost, danger; sizes: sm, md, lg
- `Card` — with hover effects, badge support
- `Input` / `Textarea` / `Select` — form controls with validation states
- `Modal` — overlay dialog
- `Badge` — status/type indicators (FREE, Best Seller, Featured, Pre-Book)
- `LoadingSpinner` / `Skeleton` — loading states
- `EmptyState` — when no data is available
- `ErrorState` — error display with retry
- `Toast` — success/error notifications

### 5.2 Layout Components
- `Header` — logo, navigation, search, cart/favorites, mobile menu
- `Footer` — company info, links, social, legal
- `MobileNav` — hamburger menu for mobile

### 5.3 Homepage Sections
- `HeroSection` — headline, subheading, CTAs
- `FeaturedCategories` — category cards grid
- `BestSellers` — top-selling products carousel/grid
- `NewArrivals` — recent products grid
- `FreeResources` — free products highlight
- `ReadyMadeProducts` — buy-now products section
- `CustomServices` — service cards with pre-book info
- `HowItWorks` — step-by-step for ready-made vs custom
- `WhyScrollzea` — value propositions
- `AIChatPreview` — chatbot teaser
- `SocialSection` — Facebook/Instagram links
- `ContactCTA` — final call-to-action

### 5.4 Product Components
- `ProductCard` — image, name, price, badges, dynamic CTA
- `ProductGrid` — responsive grid layout
- `ProductFilters` — category, price, type filters
- `ProductGallery` — image carousel with thumbnails
- `ProductInfo` — title, price, description, features
- `PaymentOptions` — dynamic payment buttons based on configuration
- `PreBookCalculator` — total price, 30% advance, remaining display
- `FreeDownloadButton` — with optional lead capture form
- `RelatedProducts` — products in same category

### 5.5 Form Components
- `ContactForm` — name, email, phone, purpose, message with validation
- `LeadCaptureForm` — name, email, phone for free downloads
- `PreBookForm` — customer info + advance payment selection
- `AuthForms` — login/register for customer accounts

### 5.6 AI Chatbot
- `ChatbotWidget` — floating button + chat panel
- `ChatMessage` — user + bot message bubbles
- `ChatInput` — text input with send button
- `QuickReplies` — suggested questions
- `ProductRecommendation` — inline product card in chat

## 6. Admin Panel Components

### 6.1 Layout
- `AdminLayout` — sidebar + header + content area
- `Sidebar` — navigation links with icons
- `AdminHeader` — user info, logout

### 6.2 Dashboard
- `StatCard` — metric display with icon
- `RecentOrdersTable` — latest orders
- `RecentLeadsTable` — latest leads
- `TopProductsChart` — best sellers bar chart
- `ClickAnalyticsChart` — link clicks over time

### 6.3 Data Management
- `DataTable` — sortable, filterable, paginated table
- `SearchBar` — text search
- `FilterBar` — status/category/type dropdowns
- `Pagination` — page navigation

### 6.4 Forms
- `ProductForm` — full product editor with all sections
- `CategoryForm` — category create/edit
- `SettingsForm` — website settings editor
- `ChatbotSettingsForm` — AI assistant configuration
- `ImageUploader` — Uploadthing integration with preview
- `PaymentOptionsEditor` — enable/disable, set links

## 7. Data Flows

### 7.1 Product Display Flow
```
Request → Next.js SSR → Server Action/API Route → Drizzle Query → Turso DB
                                                          │
                                                     Return JSON
                                                          │
                                              Render React Component
                                                          │
                                              Send HTML to Client
```

### 7.2 Contact Form Flow
```
User fills form → Client-side validation → POST /api/contact
                                              │
                                    Server-side validation
                                              │
                                    Sanitize input
                                              │
                                    Insert lead into DB
                                              │
                                    Send email via Resend → srollzea@gmail.com
                                              │
                                    Return success response
                                              │
                                    Show toast "Thank you!"
```

### 7.3 Payment Click Tracking Flow
```
User clicks "Pay with Razorpay"
              │
    ┌─────────▼─────────┐
    │  POST /api/track/click  ← Server logs: product_id, event_type='razorpay_click',
    │                         source, timestamp, IP (anonymized)
    └─────────┬─────────┘
              │
    ┌─────────▼─────────┐
    │  Store in click_events table
    └─────────┬─────────┘
              │
    ┌─────────▼─────────┐
    │  302 Redirect to Razorpay URL
    └───────────────────┘
```

### 7.4 Pre-book Flow
```
User views custom service page
              │
    ┌─────────▼─────────┐
    │  See: Total ₹50,000
    │  Advance: 30% = ₹15,000
    │  Remaining: ₹35,000
    └─────────┬─────────┘
              │
    User clicks "Pre-book Now"
              │
    ┌─────────▼─────────┐
    │  Show payment options
    │  (Razorpay/PayPal/WhatsApp)
    └─────────┬─────────┘
              │
    User chooses method → click tracked
              │
    ┌─────────▼─────────┐
    │  Lead created (status: new)
    │  Custom project created (status: pre_booked)
    │  Email notification sent
    └───────────────────┘
```

### 7.5 AI Chatbot Flow
```
User sends message → POST /api/chatbot/message
                           │
                Parse intent (keyword matching)
                           │
                ┌──────────┼──────────┐
                ▼          ▼          ▼
           Products   Categories   Services
                │          │          │
                ▼          ▼          ▼
         Query DB    Query DB    Query DB
         (live!)     (live!)     (live!)
                │          │          │
                └──────────┼──────────┘
                           ▼
                    Build response
                           │
                    Include product links
                           │
                    Return JSON response
                           │
                    Render in chat UI
```

### 7.6 Guest vs Account Flow
```
Browse products → Find product → Click "Buy Now"
                                      │
                        ┌─────────────┴─────────────┐
                        │                           │
                   Guest User                  Logged-in User
                        │                           │
              ┌─────────▼─────────┐       ┌─────────▼─────────┐
              │  Enter name,       │       │  Use account info  │
              │  email, phone      │       │  Show favorites     │
              └─────────┬─────────┘       └─────────┬─────────┘
                        │                           │
                        └─────────────┬─────────────┘
                                      ▼
                              Payment link click
                                      ▼
                              Order created
```

## 8. Click Tracking & Analytics System

### 8.1 Tracked Events

| Event Type | When Tracked | Stored Data |
|---|---|---|
| `razorpay_click` | User clicks Razorpay payment link | product_id, source, referrer, IP |
| `paypal_click` | User clicks PayPal payment link | product_id, source, referrer, IP |
| `whatsapp_click` | User clicks WhatsApp contact link | product_id, source, referrer, IP |
| `download_click` | User clicks download for free product | product_id, source |
| `view_detail` | User views a product detail page | product_id, source |
| `share` | User shares a product | product_id, platform |

### 8.2 Analytics Dashboard Metrics

| Metric | Calculation | Display |
|---|---|---|
| **Total Clicks** | COUNT of click_events | Number + trend |
| **Clicks by Product** | GROUP BY product_id | Bar chart |
| **Clicks by Payment Method** | GROUP BY event_type | Pie/donut chart |
| **Conversion Rate** | (orders + leads) / clicks per product | Percentage |
| **Top Products by Clicks** | ORDER BY COUNT DESC | Ranked list |
| **Bottom Products by Clicks** | ORDER BY COUNT ASC, LIMIT 5 | Alert list |
| **Clicks Over Time** | GROUP BY DATE(created_at) | Line chart |
| **Sales by Product** | GROUP BY product_id on orders | Bar chart |
| **Revenue** | SUM of completed orders | Number + chart |
| **Products with Zero Sales** | LEFT JOIN where orders.id IS NULL | Alert list with action |

### 8.3 Intermediate Redirect Implementation

```typescript
// Instead of linking directly to Razorpay/PayPal:
// <a href={paymentUrl}>Pay with Razorpay</a>

// We use an intermediate route:
// <a href="/api/track/click?product=123&method=razorpay&redirect={encoded_url}">
//   Pay with Razorpay
// </a>

// The /api/track/click route:
// 1. Parses product_id, method, redirect URL
// 2. Logs the click event to the database
// 3. Returns 302 redirect to the actual payment URL
```

## 9. Dynamic CTA Logic

The CTA on each product card/detail page is determined by product configuration:

| Product Type | Price | Config | CTA Text | Action |
|---|---|---|---|---|
| READY_MADE | > ₹0 | Has payment options | "Buy Now" | Show payment buttons → click track → redirect |
| FREE | ₹0 | lead_capture = 0 | "Get Free" | Direct download → track download |
| FREE | ₹0 | lead_capture = 1 | "Get Free Resource" | Lead form → download → track |
| PREBOOK | Any | advance configured | "Pre-book Now" | Show 30% calc → payment → track |
| CUSTOM_QUOTE | Any | pricing_model = custom_quote | "Request Quote" | Contact form with product pre-selected |
| Any | Any | Only WhatsApp enabled | "Chat on WhatsApp" | WhatsApp link → track click |

## 10. Implementation Order

The implementation is broken into phases that build on each other:

### Phase 1: Foundation (Day 1)
1. Initialize Next.js project with Tailwind
2. Set up Turso database + Drizzle schema
3. Configure Uploadthing for image storage
4. Build database migration scripts
5. Implement shared UI components (Button, Card, Input, Modal, Badge)
6. Create base layout (Header, Footer)

### Phase 2: Admin Panel (Day 2)
1. Admin authentication (NextAuth credentials)
2. Admin login page
3. Admin dashboard (stats, recent items)
4. Product CRUD (create, read, update, delete)
5. Category management
6. Image upload (Uploadthing integration)
7. Payment options management per product
8. Admin middleware (route protection)

### Phase 3: Public Website (Day 3)
1. Homepage with all sections
2. Product listing page with filters
3. Product detail page
4. Category pages
5. Freebies page
6. Services page
7. About page
8. Contact page with form
9. Legal pages (privacy, terms, refund)

### Phase 4: Customer Accounts (Day 4)
1. Customer registration/login
2. Guest checkout flow
3. Favorites (add/remove/list)
4. Order history for logged-in users
5. Account settings

### Phase 5: Lead Management & Email (Day 5)
1. Lead storage in database
2. Admin lead management (view, filter, update status)
3. Email notification via Resend
4. Lead capture on free products
5. Pre-book workflow

### Phase 6: Click Tracking & Analytics (Day 6)
1. Click events table and logging
2. Intermediate redirect for payment links
3. Admin analytics dashboard
4. Top/bottom product performance views
5. CSV export for analytics

### Phase 7: AI Chatbot (Day 7)
1. Chatbot API route with intent matching
2. Dynamic product data retrieval
3. Quick reply suggestions
4. In-chat product recommendations
5. In-chat booking/service inquiry flow
6. Admin chatbot settings

### Phase 8: SEO & Polish (Day 8)
1. Dynamic metadata for all pages
2. Open Graph tags
3. Sitemap.xml generation
4. Robots.txt
5. Canonical URLs
6. Structured data (JSON-LD)
7. Performance optimization
8. Final responsive testing

### Phase 9: Deployment (Day 9)
1. GitHub repository setup
2. Environment configuration
3. Vercel deployment
4. Custom domain setup
5. Production testing
6. Security audit

## 11. Error Handling Strategy

### Public Website
- **Empty states**: Show helpful messages when no products/categories exist ("No products yet. Check back soon!")
- **Error states**: Graceful error boundaries with retry buttons
- **Loading states**: Skeleton loaders matching card/layout shapes
- **Form errors**: Inline validation messages + server error display
- **404**: Custom not-found page with navigation options

### Admin Panel
- **API errors**: Toast notifications with error details
- **Form validation**: Client-side + server-side with field-level messages
- **Auth expiry**: Redirect to login with session-expired message
- **Optimistic updates**: UI updates immediately, reverts on server error

## 12. Security Measures

1. **Admin routes**: Protected by NextAuth middleware — redirects to login
2. **Password hashing**: bcrypt for admin and customer passwords
3. **API routes**: Server-side validation on all inputs
4. **XSS prevention**: Input sanitization, React's built-in escaping
5. **Rate limiting**: On contact form, auth endpoints
6. **SQL injection prevention**: Drizzle ORM parameterized queries
7. **HTTPS**: Enforced by Vercel
8. **HTTP-only cookies**: For session tokens
9. **Environment variables**: All secrets server-side only
10. **No sensitive data in client code**: API keys, database URLs never in browser

## 13. Future Migration Path to PostgreSQL

When ready to scale:

1. Install `@libsql/client` → `pg` or `@neondatabase/serverless`
2. Update Drizzle schema types (mostly compatible)
3. Run Drizzle migrations against new DB
4. Update `lib/db.ts` connection string
5. That's it — Drizzle abstracts the differences

The Turso-to-PostgreSQL migration via Drizzle is nearly seamless because:
- Drizzle generates migration SQL for both
- Both support similar SQL subsets
- No ORM queries need changing — only the driver

## 14. File Upload Approach (Uploadthing)

All product images go through Uploadthing:
1. Admin uploads image in product form → Uploadthing API → returns URL
2. URL stored in `product_images` table
3. Public pages render images from Uploadthing CDN
4. On product delete, images can be cleaned up via Uploadthing API

No images stored on Vercel filesystem. No complex storage management.

## 15. Email System (Resend)

Transactional emails sent server-side via Resend API:
- **Lead notification**: New lead → srollzea@gmail.com
- **Order confirmation**: To customer email (future)
- **Contact auto-reply**: Thank you message (future)

Email configuration via environment variables:
```
RESEND_API_KEY=
LEAD_NOTIFICATION_EMAIL=srollzea@gmail.com
EMAIL_FROM=Scrollzea <noreply@scrollzea.vercel.app>
```

## 16. AI Chatbot Design (Rule-Based, No External API)

### Intent Recognition
The chatbot uses keyword matching against known patterns:

```
Intent Categories:
- PRODUCT_LOOKUP: "show me", "what apps", "do you have", "products", "catalogue"
- CATEGORY_QUERY: "categories", "what kind of", "types"
- PRICE_QUERY: "how much", "cost", "price", "₹", "pricing"
- FREE_QUERY: "free", "freebies", "no cost"
- SERVICE_QUERY: "custom", "develop", "design", "build", "service"
- PREBOOK_QUERY: "advance", "pre-book", "booking", "30%", "deposit"
- PAYMENT_QUERY: "payment", "pay", "razorpay", "paypal", "whatsapp"
- CONTACT_QUERY: "contact", "email", "phone", "reach", "call"
- GREETING: "hi", "hello", "hey", "namaste"
- HELP: "help", "what can you do"
- BOOK_SERVICE: "book", "hire", "start project", "I want to"
```

### Response Generation
Based on intent, query the database and format response:
- PRODUCT_LOOKUP → Query products table → List matching products with links
- PRICE_QUERY → Query specific product → Return price details
- FREE_QUERY → Query FREE products → Return list
- BOOK_SERVICE → Trigger contact form inline in chat

### Safety Rules
- Never claim a product exists unless it's in the database AND published
- Never guess a price — only return `price` and `discount_price` from DB
- If no match found: "I don't have that information. You can contact Scrollzea at srollzea@gmail.com"
- All product links are real routes on the site

## 17. Environment Variables (.env.example)

```env
# Database (Turso)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# Auth
AUTH_SECRET=
AUTH_URL=

# Email (Resend)
RESEND_API_KEY=
LEAD_NOTIFICATION_EMAIL=srollzea@gmail.com
EMAIL_FROM=Scrollzea <noreply@scrollzea.vercel.app>

# Uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Optional (for future Razorpay server-side verification)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

## 18. Design & Styling System

Based on spec §36 + mobile-app-ui-design skill rules:

### Typography
- Font: Inter (single family)
- Sizes: 14px (body/small), 16px (body), 20px (h4), 24px (h3), 32px (h2), 48px (h1)
- Weights: 400 (regular), 600 (semibold), 700 (bold)
- Monospace for prices/stats

### Color System (60/30/10)
- 60% Neutral: White (#FFFFFF), Gray-50 (#F9FAFB), Gray-100 (#F3F4F6)
- 30% Complementary: Gray-900 (#111827), Gray-600 (#4B5563)
- 10% Accent: Indigo-600 (#4F46E5) → primary actions, links, badges
- Supporting: Emerald-500 (#10B981) for "Free" badges, Amber-500 for "Best Seller"

### Spacing (8-point grid)
- xs: 8px, sm: 16px, md: 24px, lg: 32px, xl: 48px, 2xl: 64px, 3xl: 80px, 4xl: 96px

### Shadows
- Card shadow: `0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)`
- Hover shadow: `0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)`
- Tinted shadow on colored backgrounds

### Border Radius
- Cards: `rounded-xl` (12px), `rounded-2xl` (16px)
- Buttons: `rounded-lg` (8px)
- Badges: `rounded-full`

### Responsive Breakpoints
- Mobile: 375px (base)
- Tablet: 768px (md)
- Desktop: 1024px (lg)
- Wide: 1280px (xl)

## 19. Legal Pages Content

### 19.1 Privacy Policy

```
# Privacy Policy

Last updated: [Current Date]

## 1. Introduction
Scrollzea ("we," "our," "us") respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

## 2. Information We Collect

### Personal Information
When you use Scrollzea, we may collect:
- **Name** — when you fill contact forms, create an account, or place an order
- **Email Address** — for communication regarding orders, leads, and account management
- **Phone Number** — for order follow-ups and project discussions
- **Billing Information** — payment is processed through Razorpay or PayPal; we do NOT store card numbers, UPI details, or banking information on our servers

### Non-Personal Information
We automatically collect:
- Browser type and version
- Device type
- Pages visited and time spent
- Referral source
- IP address (anonymized for analytics)

## 3. How We Use Your Information
- To process your orders and deliver digital products
- To respond to your enquiries and pre-booking requests
- To send administrative information (order confirmations, project updates)
- To improve our website and product offerings
- To analyze sales performance and product popularity
- To comply with legal obligations

## 4. Payment Processing
All payments are processed by third-party payment gateways:
- **Razorpay** — razorpay.com (see their privacy policy)
- **PayPal** — paypal.com (see their privacy policy)

We do not store credit/debit card numbers, CVV, UPI PIN, or banking passwords. Payment transactions occur entirely on Razorpay's or PayPal's secure servers.

## 5. Data Storage & Security
- Your personal data is stored in secure databases (Turso/LibSQL)
- Passwords are hashed using bcrypt before storage
- We implement industry-standard security measures
- Data is encrypted in transit (HTTPS)

## 6. Data Retention
We retain your personal data for as long as necessary to:
- Provide our services to you
- Comply with legal obligations
- Resolve disputes
- Enforce our agreements

## 7. Your Rights
You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your data (subject to legal obligations)
- Withdraw consent at any time
- Lodge a complaint with applicable data protection authority

## 8. Third-Party Services
We use the following third-party services:
- **Razorpay** — Payment processing
- **PayPal** — Payment processing
- **Resend** — Email delivery
- **Uploadthing** — Image/file hosting
- **Vercel** — Website hosting

## 9. Cookies
We use essential cookies for:
- Session management (authentication)
- Cart functionality
- Basic analytics

You can control cookies through your browser settings.

## 10. Children's Privacy
Our services are not directed to individuals under 13. We do not knowingly collect information from children.

## 11. Changes to This Policy
We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.

## 12. Contact Us
For privacy-related enquiries:
- **Email:** srollzea@gmail.com
- **Location:** Kolkata, West Bengal, India
```

### 19.2 Terms & Conditions

```
# Terms & Conditions

Last updated: [Current Date]

## 1. Acceptance of Terms
By accessing or using Scrollzea ("the Website"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.

## 2. Business Information
Scrollzea is a digital products and digital services platform based in Kolkata, West Bengal, India.

## 3. Definitions
- **"Digital Product"** — Ready-made downloadable products (apps, PDFs, e-books, wallpapers, templates, etc.)
- **"Free Product"** — Digital products offered at ₹0
- **"Custom Service"** — Tailored digital services (website development, app development, logo design, etc.)
- **"Pre-booking"** — Booking a custom service with an advance payment
- **"Advance Payment"** — The initial payment (typically 30%) required to confirm a custom service booking

## 4. Products & Services

### 4.1 Ready-Made Digital Products
- These products are available for immediate purchase and download/access
- Prices are displayed in Indian Rupees (₹) unless otherwise stated
- All prices include applicable taxes unless stated otherwise
- Product delivery occurs through the method specified on the product page (download link, external platform, email delivery, or manual delivery)

### 4.2 Free Digital Products
- Free products are available at ₹0
- We may require lead information (name, email, phone) before providing access
- We reserve the right to discontinue free products at any time

### 4.3 Custom Digital Services
- Custom services require a pre-booking with an advance payment
- The standard advance is 30% of the total project price
- The remaining balance is due as per the project agreement
- Project timelines will be discussed after the pre-booking is confirmed
- The final deliverables may vary from initial concepts based on requirements gathered during the project

## 5. Pricing & Payments

### 5.1 Pricing
- All prices are in Indian Rupees (₹) unless specified otherwise
- We reserve the right to modify prices at any time without prior notice
- Prices for pre-booked projects are locked at the time of booking

### 5.2 Payment Methods
We accept payments through:
- **Razorpay** — Indian payment gateway (cards, UPI, net banking, wallets)
- **PayPal** — International payment gateway
- Payments are processed on the respective gateway's secure platform

### 5.3 Payment Confirmation
- Payment is confirmed when the payment gateway returns a successful transaction
- Scrollzea is not responsible for payment failures caused by the payment gateway, bank, or network issues

## 6. Pre-Booking & Advance Payment (Custom Services)

### 6.1 Advance Payment
- Custom services require an advance payment to confirm the booking
- The standard advance is 30% of the total project price
- The advance payment secures your spot in our project queue and initiates the project

### 6.2 Remaining Payment
- The remaining amount is due as per the project agreement
- Payment milestones may be set for larger projects

### 6.3 Project Commencement
- The project begins once the advance payment is confirmed
- We will contact you to discuss requirements within 2-3 business days of receiving the advance

## 7. Delivery Policy

### 7.1 Digital Products
- Delivery method varies by product: direct download, external link, or manual delivery
- Download links, if applicable, are valid for a limited period
- We are not responsible for loss of digital files after delivery

### 7.2 Custom Services
- Delivery timelines are discussed and agreed upon during the project
- We will keep you informed of progress throughout the project
- Final delivery occurs upon project completion and your approval

## 8. Refund Policy
*See our complete Refund Policy on the Refund Policy page.*

### 8.1 Digital Products (Ready-Made)
- Due to the nature of digital products, all sales are **final** once the product is delivered
- Refunds are considered on a case-by-case basis if:
  - The product is not as described
  - The product is defective or non-functional
  - Duplicate purchase

### 8.2 Free Products
- No refund applies to free products (₹0)

### 8.3 Custom Services (Pre-booked)
- **Advance payments are non-refundable** after project work has commenced
- If we are unable to begin your project within a reasonable timeframe, you may request a full refund of the advance
- If the project is cancelled by you after work has started, the advance is non-refundable and covers the work completed up to that point
- Partial refunds may be considered based on the stage of the project

## 9. User Accounts

### 9.1 Account Registration
- You may create an account to track orders and favorites
- You are responsible for maintaining the confidentiality of your account credentials
- You are responsible for all activities under your account

### 9.2 Account Termination
- We reserve the right to suspend or terminate accounts that violate these terms
- You may delete your account at any time by contacting us

## 10. Intellectual Property

### 10.1 Digital Products
- Upon purchase, you receive a license to use the digital product as intended
- You may NOT resell, redistribute, or share the digital product without permission
- All intellectual property rights remain with Scrollzea unless otherwise stated

### 10.2 Custom Services
- Upon full payment, intellectual property rights for custom deliverables are transferred to you
- Scrollzea reserves the right to display completed work in our portfolio

## 11. User Conduct
You agree NOT to:
- Use the website for any unlawful purpose
- Attempt to hack, crack, or compromise the website
- Submit false or misleading information
- Upload malicious files or code
- Harass, abuse, or harm other users

## 12. Limitation of Liability
- Scrollzea provides products and services "as is" without warranty
- We are not liable for damages arising from the use or inability to use our products
- Our total liability shall not exceed the amount paid by you for the specific product or service
- We are not responsible for third-party platform issues (Razorpay, PayPal, etc.)

## 13. Indemnification
You agree to indemnify and hold Scrollzea harmless from any claims, damages, or expenses arising from your use of our services or violation of these terms.

## 14. Governing Law
These terms are governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts in Kolkata, West Bengal.

## 15. Changes to Terms
We reserve the right to modify these terms at any time. Continued use of the website after changes constitutes acceptance.

## 16. Contact
- **Email:** srollzea@gmail.com
- **Location:** Kolkata, West Bengal, India
```

### 19.3 Refund Policy

```
# Refund Policy

Last updated: [Current Date]

## 1. Our Commitment
At Scrollzea, we want you to be satisfied with your purchase. Due to the nature of digital products and custom services, our refund policy is structured as follows:

## 2. Ready-Made Digital Products

### 2.1 General Policy
All sales of ready-made digital products are **final** due to the instant nature of digital delivery. Once a digital product is delivered, it cannot be "returned."

### 2.2 When Refunds May Be Issued
We may issue a refund in the following circumstances:

| Situation | Refund Eligible? | Details |
|---|---|---|
| Product not as described | ✅ Yes | If the product significantly differs from its description |
| Product is defective/non-functional | ✅ Yes | If the digital file is corrupted or unusable |
| Duplicate purchase | ✅ Yes | If you accidentally purchased the same product twice |
| Change of mind | ❌ No | Due to the nature of digital products |
| Didn't download in time | ❌ No | Download links are active for a reasonable period |

### 2.3 Refund Process
- Contact us at srollzea@gmail.com with your order details
- We will review your request within 2-3 business days
- Approved refunds will be processed through the original payment method within 5-7 business days
- Refund processing time depends on the payment gateway (Razorpay/PayPal)

## 3. Free Products
- No refund applies to free products (₹0)
- If you experienced issues accessing a free product, please contact us for assistance

## 4. Custom Services (Pre-booked)

### 4.1 Before Work Commences
- If you cancel before we begin work on your project, you may receive a **full refund** of the advance payment

### 4.2 After Work Has Commenced
- Once project work has started, the **advance payment is non-refundable**
- The advance covers the initial consultation, requirement analysis, project planning, and time allocated to your project
- If we are unable to deliver the project as agreed, we will discuss a fair resolution

### 4.3 Project Delays by Scrollzea
- If we fail to begin your project within 7 business days of receiving the advance (without prior communication), you may request a full refund of the advance

### 4.4 Partial Refunds
- May be considered based on the project stage completed
- Determined on a case-by-case basis

## 5. How to Request a Refund
1. Email us at **srollzea@gmail.com**
2. Include:
   - Your name and contact information
   - Order/transaction number
   - Product or service name
   - Reason for refund request
3. We will respond within 2-3 business days

## 6. Payment Gateway Refund Timelines
- **Razorpay**: Refunds are processed within 5-7 business days after approval
- **PayPal**: Refunds are processed within 3-5 business days after approval
- Funds may take additional time to reflect depending on your bank/payment method

## 7. Contact Us
For refund enquiries:
- **Email:** srollzea@gmail.com
- **Location:** Kolkata, West Bengal, India
```

### 19.4 Legal Disclaimer
These policies are provided as templates for a digital products business. Scrollzea is not a law firm and this does not constitute legal advice. We recommend consulting with a legal professional to ensure compliance with applicable laws and regulations in India, including:
- **Information Technology Act, 2000**
- **IT (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011**
- **Consumer Protection Act, 2019**
- **GST regulations for digital products and services**

## 20. Project Documentation Files

### 20.1 Required Documentation

The following files will be created in the project root to help the business owner understand, modify, and maintain the project:

| File | Purpose |
|---|---|
| `TASKS.md` | Complete project overview, file structure, how to add products/categories/settings, how to deploy, troubleshooting guide |
| `ARCHITECTURE.md` | High-level architecture overview, data flow, technology stack, deployment architecture |
| `DEVELOPMENT.md` | Local development setup, commands, environment variables, database management |
| `.env.example` | All required environment variables with documentation |
| `README.md` | Project overview, what Scrollzea is, tech stack, quick start |

### 20.2 TASKS.md Content Structure

The TASKS.md file will include:

1. **Project Overview** — What Scrollzea is, business model
2. **File Structure** — Complete directory tree with explanations of each folder
3. **Admin Guide** — Step-by-step guide to:
   - Adding a new product
   - Editing existing products
   - Deleting products
   - Managing categories
   - Viewing leads
   - Managing orders
   - Updating website settings
   - Configuring chatbot
   - Viewing analytics
4. **Product Types Explained** — READY_MADE, FREE, PREBOOK, CUSTOM_QUOTE — what each means and how to use them
5. **Payment Configuration** — How to set up Razorpay, PayPal, WhatsApp for each product
6. **Analytics Guide** — How to interpret click tracking, sales data, product performance
7. **Database Schema Reference** — Table structure in plain English
8. **How to Deploy** — GitHub → Vercel deployment steps
9. **How to Modify** — Guide to adding new features, changing design, adding pages
10. **Troubleshooting** — Common issues and solutions
11. **Future Migration** — How to migrate from Turso to PostgreSQL when needed

### 20.3 ARCHITECTURE.md Content

The ARCHITECTURE.md file will include:
- System overview diagram (ASCII)
- Technology stack table
- Route structure (public + admin + API)
- Data flow diagrams
- Component hierarchy
- Database ERD in text form
- Deployment pipeline

### 20.4 DEVELOPMENT.md Content

The DEVELOPMENT.md file will include:
- Prerequisites (Node.js, Git, Turso account)
- Local setup steps (clone, install deps, configure env, run migrations, dev server)
- Available commands (dev, build, start, lint, db:push, db:generate, db:studio)
- Environment variables reference
- Database management (how to add tables, run migrations)
- How to add a new page
- How to add a new API route
- Testing notes

## 21. Future-Proofing & Extensibility

### 21.1 Database Migration Path (Turso → PostgreSQL)
When Scrollzea grows beyond Turso's free tier or needs PostgreSQL features:
1. Create a Neon/PostgreSQL database
2. Update Drizzle schema (minor type adjustments, if any)
3. Run `drizzle-kit push:pg` to create tables in PostgreSQL
4. Update `lib/db.ts` to use `@neondatabase/serverless` driver
5. Run data migration script
6. Update environment variables
7. Deploy

The Drizzle ORM abstraction means 90%+ of the codebase needs NO changes.

### 21.2 Adding New Features
The modular architecture makes it easy to add:

| Feature | How to Add |
|---|---|
| Coupon/discount codes | Add `coupons` table, check in checkout flow |
| Customer reviews/ratings | Add `reviews` table, display on product pages |
| Blog/CMS | Add `posts` table, create admin editor, add public routes |
| Newsletter | Add `subscribers` table, integrate email API |
| WhatsApp order notifications | Add webhook handler, integrate WhatsApp Business API |
| Multi-currency | Add currency field to products, update price display |
| Digital file delivery via email | Add email attachment logic to Resend |
| Customer portal | Extend account pages with more features |
| Wishlist sharing | Add share functionality to favorites |
| Stock/inventory tracking | Add stock fields, low-stock alerts (if needed for digital products with limits) |

### 21.3 Scalability Considerations
- Turso free tier: 9GB storage, 1B rows read/month — sufficient for thousands of products and orders
- When exceeding free tier: upgrade Turso plan or migrate to PostgreSQL
- Vercel free tier: 100GB bandwidth, 6000 build minutes/month — sufficient for a growing digital business
- Images served via Uploadthing CDN — no server load for media
- API routes are serverless — auto-scale with traffic
- Static pages (about, legal) are cached at CDN edge

### 21.4 Code Maintainability Principles
- Every component has a single responsibility
- Server actions for mutations, API routes for reads where SSR is needed
- Drizzle schema is the single source of truth for data structure
- Tailwind classes for styling (no CSS module proliferation)
- TypeScript throughout for self-documenting code
- Comments only where logic is non-obvious
- Consistent naming conventions (kebab-case files, camelCase variables, PascalCase components, UPPER_CASE constants)
