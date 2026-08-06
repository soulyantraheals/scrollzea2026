import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
// Check featured products query
const featured = await db.execute('SELECT id, name, slug, product_type, price, status, featured FROM products WHERE featured = 1 AND status = \'published\' ORDER BY created_at DESC LIMIT 8');
console.log('Featured products:', JSON.stringify(featured.rows, null, 2));