import { describe, it, expect } from "vitest";
import bcrypt from "bcrypt";
import { env } from "#backend/env";
import { createTestDbClient } from "../test-db-provision.js";
import { userAccounts } from "../../schema/users.js";
import { eq } from "drizzle-orm";

describe("Deterministic Test Authentication & Role Verification", () => {
  it("should authenticate admin and moderator in foz_test_empty", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_EMPTY_DATABASE_URL);
    try {
      const [admin] = await db.select().from(userAccounts).where(eq(userAccounts.email, "admin@admin.foz"));
      expect(admin).toBeDefined();
      expect(admin!.role).toBe("administrator");
      const isAdminPasswordValid = await bcrypt.compare("admin@admin.foz", admin!.passwordHash);
      expect(isAdminPasswordValid).toBe(true);

      const [mod] = await db.select().from(userAccounts).where(eq(userAccounts.email, "mod@mod.foz"));
      expect(mod).toBeDefined();
      expect(mod!.role).toBe("moderator");
      const isModPasswordValid = await bcrypt.compare("mod@mod.foz", mod!.passwordHash);
      expect(isModPasswordValid).toBe(true);
    } finally {
      await pgClient.end();
    }
  });

  it("should authenticate admin and moderator in foz_test_populated", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_POPULATED_DATABASE_URL);
    try {
      const [admin] = await db.select().from(userAccounts).where(eq(userAccounts.email, "admin@admin.foz"));
      expect(admin).toBeDefined();
      expect(admin!.role).toBe("administrator");
      const isAdminPasswordValid = await bcrypt.compare("admin@admin.foz", admin!.passwordHash);
      expect(isAdminPasswordValid).toBe(true);

      const [mod] = await db.select().from(userAccounts).where(eq(userAccounts.email, "mod@mod.foz"));
      expect(mod).toBeDefined();
      expect(mod!.role).toBe("moderator");
      const isModPasswordValid = await bcrypt.compare("mod@mod.foz", mod!.passwordHash);
      expect(isModPasswordValid).toBe(true);
    } finally {
      await pgClient.end();
    }
  });

  it("should authenticate standard test users with password123 in foz_test_populated", async () => {
    const { db, pgClient } = createTestDbClient(env.TEST_POPULATED_DATABASE_URL);
    try {
      const users = await db.select().from(userAccounts).where(eq(userAccounts.role, "standard"));
      expect(users.length).toBe(50);

      // Verify a sample of standard test users
      const sampleUsers = [users[0]!, users[24]!, users[49]!];
      for (const u of sampleUsers) {
        expect(u.role).toBe("standard");
        expect(u.status).toBe("active");
        const isPasswordValid = await bcrypt.compare("password123", u.passwordHash);
        expect(isPasswordValid).toBe(true);
      }
    } finally {
      await pgClient.end();
    }
  });
});
