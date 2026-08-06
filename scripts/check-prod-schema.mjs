import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
// Check production products table schema
const result = await db.execute('PRAGMA table_info(products)');
console.log('Production products table columns:', result.rows.map(r => r.name));