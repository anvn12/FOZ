import { describe, it, expect } from "vitest";
import { getAgent } from "./auth.setup.js";

// ponytail: gating tests don't need any DB rows. If a test in this file
// grows to seed a user, re-add the clearDb() beforeEach.
describe("auth gating (SC-006)", () => {
  it("POST /api/v1/auth/logout without an access token treats the session as already ended (200 ok)", async () => {
    const res = await getAgent().post("/api/v1/auth/logout").send({});
    // Logout is deliberately idempotent: a missing/expired refresh cookie must
    // be treated as a no-op rather than an error, so guests can always finish
    // a logout without tripping on a stale session.
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it("PATCH /api/v1/auth/password returns 401 with no access token", async () => {
    const res = await getAgent()
      .patch("/api/v1/auth/password")
      .send({ currentPassword: "anything", newPassword: "newpassword1" });
    expect(res.status).toBe(401);
  });

  it("POST /api/v1/auth/refresh returns 401 with no cookie", async () => {
    const res = await getAgent().post("/api/v1/auth/refresh").send({});
    expect(res.status).toBe(401);
  });
});
