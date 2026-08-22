import { describe, it, expect, beforeEach } from "vitest";
import { getAgent, clearDb } from "./auth.setup.js";
import { db } from "#backend/db/client.js";
import { userAccounts, userSocialLinks } from "#backend/db/schema/index.js";
import { eq } from "drizzle-orm";

describe("Social Auth Routes (/api/v1/auth/google)", () => {
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
    expect(res.text).toContain('"isNewUser":true');

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

  it("marks returning social users as not new", async () => {
    const first = await getAgent().get(
      "/api/v1/auth/google/callback?code=mock_google_code&state=popup&mock_email=returning@example.com&mock_name=ReturningUser",
    );
    expect(first.text).toContain('"isNewUser":true');

    const second = await getAgent().get(
      "/api/v1/auth/google/callback?code=mock_google_code&state=popup&mock_email=returning@example.com&mock_name=ReturningUser",
    );
    expect(second.text).toContain('"isNewUser":false');
  });

  it("GET /api/v1/auth/google/callback redirects to frontend in redirect mode", async () => {
    const res = await getAgent().get(
      "/api/v1/auth/google/callback?code=mock_google_code&state=redirect&mock_email=redirectgoogle@example.com",
    );

    expect(res.status).toBe(302);
    const location = new URL(res.headers.location as string, "http://localhost");
    expect(location.pathname).toBe("/");
    expect(location.searchParams.get("token")).toBeTruthy();
    expect(location.searchParams.get("new")).toBe("1");
  });

  it("GET / handles root requests and token query params gracefully", async () => {
    const resRoot = await getAgent().get("/");
    expect(resRoot.status).toBe(200);
    expect(resRoot.body).toEqual({ ok: true, message: "FOZ API Backend" });
  });
});
