# Editable Purchase Buttons, Dynamic Payment Providers & Confirmation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every product-type purchase button editable (label + URL), turn payment options into an open-ended admin-managed provider list (Gumroad, Razorpay, PayPal, Super Profile, …) shown in a dropdown, and add a per-product success page so customers can confirm their purchase/download back on the site.

**Architecture:** Extend the existing `payment_options` and `products` tables (safe ALTER migration). Rewrite `PaymentOptionsEditor` as a dynamic add/remove/reorder list. Rewrite the `PurchaseCta` client component so the main button opens a provider dropdown, a secondary editable "Contact Us" button always shows, and FREE products keep the download flow as a fallback. Add a server-rendered success page under `/products/[slug]/success`.

**Tech Stack:** Next.js 15 (App Router, server components + client components), TypeScript, Drizzle ORM, LibSQL/Turso (`file:./scrollzea.db`), Tailwind v4 (CSS vars: `--accent-gold`, `--border-gold`, `--bg-card`, etc.).

**Spec:** `docs/superpowers/specs/2026-08-06-purchase-buttons-payment-providers-confirmation-design.md`

## Global Constraints

- **Dev workflow:** run locally on port 3000 (`npm run dev`). Do **not** run `next build` while the dev server is running — they share `.next` and a build corrupts dev workers. Use `npx tsc --noEmit` for type checking (safe alongside the dev server).
- **Migrations:** use safe `scripts/migrate-*.mjs` (plain `ALTER TABLE ADD COLUMN`), **never** `drizzle-kit push` (it rebuilds/truncates tables).
- **Pricing semantics:** `price` = selling price (shown bold); `discountPrice` = original/MRP (struck through). `hasDiscount = discountPrice > price`.
- **Admin login** for manual checks: `srollzea@gmail.com` / `scrollzeaAdmin2024!`.
- **Styling:** match existing conventions — inline `style={{...}}` with CSS vars (`var(--accent-gold)`, `var(--bg-card)`, `var(--border-gold)`), `btnBase` button style in `PurchaseCta`.
- **Provider display:** dynamic. `payment_options.provider` is a machine key only; `label` (and optional `icon`) are what customers see.

---

### Task 1: Schema + safe migration

**Files:**
- Modify: `db/schema.ts`
- Create: `scripts/migrate-2026-08-06.mjs`
- Test: `scripts/migrate-2026-08-06.mjs` (run it) + `npx tsc --noEmit`

**Interfaces:**
- Produces: `payment_options` now has `label`, `icon`, `sortOrder` columns; `provider` is free text. `products` now has `secondary_cta_text`, `secondary_cta_url`. `clickEvents.eventType` accepts `"payment_click"`. Later tasks read/write these columns through Drizzle.

- [ ] **Step 1: Update `db/schema.ts` — `paymentOptions`**

Replace the `paymentOptions` table definition (lines ~112-120) with:

```ts
// Payment Options (dynamic providers — label/icon are what customers see)
export const paymentOptions = sqliteTable("payment_options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").notNull(),
  provider: text("provider").notNull(), // machine key, free text (e.g. "gumroad")
  label: text("label"),                 // display name (e.g. "Gumroad")
  icon: text("icon"),                   // optional emoji (e.g. "🛍️")
  paymentUrl: text("payment_url"),
  enabled: integer("enabled").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull().default("datetime('now')"),
});
```

- [ ] **Step 2: Update `db/schema.ts` — `products`**

Add two fields to the `products` table right after `ctaText` (around line 73):

```ts
  ctaText: text("cta_text").notNull().default("Get Instant Access Now"),
  secondaryCtaText: text("secondary_cta_text").notNull().default("Contact Us"),
  secondaryCtaUrl: text("secondary_cta_url"),
```

- [ ] **Step 3: Update `db/schema.ts` — `clickEvents` enum**

In `clickEvents` (around line 200), add `"payment_click"` to the `eventType` enum:

```ts
  eventType: text("event_type", {
    enum: ["razorpay_click", "paypal_click", "whatsapp_click", "download_click", "payment_click", "view_detail", "share"],
  }).notNull(),
```

- [ ] **Step 4: Create the migration script**

Create `scripts/migrate-2026-08-06.mjs` (copy the `columnExists` helper pattern from `scripts/migrate-aug3.mjs`):

