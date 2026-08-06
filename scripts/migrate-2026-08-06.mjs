// Safe migration: dynamic payment providers + editable secondary CTA.
// ALTER TABLE ADD COLUMN only (data-preserving).
import { createClient } from "@libsql/client";
const client = createClient({ url: "file:./scrollzea.db" });

async function columnExists(table, col) {
  const r = await client.execute(`PRAGMA table_info(${table})`);
  return r.rows.some((c) => c.name === col);
}

async function addColumn(table, col, def) {
  if (await columnExists(table, col)) { console.log(`${table}.${col}: exists, skip`); return false; }
  await client.execute(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);
  console.log(`${table}.${col}: added`);
  return true;
}

async function main() {
  // products
  await addColumn("products", "secondary_cta_text", "TEXT NOT NULL DEFAULT 'Contact Us'");
  await addColumn("products", "secondary_cta_url", "TEXT");

  // payment_options
  await addColumn("payment_options", "label", "TEXT");
  await addColumn("payment_options", "icon", "TEXT");
  const sortOrderAdded = await addColumn("payment_options", "sort_order", "INTEGER NOT NULL DEFAULT 0");

  // backfill labels/icons from legacy provider keys; order by id
  await client.execute("UPDATE payment_options SET label='Razorpay', icon='💳' WHERE provider='RAZORPAY' AND (label IS NULL OR label='')");
  await client.execute("UPDATE payment_options SET label='PayPal', icon='🅿️' WHERE provider='PAYPAL' AND (label IS NULL OR label='')");
  await client.execute("UPDATE payment_options SET label='WhatsApp', icon='💬' WHERE provider='WHATSAPP' AND (label IS NULL OR label='')");
  // Only backfill sort_order when the column was just added. Re-running this
  // script after admin saves (which writes 0,1,2) must NOT shuffle provider order.
  if (sortOrderAdded) {
    await client.execute("UPDATE payment_options SET sort_order=id WHERE sort_order=0");
  }

  console.log("Migration complete.");
}
main().catch((e) => { console.error("Migration failed:", e); process.exit(1); });
