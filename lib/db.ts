import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "@/db/schema";

function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL environment variable is not set. " +
        "Create a .env.local file with your Turso database URL."
    );
  }
  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

const client = getClient();
export const db = drizzle(client, { schema });
