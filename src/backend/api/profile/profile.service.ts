import { findProfileByUserId, updateProfile } from "#backend/db/repositories/profiles.js";
import { extractCloudinaryPublicId, isCloudinaryConfigured, destroyAsset } from "#backend/services/cloudinary.js";

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

  // If avatar was changed, delete the old Cloudinary asset — best-effort, never blocks the response
  if (
    data.avatarUrl !== undefined &&
    existing.avatarUrl &&
    existing.avatarUrl !== data.avatarUrl &&
    existing.avatarUrl.includes("res.cloudinary.com")
  ) {
    if (isCloudinaryConfigured()) {
      const publicId = extractCloudinaryPublicId(existing.avatarUrl);
      if (publicId) {
        destroyAsset(publicId).catch((err) =>
          console.warn(`[updateUserProfile] Failed to delete old Cloudinary avatar ${publicId}:`, err)
        );
      }
    }
  }

  return updated;
}
