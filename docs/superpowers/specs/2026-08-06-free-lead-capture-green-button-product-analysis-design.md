# Free Product Lead Capture, Green Button & Per-Product Lead Analysis — Design

**Date:** 2026-08-06
**Status:** Approved

## Goal

Make every FREE product capture a name / mobile / email lead before download, give FREE products a green CTA button, and let the admin see which product each lead downloaded (with a per-product filter).

## Current State (what already exists)

- `components/public/PurchaseCta.tsx` already has a name/email/phone lead form for FREE products, but it only appears when the product's `leadCaptureRequired` flag is enabled.
- `app/api/products/download/route.ts` already records a `download_click` and inserts into the `leads` table with `productId` + `productName` (admin-configured name) — gated on `leadCaptureRequired`.
- The `leads` table already has `product_id` / `product_name` columns.
- `app/admin/(protected)/leads/page.tsx` fetches all leads (full rows, incl. `productName`), but the table only shows Name / Contact / Purpose / Status / Date — **not** the product.
- All FREE buttons use the same gold gradient as paid buttons.

## Design Decisions (user-confirmed)

1. **Form scope:** the name/email/phone form shows on **all FREE products** before download — regardless of the per-product `leadCaptureRequired` toggle.
2. **Download link:** after submit, the download URL **auto-opens in a new tab AND** a visible green "Download now" link renders (with the existing "View confirmation →" success link).
3. **Admin analysis:** add a **Product column** and a **product filter dropdown** (with per-product download counts) to the admin Leads page.

## Files Touched (no schema/migration change)

| File | Change |
|---|---|
| `components/public/PurchaseCta.tsx` | Green FREE button; form always shown for FREE before download; visible download link; `submitted` state |
| `app/api/products/download/route.ts` | Store a lead whenever `name && email && phone` are present (stop gating on `leadCaptureRequired`) |
| `app/admin/(protected)/leads/page.tsx` | Product column + product filter with counts |

## Public FREE Flow

One component (`PurchaseCta`) covers both the hero and the OfferSection CTA.

- **Green button:** all FREE CTAs — the main "Get Instant Access Now" button, the provider-dropdown trigger, and the form submit button — use a green gradient (`linear-gradient(135deg, #22C55E, #16A34A)`). Paid / PREBOOK / CUSTOM_QUOTE stay gold. Secondary "Contact Us" unchanged.
- **Form always before download:**
  - FREE + no providers → name/email/phone form renders directly; its submit button is the green "Get Instant Access Now".
  - FREE + providers → green dropdown; the **Download now** entry opens the same form first (clicking a provider still goes to the payment flow unchanged).
- **Post-submit:**
  - Product has a `downloadUrl` → file auto-opens in a new tab (`window.open`) AND a green "Download now" link renders, plus the existing "View confirmation →" link.
  - Manual-delivery FREE (no `downloadUrl`) → "✅ Thank you! We've received your details. We'll send your download link shortly." state (previously unreachable — this restructure fixes the deferred M1 finding via a proper `submitted` flag).
- `leadCaptureRequired` no longer gates the FREE form; it remains in the schema/props but is unused by the FREE flow.

## Download API Change

`app/api/products/download/route.ts`: replace the `if (product.leadCaptureRequired)` lead-insert block with `if (name && email && phone)` — every FREE form submission stores a lead tagged with the admin-configured product name, regardless of the toggle. Drop the 400 "fields required" branch (the client enforces required fields).

## Admin Leads Analysis

`app/admin/(protected)/leads/page.tsx` (no API change — GET already returns full rows):

- **Product column** (after Contact, before Purpose): shows `lead.productName || "—"`.
- **Product filter dropdown** above the table, derived client-side from the loaded leads:
  - "All products (N)" default.
  - One option per distinct product name with its lead count, e.g. `Expense Tracker Pro (12)`.
  - Selecting one filters the table rows to that product.

## Product Name in the Form

Already automatic: the client sends `productId` + `productName`; the API looks the product up from the DB and stores the admin-configured name on the lead. No work needed.

## Verification

- `npx tsc --noEmit` → exit 0 (do NOT run `next build` while the dev server runs).
- POST `/api/products/download` with name/email/phone → assert a lead row is written with the correct `productName`, and a `download_click` is recorded.
- Render checks: green button on a FREE product page; form shown without the `leadCaptureRequired` toggle; download link + auto-open on a product with `downloadUrl`; thank-you state on manual delivery.
- Admin leads page: Product column present; filter dropdown lists products with counts and filters rows.

## Out of Scope

- No schema / migration changes.
- No change to paid, PREBOOK, or CUSTOM_QUOTE flows (buttons stay gold).
- No change to `clickEvents` / analytics beyond the existing `download_click`.
