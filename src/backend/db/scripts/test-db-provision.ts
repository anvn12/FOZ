import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "#backend/env";
import * as schema from "../schema/index.js";
import { assertIsTestDatabase } from "./test-db-guard.js";

/**
 * Connects to PostgreSQL server and ensures the test databases exist.
 */
export async function ensureDatabaseExists(databaseName: string, adminUrl?: string): Promise<void> {
  const baseAdminUrl = adminUrl || env.DATABASE_URL;
  // Connect to default 'postgres' or existing db to run CREATE DATABASE
  const adminClient = postgres(baseAdminUrl, { max: 1 });

  try {
    const existing = await adminClient`
      SELECT 1 FROM pg_database WHERE datname = ${databaseName}
    `;

    if (existing.length === 0) {
      // Database names cannot be parameterized in CREATE DATABASE statement
      const sanitizedDbName = databaseName.replace(/[^a-zA-Z0-9_]/g, "");
      await adminClient.unsafe(`CREATE DATABASE ${sanitizedDbName};`);
      console.log(`✅ [provision] Created test database: ${databaseName}`);
    } else {
      console.log(`ℹ️ [provision] Test database already exists: ${databaseName}`);
    }
  } finally {
    await adminClient.end();
  }
}

/**
 * Ensures both test databases (empty and populated) exist on the PostgreSQL instance.
 */
export async function provisionAllTestDatabases(): Promise<void> {
  await ensureDatabaseExists("foz_test_empty");
  await ensureDatabaseExists("foz_test_populated");
}

/**
 * Creates a Drizzle DB instance connected to the specified test database.
 */
export function createTestDbClient(dbUrl: string) {
  assertIsTestDatabase(dbUrl);
  const client = postgres(dbUrl, { max: 10 });
  const db = drizzle(client, { schema });
  return { db, pgClient: client };
}
