/**
 * Safety Guardrail: Ensures destructive test seed or reset operations
 * only run against verified test databases and never contaminate development or production.
 */
export const ALLOWED_TEST_DATABASES = ["foz_test_empty", "foz_test_populated", "foz_test"];

export function getDatabaseName(dbUrl: string): string {
  try {
    const parsed = new URL(dbUrl);
    return parsed.pathname.replace(/^\//, "");
  } catch {
    // Fallback regex in case URL parser fails on certain protocols
    const match = dbUrl.match(/\/([^/?#]+)(?:[?#]|$)/);
    return match && match[1] ? match[1] : "";
  }
}

export function assertIsTestDatabase(dbUrl: string): void {
  const dbName = getDatabaseName(dbUrl);

  const isExplicitAllowed = ALLOWED_TEST_DATABASES.includes(dbName);
  const hasTestKeyword = dbName.includes("test");
  const isDevOrProd = dbName === "foz_dev" || dbName === "foz" || dbName === "postgres";

  if (!isExplicitAllowed && (!hasTestKeyword || isDevOrProd)) {
    throw new Error(
      `CRITICAL SAFETY ERROR: Refusing to execute destructive test script against database "${dbName}". ` +
      `Target database must be an isolated test database (e.g., ${ALLOWED_TEST_DATABASES.join(", ")}).`
    );
  }
}
