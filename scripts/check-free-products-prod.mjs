import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
const result = await db.execute('SELECT id, name, product_type, price, featured FROM products WHERE product_type = \'FREE\'');
console.log('Production FREE products:', JSON.stringify(result.rows, null, 2));