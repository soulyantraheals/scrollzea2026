import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
// Make Ultimate Notion Dashboard featured
const result = await db.execute('UPDATE products SET featured = 1 WHERE slug = \'ultimate-notion-dashboard\'');
console.log('Updated:', result);
const verify = await db.execute('SELECT id, name, product_type, price, featured FROM products WHERE product_type = \'FREE\'');
console.log('Production FREE products after update:', JSON.stringify(verify.rows, null, 2));