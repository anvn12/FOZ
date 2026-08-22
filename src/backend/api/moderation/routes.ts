import { Router } from "express";
import { requireAuth, requireRole, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { db } from "#backend/db/client.js";
import { reports, userAccounts, profiles, comments } from "#backend/db/schema/index.js";
import { getReportsQuerySchema, updateReportStatusSchema, resolveReportSchema } from "#shared/schemas/interactions.js";
import { eq, and, desc, ilike, or, not, gte, sql } from "drizzle-orm";
import { deletePost } from "#backend/services/interactions/posts.js";
import { deleteComment } from "#backend/services/interactions/comments.js";

export const moderationRouter = Router();

// Apply auth and role requirements to all moderation routes
moderationRouter.use(requireAuth, requireRole(["moderator", "administrator"]));

// Get moderation dashboard metrics
moderationRouter.get("/metrics", async (req, res, next) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [totalReportsResult, pendingReportsResult, resolvedTodayResult] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(reports),
      db.select({ count: sql<number>`count(*)::int` }).from(reports).where(eq(reports.status, "open")),
      db.select({ count: sql<number>`count(*)::int` }).from(reports).where(and(not(eq(reports.status, "open")), gte(reports.updatedAt, twentyFourHoursAgo))),
    ]);

    const pendingReview = pendingReportsResult[0]?.count ?? 0;

    res.json({
      totalReports: totalReportsResult[0]?.count ?? 0,
      pendingReview,
      resolvedToday: resolvedTodayResult[0]?.count ?? 0,
      queueCapacity: Math.min(Math.round((pendingReview / 50) * 100), 100),
    });
  } catch (err) {
    next(err);
  }
});

// Get reports queue
moderationRouter.get("/reports", async (req, res, next) => {
  try {
    const result = getReportsQuerySchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: "BAD_REQUEST", message: "Invalid query parameters" } });
    }

    const { status, limit, offset } = result.data;
    
    const reportList = await db.select({
      id: reports.id,
      reporterId: reports.reporterId,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reasonType: reports.reasonType,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      contextPostId: comments.postId,
      reporter: {
        id: userAccounts.id,
        displayName: profiles.displayName,
      }
    })
    .from(reports)
    .leftJoin(userAccounts, eq(reports.reporterId, userAccounts.id))
    .leftJoin(profiles, eq(userAccounts.id, profiles.userAccountId))
    .leftJoin(comments, and(eq(reports.targetType, 'comment'), eq(reports.targetId, comments.id)))
    .where(status ? eq(reports.status, status) : undefined)
    .orderBy(desc(reports.updatedAt))
    .limit(limit || 50)
    .offset(offset);

    res.json({ reports: reportList });
  } catch (err) {
    next(err);
  }
});

// Update report status
moderationRouter.patch("/reports/:reportId/status", validateBody(updateReportStatusSchema), async (req: AuthedRequest, res, next) => {
  try {
    const reportId = req.params.reportId as string;
    const { status, notes } = req.body;

    const [updatedReport] = await db.update(reports)
      .set({ 
        status, 
        updatedAt: new Date(),
        // Note: in a full implementation with moderation_reviews table, we'd insert a review record here
        // with the moderator's notes and the user.id
      })
      .where(eq(reports.id, reportId))
      .returning();

    if (!updatedReport) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Report not found" } });
    }

    res.json(updatedReport);
  } catch (err) {
    next(err);
  }
});

// Resolve a report with an action
moderationRouter.post("/reports/:reportId/action", validateBody(resolveReportSchema), async (req: AuthedRequest, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
    }
    const reportId = req.params.reportId as string;
    const { action, notes } = req.body;

    const targetReport = await db.query.reports.findFirst({
      where: eq(reports.id, reportId)
    });

    if (!targetReport) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Report not found" } });
    }

    if (targetReport.status === "escalated" && action === "escalate") {
      return res.status(409).json({ error: { code: "CONFLICT", message: "This report has already been escalated." } });
    }
    if (targetReport.status === "closed" || targetReport.status === "dismissed") {
      return res.status(409).json({ error: { code: "CONFLICT", message: "This report has already been resolved." } });
    }

    let newStatus = targetReport.status;

    if (action === "delete_content") {
      if (targetReport.targetType === "post") {
        await deletePost(targetReport.targetId, req.user.id, true);
      } else if (targetReport.targetType === "comment") {
        await deleteComment(targetReport.targetId, req.user.id, true);
      }
      newStatus = "closed";
    } else if (action === "dismiss") {
      newStatus = "dismissed";
    } else if (action === "escalate") {
      newStatus = "escalated";
    }

    const [updatedReport] = await db.update(reports)
      .set({ 
        status: newStatus as any, 
        updatedAt: new Date(),
      })
      .where(and(eq(reports.id, reportId), eq(reports.status, targetReport.status)))
      .returning();

    if (!updatedReport) {
      return res.status(409).json({ error: { code: "CONFLICT", message: "Report status was modified by another user." } });
    }

    res.json(updatedReport);
  } catch (err) {
    next(err);
  }
});
