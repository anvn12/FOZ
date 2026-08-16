import type { Db } from "../client.js";
import { userAccounts, profiles } from "../schema/users.js";
import { truncateAllTables, getStandardPasswordHashes } from "./seed-helpers.js";
import { seedPopulatedUsers } from "./populated-users.seed.js";
import { seedPopulatedInteractions } from "./populated-interactions.seed.js";

/**
 * Seeds the populated high-density test database state:
 * - Truncates all existing records
 * - Creates Administrator account (admin@admin.foz / admin@admin.foz)
 * - Creates Moderator account (mod@mod.foz / mod@mod.foz)
 * - Creates 50 distinct test users with profiles (user1@foz.test ... user50@foz.test)
 * - Generates 100 posts (timeline spread), comments, nested replies, reposts, reactions, hashtags, reports
 */
export async function seedPopulatedState(db: Db): Promise<{ adminId: string; modId: string; userIds: string[] }> {
  console.log("🌱 [seed:populated] Clearing existing records...");
  await truncateAllTables(db);

  const { adminHash, modHash, userHash } = await getStandardPasswordHashes();

  console.log("🌱 [seed:populated] Creating Admin & Moderator accounts...");
  const [adminUser] = await db
    .insert(userAccounts)
    .values({
      email: "admin@admin.foz",
      username: "admin",
      passwordHash: adminHash,
      role: "administrator",
      status: "active",
    })
    .returning({ id: userAccounts.id });

  if (!adminUser) {
    throw new Error("Failed to insert admin user in populated state seed");
  }

  await db.insert(profiles).values({
    userAccountId: adminUser.id,
    displayName: "FOZ Administrator",
    bio: "System Administrator for FOZ Community",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=admin",
  });

  const [modUser] = await db
    .insert(userAccounts)
    .values({
      email: "mod@mod.foz",
      username: "moderator",
      passwordHash: modHash,
      role: "moderator",
      status: "active",
    })
    .returning({ id: userAccounts.id });

  if (!modUser) {
    throw new Error("Failed to insert moderator user in populated state seed");
  }

  await db.insert(profiles).values({
    userAccountId: modUser.id,
    displayName: "FOZ Moderator",
    bio: "Community Moderator for FOZ Platform",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=moderator",
  });

  // Seed 50 users
  const standardUserIds = await seedPopulatedUsers(db, userHash, 50);

  // Seed 100 posts + interactions
  const allUserIds = [adminUser.id, modUser.id, ...standardUserIds];
  await seedPopulatedInteractions(db, allUserIds, 100);

  console.log("✅ [seed:populated] High-density test database populated successfully.");
  return { adminId: adminUser.id, modId: modUser.id, userIds: standardUserIds };
}
