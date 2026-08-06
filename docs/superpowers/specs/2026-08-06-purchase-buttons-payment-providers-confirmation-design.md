# Design: Editable Purchase Buttons, Dynamic Payment Providers & Purchase Confirmation

**Date:** 2026-08-06
**Status:** Approved by user
**Applies to:** Scrollzea (`C:\Users\nn\scrollzea`, Next.js 15)

## Problem

1. **Buttons are hardcoded / not editable per product.** The FREE "Get Instant Access Now" button has no configurable URL. READY_MADE, PREBOOK, and CUSTOM_QUOTE fall back to hardcoded "Contact Us to Purchase" / "Request a Quote" / "Pre-book Now" buttons that cannot be relabeled or pointed at a custom link.
2. **Payment providers are a fixed enum.** Only RAZORPAY, PAYPAL, WHATSAPP exist. The owner wants Gumroad, Razorpay payment page, PayPal, Super Profile, and an open-ended set of "more options" — each with an editable link configured in admin.
3. **No return path after purchase/download.** Customers are handed off to external providers with no way back to the site to confirm their activity.

## Decisions (confirmed with user)

| Question | Decision |
|---|---|
| Provider management | **Dynamic** — admin adds/removes any provider (name, emoji icon, URL). No fixed list. |
| FREE product button | **Menu + URL, keep download fallback** — button opens the provider menu; if no provider links are set, fall back to the existing lead-capture + download flow. |
| Click interaction | **Dropdown on the button** — clicking the main CTA opens an in-place dropdown listing enabled providers. |
| Confirmation | **On-site success page** per product, plus inline success after free downloads. |

## 1. Data model

### `payment_options` — dynamic providers

- `provider` (`text`) — stays as the machine key but becomes **free text** (was enum `["RAZORPAY","PAYPAL","WHATSAPP"]`). e.g. `"gumroad"`, `"super-profile"`.
- **add** `label` (`text`) — display name shown to customers, e.g. `"Gumroad"`. Backfilled from existing providers; if empty, derive from `provider`.
- **add** `icon` (`text`) — optional emoji shown next to the label (e.g. `🛍️`).
- **add** `sortOrder` (`integer`) — display order in the dropdown.
- keep `paymentUrl`, `enabled`.

Note: SQLite `text` enum in Drizzle is TS-only (no CHECK constraint emitted), so widening the type is a TS change, not a DB rebuild.

### `products` — editable buttons

- `ctaText` — existing field reused as the **main** button label (default `"Get Instant Access Now"`).
- **add** `secondaryCtaText` (`text`, default `"Contact Us"`) — label of the secondary contact button.
- **add** `secondaryCtaUrl` (`text`, default empty) — URL of the secondary button; when empty, the site falls back to `/contact`.

### `click_events`

- **add** `payment_click` to the `eventType` enum (analytics for dynamic-provider clicks). Existing `razorpay_click` / `paypal_click` / `whatsapp_click` / `download_click` stay.

### Migration

New safe migration script `scripts/migrate-YYYY-MM-DD.mjs` (same pattern as `scripts/migrate-aug3.mjs` — plain ALTER TABLE, **not** `drizzle-kit push`):

- `ALTER TABLE payment_options ADD COLUMN label TEXT;`
- `ALTER TABLE payment_options ADD COLUMN icon TEXT;`
- `ALTER TABLE payment_options ADD COLUMN sort_order INTEGER DEFAULT 0;`
- Backfill: `label = 'Razorpay' / 'PayPal' / 'WhatsApp'`, `sortOrder` by id for existing rows.
- `ALTER TABLE products ADD COLUMN secondary_cta_text TEXT DEFAULT 'Contact Us';`
- `ALTER TABLE products ADD COLUMN secondary_cta_url TEXT;`

## 2. Admin UI (`components/admin/ProductForm.tsx`)

### New "Purchase Buttons" section (placed right after Basic Information)

- **Main button label** — `ctaText`. Placeholder varies by selected product type:
  - FREE → `Get Instant Access Now`
  - READY_MADE → `Buy Now`
  - PREBOOK → `Pre-book Now — Pay Advance`
  - CUSTOM_QUOTE → `Request a Quote`
