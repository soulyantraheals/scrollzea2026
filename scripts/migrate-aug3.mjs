// Safe migration for the Aug 3 schema extension.
// Adds new product columns, new columns on features/faqs, and the
// product_reviews + product_perfect_for tables. Uses ALTER TABLE ADD
// COLUMN (data-preserving) instead of drizzle-kit's table rebuild.
import { createClient } from "@libsql/client";

const client = createClient({ url: "file:./scrollzea.db" });

const productColumns = [
  ["original_price", "REAL"],
  ["sale_price", "REAL"],
  ["currency", "TEXT NOT NULL DEFAULT 'INR'"],
  ["show_limited_offer", "INTEGER NOT NULL DEFAULT 0"],
  ["offer_label", "TEXT NOT NULL DEFAULT 'Limited Time Offer'"],
  ["payment_description", "TEXT NOT NULL DEFAULT 'One-time payment · Lifetime access · No subscriptions'"],
  ["cta_text", "TEXT NOT NULL DEFAULT 'Get Instant Access Now'"],
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

const tableCreates = {
  product_reviews: `
    CREATE TABLE IF NOT EXISTS product_reviews (
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
  product_perfect_for: `
    CREATE TABLE IF NOT EXISTS product_perfect_for (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      enabled INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`,
};

async function columnExists(table, col) {
  const r = await client.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((c) => c.name === col);
}

async function main() {
  // 1) Add missing products columns
  for (const [col, def] of productColumns) {
    if (await columnExists("products", col)) {
      console.log(`products.${col}: exists, skip`);
      continue;
    }
    await client.execute(`ALTER TABLE products ADD COLUMN ${col} ${def}`);
    console.log(`products.${col}: added`);
  }

  // 2) product_features.enabled + created_at
  if (await columnExists("product_features", "enabled")) {
    console.log("product_features.enabled: exists, skip");
  } else {
    await client.execute(`ALTER TABLE product_features ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1`);
    console.log("product_features.enabled: added");
  }
  if (await columnExists("product_features", "created_at")) {
    console.log("product_features.created_at: exists, skip");
  } else {
    await client.execute(`ALTER TABLE product_features ADD COLUMN created_at TEXT DEFAULT ''`);
    await client.execute(`UPDATE product_features SET created_at = datetime('now') WHERE created_at = ''`);
    console.log("product_features.created_at: added");
  }

  // 3) faqs.enabled
  if (await columnExists("faqs", "enabled")) {
    console.log("faqs.enabled: exists, skip");
  } else {
    await client.execute(`ALTER TABLE faqs ADD COLUMN enabled INTEGER NOT NULL DEFAULT 1`);
    console.log("faqs.enabled: added");
  }

  // 4) Create new tables
  for (const [name, ddl] of Object.entries(tableCreates)) {
    await client.execute(ddl);
    console.log(`${name}: ensured`);
  }

  console.log("Migration complete.");
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
