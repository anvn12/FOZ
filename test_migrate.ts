import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

async function run() {
  const sql = postgres("postgres://foz:foz@localhost:5432/foz_test", { max: 1 });
  
  // reset schema first
  await sql`DROP SCHEMA public CASCADE;`;
  await sql`CREATE SCHEMA public;`;
  
  const db = drizzle(sql);
  try {
    console.log("Running migrations...");
    await migrate(db, { migrationsFolder: "./src/backend/db/migrations" });
    console.log("Done.");
  } catch(e) {
    console.error(e);
  }
  await sql.end();
}
run();
