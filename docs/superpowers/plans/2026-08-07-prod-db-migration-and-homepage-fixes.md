# Prod DB Migration + Homepage Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the live `scrollzea2026` production site fully work again by bringing the prod Turso DB schema in line with the code, mirroring the local catalog (including premium content) into prod, then fixing the homepage title copy and light-mode default, and verifying the admin panel is functional.

**Architecture:** Two idempotent Node scripts (`scripts/migrate-prod.mjs`, `scripts/sync-prod-data.mjs`) operate directly on the prod Turso DB using credentials from `turso token.txt` (the `.env*` files are scrubbed to `[SENSITIVE]` and unusable). The migration is schema-only and data-preserving (ALTER TABLE ADD COLUMN / CREATE TABLE IF NOT EXISTS — never a rebuild). The sync mirrors local product rows and their related tables into prod by slug, preserving prod-only rows and never touching orders/leads/customers. Homepage fixes are small edits to `app/page.tsx` (hero title) and `app/layout.tsx` (light-mode first paint).

**Tech Stack:** Node.js ESM, `@libsql/client`, Drizzle schema in `db/schema.ts`, Next.js 15 (App Router), Tailwind v4 CSS vars.

## Global Constraints

- **Prod creds come ONLY from `turso token.txt`** (real URL + JWT token). The `.env*` files literally contain `[SENSITIVE]` placeholders and must not be used.
- **Data-preserving only.** `ALTER TABLE ADD COLUMN`, `CREATE TABLE IF NOT EXISTS`. **Never** `drizzle-kit push`, table rebuild, `DROP`, or wholesale DB dump.
- **Never touch** `orders`, `leads`, `customers`, `click_events`, `custom_projects`, `favorites` on prod.
- **Preserve prod-only products** (e.g. `my-period-tracker`, id 22) — do not delete any product that doesn't exist locally.
- All migrations/syncs are **idempotent** — safe to re-run.
- `npx tsc --noEmit` must pass after every code task.
- Do **not** run `next build` while a dev server is running (both share `.next`). Kill the port-3000 process first.
- Deploy to Vercel only after user confirms (dev-locally-first workflow).

---

### Task 1: Prod schema migration script

**Files:**
- Create: `scripts/migrate-prod.mjs`

**Interfaces:**
- Consumes: `turso token.txt` (prod URL line starting `libsql://`; first `eyJ...` JWT token).
- Produces: A script that, when run, adds the missing columns/tables to the prod DB. Later tasks run it; Task 2 depends on prod having these columns.

- [ ] **Step 1: Write the migration script**

Create `scripts/migrate-prod.mjs`:

