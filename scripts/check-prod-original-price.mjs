import { createClient } from "@libsql/client";
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});
const result = await db.execute('SELECT original_price FROM products LIMIT 1');
console.log('Prod original_price works:', result.rows);