```js
// Safe migration: dynamic payment providers + editable secondary CTA.
// ALTER TABLE ADD COLUMN only (data-preserving).
import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./scrollzea.db" });

async function columnExists(table, col) {
  const r = await client.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((c) => c.name === col);
}

async function addColumn(table, col, def) {
  if (await columnExists(table, col)) { console.log(`${table}.${col}: exists, skip`); return; }
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  console.log(`${table}.${col}: added`);
}

async function main() {
  // products
  await addColumn("products", "secondary_cta_text", "TEXT NOT NULL DEFAULT 'Contact Us'");
  await addColumn("products", "secondary_cta_url", "TEXT");

  // payment_options
  await addColumn("payment_options", "label", "TEXT");
  await addColumn("payment_options", "icon", "TEXT");
  await addColumn("payment_options", "sort_order", "INTEGER NOT NULL DEFAULT 0");

  // backfill labels/icons from legacy provider keys; order by id
  await client.execute("UPDATE payment_options SET label='Razorpay', icon='💳' WHERE provider='RAZORPAY' AND (label IS NULL OR label='')");
  await client.execute("UPDATE payment_options SET label='PayPal', icon='🅿️' WHERE provider='PAYPAL' AND (label IS NULL OR label='')");
  await client.execute("UPDATE payment_options SET label='WhatsApp', icon='💬' WHERE provider='WHATSAPP' AND (label IS NULL OR label='')");
  await client.execute("UPDATE payment_options SET sort_order=id WHERE sort_order=0");

  console.log("Migration complete.");
}
main().catch((e) => { console.error("Migration failed:", e); process.exit(1); });
```

- [ ] **Step 5: Run the migration + typecheck**

Run: `node scripts/migrate-2026-08-06.mjs`
Expected: all `added` lines, then `Migration complete.` Run again → all `exists, skip`.

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add db/schema.ts scripts/migrate-2026-08-06.mjs
git commit -m "feat: dynamic payment providers (label/icon/sort) + editable secondary CTA (schema+migration)"
```

---

### Task 2: Admin product API persists the new provider fields

**Files:**
- Modify: `app/api/admin/products/route.ts` (POST insert, lines ~73-82)
- Modify: `app/api/admin/products/[id]/route.ts` (PUT insert, lines ~80-90)

**Interfaces:**
- Consumes: Task 1 schema columns (`label`, `icon`, `sortOrder`).
- Produces: `paymentOptions` rows received from admin now carry `provider`, `label`, `icon`, `paymentUrl`, `sortOrder`. `GET` routes already return full rows, so no change needed there.

- [ ] **Step 1: Update POST insert in `app/api/admin/products/route.ts`**

Import `slugify` from `@/lib/utils` (top of file), then replace the payments insert (lines 73-82) with:

```ts
  if (payments?.length) {
    await db.insert(paymentOptions).values(
      payments.map((p: any, i: number) => ({
        productId: result.id,
        provider: (p.label || "").trim() ? slugify(p.label.trim()) : `link-${i}`,
        label: p.label?.trim() || null,
        icon: p.icon?.trim() || null,
        paymentUrl: p.paymentUrl,
        enabled: 1,
        sortOrder: i,
      }))
    );
  }
```

- [ ] **Step 2: Update PUT insert in `app/api/admin/products/[id]/route.ts`**

Import `slugify` from `@/lib/utils`, then replace the payments insert (lines 80-90) with:

```ts
  await db.delete(paymentOptions).where(eq(paymentOptions.productId, id));
  if (payments?.length) {
    await db.insert(paymentOptions).values(
      payments.map((p: any, i: number) => ({
        productId: id,
        provider: (p.label || "").trim() ? slugify(p.label.trim()) : `link-${i}`,
        label: p.label?.trim() || null,
        icon: p.icon?.trim() || null,
        paymentUrl: p.paymentUrl,
        enabled: 1,
        sortOrder: i,
      }))
    );
  }
```

- [ ] **Step 3: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/api/admin/products/route.ts "app/api/admin/products/[id]/route.ts"
git commit -m "feat: persist dynamic payment provider fields in admin API"
```

---

### Task 3: Rewrite `PaymentOptionsEditor` as a dynamic list

**Files:**
- Modify: `components/admin/PaymentOptionsEditor.tsx` (full rewrite)

**Interfaces:**
- Produces:
  - `export function humanizeProvider(provider: string): string`
  - `export function providerDefaultIcon(provider: string): string`
  - `export function PaymentOptionsEditor({ options, onChange, slug }: { options: PaymentOption[]; onChange: (o: PaymentOption[]) => void; slug: string })`
  - `type PaymentOption = { label: string; icon: string; paymentUrl: string; enabled: boolean }`

- [ ] **Step 1: Replace the whole file**

Replace `components/admin/PaymentOptionsEditor.tsx` with:

