# Scrollzea Admin Panel Generator Skill

Generate a complete admin panel for any website/niche using the Scrollzea pattern. This skill creates a full-featured admin dashboard with authentication, CRUD management, analytics, and settings — reusable across any subject.

## Usage

When the user asks to generate an admin panel for a new website/subject, follow this plan.

## Configuration Variables

When invoking this skill, collect these variables from the user:

| Variable | Description | Example |
|----------|-------------|---------|
| `SITE_NAME` | Name of the website | "Scrollzea", "GadgetHub", "ArtisanMarket" |
| `SITE_DOMAIN` | Main subject/niche | "Digital Products", "Electronics", "Handicrafts" |
| `SITE_TAGLINE` | Short tagline | "Premium Digital Products Marketplace" |
| `PRIMARY_COLOR` | Gold accent color (hex) | "#D4AF37" |
| `PRIMARY_COLOR_LIGHT` | Lighter accent | "#F4D06F" |
| `BG_DARK` | Dark background | "#071B14" |
| `BG_DARK_2` | Secondary dark bg | "#0D241D" |
| `LOGO_PATH` | Logo image path | "/logo.jpg" |
| `DB_TYPE` | Database type | "turso" (default) or "sqlite" |
| `AUTH_EMAIL` | Admin login email | "admin@example.com" |
| `AUTH_EMAIL_DISPLAY` | Shown on login page | "admin@example.com / password" |

## Generated File Structure

```
├── app/
│   ├── admin/
│   │   ├── (auth)/
│   │   │   ├── layout.tsx          # Auth layout (centered, minimal)
│   │   │   └── page.tsx            # Login page (credentials form)
│   │   └── (protected)/
│   │       ├── layout.tsx          # Protected layout (sidebar + header)
│   │       ├── dashboard/
│   │       │   └── page.tsx        # Dashboard with stats & recent items
│   │       ├── products/           # (or "items" for non-product sites)
│   │       │   ├── page.tsx        # Product listing with CRUD
│   │       │   ├── new/
│   │       │   │   └── page.tsx    # Create product form
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx # Edit product form
│   │       ├── categories/
│   │       │   └── page.tsx        # Category management
│   │       ├── orders/
│   │       │   └── page.tsx        # Order management
│   │       ├── leads/
│   │       │   └── page.tsx        # Lead management
│   │       ├── projects/
│   │       │   └── page.tsx        # Custom projects management
│   │       ├── customers/
│   │       │   └── page.tsx        # Customer management
│   │       ├── analytics/
│   │       │   └── page.tsx        # Analytics dashboard
│   │       └── settings/
│   │           └── page.tsx        # Website settings
├── components/
│   ├── admin/
│   │   ├── AdminHeader.tsx         # Admin header with sign out
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   ├── StatCard.tsx            # Dashboard stat card
│   │   ├── ImageUploader.tsx       # Image upload component
│   │   ├── ProductForm.tsx         # Product/Item form (rename for context)
│   │   └── PaymentOptionsEditor.tsx # Payment options editor
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── Input.tsx
│       ├── LoadingSpinner.tsx
│       └── Modal.tsx
├── app/api/
│   ├── admin/
│   │   ├── dashboard/route.ts      # Dashboard stats API
│   │   ├── products/route.ts       # Products CRUD API
│   │   ├── products/[id]/route.ts  # Single product API
│   │   ├── categories/route.ts     # Categories CRUD API
│   │   ├── orders/route.ts         # Orders API
│   │   ├── leads/route.ts          # Leads CRUD API
│   │   ├── projects/route.ts       # Projects API
│   │   ├── customers/route.ts      # Customers API
│   │   ├── analytics/route.ts      # Analytics API
│   │   └── settings/route.ts      # Settings CRUD API
│   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   ├── setup/route.ts              # Initial setup (create admin user)
│   ├── settings/route.ts           # Public settings API
│   ├── track/click/route.ts        # Click tracking API
│   └── upload/route.ts             # File upload API
├── db/
│   └── schema.ts                   # Complete database schema
├── lib/
│   ├── auth.ts                     # NextAuth configuration
│   ├── db.ts                       # Drizzle database client
│   ├── utils.ts                    # Utility functions
│   └── uploadthing.ts              # UploadThing config
├── middleware.ts                   # Auth middleware (route protection)
└── .env.example                    # Environment variables template
```

## Step-by-Step Implementation

### 1. Database Schema (`db/schema.ts`)

Create the schema with these tables (adapt names to the niche):

```typescript
// Core tables (rename for context)
- admin_users          # Admin authentication
- customers            # User/customer accounts
- items                # Products → rename to your domain (products, listings, posts, etc.)
- item_images          # Images for items
- item_features        # Features/attributes for items
- categories           # Categories/collections
- payment_options      # Payment methods per item
- orders               # Customer orders
- leads                # Contact form leads
- custom_projects      # Custom work/projects
- favorites            # Customer favorites
- click_events         # Analytics tracking
- website_settings     # Key-value settings store
- chatbot_settings     # Chatbot configuration
- faqs                 # Frequently asked questions
```

