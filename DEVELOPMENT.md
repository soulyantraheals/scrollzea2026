# Scrollzea — Development Guide

## Prerequisites

- **Node.js** v18+ (recommended: v20 LTS)
- **npm** or **pnpm**
- **Git**
- **Turso CLI** (for database management)

## Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/scrollzea.git
cd scrollzea
npm install
```

### 2. Set Up Turso Database

```bash
# Install Turso CLI (if not done)
npm install -g @libsql/cli

# Login to Turso
turso auth login

# Create database
turso db create scrollzea

# Get connection details
turso db show scrollzea        # Copy the URL
turso db tokens create scrollzea  # Copy the token
```

### 3. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

```env
# Turso Database
TURSO_DATABASE_URL=libsql://scrollzea-YOUR_USERNAME.turso.io
TURSO_AUTH_TOKEN=your_turso_token_here

# NextAuth (generate a random string)
AUTH_SECRET=your_random_secret_here
AUTH_URL=http://localhost:3000

# Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxx
LEAD_NOTIFICATION_EMAIL=srollzea@gmail.com
EMAIL_FROM=Scrollzea <noreply@scrollzea.vercel.app>

# Uploadthing
UPLOADTHING_SECRET=sk_live_xxxxx
UPLOADTHING_APP_ID=xxxxx
```

### 4. Create Database Tables

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000`

### 6. Create Admin Account

After starting the server:
1. Visit `http://localhost:3000/api/setup` (first visit only)
2. This creates the initial admin user
3. Log in at `http://localhost:3000/admin/login`

## Available Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (port 3000) |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run linter |
| `npm run db:push` | Push schema changes to database |
| `npm run db:generate` | Generate SQL migration files |
| `npm run db:studio` | Open Drizzle Studio (GUI database browser) |

## Project Scripts

Add these to your `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:push": "drizzle-kit push",
    "db:generate": "drizzle-kit generate",
    "db:studio": "drizzle-kit studio"
  }
}
```

## Database Management

### Adding a New Table

1. Add table definition in `db/schema.ts`
2. Run `npm run db:push` to create it in Turso

### Adding Columns to Existing Table

1. Add column to the table definition in `db/schema.ts`
2. Run `npm run db:push` — Drizzle handles the migration

### Viewing Database Contents

```bash
npm run db:studio
```
Opens Drizzle Studio at `http://localhost:4983` — a browser-based database browser.

## How to Add a New Public Page

1. Create a folder: `app/(public)/[page-name]/`
2. Create `page.tsx`:
```tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title',
  description: 'Page description',
}

export default async function Page() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold">Page Title</h1>
      {/* Your content */}
    </main>
  )
}
```

3. Link it from navigation (edit `components/public/Header.tsx`)

## How to Add a New Admin Section

1. Create folder: `app/admin/[section]/`
2. Create `page.tsx` (client component with 'use client')
3. Create corresponding API route in `app/api/admin/[section]/route.ts`
4. Add link in sidebar (`components/admin/Sidebar.tsx`)

## Environment Variables Reference

| Variable | Required | Where to Get |
|---|---|---|
| `TURSO_DATABASE_URL` | ✅ Yes | Turso dashboard: `turso db show` |
| `TURSO_AUTH_TOKEN` | ✅ Yes | Turso dashboard: `turso db tokens create` |
| `AUTH_SECRET` | ✅ Yes | Generate: `openssl rand -base64 32` |
| `AUTH_URL` | ✅ Yes | Your site URL (e.g. `http://localhost:3000`) |
| `RESEND_API_KEY` | ✅ Yes | Resend dashboard |
| `LEAD_NOTIFICATION_EMAIL` | ✅ Yes | srollzea@gmail.com |
| `EMAIL_FROM` | ✅ Yes | e.g. "Scrollzea <noreply@scrollzea.vercel.app>" |
| `UPLOADTHING_SECRET` | ✅ Yes | Uploadthing dashboard |
| `UPLOADTHING_APP_ID` | ✅ Yes | Uploadthing dashboard |

## Deployment Checklist

- [ ] All environment variables set in Vercel
- [ ] Turso database accessible from Vercel IPs
- [ ] Uploadthing can process uploads from your domain
- [ ] Resend domain verified
- [ ] Admin login works on production
- [ ] Products display correctly
- [ ] Contact form sends email
- [ ] Click tracking works
- [ ] AI chatbot responds
- [ ] All pages are responsive on mobile
- [ ] SEO metadata set
- [ ] Sitemap.xml accessible

## Common Tasks

### Adding a New Product Type
1. Add to `productType` enum in `db/schema.ts`
2. Add CTA logic in `components/public/ProductCard.tsx`
3. Add form options in `components/admin/ProductForm.tsx`

### Changing Site Theme
Edit CSS variables in `app/globals.css`:
```css
:root {
  --color-primary: #4F46E5;
  --color-primary-foreground: #FFFFFF;
  /* ... etc */
}
```

### Adding a New AI Chatbot Intent
Edit the intent patterns in `lib/chatbot/intents.ts`:
```typescript
const intents = {
  NEW_INTENT: ['keyword1', 'keyword2', 'keyword3'],
  // ...
}
```
