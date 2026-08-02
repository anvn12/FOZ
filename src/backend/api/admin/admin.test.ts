import { describe, it, expect } from "vitest";
import { getAgent } from "#backend/__tests__/integration/auth.setup.js";

describe("Administrator Authorization & Gating (SC-005 & FR-001)", () => {
  it("GET /api/v1/admin/metrics returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/metrics");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/admin/audit-logs returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/audit-logs");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/admin/users returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/users");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/admin/reports returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/reports");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/admin/categories returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/categories");
    expect(res.status).toBe(401);
  });

  it("GET /api/v1/admin/settings returns 401 unauthenticated without token", async () => {
    const res = await getAgent().get("/api/v1/admin/settings");
    expect(res.status).toBe(401);
  });
});
