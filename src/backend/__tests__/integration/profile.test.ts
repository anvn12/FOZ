import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { createUserWithProfile } from "#backend/db/repositories/users.js";

async function registerAndGetToken(email = "user@example.com"): Promise<{ accessToken: string; userId: string }> {
  const res = await getAgent()
    .post("/api/v1/auth/register")
    .send({ email, password: "password123", username: `u${Math.random().toString(36).slice(2, 8)}`, displayName: "Test User", location: "loc", website: "https://foz.dev" });
  expect(res.status).toBe(201);
  return {
    accessToken: res.body.accessToken,
    userId: res.body.user.id,
  };
}

describe("Profile Management API Integration Tests", () => {
  beforeEach(async () => {
    await clearDb();
  });

  describe("GET /api/v1/profiles/:userId", () => {
    it("should return 404 for non-existent profile UUID", async () => {
      const nonExistentId = "00000000-0000-0000-0000-000000000000";
      const res = await getAgent().get(`/api/v1/profiles/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("NOT_FOUND");
      expect(res.body.error.message).toMatch(/not found/i);
    });

    it("should return 200 and the profile details for a valid user", async () => {
      const { profile } = await createUserWithProfile({
        email: "testprofile@example.com",
        passwordHash: "somehashedpassword",
        username: "testprofile",
        displayName: "Alice",
      });

      const res = await getAgent().get(`/api/v1/profiles/${profile.userAccountId}`);
      expect(res.status).toBe(200);
      expect(res.body.profile).toBeDefined();
      expect(res.body.profile.userAccountId).toBe(profile.userAccountId);
      expect(res.body.profile.displayName).toBe("Alice");
      expect(res.body.profile.bio).toBeNull();
      expect(res.body.profile.avatarUrl).toBeNull();
      expect(res.body.profile.location).toBeNull();
      expect(res.body.profile.website).toBeNull();
    });
  });

  describe("PATCH /api/v1/profiles/me", () => {
    it("should return 401 if unauthorized", async () => {
      const res = await getAgent()
        .patch("/api/v1/profiles/me")
        .send({ displayName: "New Name" });
      expect(res.status).toBe(401);
    });

    it("should successfully update profile fields for logged in user", async () => {
      const { accessToken, userId } = await registerAndGetToken();
      const res = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          displayName: "Updated Name",
          bio: "Updated bio text",
          location: "Oakland",
          website: "https://alice.com",
        });

      expect(res.status).toBe(200);
      expect(res.body.profile.displayName).toBe("Updated Name");
      expect(res.body.profile.bio).toBe("Updated bio text");
      expect(res.body.profile.location).toBe("Oakland");
      expect(res.body.profile.website).toBe("https://alice.com");
      expect(res.body.profile.userAccountId).toBe(userId);
    });

    it("should ensure that User A cannot modify User B's profile", async () => {
      const userA = await registerAndGetToken("usera@example.com");
      const userB = await registerAndGetToken("userb@example.com");

      // Try to update profile as User A
      const updateRes = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${userA.accessToken}`)
        .send({
          displayName: "User A Updated",
        });
      expect(updateRes.status).toBe(200);

      // Verify User B's profile remains unchanged
      const checkBRes = await getAgent().get(`/api/v1/profiles/${userB.userId}`);
      expect(checkBRes.status).toBe(200);
      expect(checkBRes.body.profile.displayName).not.toBe("User A Updated");
    });

    it("should return 422 if displayName is missing or empty", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          displayName: "",
        });

      expect(res.status).toBe(422);
      expect(res.body.error.code).toBe("VALIDATION");
    });

    it("should return 422 if bio exceeds max length", async () => {
      const { accessToken } = await registerAndGetToken();
      const longBio = "a".repeat(161);
      const res = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          displayName: "Alice",
          bio: longBio,
        });

      expect(res.status).toBe(422);
    });

    it("should format and validate website correctly", async () => {
      const { accessToken } = await registerAndGetToken();
      
      // Update with website lacking protocol
      const res1 = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          displayName: "Alice",
          website: "google.com",
        });

      expect(res1.status).toBe(200);
      expect(res1.body.profile.website).toBe("https://google.com");

      // Update with invalid website format
      const res2 = await getAgent()
        .patch("/api/v1/profiles/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          displayName: "Alice",
          website: "not-a-valid-url",
        });

      expect(res2.status).toBe(422);
      expect(res2.body.error.fields.website).toContain("Invalid website URL format");
    });
  });

  describe("POST /api/v1/profiles/me/avatar", () => {
    const validAvatarBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    it("should return 401 if unauthorized", async () => {
      const res = await getAgent()
        .post("/api/v1/profiles/me/avatar")
        .send({ avatar: validAvatarBase64 });
      expect(res.status).toBe(401);
    });

    it("should successfully upload avatar for logged in user", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/profiles/me/avatar")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ avatar: validAvatarBase64 });

      expect(res.status).toBe(200);
      expect(res.body.avatarUrl).toBe(validAvatarBase64);
    });

    it("should return 422 for invalid image mime type", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/profiles/me/avatar")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ avatar: "data:image/bmp;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" });

      expect(res.status).toBe(422);
    });

    it("should return 422 for invalid base64 data", async () => {
      const { accessToken } = await registerAndGetToken();
      const res = await getAgent()
        .post("/api/v1/profiles/me/avatar")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ avatar: "data:image/png;base64,not-base64-data!!" });

      expect(res.status).toBe(422);
    });
  });
});
