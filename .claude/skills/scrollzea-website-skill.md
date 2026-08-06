# Scrollzea Website Generator Skill

Generate a complete public-facing website for any niche/subject using the Scrollzea pattern. This skill creates a full-featured marketplace or listing site with homepage, search, categories, product pages, contact forms, and theme system — reusable across any subject.

## Usage

When the user asks to generate a website for a new subject/niche, follow this plan.

## Configuration Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SITE_NAME` | Website name | "Scrollzea", "GadgetHub", "ArtisanMarket" |
| `SITE_DOMAIN` | Main subject/niche | "Digital Products", "Electronics", "Handicrafts" |
| `SITE_TAGLINE` | Short tagline | "Premium Digital Products Marketplace" |
| `SITE_EMAIL` | Business email | "srollzea@gmail.com" |
| `SITE_LOCATION` | Business location | "Kolkata, West Bengal, India" |
| `WHATSAPP_NUMBER` | WhatsApp number | "911234567890" |
| `FACEBOOK_URL` | Facebook page URL | "https://www.facebook.com/scrollzea" |
| `INSTAGRAM_URL` | Instagram URL | "https://www.instagram.com/scrollzea/" |
| `PRIMARY_COLOR` | Gold accent color (hex) | "#D4AF37" |
| `PRIMARY_COLOR_LIGHT` | Lighter accent | "#F4D06F" |
| `BG_DARK` | Dark background | "#071B14" |
| `BG_DARK_2` | Secondary dark bg | "#0D241D" |
| `LOGO_PATH` | Logo image path | "/logo.jpg" |
| `HERO_TITLE` | Hero headline | "Ready-to-Use Digital Products for Business, Creators & Developers" |
| `HERO_SUBTITLE` | Hero sub-text | "Buy professional website templates, management systems, Flutter apps..." |
| `FEATURES` | Hero features list | ["Instant Download", "Secure Payment", "Premium Quality", "WhatsApp Support"] |
| `HOW_IT_WORKS` | Steps | See below |
| `WHY_CHOOSE_US` | Value props | See below |
| `TESTIMONIALS` | Testimonials | See below |
| `FAQ_ITEMS` | FAQ questions | See below |
| `NAV_LINKS` | Navigation links | ["Products", "Categories", "Freebies", "Custom Work", "Contact"] |
| `FOOTER_LINKS_1` | Footer column 1 | Products links |
| `FOOTER_LINKS_2` | Footer column 2 | Company links |
| `FOOTER_LINKS_3` | Footer column 3 | Legal links |

## Generated File Structure

```
├── app/
│   ├── layout.tsx                   # Root layout with metadata
│   ├── page.tsx                     # Homepage (hero, featured, categories, testimonials, FAQ, CTA)
│   ├── globals.css                  # Global styles, CSS variables, theme
│   ├── sitemap.ts                   # SEO sitemap
│   ├── robots.ts                    # Robots.txt
│   └── (public)/
│       ├── layout.tsx               # Public layout (Header + Footer)
│       ├── products/
│       │   ├── page.tsx             # Products listing with search
│       │   └── [slug]/
│       │       └── page.tsx         # Product detail page
│       ├── categories/
│       │   ├── page.tsx             # All categories
│       │   └── [slug]/
│       │       └── page.tsx         # Category detail
│       ├── freebies/
│       │   └── page.tsx             # Free products page
│       ├── services/
│       │   └── page.tsx             # Custom services page
│       ├── about/
│       │   └── page.tsx             # About us
│       ├── contact/
│       │   └── page.tsx             # Contact form
│       ├── account/
│       │   └── page.tsx             # Customer account
│       ├── auth/
│       │   └── page.tsx             # Customer auth
│       ├── privacy/
│       │   └── page.tsx             # Privacy policy
│       ├── terms/
│       │   └── page.tsx             # Terms & conditions
│       └── refund/
│           └── page.tsx             # Refund policy
├── components/
│   ├── public/
│   │   ├── Header.tsx               # Navigation header with search, theme toggle, mobile menu
│   │   ├── Footer.tsx               # Full footer with links, social, copyright
│   │   ├── HomeSearchBar.tsx        # Homepage hero search
│   │   ├── ProductCard.tsx          # Product card component
│   │   └── ProductsSearchBar.tsx    # Products page search
│   └── ui/                          # Shared UI components
│       ├── Badge.tsx
│       ├── Button.tsx
│       └── Card.tsx
├── app/api/
│   ├── products/route.ts            # Public products API
│   ├── products/[slug]/route.ts     # Single product detail API
│   ├── products/search/route.ts     # Product search API
│   ├── categories/route.ts          # Public categories API
│   ├── settings/route.ts            # Public settings API
│   ├── contact/route.ts             # Contact form submission
│   └── track/click/route.ts         # Click tracking
├── public/
│   └── logo.jpg                     # Website logo
├── db/
│   └── schema.ts                    # Database schema (shared with admin)
└── lib/
    ├── db.ts                        # Database client
    └── utils.ts                     # Utility functions
```

