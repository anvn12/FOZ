import { describe, it, expect } from "vitest";
import { getAgent } from "./auth.setup.js";

// ponytail: gating tests don't need any DB rows. If a test in this file
// grows to seed a user, re-add the clearDb() beforeEach.
describe("auth gating (SC-006)", () => {
  it("POST /api/v1/auth/logout returns 401 with no access token", async () => {
    const res = await getAgent().post("/api/v1/auth/logout").send({});
    expect(res.status).toBe(401);
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
