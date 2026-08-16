import type { Db } from "../client.js";
import { userAccounts, profiles } from "../schema/users.js";
import { truncateAllTables, getStandardPasswordHashes } from "./seed-helpers.js";

/**
 * Seeds the empty test database state:
 * - Truncates all existing records
 * - Creates Administrator account (admin@admin.foz / admin@admin.foz)
 * - Creates Moderator account (mod@mod.foz / mod@mod.foz)
 * - Ensures 0 posts, 0 comments, 0 reactions
 */
export async function seedEmptyState(db: Db): Promise<{ adminId: string; modId: string }> {
  console.log("🌱 [seed:empty] Clearing existing records...");
  await truncateAllTables(db);

  const { adminHash, modHash } = await getStandardPasswordHashes();

  console.log("🌱 [seed:empty] Creating Admin & Moderator accounts...");
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
    throw new Error("Failed to insert admin user in empty state seed");
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
    throw new Error("Failed to insert moderator user in empty state seed");
  }

  await db.insert(profiles).values({
    userAccountId: modUser.id,
    displayName: "FOZ Moderator",
    bio: "Community Moderator for FOZ Platform",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=moderator",
  });

  console.log("✅ [seed:empty] Empty state seeded successfully with 0 posts.");
  return { adminId: adminUser.id, modId: modUser.id };
}
