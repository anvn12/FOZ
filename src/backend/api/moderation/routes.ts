import { Router } from "express";
import { requireAuth, requireRole, validateBody, type AuthedRequest } from "#backend/api/auth/middleware.js";
import { db } from "#backend/db/client.js";
import { reports, userAccounts, profiles } from "#backend/db/schema/index.js";
import { getReportsQuerySchema, updateReportStatusSchema } from "#shared/schemas/interactions.js";
import { eq, desc, and, count, not, gte } from "drizzle-orm";

export const moderationRouter = Router();

// Apply auth and role requirements to all moderation routes
moderationRouter.use(requireAuth, requireRole(["moderator", "administrator"]));

// Get moderation dashboard metrics
moderationRouter.get("/metrics", async (req, res, next) => {
  try {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const [totalReportsResult, pendingReportsResult, resolvedTodayResult] = await Promise.all([
      db.select({ count: count() }).from(reports),
      db.select({ count: count() }).from(reports).where(eq(reports.status, "open")),
      db.select({ count: count() }).from(reports).where(and(not(eq(reports.status, "open")), gte(reports.updatedAt, twentyFourHoursAgo))),
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
    
    let query = db.select({
      id: reports.id,
      reporterId: reports.reporterId,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reasonType: reports.reasonType,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      reporter: {
        id: userAccounts.id,
        displayName: profiles.displayName,
      }
    })
    .from(reports)
    .leftJoin(userAccounts, eq(reports.reporterId, userAccounts.id))
    .leftJoin(profiles, eq(userAccounts.id, profiles.userAccountId))
    .orderBy(desc(reports.updatedAt))
    .limit(limit || 50)
    .offset(offset);

    if (status) {
      query.where(eq(reports.status, status));
    }

    const reportList = await query;
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