```tsx
"use client";

import { Plus, Trash2, ChevronUp, ChevronDown, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export interface PaymentOption {
  label: string;
  icon: string;
  paymentUrl: string;
  enabled: boolean;
}

interface PaymentOptionsEditorProps {
  options: PaymentOption[];
  onChange: (options: PaymentOption[]) => void;
  /** Product slug, used to build the copyable success-page URL. */
  slug: string;
}

export function humanizeProvider(provider: string): string {
  const map: Record<string, string> = {
    RAZORPAY: "Razorpay",
    PAYPAL: "PayPal",
    WHATSAPP: "WhatsApp",
    GUMROAD: "Gumroad",
    SUPER_PROFILE: "Super Profile",
  };
  if (map[provider]) return map[provider];
  return provider.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function providerDefaultIcon(provider: string): string {
  const map: Record<string, string> = {
    RAZORPAY: "💳",
    PAYPAL: "🅿️",
    WHATSAPP: "💬",
    GUMROAD: "🛍️",
    SUPER_PROFILE: "✨",
  };
  return map[provider] || "🔗";
}

const inputBaseStyle: React.CSSProperties = {
  backgroundColor: "var(--bg-primary)",
  border: "1px solid var(--border-gold)",
  color: "var(--text-primary)",
  borderRadius: "8px",
  padding: "9px 14px",
  width: "100%",
  fontSize: "0.85rem",
  outline: "none",
};
const fieldLabelStyle: React.CSSProperties = {
  color: "var(--text-muted)",
  fontSize: "0.78rem",
  fontWeight: 500,
  marginBottom: "5px",
  display: "block",
};

export function PaymentOptionsEditor({ options, onChange, slug }: PaymentOptionsEditorProps) {
  const [copied, setCopied] = useState(false);

  const successUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/products/${slug}/success`;

  const copySuccessUrl = () => {
    navigator.clipboard?.writeText(successUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addOption = () => onChange([...options, { label: "", icon: "🔗", paymentUrl: "", enabled: true }]);
  const updateOption = (index: number, field: keyof PaymentOption, value: any) =>
    onChange(options.map((o, i) => (i === index ? { ...o, [field]: value } : o)));
  const removeOption = (index: number) => onChange(options.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const next = [...options];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          Add any provider (Gumroad, Razorpay, PayPal, Super Profile, …). Customers pick one from the button dropdown.
        </p>
        <Button type="button" variant="outline" size="sm" onClick={addOption}>
          <Plus className="h-4 w-4" /> Add Provider
        </Button>
      </div>

      {options.length === 0 ? (
        <p className="text-sm py-4" style={{ color: "var(--text-dim)" }}>
          No providers yet. Click "Add Provider" to add one.
        </p>
      ) : (
        options.map((opt, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{
              backgroundColor: "var(--bg-primary)",
              border: "1px solid var(--border-gold)",
              opacity: opt.enabled ? 1 : 0.55,
            }}
          >
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" style={{ color: "var(--text-muted)" }} aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === options.length - 1} className="p-1 rounded hover:bg-gray-100 disabled:opacity-30" style={{ color: "var(--text-muted)" }} aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <span className="text-xs" style={{ color: "var(--text-dim)" }}>#{i + 1}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={opt.enabled}
                    onChange={(e) => updateOption(i, "enabled", e.target.checked)}
                    className="rounded w-4 h-4"
                    style={{ accentColor: "var(--accent-gold)" }}
                  />
                  <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Enabled</span>
                </label>
                <button type="button" onClick={() => removeOption(i)} className="p-1.5 rounded hover:bg-red-50" style={{ color: "#EF4444" }} aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ flex: "1 1 20%" }}>
                <label style={fieldLabelStyle}>Icon (emoji)</label>
                <input type="text" value={opt.icon} onChange={(e) => updateOption(i, "icon", e.target.value)} placeholder="🛍️" style={inputBaseStyle} />
              </div>
              <div style={{ flex: "1 1 30%" }}>
                <label style={fieldLabelStyle}>Name</label>
                <input type="text" value={opt.label} onChange={(e) => updateOption(i, "label", e.target.value)} placeholder="Gumroad" required style={inputBaseStyle} />
              </div>
              <div style={{ flex: "1 1 40%" }}>
                <label style={fieldLabelStyle}>Link (URL)</label>
                <input type="text" value={opt.paymentUrl} onChange={(e) => updateOption(i, "paymentUrl", e.target.value)} placeholder="https://gumroad.com/l/..." required style={inputBaseStyle} />
              </div>
            </div>
          </div>
        ))
      )}

      <div className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor: "rgba(99,102,241,0.08)", border: "1px solid var(--border-gold)" }}>
        <p className="text-xs flex-1" style={{ color: "var(--text-muted)" }}>
          To bring customers back after paying, paste this success-page URL into each provider&apos;s dashboard (Gumroad → success URL, Razorpay → redirect, etc.).
        </p>
        <Button type="button" variant="outline" size="sm" onClick={copySuccessUrl}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy success page URL"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/PaymentOptionsEditor.tsx