### 2. Database Client (`lib/db.ts`)

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error("TURSO_DATABASE_URL not set");
  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const client = getClient();
export const db = drizzle(client, { schema });
```

### 3. Authentication (`lib/auth.ts`)

NextAuth v5 with credentials provider, JWT strategy, session callbacks.

### 4. Middleware (`middleware.ts`)

- Protect all `/admin/*` routes (except `/admin` login page)
- Redirect authenticated users from login to dashboard
- Check session cookie for both HTTP and HTTPS prefixes

### 5. Auth Pages (`app/admin/(auth)/`)

- **Login page**: Email/password form, error handling from URL params, NextAuth `signIn` with credentials
- **Auth layout**: Centered card layout, dark background, logo display

### 6. Protected Layout (`app/admin/(protected)/layout.tsx`)

- Session check via `/api/auth/session` fetch
- Redirect to login if not authenticated
- Sidebar + Header layout
- Responsive (collapsible sidebar on mobile)

### 7. Admin Components

**Sidebar** (`components/admin/Sidebar.tsx`):
- Navigation items: Dashboard, Items, Categories, Leads, Orders, Projects, Customers, Analytics, Settings
- Active state highlighting
- Logo + brand
- Mobile overlay

**AdminHeader** (`components/admin/AdminHeader.tsx`):
- Mobile menu toggle
- Sign out button

**StatCard** (`components/admin/StatCard.tsx`):
- Icon, label, value display
- Dark theme card styling

**ProductForm** (`components/admin/ProductForm.tsx`):
- Full CRUD form with sections: Basic Info, Pricing, Images, Payment Options, Visibility, Delivery, SEO
- Image uploader with URL input
- Payment options editor (Razorpay, PayPal, WhatsApp)
- Auto-slug generation from name

### 8. Admin Pages

**Dashboard** (`/admin/dashboard`):
- Stat cards: Total Items, Published, New Leads, Orders, Revenue
- Recent orders table
- Recent leads list

**Items/Products** (`/admin/products`):
- Table with: name, type, price, status, featured, best-seller, actions
- CRUD operations
- Empty state handling

**Categories** (`/admin/categories`):
- Table with sort order, name, slug, status
- Modal for create/edit
- CRUD operations

**Leads** (`/admin/leads`):
- Table with: name, contact, purpose, status (dropdown), date
- Status update inline
- Delete with confirmation

**Orders** (`/admin/orders`):
- Table with: order number, customer, product, amount, payment status, order status, date
- Status badges with colors

**Analytics** (`/admin/analytics`):
- Click events tracking
- Stats by product
- Visual charts

**Settings** (`/admin/settings`):
- Key-value settings editor
- Fields: site name, description, email, social URLs, WhatsApp, SEO, chatbot config, etc.

### 9. UI Components (`components/ui/`)

Reusable components used across admin:
- `Button` — with loading state, variants (primary, outline)
- `Input` — with label, type, dark theme styling
- `Badge` — variants: default, free, prebook, best-seller, featured
- `Card` — base card component
- `Modal` — overlay modal with title
- `EmptyState` — empty state with title, description, optional action
- `LoadingSpinner` — centered loading spinner

### 10. API Routes

Each admin API route:
- Dashboard: aggregate stats from all tables
- Products: GET (list), POST (create), PUT (update), DELETE
- Categories: GET, POST, PUT, DELETE
- Orders: GET (list)
- Leads: GET, PUT (status), DELETE
- Settings: GET (all), PUT (save all)
- Track: POST click events
- Setup: initial admin user creation

### 11. Environment Variables

```
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
RESEND_API_KEY=re_...
UPLOADTHING_SECRET=...
UPLOADTHING_APP_ID=...
```

### 12. Package Dependencies

```json
{
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

## Adaptation Notes

When generating for a different niche:
1. **Rename tables** — `products` → `items`, `listings`, `courses`, `services`, etc.
2. **Adapt form fields** — change product-specific fields to match the niche
3. **Payment types** — keep Razorpay/PayPal for e-commerce; remove for non-commerce sites
4. **Item types** — modify `product_type` enum to match: `READY_MADE`, `FREE`, `PREBOOK`, `CUSTOM_QUOTE`
5. **Status badges** — keep the same color scheme (green=active, gold=warning, red=inactive)
6. **Theme** — keep the dark/gold scheme or swap CSS variables for custom branding

## Design Patterns

### Dark Theme CSS Variables
```css
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
}
```

### Key Patterns to Follow
- All admin pages use `"use client"` directive
- Fetch data in `useEffect` from API routes
- Consistent dark theme with gold accent borders
- Table-based layouts with overflow-x-auto for responsiveness
- Status badges with colored backgrounds
- Empty states for zero-data scenarios
- Loading spinners during data fetch
- Inline status updates with dropdown selects
- Delete with confirmation dialogs