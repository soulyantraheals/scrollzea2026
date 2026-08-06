import { createClient } from "@libsql/client";
const db = createClient({ url: "file:./scrollzea.db" });
const result = await db.execute('PRAGMA table_info(products)');
console.log('Products table columns:', result.rows.map(r => r.name));