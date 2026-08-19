import { env } from "#backend/env";
import { ensureDatabaseExists, createTestDbClient } from "./test-db-provision.js";
import { migrateTestDatabase } from "./test-db-migrate.js";
import { seedPopulatedState } from "../seeds/populated-state.seed.js";
import { assertIsTestDatabase } from "./test-db-guard.js";

/**
 * Provisions, migrates, and resets the populated test database (foz_test_populated).
 */
export async function resetPopulatedTestDatabase(): Promise<void> {
  const startTime = Date.now();
  const dbUrl = env.TEST_POPULATED_DATABASE_URL;
  assertIsTestDatabase(dbUrl);

  console.log(`🚀 [reset:populated] Resetting ${dbUrl}...`);
  await ensureDatabaseExists("foz_test_populated");
  await migrateTestDatabase(dbUrl);

  const { db, pgClient } = createTestDbClient(dbUrl);
  try {
    await seedPopulatedState(db);
    const duration = Date.now() - startTime;
    console.log(`✅ [reset:populated] Successfully reset foz_test_populated in ${duration}ms.`);
  } finally {
    await pgClient.end();
  }
}

if (process.argv[1]?.endsWith("test-db-populated-reset.ts") || process.argv[1]?.endsWith("test-db-populated-reset.js")) {
  resetPopulatedTestDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ [reset:populated] Reset failed:", err);
      process.exit(1);
    });
}