```javascript
// Safe prod schema migration for scrollzea2026. ALTER TABLE ADD COLUMN /
// CREATE TABLE IF NOT EXISTS only — data-preserving, idempotent.
// Reads real prod creds from turso token.txt (env files are scrubbed).
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

// --- Load prod creds from turso token.txt ---
const raw = readFileSync("turso token.txt", "utf-8");
const url = (raw.split("\n").find((l) => l.trim().startsWith("libsql://")) || "").trim();
const token = (raw.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/) || [""])[0];
if (!url || !token) {
  console.error("Could not read prod creds from turso token.txt");
  process.exit(1);
}
const db = createClient({ url, authToken: token });

async function columnExists(table, col) {
  const r = await db.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((c) => c.name === col);
}
async function addColumn(table, col, def) {
  if (await columnExists(table, col)) {
    console.log(`  ${table}.${col}: exists, skip`);
    return false;
  }
  await db.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  console.log(`  ${table}.${col}: added`);
  return true;
}
async function tableExists(name) {
  const r = await db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", [name]);
  return r.rows.length > 0;
}

async function main() {
  console.log("Migrating prod schema (scrollzea2026)...");

  // products — new pricing/offer/CTA/urgency/YouTube columns
  const productColumns = [
    ["original_price", "REAL"],
    ["sale_price", "REAL"],
    ["currency", "TEXT NOT NULL DEFAULT 'INR'"],
    ["show_limited_offer", "INTEGER NOT NULL DEFAULT 0"],
    ["offer_label", "TEXT NOT NULL DEFAULT 'Limited Time Offer'"],
    ["payment_description", "TEXT NOT NULL DEFAULT 'One-time payment · Lifetime access · No subscriptions'"],
    ["cta_text", "TEXT NOT NULL DEFAULT 'Get Instant Access Now'"],
    ["secondary_cta_text", "TEXT NOT NULL DEFAULT 'Contact Us'"],
    ["secondary_cta_url", "TEXT"],
    ["social_proof_text", "TEXT NOT NULL DEFAULT 'Join 50,000+ satisfied customers'"],
    ["urgency_enabled", "INTEGER NOT NULL DEFAULT 0"],
    ["show_fire_symbol", "INTEGER NOT NULL DEFAULT 1"],
    ["urgency_text", "TEXT NOT NULL DEFAULT 'Hurry! Offer Ends In'"],
    ["expires_at", "TEXT"],
    ["youtube_enabled", "INTEGER NOT NULL DEFAULT 0"],
    ["youtube_url", "TEXT"],
    ["youtube_button_text", "TEXT NOT NULL DEFAULT 'Watch YouTube Video'"],
    ["youtube_video_title", "TEXT"],
  ];
  for (const [col, def] of productColumns) {
    await addColumn("products", col, def);
  }

  // product_features.enabled + created_at
  await addColumn("product_features", "enabled", "INTEGER NOT NULL DEFAULT 1");
  if (await addColumn("product_features", "created_at", "TEXT DEFAULT ''")) {
    await db.execute("UPDATE product_features SET created_at = datetime('now') WHERE created_at = '' OR created_at IS NULL");
  }

  // faqs.enabled + created_at
  await addColumn("faqs", "enabled", "INTEGER NOT NULL DEFAULT 1");
  if (await addColumn("faqs", "created_at", "TEXT DEFAULT ''")) {
    await db.execute("UPDATE faqs SET created_at = datetime('now') WHERE created_at = '' OR created_at IS NULL");
  }

  // payment_options.label/icon/sort_order + legacy backfill
  await addColumn("payment_options", "label", "TEXT");
  await addColumn("payment_options", "icon", "TEXT");
  await addColumn("payment_options", "sort_order", "INTEGER NOT NULL DEFAULT 0");
  await db.execute("UPDATE payment_options SET label='Razorpay', icon='💳' WHERE provider='RAZORPAY' AND (label IS NULL OR label='')");
  await db.execute("UPDATE payment_options SET label='PayPal', icon='🅿️' WHERE provider='PAYPAL' AND (label IS NULL OR label='')");
  await db.execute("UPDATE payment_options SET label='WhatsApp', icon='💬' WHERE provider='WHATSAPP' AND (label IS NULL OR label='')");

  // create missing tables
  const tableCreates = {
    product_reviews: `CREATE TABLE IF NOT EXISTS product_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      company TEXT,
      rating INTEGER NOT NULL DEFAULT 5,
      review_text TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
    product_perfect_for: `CREATE TABLE IF NOT EXISTS product_perfect_for (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
  };
  for (const [name, ddl] of Object.entries(tableCreates)) {
    if (await tableExists(name)) {
      console.log(`  ${name}: exists, skip`);
      continue;
    }
    await db.execute(ddl);
    console.log(`  ${name}: created`);
  }

  console.log("Migration complete.");
}
main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
```

- [ ] **Step 2: Run the migration against prod**

Run: `node scripts/migrate-prod.mjs`
Expected: prints `added` for the ~18 products columns, `enabled`/`created_at` on product_features and faqs, `label`/`icon`/`sort_order` on payment_options, and `created` for `product_reviews` + `product_perfect_for`. No `exists, skip` lines on first run.

- [ ] **Step 3: Verify prod schema now matches**

Run: `node scripts/migrate-prod.mjs` (second run)
Expected: every line prints `exists, skip` — idempotent, exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-prod.mjs
git commit -m "feat: add prod schema migration script (scrollzea2026)"
```

---

### Task 2: Local→prod catalog sync script (full, including premium content)

**Files:**
- Create: `scripts/sync-prod-data.mjs`

**Interfaces:**
- Consumes: local `file:./scrollzea.db` (source of truth), prod creds from `turso token.txt`, and the columns/tables created in Task 1.
- Produces: Prod product rows + related tables mirroring local. Task 3 verifies the live site against this.

- [ ] **Step 1: Write the sync script**

Create `scripts/sync-prod-data.mjs`:

```javascript
// Full catalog mirror local -> prod (scrollzea2026). Matches products by
// slug, copies ALL product columns, and replace-on-save for related tables.
// Preserves prod-only rows; never touches orders/leads/customers.
import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

