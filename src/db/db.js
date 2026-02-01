import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { DATABASE_URL } from "../config/index.js";
const { Pool } = pkg;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const db = drizzle(pool);
