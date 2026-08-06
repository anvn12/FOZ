import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, userSocialLinks } from "#backend/db/schema/index.js";
import { eq } from "drizzle-orm";

describe("Social Auth Routes (/api/v1/auth/google & /api/v1/auth/facebook)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  it("GET /api/v1/auth/google redirects to callback or provider URL", async () => {
    const res = await getAgent().get("/api/v1/auth/google?mode=popup");
    expect(res.status).toBe(302);
    expect(res.headers.location).toMatch(/\/api\/v1\/auth\/google\/callback|google\.com/);
  });

  it("GET /api/v1/auth/google/callback processes social login and sets cookie (popup mode)", async () => {
    const res = await getAgent().get(
      "/api/v1/auth/google/callback?code=mock_google_code&state=popup&mock_email=testgoogle@example.com&mock_name=GoogleTester",
    );

    expect(res.status).toBe(200);
    expect(res.text).toContain("SOCIAL_AUTH_SUCCESS");

    const cookie = res.headers["set-cookie"];
    const rawCookie = Array.isArray(cookie) ? cookie.join("\n") : cookie ?? "";
    expect(rawCookie).toMatch(/refresh_token=/);

    // Verify user created in DB
    const [user] = await db
      .select()
      .from(userAccounts)
      .where(eq(userAccounts.email, "testgoogle@example.com"));
    expect(user).toBeDefined();

    // Verify user_social_links created
    const [link] = await db
      .select()
      .from(userSocialLinks)
      .where(eq(userSocialLinks.userAccountId, user!.id));
    expect(link).toBeDefined();
    expect(link!.provider).toBe("google");
  });

  it("GET /api/v1/auth/facebook/callback links to existing user if email matches", async () => {
    // Seed user first via registration
    const email = "existing.user@example.com";
    await getAgent()
      .post("/api/v1/auth/register")
      .send({ email, password: "Password123!" });

    // Login via Facebook using the same email
    const res = await getAgent().get(
      `/api/v1/auth/facebook/callback?code=mock_facebook_code&state=popup&mock_email=${encodeURIComponent(
        email,
      )}&mock_name=FacebookUser`,
    );

    expect(res.status).toBe(200);

    // Verify user count in DB is still 1 (linked to existing account)
    const users = await db.select().from(userAccounts).where(eq(userAccounts.email, email));
    expect(users.length).toBe(1);

    // Verify social link mapped to the existing user
    const [link] = await db
      .select()
      .from(userSocialLinks)
      .where(eq(userSocialLinks.userAccountId, users[0]!.id));
    expect(link).toBeDefined();
    expect(link!.provider).toBe("facebook");
  });
});
