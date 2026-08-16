import { migrate } from "drizzle-orm/postgres-js/migrator";
import { env } from "#backend/env";
import { assertIsTestDatabase } from "./test-db-guard.js";
import { createTestDbClient, provisionAllTestDatabases } from "./test-db-provision.js";

/**
 * Runs Drizzle migrations on a specific target database URL.
 */
export async function migrateTestDatabase(dbUrl: string): Promise<void> {
  assertIsTestDatabase(dbUrl);
  const { db, pgClient } = createTestDbClient(dbUrl);

  try {
    await migrate(db, { migrationsFolder: "src/backend/db/migrations" });
    console.log(`✅ [migrate] Applied migrations successfully to ${dbUrl}`);
  } catch (err) {
    console.error(`❌ [migrate] Migration failed for ${dbUrl}:`, err);
    throw err;
  } finally {
    await pgClient.end();
  }
}

/**
 * Migrates both foz_test_empty and foz_test_populated.
 */
export async function migrateAllTestDatabases(): Promise<void> {
  await provisionAllTestDatabases();
  await migrateTestDatabase(env.TEST_EMPTY_DATABASE_URL);
  await migrateTestDatabase(env.TEST_POPULATED_DATABASE_URL);
}

// If executed directly from CLI
if (process.argv[1]?.endsWith("test-db-migrate.ts") || process.argv[1]?.endsWith("test-db-migrate.js")) {
  migrateAllTestDatabases()
    .then(() => {
      console.log("✅ [migrate] All test databases migrated successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ [migrate] Failed to migrate test databases:", err);
      process.exit(1);
    });
}
