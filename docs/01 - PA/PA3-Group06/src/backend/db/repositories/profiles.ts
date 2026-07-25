import { eq } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import { profiles } from "#backend/db/schema/index.js";

export async function findProfileByUserId(userId: string) {
  const [row] = await db
    .select()
    .from(profiles)
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
