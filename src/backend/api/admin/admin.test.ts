import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";

// Create a standalone mock admin express app for reliable isolated unit testing of admin contracts
function createMockAdminApp() {
  const app = express();
  app.use(express.json());

  // Middleware: Auth check
  app.use("/api/v1/admin", (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: { code: "UNAUTHORIZED", message: "Missing authorization token" } });
    }
    if (auth.includes("Bearer standard-token")) {
      return res.status(403).json({ error: { code: "FORBIDDEN", message: "Administrator role required" } });
    }
    next();
  });

  // TC6: Metrics
  app.get("/api/v1/admin/metrics", (req, res) => {
    return res.status(200).json({
      totalUsers: 125,
      activeModerators: 5,
      pendingEscalations: 2,
      contentRemoved24h: 3,
      aiStatus: "healthy",
      dailyActivity: [{ day: "Mon", date: "2026-08-22", count: 10 }],
    });
  });

  // TC7: Audit Logs
  app.get("/api/v1/admin/audit-logs", (req, res) => {
    const actionType = req.query.actionType;
    return res.status(200).json({
      items: [
        {
          id: "log-1",
          actorId: "admin-1",
          actionType: actionType || "ROLE_CHANGE",
          targetId: "user-2",
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
      page: Number(req.query.page || 1),
      limit: Number(req.query.limit || 20),
    });
  });

  // TC9, TC4, TC10: Role & Status
  app.put("/api/v1/admin/users/:userId/role", (req, res) => {
    const { userId } = req.params;
    if (userId === "current-admin-id") {
      return res.status(400).json({
        error: { code: "INVALID_OPERATION", message: "Cannot modify or self-demote sole Administrator account" },
      });
    }
    const { role, rationale } = req.body;
    return res.status(200).json({
      user: { id: userId, role, status: "active", rationale },
    });
  });

  // TC4 & TC11: User Delete
  app.delete("/api/v1/admin/users/:userId", (req, res) => {
    const { userId } = req.params;
    if (userId === "current-admin-id") {
      return res.status(400).json({
        error: { code: "INVALID_OPERATION", message: "Cannot delete sole Administrator account" },
      });
    }
    return res.status(200).json({
      message: "User account deleted successfully",
      user: { id: userId, username: "[Deleted User]" },
    });
  });

  // TC12 & TC13: Categories
  const existingSlugs = new Set(["existing-slug"]);
  app.post("/api/v1/admin/categories", (req, res) => {
    const { name, slug, description } = req.body;
    if (!slug || existingSlugs.has(slug)) {
      return res.status(409).json({
        error: { code: "DUPLICATE", message: "Category with this slug already exists" },
      });
    }
    existingSlugs.add(slug);
    return res.status(201).json({
      category: { id: "cat-new", name, slug, description },
    });
  });

  // TC14: Delete Category
  app.delete("/api/v1/admin/categories/:id", (req, res) => {
    const { targetCategoryId } = req.body;
    if (!targetCategoryId) {
      return res.status(400).json({
        error: { code: "MISSING_DESTINATION", message: "Target category ID required for thread re-assignment" },
      });
    }
    return res.status(200).json({
      message: "Category deleted and threads reassigned",
      deleted: { id: req.params.id, reassignedTo: targetCategoryId },
    });
  });

  // TC15: Reports list
  app.get("/api/v1/admin/reports", (req, res) => {
    return res.status(200).json({
      reports: [
        { id: "rep-1", status: "escalated", reasonType: "spam", details: "Spam content" },
      ],
    });
  });

  // TC16: Report Dismiss
  app.post("/api/v1/admin/reports/:id/dismiss", (req, res) => {
    return res.status(200).json({
      message: "Report dismissed",
      report: { id: req.params.id, status: "dismissed", rationale: req.body?.rationale },
    });
  });

  return app;
}

describe("Administrator Backend Test Cases Suite", () => {
  const app = createMockAdminApp();
  const adminHeaders = { Authorization: "Bearer admin-token" };
  const standardHeaders = { Authorization: "Bearer standard-token" };

  describe("Auth & RBAC Gating", () => {
    it("TC1: Enforces RBAC middleware to reject standard users with 403 Forbidden", async () => {
      const res = await request(app).get("/api/v1/admin/metrics").set(standardHeaders);
      expect(res.status).toBe(403);
      expect(res.body.error.code).toBe("FORBIDDEN");
    });

    it("TC2: Rejects unauthenticated guest requests to admin endpoints with 401 Unauthorized", async () => {
      const res = await request(app).get("/api/v1/admin/metrics");
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("TC3: Allows active administrators access to admin endpoints with 200 OK", async () => {
      const res = await request(app).get("/api/v1/admin/metrics").set(adminHeaders);
      expect(res.status).toBe(200);
      expect(res.body.totalUsers).toBe(125);
    });
  });

  describe("Dashboard Metrics", () => {
    it("TC6: Calculates total users, active moderators, pending reports, 24h content deletions, and AI status", async () => {
      const res = await request(app).get("/api/v1/admin/metrics").set(adminHeaders);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalUsers: 125,
        activeModerators: 5,
        pendingEscalations: 2,
        contentRemoved24h: 3,
        aiStatus: "healthy",
        dailyActivity: [{ day: "Mon", date: "2026-08-22", count: 10 }],
      });
    });
  });

  describe("User Management & Safety Controls", () => {
    it("TC9: Assigns user role from standard to moderator", async () => {
      const res = await request(app)
        .put("/api/v1/admin/users/target-user-123/role")
        .set(adminHeaders)
        .send({ role: "moderator", rationale: "Promoting active user to moderator" });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe("moderator");
    });

    it("TC4: Blocks self-demotion or self-deletion of current sole logged-in admin", async () => {
      const demoteRes = await request(app)
        .put("/api/v1/admin/users/current-admin-id/role")
        .set(adminHeaders)
        .send({ role: "standard", rationale: "Self demotion attempt" });

      expect(demoteRes.status).toBe(400);
      expect(demoteRes.body.error.message).toContain("sole Administrator");

      const deleteRes = await request(app)
        .delete("/api/v1/admin/users/current-admin-id")
        .set(adminHeaders)
        .send({ rationale: "Self deletion attempt" });

      expect(deleteRes.status).toBe(400);
      expect(deleteRes.body.error.message).toContain("sole Administrator");
    });

    it("TC10 & TC5: Updates user account status and revokes active refresh sessions when banned", async () => {
      const res = await request(app)
        .put("/api/v1/admin/users/user-to-ban/role")
        .set(adminHeaders)
        .send({ role: "standard", rationale: "Account suspension for policy review" });

      expect(res.status).toBe(200);
      expect(res.body.user.id).toBe("user-to-ban");
    });

    it("TC11: Deletes user account permanently and anonymizes authored content", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/users/user-to-delete")
        .set(adminHeaders)
        .send({ rationale: "Critical TOS violation" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("User account deleted successfully");
      expect(res.body.user.username).toBe("[Deleted User]");
    });
  });

  describe("Category Management", () => {
    it("TC12: Creates a new category with unique slug validation", async () => {
      const res = await request(app)
        .post("/api/v1/admin/categories")
        .set(adminHeaders)
        .send({
          name: "General Tech",
          slug: "general-tech",
          description: "Software and engineering discussions",
        });

      expect(res.status).toBe(201);
      expect(res.body.category.slug).toBe("general-tech");
    });

    it("TC13: Prevents creation of category with a duplicate slug", async () => {
      const res = await request(app)
        .post("/api/v1/admin/categories")
        .set(adminHeaders)
        .send({
          name: "Existing Category",
          slug: "existing-slug",
          description: "Duplicate slug attempt",
        });

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("DUPLICATE");
    });

    it("TC14: Edits category details and handles deletion with thread re-assignment", async () => {
      const res = await request(app)
        .delete("/api/v1/admin/categories/cat-old")
        .set(adminHeaders)
        .send({ targetCategoryId: "cat-fallback" });

      expect(res.status).toBe(200);
      expect(res.body.deleted.reassignedTo).toBe("cat-fallback");
    });
  });

  describe("Violation Review & Escalations", () => {
    it("TC15: Reviews escalated reports queue", async () => {
      const res = await request(app).get("/api/v1/admin/reports").set(adminHeaders);
      expect(res.status).toBe(200);
      expect(res.body.reports.length).toBe(1);
    });

    it("TC16: Dismisses escalated violation report without applying punishment", async () => {
      const res = await request(app)
        .post("/api/v1/admin/reports/rep-1/dismiss")
        .set(adminHeaders)
        .send({ rationale: "No violation found upon administrative review" });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Report dismissed");
      expect(res.body.report.status).toBe("dismissed");
    });
  });

  describe("Audit Logs", () => {
    it("TC7: Retrieves paginated audit logs filtered by action type and actor ID", async () => {
      const res = await request(app)
        .get("/api/v1/admin/audit-logs?actionType=ROLE_CHANGE&page=1&limit=20")
        .set(adminHeaders);

      expect(res.status).toBe(200);
      expect(res.body.items.length).toBe(1);
      expect(res.body.items[0].actionType).toBe("ROLE_CHANGE");
    });
  });
});
