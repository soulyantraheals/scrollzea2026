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