const local = createClient({ url: "file:./scrollzea.db" });

const raw = readFileSync("turso token.txt", "utf-8");
const url = (raw.split("\n").find((l) => l.trim().startsWith("libsql://")) || "").trim();
const token = (raw.match(/eyJ[\w-]+\.[\w-]+\.[\w-]+/) || [""])[0];
if (!url || !token) {
  console.error("Could not read prod creds from turso token.txt");
  process.exit(1);
}
const prod = createClient({ url, authToken: token });

const RELATED_TABLES = [
  "product_images",
  "product_features",
  "payment_options",
  "faqs",
  "product_reviews",
  "product_perfect_for",
];

async function main() {
  const localProducts = (await local.execute("SELECT * FROM products ORDER BY id")).rows;

  // prod product columns (post-migration) minus identity/immutable keys
  const prodCols = (await prod.execute("PRAGMA table_info(products)")).rows
    .map((c) => c.name)
    .filter((c) => !["id", "slug", "created_at"].includes(c));

  let matched = 0;
  let skipped = [];

  for (const lp of localProducts) {
    const slug = lp.slug;
    const found = await prod.execute("SELECT id FROM products WHERE slug = ?", [slug]);
    if (found.rows.length === 0) {
      skipped.push(slug);
      continue;
    }
    const prodId = found.rows[0].id;

    // copy all shared product columns (except id/slug/created_at)
    const setCols = [];
    const params = [];
    for (const c of prodCols) {
      if (!(c in lp)) continue;
      if (c === "updated_at") {
        setCols.push("updated_at = datetime('now')");
        continue;
      }
      setCols.push(`${c} = ?`);
      params.push(lp[c] ?? null);
    }
    params.push(prodId);
    await prod.execute(`UPDATE products SET ${setCols.join(", ")} WHERE id = ?`, params);

    // replace-on-save related tables (mirror local rows)
    for (const table of RELATED_TABLES) {
      await prod.execute(`DELETE FROM ${table} WHERE product_id = ?`, [prodId]);
      const rows = (await local.execute(`SELECT * FROM ${table} WHERE product_id = ? ORDER BY id`, [lp.id])).rows;
      if (rows.length === 0) continue;
      const localCols = (await local.execute(`PRAGMA table_info(${table})`)).rows.map((c) => c.name).filter((c) => c !== "id");
      for (const row of rows) {
        const keys = localCols.filter((k) => k in row);
        const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
        await prod.execute(sql, keys.map((k) => row[k] ?? null));
      }
    }
    matched++;
    console.log(`synced: ${slug} (prod id ${prodId})`);
  }

  console.log(`\nMatched+synced: ${matched}/${localProducts.length}`);
  if (skipped.length) console.log(`Skipped (not on prod): ${skipped.join(", ")}`);
  console.log("Sync complete.");
}
main().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
```

- [ ] **Step 2: Run the sync against prod**

Run: `node scripts/sync-prod-data.mjs`
Expected: prints `synced:` for every local product (21 products), ends with `Matched+synced: 21/21` and `Sync complete.` Exit 0.

- [ ] **Step 3: Verify idempotency**

Run: `node scripts/sync-prod-data.mjs` again
Expected: same output, no errors (replace-on-save makes re-runs safe).

- [ ] **Step 4: Verify prod state directly**

Run (one-liner): `node -e "const{readFileSync}=require('fs');const raw=readFileSync('turso token.txt','utf-8');const url=raw.split('\n').find(l=>l.trim().startsWith('libsql://')).trim();const token=(raw.match(/eyJ[\\w-]+\\.[\\w-]+\\.[\\w-]+/)||[''])[0];const{createClient}=require('@libsql/client');const db=createClient({url,authToken:token});db.execute(\"SELECT slug,status,featured FROM products WHERE slug IN ('ultimate-notion-dashboard','expense-tracker-pro','minimal-resume-template','my-period-tracker')\").then(r=>{r.rows.forEach(p=>console.log(p.slug,'|',p.status,'| featured='+p.featured));process.exit(0)})"`
Expected:
```
ultimate-notion-dashboard | published | featured=1
expense-tracker-pro | published | featured=1
minimal-resume-template | published | featured=1
my-period-tracker | published | featured=0
```
(`my-period-tracker` status/featured may be whatever prod had — it is preserved, not touched.)

- [ ] **Step 5: Commit**

```bash
git add scripts/sync-prod-data.mjs
git commit -m "feat: add local->prod catalog sync script (incl. premium content)"
```

---

### Task 3: Verify live site is fixed

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: prod DB state after Tasks 1–2.

- [ ] **Step 1: Confirm previously-broken pages now return 200**

Run:
```bash
for p in / /products /freebies /products/admin-dashboard-template /products/ultimate-notion-dashboard /products/expense-tracker-pro; do
  echo "$p: $(curl -s -o /dev/null -w '%{http_code}' https://scrollzea2026.vercel.app$p)"
