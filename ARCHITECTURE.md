# Scrollzea — Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER (Browser)                        │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                        Vercel (CDN + Edge)
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              Static Pages              Serverless Functions
            (ISR/SSG/Static)           (SSR + API Routes)
                    │                         │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
              Turso Database            Uploadthing
              (LibSQL/SQLite)           (Image CDN)
                    │
                    │ (via Resend)
                    ▼
            srollzea@gmail.com
```

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Turso (LibSQL) |
| ORM | Drizzle ORM |
| Auth | NextAuth.js v5 |
| Images | Uploadthing |
| Email | Resend |
| Icons | Lucide React |
| Deployment | GitHub + Vercel |

## Route Structure

### Public Routes
- `/` — Homepage (hero, categories, best sellers, new arrivals, freebies, services, how it works)
- `/products` — Product listing
- `/products/[slug]` — Product detail
- `/categories` — Category listing
- `/categories/[slug]` — Category detail
- `/freebies` — Free products
- `/services` — Custom services
- `/about` — About Scrollzea
- `/contact` — Contact form
- `/auth/*` — Customer login/register
- `/account/*` — Customer account (favorites, orders)
- `/privacy`, `/terms`, `/refund` — Legal pages

### Admin Routes (Protected)
- `/admin` — Dashboard
- `/admin/login` — Admin login
- `/admin/products/*` — Product CRUD
- `/admin/categories/*` — Category management
- `/admin/leads` — Lead management
- `/admin/orders` — Order management
- `/admin/projects` — Custom projects
- `/admin/customers` — Customer list
- `/admin/settings` — Website settings
- `/admin/chatbot` — AI chatbot config
- `/admin/analytics` — Click tracking & analytics

### API Routes
- `/api/auth/*` — Authentication
- `/api/products/*` — Product data
- `/api/categories/*` — Category data
- `/api/contact` — Contact form
- `/api/chatbot/*` — AI chatbot
- `/api/track/*` — Click/download tracking
- `/api/admin/*` — Admin CRUD
- `/api/uploadthing` — File upload

## Component Hierarchy

```
RootLayout
├── CartProvider
├── SessionProvider (Auth)
│
├── PublicLayout (for public routes)
│   ├── Header (logo, nav, search, cart)
│   ├── Page Content
│   │   ├── HomePage
│   │   │   ├── HeroSection
│   │   │   ├── FeaturedCategories
│   │   │   ├── BestSellers
│   │   │   ├── NewArrivals
│   │   │   ├── FreeResources
│   │   │   ├── HowItWorks
│   │   │   ├── WhyScrollzea
│   │   │   ├── AIChatPreview
│   │   │   └── ContactCTA
│   │   ├── ProductDetailPage
│   │   │   ├── ProductGallery
│   │   │   ├── ProductInfo
│   │   │   ├── PaymentOptions
│   │   │   ├── PreBookCalculator
│   │   │   └── RelatedProducts
│   │   ├── ContactPage
│   │   │   └── ContactForm
│   │   └── ...
│   ├── Footer
│   └── ChatbotWidget
│
├── AdminLayout (for admin routes)
│   ├── Sidebar
│   ├── AdminHeader
│   └── Page Content
│       ├── Dashboard
│       │   ├── StatCard (×4)
│       │   ├── RecentOrdersTable
│       │   ├── RecentLeadsTable
│       │   └── TopProductsChart
│       ├── ProductForm
│       │   ├── BasicInfoSection
│       │   ├── PricingSection
│       │   ├── ImageUploader
│       │   ├── PaymentOptionsEditor
│       │   └── VisibilitySection
│       └── ...
```

## Data Flow

### Product Display
```
Request → Next.js SSR → Drizzle Query → Turso DB → JSON → React Component → HTML
```

### Contact Form
```
Client Submit → Server Validation → DB Insert (lead) → Email (Resend) → Response
```

### Click Tracking
```
Client Click → /api/track/click → DB Insert (click_event) → 302 Redirect (to payment URL)
```

### AI Chatbot
```
User Message → API Route → Parse Intent → Query DB (products) → Format Response → JSON
```

## Database Entity Relationships

```
categories ──┬── products ──┬── product_images
              │              ├── product_features
              │              ├── payment_options
              │              ├── faqs
              │              ├── click_events
              │              ├── orders
              │              └── favorites ── customers
              │
              └── leads ── custom_projects
```

## Security Architecture

- Admin routes protected by NextAuth middleware
- All API routes validate input server-side
- Passwords hashed with bcrypt
- No API keys exposed in client bundle
- HTTPS enforced by Vercel
- Rate limiting on contact/unauth endpoints
- Database parameterized queries prevent SQL injection
