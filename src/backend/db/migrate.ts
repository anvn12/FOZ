import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db, pgClient } from "./client.js";

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "src/backend/db/migrations" });
    console.log("Database migrations applied successfully.");
  } catch (err) {
    console.error("Failed to apply database migrations:", err);
    process.exit(1);
  } finally {
    await pgClient.end();
  }
}

runMigrations();