## Step-by-Step Implementation

### 1. Global Styles (`app/globals.css`)

Tailwind CSS v4 with custom theme variables:

```css
@import "tailwindcss";

@theme {
  --color-brand-dark: #071B14;
  --color-brand-dark-2: #0D241D;
  --color-brand-gold: #D4AF37;
  --color-brand-gold-light: #F4D06F;
  --color-brand-gold-muted: rgba(212, 175, 55, 0.15);
  --color-brand-light: #FFFFFF;
  --color-brand-surface: #F8FAFC;
  --color-brand-text: #0F172A;
  --color-brand-text-muted: #64748B;
  --color-brand-success: #22C55E;
  --color-brand-error: #EF4444;
}

:root {
  --bg-primary: #071B14;
  --bg-secondary: #0D241D;
  --bg-card: #0F281F;
  --bg-card-hover: #153329;
  --text-primary: #FFFFFF;
  --text-muted: #B8C2BE;
  --text-dim: #6B7B76;
  --accent-gold: #D4AF37;
  --accent-gold-light: #F4D06F;
  --accent-glow: rgba(212, 175, 55, 0.08);
  --border-gold: rgba(212, 175, 55, 0.15);
  --border-gold-hover: rgba(212, 175, 55, 0.35);
  --overlay-dark: rgba(0, 0, 0, 0.6);
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 40px rgba(212, 175, 55, 0.06);
  --font-display: 'Georgia', 'Playfair Display', serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.light-theme {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --bg-card: #FFFFFF;
  --bg-card-hover: #F1F5F9;
  --text-primary: #0F172A;
  --text-muted: #475569;
  --text-dim: #94A3B8;
  --accent-gold: #B8941E;
  --accent-gold-light: #D4AF37;
  --accent-glow: rgba(184, 148, 30, 0.06);
  --border-gold: rgba(184, 148, 30, 0.15);
  --border-gold-hover: rgba(184, 148, 30, 0.35);
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 40px rgba(184, 148, 30, 0.03);
}
```

