import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
// Check all products
const allProducts = await db.execute('SELECT id, name, product_type, status, featured FROM products WHERE status = \'published\' ORDER BY created_at DESC');
console.log('All published products:', JSON.stringify(allProducts.rows, null, 2));