done
```
Expected: every line ends in `200`.

- [ ] **Step 2: Confirm homepage renders real products (no placeholder)**

Run: `curl -s https://scrollzea2026.vercel.app/ | grep -oE "Products coming soon|Ultimate Notion Dashboard|Expense Tracker Pro|Free" | sort | uniq -c`
Expected: `"Products coming soon"` count is 0; at least one real product name appears (e.g. `Ultimate Notion Dashboard` or `Expense Tracker Pro`), and `Free` appears (FREE card badge).

- [ ] **Step 3: Confirm a FREE product page renders**

Run: `curl -s https://scrollzea2026.vercel.app/products/ultimate-notion-dashboard | grep -oE "Download now|Get Instant Access|Free|Ultimate Notion" | head`
Expected: page title/greeting text present (any of the matched tokens ≥ 1). A 200 with product name is sufficient.

- [ ] **Step 4: Confirm hero buttons point at working destinations**

Run: `curl -s https://scrollzea2026.vercel.app/ | grep -oE 'href="/products"|wa\.me/[0-9]{6,}'`
Expected: at least one `href="/products"` and one `wa.me/…` (the "Explore Products" and "Build Something Custom" targets). Since `/products` now returns 200 (Step 1), both buttons navigate to working pages. Actual click-through on desktop + mobile is a quick human browser check — note it in the report.

- [ ] **Step 5: Confirm admin API behaves correctly (401 unauth expected)**

Run: `curl -s -o /dev/null -w "%{http_code}\n" https://scrollzea2026.vercel.app/api/admin/dashboard`
Expected: `401` (unauthenticated → Unauthorized, NOT a 500).

- [ ] **Step 6: Record results**

Note the verification results in this task's report. Do not commit (nothing changed).

---

### Task 4: Homepage hero title copy

**Files:**
- Modify: `app/page.tsx:64-83`

**Interfaces:**
- Consumes: existing hero section markup.
- Produces: New hero heading hierarchy per user note ("Welcome to Scrollzea" title above the marketplace sentence; no "premium").

- [ ] **Step 1: Rewrite the hero heading block**

Replace the block from `{/* Welcome text */}` through the `</h1>` (currently lines 66–79) with:

```tsx
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Welcome to <span className="gold-gradient">Scrollzea</span>
            </h1>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[var(--border-gold)] text-[var(--accent-gold)] text-xs font-medium tracking-wider uppercase mb-6 mt-4">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-gold)]" />
              Digital Products Marketplace
            </div>

            <p className="mt-6 text-base sm:text-lg lg:text-xl text-[var(--text-muted)] leading-relaxed max-w-2xl">
              Ready-to-Use Digital Products for{" "}
              <span className="gold-gradient">Business, Creators &amp; Developers</span>
            </p>
```

(Then the existing description `<p>` on line 81 stays as-is.)

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Sanity-check locally with a dev server**

Run (in order):
```bash
npx next dev --port 3000 &
sleep 12
curl -s http://localhost:3000/ | grep -oE "Welcome to|Digital Products Marketplace|Business, Creators &amp; Developers" | head
```
Expected: all three strings present; no "Premium Digital Products Marketplace".

Then kill the dev server: `taskkill //F //PID <pid>` or close the background shell.

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: homepage hero — 'Welcome to Scrollzea' title, drop premium wording"
```

---

### Task 5: Light mode default on first paint

**Files:**
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: existing theme system (CSS vars: dark default under `:root`, `.light-theme` override; `Header.tsx` toggles `light-theme` class on `<html>` and stores `scrollzea-theme` in localStorage).
- Produces: `<html>` gets `light-theme` class before first paint unless the user stored `dark`, eliminating the dark flash. Header toggle behavior is unchanged.

- [ ] **Step 1: Add a pre-hydration theme script to the layout**

Modify `app/layout.tsx` so `<html>` has a `<head>` with an inline script:

```tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('scrollzea-theme');document.documentElement.classList.toggle('light-theme',t!=='dark');}catch(e){document.documentElement.classList.add('light-theme')}})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

