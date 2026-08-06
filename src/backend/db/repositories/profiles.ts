import { eq } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { profiles, userAccounts } from "#backend/db/schema/index.js";

export async function findProfileByUserId(userId: string) {
  const [row] = await db
    .select({
      id: profiles.id,
      userAccountId: profiles.userAccountId,
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
  const [row] = await db
    .update(profiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(profiles.userAccountId, userId))
    .returning();
  return row;
}
