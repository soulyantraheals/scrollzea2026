import { createClient } from "@libsql/client";
const db = createClient({ url: "file:./scrollzea.db" });
const result = await db.execute('SELECT original_price FROM products LIMIT 1');
console.log('Local original_price works:', result.rows);