import { env } from "#backend/env";
import { ensureDatabaseExists, createTestDbClient } from "./test-db-provision.js";
import { migrateTestDatabase } from "./test-db-migrate.js";
import { seedEmptyState } from "../seeds/empty-state.seed.js";
import { assertIsTestDatabase } from "./test-db-guard.js";

/**
 * Provisions, migrates, and resets the empty state test database (foz_test_empty).
 */
export async function resetEmptyTestDatabase(): Promise<void> {
  const startTime = Date.now();
  const dbUrl = env.TEST_EMPTY_DATABASE_URL;
  assertIsTestDatabase(dbUrl);

  console.log(`🚀 [reset:empty] Resetting ${dbUrl}...`);
  await ensureDatabaseExists("foz_test_empty");
  await migrateTestDatabase(dbUrl);

  const { db, pgClient } = createTestDbClient(dbUrl);
  try {
    await seedEmptyState(db);
    const duration = Date.now() - startTime;
    console.log(`✅ [reset:empty] Successfully reset foz_test_empty in ${duration}ms.`);
  } finally {
    await pgClient.end();
  }
}

if (process.argv[1]?.endsWith("test-db-empty-reset.ts") || process.argv[1]?.endsWith("test-db-empty-reset.js")) {
  resetEmptyTestDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ [reset:empty] Reset failed:", err);
      process.exit(1);
    });
}
