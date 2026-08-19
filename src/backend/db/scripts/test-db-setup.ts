import { resetEmptyTestDatabase } from "./test-db-empty-reset.js";
import { resetPopulatedTestDatabase } from "./test-db-populated-reset.js";

/**
 * Master test database setup script:
 * - Provisions both foz_test_empty and foz_test_populated
 * - Runs latest migrations on both
 * - Seeds empty state into foz_test_empty (0 posts, admin + mod)
 * - Seeds high-density state into foz_test_populated (50 users, 100 posts, interactions)
 */
export async function setupAllTestDatabases(): Promise<void> {
  const startTime = Date.now();
  console.log("==================================================");
  console.log("🚀 Starting Full Test Database Provisioning Suite");
  console.log("==================================================");

  await resetEmptyTestDatabase();
  console.log("--------------------------------------------------");
  await resetPopulatedTestDatabase();

  const totalDuration = Date.now() - startTime;
  console.log("==================================================");
  console.log(`🎉 All test databases successfully setup in ${totalDuration}ms.`);
  console.log("   1. Empty Database:     postgres://foz:foz@localhost:5432/foz_test_empty");
  console.log("   2. Populated Database: postgres://foz:foz@localhost:5432/foz_test_populated");
  console.log("==================================================");
}

if (process.argv[1]?.endsWith("test-db-setup.ts") || process.argv[1]?.endsWith("test-db-setup.js")) {
  setupAllTestDatabases()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to setup test databases:", err);
      process.exit(1);
    });
}
