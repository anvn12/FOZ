import { Router } from "express";
import { requireAdminRole } from "./middleware.js";
import { validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import {
  AssignRoleRequest,
  DeleteUserRequest,
  SetUserStatusRequest,
  InstantDeleteContentRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  UpdateSystemSettingRequest,
} from "#shared/schemas/admin.js";
import * as adminService from "#backend/services/admin.service.js";

export const adminRouter = Router();

// Protect all admin endpoints with requireAdminRole middleware
adminRouter.use(requireAdminRole);

// Control Center Metrics
adminRouter.get("/metrics", async (req, res, next) => {
  try {
    const metrics = await adminService.fetchAdminMetrics();
    return res.json(metrics);
  } catch (err) {
    next(err);
  }
});

// Searchable Audit Logs
adminRouter.get("/audit-logs", async (req, res, next) => {
  try {
    const { actorId, actionType, startDate, endDate, page, limit } = req.query;
    const result = await adminService.fetchAuditLogs({
      actorId: actorId ? String(actorId) : undefined,
      actionType: actionType ? String(actionType) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

// User Management
adminRouter.get("/users", async (req, res, next) => {
  try {
    const { query, role, page, limit } = req.query;
    const result = await adminService.fetchUsers({
      query: query ? String(query) : undefined,
      role: role ? String(role) : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });
    return res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.put(
  "/users/:userId/role",
  validateBody(AssignRoleRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const userId = String(req.params.userId);
      const { role, rationale } = req.body;
      const updated = await adminService.assignUserRole({
        adminUser: authed.user!,
        targetUserId: userId,
        newRole: role,
        rationale,
      });
      return res.json({ user: updated });
    } catch (err: any) {
      if (err.message.includes("sole Administrator")) {
        return res.status(400).json({ error: { code: "INVALID_OPERATION", message: err.message } });
      }
      if (err.message === "This user account is no longer available.") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      }
      next(err);
    }
  }
);

adminRouter.delete(
  "/users/:userId",
  validateBody(DeleteUserRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const userId = String(req.params.userId);
      const { rationale } = req.body;
      const deleted = await adminService.permanentlyRemoveUser({
        adminUser: authed.user!,
        targetUserId: userId,
        rationale,
      });
      return res.json({ message: "User account deleted successfully", user: deleted });
    } catch (err: any) {
      if (err.message.includes("sole Administrator")) {
        return res.status(400).json({ error: { code: "INVALID_OPERATION", message: err.message } });
      }
      if (err.message === "This user account is no longer available.") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      }
      next(err);
    }
  }
);

adminRouter.put(
  "/users/:userId/status",
  validateBody(SetUserStatusRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const userId = String(req.params.userId);
      const { status, rationale } = req.body;
      const updated = await adminService.setUserStatus({
        adminUser: authed.user!,
        targetUserId: userId,
        status,
        rationale,
      });
      return res.json({ user: updated });
    } catch (err: any) {
      if (err.message.includes("Administrator account")) {
        return res.status(400).json({ error: { code: "INVALID_OPERATION", message: err.message } });
      }
      next(err);
    }
  }
);

// Moderation & Instant Content Removal
adminRouter.get("/reports", async (req, res, next) => {
  try {
    const reports = await adminService.fetchEscalatedReports();
    return res.json({ reports });
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/reports/:id/dismiss", async (req, res, next) => {
  try {
    const authed = req as AuthedRequest;
    const reportId = String(req.params.id);
    const { rationale } = req.body || {};
    const updated = await adminService.dismissReport({
      adminUser: authed.user!,
      reportId,
      rationale,
    });
    return res.json({ message: "Report dismissed", report: updated });
  } catch (err) {
    next(err);
  }
});

adminRouter.delete(
  "/content/:type/:id",
  validateBody(InstantDeleteContentRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const type = String(req.params.type);
      const id = String(req.params.id);
      const { rationale } = req.body;
      if (type !== "post" && type !== "comment") {
        return res.status(400).json({ error: { code: "INVALID_TYPE", message: "Content type must be post or comment" } });
      }
      const deleted = await adminService.instantDeleteContent({
        adminUser: authed.user!,
        contentType: type as "post" | "comment",
        contentId: id,
        rationale,
      });
      return res.json({ message: "Content deleted successfully", deleted });
    } catch (err: any) {
      if (err.message === "This content is no longer available.") {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
      }
      next(err);
    }
  }
);

// Forum Category Management
adminRouter.get("/categories", async (req, res, next) => {
  try {
    const categories = await adminService.fetchCategories();
    return res.json({ categories });
  } catch (err) {
    next(err);
  }
});

adminRouter.post(
  "/categories",
  validateBody(CreateCategoryRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const created = await adminService.createCategory({
        adminUser: authed.user!,
        ...req.body,
      });
      return res.status(201).json({ category: created });
    } catch (err: any) {
      if (err?.code === "23505" || err?.cause?.code === "23505" || err?.message?.includes("unique constraint")) {
        return res.status(400).json({ error: { code: "DUPLICATE", message: "Category with this name or slug already exists" } });
      }
      next(err);
    }
  }
);

adminRouter.put(
  "/categories/:id",
  validateBody(UpdateCategoryRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const id = String(req.params.id);
      const updated = await adminService.updateCategory({
        adminUser: authed.user!,
        id,
        ...req.body,
      });
      return res.json({ category: updated });
    } catch (err) {
      next(err);
    }
  }
);

adminRouter.delete(
  "/categories/:id",
  validateBody(DeleteCategoryRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const id = String(req.params.id);
      const { targetCategoryId } = req.body;
      const deleted = await adminService.deleteCategory({
        adminUser: authed.user!,
        id,
        targetCategoryId,
      });
      return res.json({ message: "Category deleted and threads reassigned", deleted });
    } catch (err) {
      next(err);
    }
  }
);

// System Settings
adminRouter.get("/settings", async (req, res, next) => {
  try {
    const settings = await adminService.fetchSystemSettings();
    return res.json({ settings });
  } catch (err) {
    next(err);
  }
});

adminRouter.put(
  "/settings",
  validateBody(UpdateSystemSettingRequest),
  async (req, res, next) => {
    try {
      const authed = req as AuthedRequest;
      const { key, value, rationale } = req.body;
      const updated = await adminService.updateSetting({
        adminUser: authed.user!,
        key,
        value,
        rationale,
      });
      return res.json({ setting: updated });
    } catch (err) {
      next(err);
    }
  }
);