- **Secondary "Contact Us" button label** — `secondaryCtaText`
- **Secondary "Contact Us" URL** — `secondaryCtaUrl` (leave empty to default to `/contact`)
- The existing **CTA Text** input in "Limited Time Offer" is **removed** (same field now lives in Purchase Buttons — no duplication).

### `components/admin/PaymentOptionsEditor.tsx` → dynamic list

Reuse the existing `ListEditor` interaction pattern (add / remove / reorder rows). Each row:

- `label` (text input) — display name
- `icon` (text input) — optional emoji
- `paymentUrl` (text input) — the link
- `enabled` (checkbox toggle)

Plus a **"Copy success page URL"** helper near the section: copies `/products/{slug}/success` so the owner can paste it into Gumroad / Razorpay-dashboard redirect settings.

Form payload: at save time, filter to rows that are **enabled AND have a non-empty URL** (same rule as today). Unfilled/disabled rows are dropped. The dynamic editor keeps working rows in client state while the form is open; they persist only if saved with a URL.

## 3. Public purchase UI (`components/public/PurchaseCta.tsx`)

Applied to **all four product types**.

- **Main button** — label `ctaText` (per-type default when empty). Clicking it opens an **in-place dropdown** listing all enabled providers (icon + label). Selecting a provider:
  - opens `paymentUrl` in a new tab (`target="_blank" rel="noopener noreferrer"`),
  - records a `payment_click` analytics event (provider label in `source`),
  - shows an inline card on the product page: *"Complete your payment in the new tab — once done, click here to confirm"* linking to the success page.
- **Secondary "Contact Us" button** — always rendered below the main button: label `secondaryCtaText`, href `secondaryCtaUrl || "/contact"`.
- **FREE** products:
  - Providers configured → main button opens the dropdown, including a **"Download now"** entry when `downloadUrl` or a downloadable `deliveryMethod` exists.
  - No providers configured → existing lead-capture form + `POST /api/products/download` flow, then inline success state + link to the success page.
- **PREBOOK** — advance summary card stays; main button opens the dropdown (same as READY_MADE).
- **CUSTOM_QUOTE** — main button opens the dropdown (owner configures WhatsApp / contact / email links as providers).

### Prop/type changes

`PurchaseCta` product type gains `secondaryCtaText`, `secondaryCtaUrl`, and payment options carry `label`, `icon`, `sortOrder`. `OfferSection` forwards the whole product object already — just extend its interface. `app/(public)/products/[slug]/page.tsx` builds `purchaseProduct` — add the new fields.

## 4. Confirmation page

### New `app/(public)/products/[slug]/success/page.tsx` (server-rendered)

- Hero: ✅ "Purchase / Download Confirmed"
- Product name, price (selling price; struck MRP if discount), provider (from `?provider=` query), optional reference (`?ref=`)
- **Download link** when `deliveryMethod === "download"` and `downloadUrl` exists
- "What happens next" — `paymentDescription` text
- WhatsApp support CTA (uses the product's `whatsappMessage` to build a `wa.me` link, or falls back to `/contact`)
- Links: "Return to product" (`/products/{slug}`), "Browse more products" (`/products`)

### Return path

External providers (PayPal.me, Super Profile) cannot force a redirect back. Guaranteed return paths:

1. **Admin** pastes the success-page URL into each provider's dashboard (copy helper in admin).
2. **"Confirm here" fallback card** on the product page after clicking a provider — the customer can always click back and confirm.

Free downloads confirm inline after the download completes, with a "View confirmation" link to the success page.

## 5. Files touched

- `db/schema.ts`
- `scripts/migrate-2026-08-06.mjs` (new)
- `components/admin/PaymentOptionsEditor.tsx`
- `components/admin/ProductForm.tsx`
- `components/public/PurchaseCta.tsx`
- `components/public/OfferSection.tsx` (interface only)
- `app/(public)/products/[slug]/page.tsx`
- `app/(public)/products/[slug]/success/page.tsx` (new)
- `app/api/track/click/route.ts` (accept new event type — validate only)
- `scripts/test-premium.mjs` — update if it seeds payment options with old shape

## Out of scope

- No auto-created order records on click (orders table unchanged; can be added later).
- No changes to `ProductCard` (card CTA text is decorative and links to the product page).
