import { describe, it, expect } from "vitest";
import { UpdateProfileRequest, UpdateAvatarRequest } from "./profile.js";

describe("UpdateProfileRequest Schema", () => {
  it("should validate a valid request successfully", () => {
    const data = {
      displayName: "Alice",
      bio: "Hello world",
      location: "San Francisco",
      website: "https://alice.com",
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(true);
  });

  it("should transform empty string values to null", () => {
    const data = {
      displayName: "Alice",
      bio: "",
      location: "",
      website: "",
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.bio).toBeNull();
      expect(parsed.data.location).toBeNull();
      expect(parsed.data.website).toBeNull();
    }
  });

  it("should reject display names longer than 50 characters", () => {
    const data = {
      displayName: "a".repeat(51),
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("should reject bios longer than 160 characters", () => {
    const data = {
      displayName: "Alice",
      bio: "b".repeat(161),
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("should reject invalid website URL formats", () => {
    const data = {
      displayName: "Alice",
      website: "not-a-url",
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(false);
  });

  it("should accept valid protocol-less URLs and check they parse", () => {
    const data = {
      displayName: "Alice",
      website: "google.com",
    };
    const parsed = UpdateProfileRequest.safeParse(data);
    expect(parsed.success).toBe(true);
  });
});

describe("UpdateAvatarRequest Schema", () => {
  const validBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  it("should validate a valid base64 image", () => {
    const parsed = UpdateAvatarRequest.safeParse({ avatar: validBase64 });
    expect(parsed.success).toBe(true);
  });

  it("should validate a valid webp base64 image", () => {
    const parsed = UpdateAvatarRequest.safeParse({
      avatar: "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",
    });
    expect(parsed.success).toBe(true);
  });

  it("should reject base64 images of invalid types", () => {
    const parsed = UpdateAvatarRequest.safeParse({
      avatar: "data:image/svg+xml;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    });
    expect(parsed.success).toBe(false);
  });


  it("should reject base64 payloads that exceed 2MB", () => {
    // 2.1 MB = 2.1 * 1024 * 1024 bytes approx = 2,202,000 bytes
    // Base64 encoding expands size by ~4/3, so string length will be around 2.9 million characters.
    const largeBase64String = "data:image/png;base64," + "a".repeat(3 * 1024 * 1024);
    const parsed = UpdateAvatarRequest.safeParse({ avatar: largeBase64String });
    expect(parsed.success).toBe(false);
  });
});