This keeps the existing logic contract (`scrollzea-theme` stored value wins; default is light) but applies it before hydration so there's no dark flash on first load.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 3: Sanity-check locally**

Run:
```bash
npx next dev --port 3000 &
sleep 12
curl -s http://localhost:3000/ | grep -oE 'classList.toggle\("light-theme"|light-theme' | head -3
```
Expected: the inline script is present in the HTML head. (The class itself is applied client-side pre-paint, so presence of the script + no runtime error is the check.)

Then kill the dev server.

- [ ] **Step 4: Commit**

```bash
git add app/layout.tsx
git commit -m "feat: default to light mode on first paint (no dark flash)"
```

---

### Task 6: Verify admin is functional (root-cause fix only)

**Files:**
- None required unless a bug is found. Possible touch: `app/admin/(protected)/<page>/page.tsx` or admin API routes.

**Interfaces:**
- Consumes: prod DB schema fix from Task 1 (admin pages query the same tables).
- Produces: Confirmation that admin pages load and CRUD works; fixes for any discovered admin-only bugs.

- [ ] **Step 1: Confirm admin pages no longer 500 via session redirect**

Run:
```bash
for p in /admin/dashboard /admin/products /admin/leads /admin/orders /admin/categories; do
  echo "$p: $(curl -s -o /dev/null -w '%{http_code}' https://scrollzea2026.vercel.app$p)"
done
```
Expected: `307` or `308` (redirect to login because unauthenticated) — NOT `500`.

- [ ] **Step 2: Verify admin API data endpoints return 401 (not 500) unauth**

Run:
```bash
for p in /api/admin/dashboard /api/admin/products /api/admin/leads /api/admin/orders /api/admin/categories; do
  echo "$p: $(curl -s -o /dev/null -w '%{http_code}' https://scrollzea2026.vercel.app$p)"
done
```
Expected: `401` for each. A 500 here would indicate a remaining schema/query bug to fix.

- [ ] **Step 3: Local admin round-trip smoke test**

Run locally with the dev server:
```bash
npx next dev --port 3000 &
sleep 12
curl -s http://localhost:3000/admin/login -o /dev/null -w "login: %{http_code}\n"
curl -s http://localhost:3000/api/admin/dashboard -o /dev/null -w "dashboard api unauth: %{http_code}\n"
```
Expected: login page `200`; dashboard API `401`. This confirms the admin routes load and only auth gates them.

If any endpoint returns `500`, read the error, fix the underlying cause (likely a query referencing a column/table still missing), and re-run. Then kill the dev server.

- [ ] **Step 4: Commit any fixes (only if a bug was found)**

If fixes were needed:
```bash
git add -A app scripts db
git commit -m "fix: admin pages functional after schema alignment"
```
If no fixes were needed, make no commit and note that in the report.

- [ ] **Step 5: Note the remaining manual browser pass**

The product form full round-trip (create/edit/save, payment options, list editors, provider dropdown → confirmation page) requires a human in a browser at `https://scrollzea2026.vercel.app/admin`. Record this as the remaining manual step.

---

### Task 7: User-confirmed deployment

**Files:**
- None.

**Interfaces:**
- Consumes: committed code changes from Tasks 4–5 (DB work in Tasks 1–3 took effect immediately on the Turso DB — no deploy needed).

- [ ] **Step 1: Confirm deployment is wanted**

Ask the user before pushing to GitHub / deploying to Vercel (dev-locally-first workflow). If declined, stop here — the DB fix is already live; homepage code changes await deployment.

- [ ] **Step 2: Commit everything and push**

```bash
git add -A
git commit -m "fix: prod schema + catalog sync + homepage copy/theme"
git push origin main
```

- [ ] **Step 3: Trigger Vercel deploy**

Run: `npx vercel --prod` (from repo root) and confirm the deployment succeeds and `https://scrollzea2026.vercel.app` reflects the homepage copy + light-mode changes.

- [ ] **Step 4: Final live verification**

Repeat Task 3 Steps 1–2. Confirm `/products`, `/freebies`, product detail pages all 200 and homepage renders featured products with the new hero copy.