git commit -m "feat: dynamic payment provider editor with copyable success URL"
```

---

### Task 4: `ProductForm` — Purchase Buttons section + new state wiring

**Files:**
- Modify: `components/admin/ProductForm.tsx`

**Interfaces:**
- Consumes: Task 3 `humanizeProvider`, `providerDefaultIcon`, new `PaymentOptionsEditor` props (`options`, `onChange`, `slug`).
- Produces: `form` gains `secondaryCtaText`, `secondaryCtaUrl`; submit payload includes them and sends new-shape `paymentOptions`.

- [ ] **Step 1: Update imports**

Add `humanizeProvider, providerDefaultIcon` to the existing `PaymentOptionsEditor` import (line 8):

```ts
import { PaymentOptionsEditor, humanizeProvider, providerDefaultIcon } from "@/components/admin/PaymentOptionsEditor";
```

- [ ] **Step 2: Add form state + new field defaults**

In the `form` state object (lines 72-111), add after `ctaText` (line 96):

```ts
    ctaText: product?.ctaText || "Get Instant Access Now",
    secondaryCtaText: product?.secondaryCtaText || "Contact Us",
    secondaryCtaUrl: product?.secondaryCtaUrl || "",
```

- [ ] **Step 3: Update `paymentOptions` initial state**

Replace the `paymentOptions` state initializer (lines 113-127) with:

```ts
  const [paymentOptions, setPaymentOptions] = useState<
    Array<{ label: string; icon: string; paymentUrl: string; enabled: boolean }>
  >(
    product?.paymentOptions?.length
      ? product.paymentOptions.map((p: any) => ({
          label: p.label || humanizeProvider(p.provider || ""),
          icon: p.icon || providerDefaultIcon(p.provider || ""),
          paymentUrl: p.paymentUrl || "",
          enabled: p.enabled ? true : false,
        }))
      : []
  );
```

- [ ] **Step 4: Update the submit payload for `paymentOptions`**

Replace the `paymentOptions` line in the payload (line 199) with:

```ts
      paymentOptions: paymentOptions
        .filter((p) => p.enabled && p.paymentUrl.trim())
        .map((p, i) => ({
          provider: p.label.trim() ? slugify(p.label.trim()) : `link-${i}`,
          label: p.label.trim(),
          icon: (p.icon || "").trim(),
          paymentUrl: p.paymentUrl.trim(),
          enabled: 1,
          sortOrder: i,
        })),
