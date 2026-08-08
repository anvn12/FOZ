import { eq, sql } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { profiles, userAccounts } from "#backend/db/schema/index.js";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function findProfileByUserId(userId: string) {
  if (!UUID_REGEX.test(userId)) {
    // If identifier is not a valid UUID format (e.g. '@test' or 'johndoe'), search directly by username handle
    return findProfileByUsername(userId);
  }

  const [row] = await db
    .select({
      id: profiles.id,
      userAccountId: profiles.userAccountId,
      username: userAccounts.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      location: profiles.location,
      website: profiles.website,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      role: userAccounts.role,
    })
    .from(profiles)
    .innerJoin(userAccounts, eq(profiles.userAccountId, userAccounts.id))
    .where(eq(profiles.userAccountId, userId));
  
  if (row) return row;

  // Fallback: search by username if identifier was passed as handle
  return findProfileByUsername(userId);
}

export async function findProfileByUsername(username: string) {
  const cleanUsername = username.replace(/^@/, "").trim().toLowerCase();
  const [row] = await db
    .select({
      id: profiles.id,
      userAccountId: profiles.userAccountId,
      username: userAccounts.username,
      displayName: profiles.displayName,
      bio: profiles.bio,
      avatarUrl: profiles.avatarUrl,
      location: profiles.location,
      website: profiles.website,
      createdAt: profiles.createdAt,
      updatedAt: profiles.updatedAt,
      role: userAccounts.role,
    })
    .from(profiles)
    .innerJoin(userAccounts, eq(profiles.userAccountId, userAccounts.id))
    .where(sql`LOWER(${userAccounts.username}) = ${cleanUsername}`);
  return row;
}

export async function updateProfile(
  userId: string,
  data: {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    website?: string | null;
  }
) {
  await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userAccountId, userId));
  return findProfileByUserId(userId);
}
