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
