// Migration: Add new pricing & offer columns to products table
// Safe ALTER TABLE ADD COLUMN only (data-preserving)
import { createClient } from "@libsql/client";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from .env.local for local, or use Vercel env
const envPath = resolve(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...vals] = trimmed.split("=");
      const val = vals.join("=").replace(/^"|"$/g, "");
      if (key === "TURSO_DATABASE_URL") process.env.TURSO_DATABASE_URL = val;
      if (key === "TURSO_AUTH_TOKEN") process.env.TURSO_AUTH_TOKEN = val;
    }
  }
}

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL env var");
  process.exit(1);
}

const db = createClient({ url, authToken });

async function columnExists(table, col) {
  const r = await db.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((c) => c.name === col);
}

async function addColumn(table, col, def) {
  if (await columnExists(table, col)) {
    console.log(`${table}.${col}: exists, skip`);
    return false;
  }
  await db.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  console.log(`${table}.${col}: added`);
  return true;
}

async function main() {
  console.log("🔧 Running pricing & offer migration...\n");

  // Add new pricing columns that exist in schema but not in production DB
  await addColumn("products", "original_price", "REAL");
  await addColumn("products", "sale_price", "REAL");
  await addColumn("products", "currency", "TEXT NOT NULL DEFAULT 'INR'");
  await addColumn("products", "show_limited_offer", "INTEGER NOT NULL DEFAULT 0");
  await addColumn("products", "offer_label", "TEXT NOT NULL DEFAULT 'Limited Time Offer'");
  await addColumn("products", "payment_description", "TEXT NOT NULL DEFAULT 'One-time payment · Lifetime access · No subscriptions'");
  await addColumn("products", "cta_text", "TEXT NOT NULL DEFAULT 'Get Instant Access Now'");
  await addColumn("products", "social_proof_text", "TEXT NOT NULL DEFAULT 'Join 50,000+ satisfied customers'");

  // Urgency / Countdown
  await addColumn("products", "urgency_enabled", "INTEGER NOT NULL DEFAULT 0");
  await addColumn("products", "show_fire_symbol", "INTEGER NOT NULL DEFAULT 1");
  await addColumn("products", "urgency_text", "TEXT NOT NULL DEFAULT 'Hurry! Offer Ends In'");
  await addColumn("products", "expires_at", "TEXT");

  // YouTube Video
  await addColumn("products", "youtube_enabled", "INTEGER NOT NULL DEFAULT 0");
  await addColumn("products", "youtube_url", "TEXT");
  await addColumn("products", "youtube_button_text", "TEXT NOT NULL DEFAULT 'Watch YouTube Video'");
  await addColumn("products", "youtube_video_title", "TEXT");

  // Backfill original_price from discount_price where it exists
  await db.execute(`
    UPDATE products
    SET original_price = discount_price
    WHERE original_price IS NULL AND discount_price IS NOT NULL AND discount_price > price
  `);
  console.log("products.original_price: backfilled from discount_price");

  // Backfill sale_price from price
  await db.execute(`
    UPDATE products
    SET sale_price = price
    WHERE sale_price IS NULL
  `);
  console.log("products.sale_price: backfilled from price");

  console.log("\n✅ Migration complete!");
}

main().catch((e) => {
  console.error("❌ Migration failed:", e);
  process.exit(1);
});