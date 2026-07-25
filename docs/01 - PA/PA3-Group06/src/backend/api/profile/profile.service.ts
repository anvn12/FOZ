import { findProfileByUserId, updateProfile } from "#backend/db/repositories/profiles.js";

export class ProfileError extends Error {
  constructor(
    public code: string,
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function getProfileByUserId(userId: string) {
  const profile = await findProfileByUserId(userId);
  if (!profile) {
    throw new ProfileError("NOT_FOUND", 404, "Profile not found");
  }
  return profile;
}

export async function updateUserProfile(
  userId: string,
  data: {
    displayName?: string;
    bio?: string | null;
    avatarUrl?: string | null;
    location?: string | null;
    website?: string | null;
  }
) {
  // Check if profile exists first
  const existing = await findProfileByUserId(userId);
  if (!existing) {
    throw new ProfileError("NOT_FOUND", 404, "Profile not found");
  }

  const updated = await updateProfile(userId, data);
  if (!updated) {
    throw new ProfileError("NOT_FOUND", 404, "Profile not found");
  }
  return updated;
}