```

- [ ] **Step 5: Add the "Purchase Buttons" section**

Insert this new section right after the closing `</section>` of **Basic Information** (after line 334), before the `{/* Pricing */}` section:

```tsx
      {/* Purchase Buttons */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Purchase Buttons</h2>
        <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>
          The main button opens a dropdown of the enabled payment providers. The secondary button (e.g. "Contact Us") is a plain link shown below it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Main button text"
            value={form.ctaText}
            onChange={(e) => updateField("ctaText", e.target.value)}
            placeholder={form.productType === "FREE" ? "Get Instant Access Now" : form.productType === "PREBOOK" ? "Pre-book Now — Pay Advance" : form.productType === "CUSTOM_QUOTE" ? "Request a Quote" : "Buy Now"}
          />
          <Input
            label="Secondary button text"
            value={form.secondaryCtaText}
            onChange={(e) => updateField("secondaryCtaText", e.target.value)}
            placeholder="Contact Us"
          />
          <Input
            label="Secondary button URL (empty = /contact)"
            value={form.secondaryCtaUrl}
            onChange={(e) => updateField("secondaryCtaUrl", e.target.value)}
            placeholder="https://wa.me/91XXXXXXXXXX"
          />
        </div>
      </section>
```

- [ ] **Step 6: Remove the old CTA Text input from "Limited Time Offer"**

In the **Limited Time Offer** section (lines ~372-374), delete the `<Input label="CTA Text" ... />` line so only the Offer Label input remains:

```tsx
            <Input label="Offer Label" value={form.offerLabel} onChange={(e) => updateField("offerLabel", e.target.value)} placeholder="Limited Time Offer" />
```

(The `ctaText` field now lives in the Purchase Buttons section.)

- [ ] **Step 7: Pass `slug` to `PaymentOptionsEditor`**

Replace the Payment Options section (line 464-467) with:

```tsx
      {/* Payment Options */}
      <section style={sectionStyle}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Payment Options</h2>
        <PaymentOptionsEditor options={paymentOptions} onChange={setPaymentOptions} slug={form.slug} />
      </section>
```

- [ ] **Step 8: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 9: Commit**

```bash
git add components/admin/ProductForm.tsx
git commit -m "feat: admin Purchase Buttons section + dynamic payment options wiring"
```

---

### Task 5: Rewrite `PurchaseCta` — dropdown, secondary button, FREE fallback

**Files:**
- Modify: `components/public/PurchaseCta.tsx` (full rewrite)

**Interfaces:**
- Consumes: product fields `ctaText`, `secondaryCtaText`, `secondaryCtaUrl`, `slug`; `paymentOptions` rows with `{ id, provider, label, icon, paymentUrl, enabled, sortOrder }`.
- Produces: `PurchaseCta({ product, size?, compact? })` where `product` now includes `slug`, `secondaryCtaText`, `secondaryCtaUrl`, and payment options with `label`/`icon`/`sortOrder`. Links to `/products/{slug}/success?provider={label}`.

- [ ] **Step 1: Replace the whole file**

Replace `components/public/PurchaseCta.tsx` with:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, ChevronDown } from "lucide-react";

interface PaymentOption {
  id: number;
  provider: string;
  label: string | null;
  icon: string | null;
  paymentUrl: string | null;
  enabled: number;
  sortOrder?: number;
}

interface PurchaseCtaProps {
  product: {
    id: number;
    slug: string;
    name: string;
    productType: string;
    price: number;
    advancePercentage: number;
    deliveryMethod: string;
    downloadUrl: string | null;
    leadCaptureRequired: number;
    ctaText: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
    whatsappMessage?: string | null;
    paymentOptions: PaymentOption[];
  };
  size?: "sm" | "lg";
  compact?: boolean;
}

const typeDefaultCta: Record<string, string> = {
  FREE: "Get Instant Access Now",
  READY_MADE: "Buy Now",
  PREBOOK: "Pre-book Now — Pay Advance",
  CUSTOM_QUOTE: "Request a Quote",
};

const btnBase: React.CSSProperties = {
  width: "100%",
  padding: "16px 24px",
  borderRadius: "14px",
  fontSize: "1.05rem",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  border: "none",
  cursor: "pointer",
  transition: "transform .15s ease, box-shadow .15s ease",
  textDecoration: "none",
  color: "#FFFFFF",
};

function track(productId: number, productName: string, eventType: string, source = "website") {
  fetch("/api/track/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productId, productName, eventType, source }),
  }).catch(() => {});
}

export function PurchaseCta({ product, size = "lg", compact = false }: PurchaseCtaProps) {
  const [open, setOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [leadForm, setLeadForm] = useState({ name: "", email: "", phone: "" });
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const enabledPayments =
    (product.paymentOptions || [])
      .filter((p) => p.enabled && p.paymentUrl)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  const isFree = product.productType === "FREE" && product.price === 0;
  const ctaLabel = product.ctaText || typeDefaultCta[product.productType] || "Buy Now";
  const secondaryLabel = product.secondaryCtaText || "Contact Us";
  const secondaryUrl = product.secondaryCtaUrl || "/contact";
  const isDownloadable =
    !!product.downloadUrl || product.deliveryMethod === "download" || product.deliveryMethod === "external_link";
  const pad = size === "lg" ? "16px 24px" : "12px 20px";
  const fontSize = size === "lg" ? "1.05rem" : "0.95rem";

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    setSelectedProvider(null);
    try {
      const res = await fetch("/api/products/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          ...(product.leadCaptureRequired ? leadForm : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
        setDownloadUrl(data.downloadUrl);
      } else {
        setDownloadUrl(null); // manual delivery → thank-you state
      }
    } catch {
      setError("Failed to process download");
    } finally {
      setLoading(false);
    }
  };

  const chooseProvider = (pm: PaymentOption) => {
    if (!pm.paymentUrl) return;
    window.open(pm.paymentUrl, "_blank", "noopener,noreferrer");
    track(product.id, product.name, "payment_click", pm.label || pm.provider);
    setSelectedProvider(pm.label || pm.provider);
    setOpen(false);
  };

  const freeDownloadAction = () => {
    if (product.leadCaptureRequired) {
      setShowLeadForm(true);
      setOpen(false);
    } else {
      handleDownload();
    }
  };

  // Dropdown trigger (used when providers exist and the main action is the menu)
  const dropdownTrigger = (showChevron: boolean) => (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}
    >
      {ctaLabel}
      {showChevron && <ChevronDown className="h-4 w-4" style={{ opacity: 0.8 }} />}
    </button>
  );

  const providerMenu = () => (
    <div ref={menuRef} className="relative">
      {dropdownTrigger(true)}
      {open && (
        <div
          className="absolute z-50 mt-2 w-full rounded-xl overflow-hidden"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-gold)", boxShadow: "0 10px 40px rgba(0,0,0,0.35)" }}
        >
          {enabledPayments.map((pm) => (
            <button
              key={pm.id ?? pm.provider}
              type="button"
              onClick={() => chooseProvider(pm)}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:opacity-90"
              style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-gold)" }}
            >
              <span style={{ fontSize: "1.1rem" }}>{pm.icon || "🔗"}</span>
              <span className="font-medium">{pm.label || pm.provider}</span>
            </button>
          ))}
          {isFree && isDownloadable && (
            <button
              type="button"
              onClick={freeDownloadAction}
              className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:opacity-90"
              style={{ color: "var(--text-primary)", backgroundColor: "var(--bg-primary)", borderBottom: "1px solid var(--border-gold)" }}
            >
              <span style={{ fontSize: "1.1rem" }}>⬇️</span>
              <span className="font-medium">Download now</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  const confirmCard = selectedProvider && (
    <div
      className="rounded-xl p-4 text-sm space-y-2"
      style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
    >
      <p>
        <strong style={{ color: "var(--accent-gold)" }}>{selectedProvider}</strong> opened in a new tab. Complete the payment there, then confirm back here.
      </p>
      <a href={`/products/${product.slug}/success?provider=${encodeURIComponent(selectedProvider)}`} className="block font-semibold" style={{ color: "var(--accent-gold)" }}>
        I&apos;ve completed my payment — confirm →
      </a>
    </div>
  );

  const secondaryButton = (
    <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: "12px 20px", fontSize: "0.9rem", background: "var(--bg-card)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}>
      {secondaryLabel}
    </a>
  );

  const downloadSuccess = (
    <div
      className="text-center py-4 px-4 rounded-xl text-sm space-y-2"
      style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}
    >
      <p>✅ Thank you! Your download is in progress. Check your browser downloads.</p>
      <a href={`/products/${product.slug}/success?provider=download`} className="block font-semibold" style={{ color: "var(--accent-gold)" }}>
        View confirmation →
      </a>
    </div>
  );

  // ---- FREE ----
  if (isFree) {
    if (enabledPayments.length === 0) {
      // Fallback: existing lead-capture + download flow
      if (product.leadCaptureRequired && !downloadUrl && !loading) {
        return (
          <div className="space-y-3">
            <form
              onSubmit={(e) => { e.preventDefault(); handleDownload(); }}
              className="space-y-3"
            >
              <input type="text" placeholder="Your name *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
              <input type="email" placeholder="Your email *" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
              <input type="tel" placeholder="Your phone / WhatsApp *" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
              {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
              <button type="submit" disabled={loading} style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {ctaLabel}
              </button>
            </form>
            <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>Enter your details to get instant access.</p>
            {secondaryButton}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {downloadUrl || !product.leadCaptureRequired ? (
            downloadUrl ? (
              downloadSuccess
            ) : (
              <button onClick={handleDownload} disabled={loading} style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
                {ctaLabel}
              </button>
            )
          ) : (
            <div className="text-center py-4 px-4 rounded-xl text-sm" style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }}>
              ✅ Thank you! We&apos;ve received your details. We&apos;ll send your download link shortly.
              <a href={`/products/${product.slug}/success?provider=download`} className="block font-semibold mt-2" style={{ color: "var(--accent-gold)" }}>View confirmation →</a>
            </div>
          )}
          {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
          {product.deliveryMethod === "manual" && !product.downloadUrl && (
            <p className="text-xs text-center" style={{ color: "var(--text-dim)" }}>
              We&apos;ll deliver this free resource to you via WhatsApp / email.
            </p>
          )}
          {secondaryButton}
        </div>
      );
    }

    // FREE with providers → dropdown (+ download option)
    if (showLeadForm) {
      return (
        <div className="space-y-3">
          <form onSubmit={(e) => { e.preventDefault(); handleDownload(); }} className="space-y-3">
            <input type="text" placeholder="Your name *" value={leadForm.name} onChange={(e) => setLeadForm({ ...leadForm, name: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
            <input type="email" placeholder="Your email *" value={leadForm.email} onChange={(e) => setLeadForm({ ...leadForm, email: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
            <input type="tel" placeholder="Your phone / WhatsApp *" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} required className="w-full px-4 py-3 rounded-xl text-sm" style={{ backgroundColor: "var(--bg-primary)", border: "1px solid var(--border-gold)", color: "var(--text-primary)" }} />
            {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              {ctaLabel}
            </button>
          </form>
          {secondaryButton}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {downloadUrl ? downloadSuccess : providerMenu()}
        {error && <p className="text-sm" style={{ color: "#EF4444" }}>{error}</p>}
        {confirmCard}
        {secondaryButton}
      </div>
    );
  }

  // ---- PREBOOK: advance calculator + CTA ----
  if (product.productType === "PREBOOK") {
    const pct = product.advancePercentage || 30;
    const advance = Math.round((product.price * pct) / 100);
    return (
      <div className="space-y-3">
        <div className="rounded-xl p-4 text-sm space-y-1" style={{ backgroundColor: "var(--accent-glow)", border: "1px solid var(--border-gold)" }}>
          <p style={{ color: "var(--text-muted)" }}>
            Pre-book with <strong style={{ color: "var(--accent-gold)" }}>{pct}% advance</strong>
          </p>
          <p style={{ color: "var(--text-primary)" }}>
            Total: <strong>₹{product.price.toLocaleString("en-IN")}</strong> · Advance: <strong>₹{advance.toLocaleString("en-IN")}</strong>
          </p>
        </div>
        {enabledPayments.length > 0 ? providerMenu() : (
          <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
            {ctaLabel}
          </a>
        )}
        {confirmCard}
        {secondaryButton}
      </div>
    );
  }

  // ---- CUSTOM_QUOTE ----
  if (product.productType === "CUSTOM_QUOTE") {
    return (
      <div className="space-y-3">
        {enabledPayments.length > 0 ? providerMenu() : (
          <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
            {ctaLabel}
          </a>
        )}
        {confirmCard}
        {secondaryButton}
      </div>
    );
  }

  // ---- PAID (READY_MADE) ----
  return (
    <div className="space-y-3">
      {enabledPayments.length > 0 ? providerMenu() : (
        <a href={secondaryUrl} target={secondaryUrl.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ ...btnBase, padding: pad, fontSize, background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))" }}>
          {ctaLabel}
        </a>
      )}
      {confirmCard}
      {secondaryButton}
    </div>
  );
}
```

- [ ] **Step 2: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/public/PurchaseCta.tsx
git commit -m "feat: purchase button dropdown with dynamic providers, secondary contact button, FREE download fallback"
```

---

### Task 6: Pass new fields through the product detail page and `OfferSection`

**Files:**
- Modify: `app/(public)/products/[slug]/page.tsx`
- Modify: `components/public/OfferSection.tsx`

**Interfaces:**
- Consumes: Task 5 `PurchaseCta` props (`slug`, `secondaryCtaText`, `secondaryCtaUrl`).
- Produces: both hero and offer-section CTAs receive the new fields.

- [ ] **Step 1: Add the new fields to `purchaseProduct` in `[slug]/page.tsx`**

In `app/(public)/products/[slug]/page.tsx`, extend the `purchaseProduct` object (lines 107-119) to add `slug`, `secondaryCtaText`, `secondaryCtaUrl`:

```ts
  const purchaseProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productType: product.productType,
    price: product.price,
    advancePercentage: product.advancePercentage,
    deliveryMethod: product.deliveryMethod,
    downloadUrl: product.downloadUrl,
    leadCaptureRequired: product.leadCaptureRequired,
    ctaText: product.ctaText,
    secondaryCtaText: product.secondaryCtaText,
    secondaryCtaUrl: product.secondaryCtaUrl,
    whatsappMessage: product.whatsappMessage,
    paymentOptions: product.paymentOptions || [],
  };
