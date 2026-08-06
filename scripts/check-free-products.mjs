import { createClient } from "@libsql/client";
const db = createClient({ url: "file:./scrollzea.db" });
const result = await db.execute('SELECT id, name, product_type, price, featured FROM products WHERE product_type = \'FREE\'');
console.log('Local FREE products:', JSON.stringify(result.rows, null, 2));