### 2. Root Layout (`app/layout.tsx`)

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{SITE_NAME} — {SITE_TAGLINE}",
  description: "{SITE_DESCRIPTION}",
  openGraph: {
    title: "{SITE_NAME} — {SITE_TAGLINE}",
    description: "{SITE_DESCRIPTION}",
    siteName: "{SITE_NAME}",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 3. Public Layout (`app/(public)/layout.tsx`)

```tsx
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
```

### 4. Header Component (`components/public/Header.tsx`)

Features:
- **Fixed navbar** — transparent → solid on scroll (backdrop-blur)
- **Logo + brand** — linking to homepage
- **Desktop nav** — nav links, search bar, Contact Us CTA button, theme toggle
- **Mobile nav** — toggleable menu with all links, search, theme toggle
- **Search** — inline search bar opens on click, closes on outside click / empty submit
- **Theme toggle** — light/dark mode with localStorage persistence
- **Scroll detection** — adds background + border after 60px scroll

### 5. Footer Component (`components/public/Footer.tsx`)

Features:
- Gold gradient divider line at top
- **4-column grid**: Brand (logo, description, email, location), Products links, Company links, Legal links
- **Social icons** — Facebook, Instagram with hover effects
- **Bottom bar** — copyright with current year, social links

### 6. Homepage (`app/page.tsx`)

Sections (in order):
1. **Hero Section**
   - Full-screen gradient background
   - Welcome text + category badge
   - Main headline with gold gradient span
   - Subtitle description
   - Search bar (HomeSearchBar component)
   - CTA buttons: "Explore Products" + "Build Something Custom" (WhatsApp link)
   - Feature chips: Instant Download, Secure Payment, Premium Quality, WhatsApp Support

2. **Featured Products** (section-dark-2)
   - Section label + heading with gold gradient
   - 4-column grid of product cards
   - Empty state when no products
   - "View All Products" link

3. **Categories** (section-dark) — conditional: only shown if categories exist
   - 6-column grid of category cards with icons

4. **How It Works** (section-dark-2)
   - 4-step numbered process: Browse, Purchase, Access, Support

5. **Why Choose Us** (section-dark)
   - 4-column value props: Production Ready, Fast Delivery, Mobile Optimized, Real Support

6. **Testimonials** (section-dark-2)
   - 3-column testimonial cards with star ratings, quotes, names, roles

7. **FAQ** (section-dark)
   - Accordion-style FAQ with `<details>` elements
   - Gold accent on open state

8. **Final CTA** (section-dark-2)
   - "Ready to Build Something Great?"
   - Two buttons: Browse Products + Chat on WhatsApp

### 7. Product Card (`components/public/ProductCard.tsx`)

Features:
- Image with hover zoom effect
- Badges: Best Seller, Featured, FREE, discount percentage, type badges
- Product info: name, short description (2 lines clamped)
- Price display: with discount support, "FREE" for free items
- CTA button: "Buy Now", "Get Free", "Pre-book Now", "Request Quote" (based on type)
- Link to product detail page

### 8. Products Listing (`app/(public)/products/page.tsx`)

Features:
- Server-side data fetching with search params
- Filter by category, search query, type
- ProductsSearchBar for filtering
- Grid layout with ProductCard components
- Empty state when no results

### 9. Product Detail (`app/(public)/products/[slug]/page.tsx`)

Features:
- Server-side product fetch with all relations (images, features, payment options, FAQs)
- Image gallery with primary image
- Product info: name, description, features list
- Pricing section with discount
- Payment options (Razorpay, PayPal, WhatsApp)
- FAQ accordion for product-specific FAQs
- SEO metadata (title, description)

### 10. Search Components

**HomeSearchBar**:
- Large search input with icon
- Submit on Enter
- Links to /products?search=query

**ProductsSearchBar**:
- Search input + category filter dropdown
- Used on products listing page

### 11. SEO

**Sitemap** (`app/sitemap.ts`):
```ts
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.SITE_URL || "https://scrollzea2026.vercel.app";
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/freebies`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/refund`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
```

**Robots** (`app/robots.ts`):
```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/admin/" },
    sitemap: `${process.env.SITE_URL || "https://scrollzea2026.vercel.app"}/sitemap.xml`,
  };
}
```

## Design Patterns

### Reusable CSS Classes
```css
.gold-gradient { /* gold text gradient */ }
.glass-card { /* card with border, shadow, blur */ }
.btn-gold { /* gold gradient button */ }
.btn-ghost-gold { /* outlined gold button */ }
.product-card { /* product card with hover effects */ }
.step-number { /* numbered circle step indicator */ }
.section-label { /* gold label with dot prefix */ }
.animate-fade-in-up { /* staggered fade-in animation */ }
.hero-gradient { /* radial gradient hero background */ }
```

### Components
- **Loading state**: LoadingSpinner component with centered animation
- **Empty state**: EmptyState component with icon, title, description, optional action button
- **Error state**: Error boundaries or try/catch with fallback messages
- **Animations**: Staggered fade-in-up with `animationDelay` via inline style
- **Responsive**: Mobile-first with `sm:`, `md:`, `lg:` breakpoints
- **Hover effects**: Scale, translateY, border glow, shadow transitions

### Key Patterns
- Server Components for data fetching where possible
- Client Components for interactive elements
- CSS variables for theming (dark/light mode)
- All public pages use `(public)` route group with shared Header/Footer layout
- Consistent gold accent on all interactive elements
- Backdrop blur for overlays and fixed headers
- Gradient backgrounds for hero sections and buttons

## Adaptation Notes

When generating for a different niche:
1. **Homepage sections** — adapt the 8-section layout to match your niche
2. **Hero content** — change headline, subtitle, features to match the subject
3. **Product types** — modify enums for your domain (e.g., courses → "FREE", "PAID", "PREMIUM")
4. **"How It Works"** — customize the 4 steps for your process
5. **"Why Choose Us"** — customize value propositions
6. **Testimonials** — replace with niche-appropriate testimonials
7. **FAQ** — replace with niche-specific questions
8. **Navigation** — adapt nav links to your site structure
9. **Footer** — adapt columns and links to your site
10. **Theme** — keep the dark/gold scheme or customize CSS variables