```

- [ ] **Step 2: Extend the `PaymentOption` interface in `OfferSection.tsx`**

In `components/public/OfferSection.tsx`, update the `PaymentOption` interface (lines 7-12):

```ts
interface PaymentOption {
  id: number;
  provider: string;
  label?: string | null;
  icon?: string | null;
  paymentUrl: string | null;
  enabled: number;
  sortOrder?: number;
}
```

- [ ] **Step 3: Extend the `OfferSectionProps` product type**

Add to the product type (after `ctaText`, around line 25):

```ts
    ctaText: string;
    slug: string;
    secondaryCtaText: string;
    secondaryCtaUrl: string;
```

- [ ] **Step 4: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/products/[slug]/page.tsx" components/public/OfferSection.tsx
git commit -m "feat: pass editable CTA fields to purchase components"
```

---

### Task 7: Purchase confirmation (success) page

**Files:**
- Create: `app/(public)/products/[slug]/success/page.tsx`

**Interfaces:**
- Consumes: product row fields; query params `provider?`, `ref?`.
- Produces: `/products/{slug}/success` page — reached from the confirm card, the download confirmation, and provider return URLs.

- [ ] **Step 1: Create the success page**

Create `app/(public)/products/[slug]/success/page.tsx`:

```tsx
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ provider?: string; ref?: string }>;
}

export default async function PurchaseSuccessPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { provider, ref } = await searchParams;

  const product = await db.select().from(products).where(eq(products.slug, slug)).get();
  if (!product) notFound();

  const isFree = product.productType === "FREE" && product.price === 0;
  const hasDiscount = !!product.discountPrice && product.discountPrice > product.price;
  const whatsappHref = product.whatsappMessage
    ? `https://wa.me/?text=${encodeURIComponent(`${product.whatsappMessage} — ${product.name}`)}`
    : "/contact";

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-primary)" }}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-3xl p-8 sm:p-10 text-center" style={{ backgroundColor: "var(--bg-card)", border: "2px solid var(--border-gold-hover)", boxShadow: "0 0 60px var(--accent-glow)" }}>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
            {isFree ? "Download Confirmed" : "Purchase Confirmed"}
          </h1>
          <p className="mt-3 text-sm sm:text-base" style={{ color: "var(--text-muted)" }}>
            {product.name}
            {provider ? ` · via ${provider}` : ""}
            {ref ? ` · Ref: ${ref}` : ""}
          </p>

          {!isFree && (
            <div className="mt-6 flex items-end justify-center gap-3">
              <span className="text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {hasDiscount && (
                <span className="text-lg line-through mb-0.5" style={{ color: "var(--text-dim)" }}>
                  ₹{product.discountPrice!.toLocaleString("en-IN")}
                </span>
              )}
            </div>
          )}

          {product.deliveryMethod === "download" && product.downloadUrl && (
            <div className="mt-6">
              <a
                href={product.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-flex", padding: "14px 28px", borderRadius: "12px", fontWeight: 700, color: "#FFFFFF", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))", textDecoration: "none" }}
              >
                ⬇️ Download your product
              </a>
            </div>
          )}

          <div className="mt-8 space-y-2 text-left rounded-2xl p-6" style={{ backgroundColor: "var(--bg-secondary)", border: "1px solid var(--border-gold)" }}>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>What happens next?</p>
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {product.paymentDescription || (isFree ? "Your download is ready above." : "You'll receive your access details shortly.")}
            </p>
            <a href={whatsappHref} target={whatsappHref.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="block text-sm font-semibold mt-2" style={{ color: "var(--accent-gold)" }}>
              💬 Need help? Chat with support on WhatsApp
            </a>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/products/${product.slug}`} style={{ display: "inline-flex", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, color: "var(--text-primary)", background: "var(--bg-card)", border: "1px solid var(--border-gold)", textDecoration: "none" }}>
              ← Back to {product.name}
            </Link>
            <Link href="/products" style={{ display: "inline-flex", padding: "12px 24px", borderRadius: "12px", fontWeight: 600, color: "#FFFFFF", background: "linear-gradient(135deg, var(--accent-gold), var(--accent-gold-light))", textDecoration: "none" }}>
              Browse more products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify with `npx tsc --noEmit`**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/products/[slug]/success/page.tsx"
git commit -m "feat: per-product purchase confirmation page"
```

---

### Task 8: End-to-end verification

**Files:**
- None (verification only)

- [ ] **Step 1: Confirm dev server + migration are in sync**

Run: `npx tsc --noEmit` — expected: no errors.
Run: `node scripts/migrate-2026-08-06.mjs` — expected: all `exists, skip`.

Ensure the dev server is running on port 3000 (start `npm run dev` in the background if not; check `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → `200`).

- [ ] **Step 2: Smoke-test public pages**

Run:
```bash
curl -s -o /dev/null -w "home: %{http_code}\n" http://localhost:3000/
curl -s -o /dev/null -w "detail: %{http_code}\n" http://localhost:3000/products/expense-tracker-pro
curl -s -o /dev/null -w "success: %{http_code}\n" "http://localhost:3000/products/expense-tracker-pro/success?provider=Razorpay"
```
Expected: `200` for all three. The success page body should contain "Purchase Confirmed".

- [ ] **Step 3: Verify success page renders download CTA for a downloadable product**

If any published product has `deliveryMethod === "download"` and a `downloadUrl`, `curl` its success page and confirm the body contains "Download your product". If none exists, create/update one via the admin form (see Step 4) and re-check.

- [ ] **Step 4: Manual admin check (browser)**

Log in at `/admin` with `srollzea@gmail.com` / `scrollzeaAdmin2024!`, open a product (e.g. expense-tracker-pro):
- "Purchase Buttons" section shows main button text, secondary text + URL.
- "Payment Options" section: add a provider row named "Gumroad" with an emoji and a URL; toggle Enabled. Reorder with the arrows. Copy the success-page URL.
- Save, then re-open the product → the provider row round-trips.
- **Browser check of the public product page:** the main button shows a dropdown arrow; clicking it lists the enabled providers (icon + name). Clicking one opens the link in a new tab and shows the "opened in a new tab … confirm →" card. Clicking the confirm link lands on the success page. The secondary "Contact Us" button appears below with the configured label/URL.
- **FREE product check:** verify a FREE product with no providers still shows the download button (or lead form), and after download shows "View confirmation →".

- [ ] **Step 5: Update `scripts/test-premium.mjs` seeding shape (if used)**

`scripts/test-premium.mjs` inserts `payment_options` with the old column set only (`product_id, provider, payment_url, enabled`). This still works (new columns are nullable/defaulted). No change required — skip unless you want seeded providers to include `label`/`icon`. If you add them, set `label`/`icon` explicitly.

- [ ] **Step 6: Final typecheck + commit any leftovers**

Run: `npx tsc --noEmit` — expected: no errors. Commit anything left over with a descriptive message.

---

## Self-Review Notes

- **Spec coverage:** schema+migration (Task 1), admin persistence (Task 2), dynamic admin editor (Tasks 3-4), dropdown + secondary button + FREE fallback (Task 5), pass-through (Task 6), success page (Task 7), verification (Task 8). All four approved decisions and every spec section map to a task.
- **No placeholders:** every task ships concrete code or exact commands.
- **Track route note:** `app/api/track/click/route.ts` already accepts any `eventType` string (it only checks `productId`/`eventType` presence), so `payment_click` works with **no change** — the spec's "validate only" entry is satisfied as-is.
- **Type consistency:** `PaymentOption` in the editor is `{ label, icon, paymentUrl, enabled }` (admin form shape); in the public `PurchaseCta`/`OfferSection` it is the DB row shape `{ id, provider, label, icon, paymentUrl, enabled, sortOrder }`. `slugify` is imported in both API routes and ProductForm (already exported from `@/lib/utils`). `slug`, `secondaryCtaText`, `secondaryCtaUrl` are threaded consistently from `[slug]/page.tsx` → `PurchaseCta`/`OfferSection`.
