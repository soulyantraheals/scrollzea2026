# Design — Prod DB migration, catalog sync, and homepage fixes

Date: 2026-08-07
Status: Approved
Applies to: `scrollzea2026` Vercel project (the live production site) + `C:\Users\nn\scrollzea`

## Problem

The live production site `https://scrollzea2026.vercel.app` is broken:

- `/products`, `/freebies`, and every `/products/[slug]` page return **HTTP 500**.
- The homepage renders "Products coming soon" — the `getHomepageData()` try/catch swallows the underlying DB error.
- Admin pages that query `products` fail the same way.
- Consequently the hero buttons ("Explore Products") navigate to an error page, and the site looks unprofessional.

### Root cause

The production Turso database (`libsql://scrollzea-soulyantra.aws-ap-south-1.turso.io`) has an **out-of-date schema**. The code's Drizzle schema (`db/schema.ts`) and every `db.select().from(products)` query reference columns/tables that don't exist on prod:

| Table | Missing on prod |
|---|---|
| `products` | 18 columns: `original_price`, `sale_price`, `currency`, `show_limited_offer`, `offer_label`, `payment_description`, `cta_text`, `secondary_cta_text`, `secondary_cta_url`, `social_proof_text`, `urgency_enabled`, `show_fire_symbol`, `urgency_text`, `expires_at`, `youtube_enabled`, `youtube_url`, `youtube_button_text`, `youtube_video_title` |
| `product_features` | `enabled`, `created_at` |
| `faqs` | `enabled`, `created_at` |
| `payment_options` | `label`, `icon`, `sort_order` |
| `product_reviews` | entire table |
| `product_perfect_for` | entire table |

The migration scripts that add these to the **local** DB (`scripts/migrate-aug3.mjs`, `scripts/migrate-2026-08-06.mjs`, `scripts/migrate-pricing-columns.mjs`) target `file:./scrollzea.db` and were never run against prod.

Secondary: the prod product **catalog state** is out of sync with local — most products are `draft`/unfeatured on prod while local has them `published` + featured.

Tertiary (homepage UX, from user notes): title copy ("Welcome to Scrollzea" title above the marketplace sentence, remove "premium"), light mode on load by default, verify hero buttons work.

## Approach

Selected: **A** — apply the missing schema to prod with safe data-preserving migrations, then mirror the local catalog (including premium content) into prod, then fix the homepage copy/theme, then verify admin works. No table rebuilds, no truncation, no wholesale DB dump.

## Section 1 — Prod DB schema migration

New idempotent script `scripts/migrate-prod.mjs`:

- Reads real prod `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN` from `turso token.txt` (the `.env*` files are scrubbed to `[SENSITIVE]` by a secret-redaction layer and cannot be used; the token file holds valid read/write creds already used to inspect prod successfully).
- Uses `createClient` from `@libsql/client` (same as existing scripts).
- For each column/table, guards with `PRAGMA table_info` / `CREATE TABLE IF NOT EXISTS` so re-runs are no-ops.
- Applies, data-preserving only (`ALTER TABLE ADD COLUMN`, never rebuild/truncate):
  - `products`: the 18 missing columns listed above (all nullable or with safe defaults).
  - `product_features`: `enabled INTEGER NOT NULL DEFAULT 1`, `created_at TEXT DEFAULT ''` then backfill `datetime('now')`.
  - `faqs`: `enabled INTEGER NOT NULL DEFAULT 1`, `created_at TEXT DEFAULT ''` then backfill `datetime('now')`.
  - `payment_options`: `label TEXT`, `icon TEXT`, `sort_order INTEGER NOT NULL DEFAULT 0`; backfill legacy `RAZORPAY`→Razorpay/💳, `PAYPAL`→PayPal/🅿️, `WHATSAPP`→WhatsApp/💬 (mirrors `migrate-2026-08-06.mjs`).
  - Create `product_reviews` and `product_perfect_for` with the exact DDL from `migrate-aug3.mjs`.

### Risk & mitigation
- DDL on the live DB mid-traffic. SQLite `ADD COLUMN` is metadata-only and fast; all added columns are nullable or defaulted. Run off-peak if preferred. Script is idempotent so a failed/partial run can be re-run safely.

## Section 2 — Full catalog mirror local → prod

New idempotent script `scripts/sync-prod-data.mjs`:

- Reads local DB from `file:./scrollzea.db` (source of truth) and prod from `turso token.txt`.
- Matches products **by slug**.
- For each matched product, copy **all** `products` columns local → prod (status, featured, price, discount_price, product_type, category_id, delivery, and every premium/offer/CTA/YouTube column).
- **Replace-on-save** for related tables (same semantics as the admin API): delete prod rows for that product_id, then insert local rows (mapping local product_id → prod product_id) for:
  - `product_images`
  - `product_features`
  - `payment_options`
  - `faqs`
  - `product_reviews`
  - `product_perfect_for`
- **Preserve** prod-only rows (`my-period-tracker`, id 22) — never delete products that don't exist locally.
- **Never touch** `orders`, `leads`, `customers`, `click_events`, `custom_projects`, `favorites` — real prod data stays.

Result: every live product detail page renders identical to local, including premium content.

## Section 3 — Homepage fixes

Small code changes in `app/page.tsx` and theme handling:

1. **Title copy**: make "Welcome to Scrollzea" the prominent hero title; ensure the marketplace sentence is "Digital Products Marketplace" (no "premium").
2. **Light mode default**: guarantee light theme on first paint (set `light-theme` before hydration / avoid dark flash), while keeping the stored-preference toggle in `Header.tsx`.
3. **Buttons**: verify "Explore Products" and "Build Something Custom" navigate correctly on desktop and mobile once pages return 200.
4. **Professional look**: confirm the hero renders featured products (the "Products coming soon" placeholder disappears with the DB fix); apply light-mode-friendly polish if needed.

## Section 4 — Admin functional (root-cause only)

- The schema fix unblocks admin pages (they query the same tables).
- Verify `/admin/dashboard`, `/admin/products`, `/admin/leads`, `/admin/orders`, `/admin/categories` load and that the product form round-trips (create/edit/save, payment options, lists).
- Fix any remaining admin-only bugs surfaced during verification.
- **No Grit restyle** in this pass.

## Verification

- Run `migrate-prod.mjs` then `sync-prod-data.mjs`; confirm exit 0 and idempotent re-runs.
- `curl` prod: `/`, `/products`, `/freebies`, `/products/admin-dashboard-template`, `/products/ultimate-notion-dashboard` all return 200.
- Homepage HTML contains featured product names (incl. FREE product) and no "Products coming soon".
- Admin dashboard API returns 200 when authenticated (401 unauth is expected).
- `npx tsc --noEmit` passes after homepage edits.
- Manual browser pass: admin login + product form round-trip (deferred to human where noted).

## Out of scope

- Grit-style admin restyle.
- Syncing orders/leads/customers.
- Retiring the stale `scrollzea` Vercel project (noted, not part of this pass).
- The `[SENSITIVE]` scrubbing of `.env*` files (Vercel dashboard env vars are intact; the site's runtime DB connection works — confirmed by live 200 homepages).
