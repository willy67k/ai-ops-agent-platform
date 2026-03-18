import * as dotenv from "dotenv";
dotenv.config({ path: ".env.development" });
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./src/modules/database/schema.js";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

async function seed() {
  await db
    .insert(schema.users)
    .values([
      {
        username: "admin_user",
        email: "admin@example.com",
        role: "admin",
      },
      {
        username: "operator_user",
        email: "op@example.com",
        role: "operator",
      },
      {
        username: "viewer_user",
        email: "viewer@example.com",
        role: "viewer",
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Seed finished.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
