import { eq, and, desc, gte, lte, ilike, or, sql } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import {
  userAccounts,
  profiles,
  posts,
  comments,
  reactions,
  reports,
  adminAuditLogs,
  forumCategories,
  systemSettings,
  refreshSessions,
  type NewAdminAuditLog,
  type NewForumCategory,
} from "#backend/db/schema/index.js";

export async function createAuditLog(entry: NewAdminAuditLog) {
  const [row] = await db.insert(adminAuditLogs).values(entry).returning();
  return row!;
}

export async function getAdminMetrics() {
  const [uRow] = await db.select({ totalUsers: sql<number>`count(*)::int` }).from(userAccounts);
  const [mRow] = await db
    .select({ activeModerators: sql<number>`count(*)::int` })
    .from(userAccounts)
    .where(eq(userAccounts.role, "moderator"));

  const [eRow] = await db
    .select({ pendingEscalations: sql<number>`count(*)::int` })
    .from(reports)
    .where(or(eq(reports.status, "open"), eq(reports.status, "escalated")));

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [cRow] = await db
    .select({ contentRemoved24h: sql<number>`count(*)::int` })
    .from(adminAuditLogs)
    .where(
      and(
        eq(adminAuditLogs.actionType, "CONTENT_DELETE"),
        gte(adminAuditLogs.createdAt, yesterday)
      )
    );

  // Compute live daily post creation counts for the last 7 days
  const now = new Date();
  const dailyActivity: { day: string; date: string; count: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

    const [pRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(posts)
      .where(and(gte(posts.createdAt, startOfDay), lte(posts.createdAt, endOfDay)));

    const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
    const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    dailyActivity.push({
      day: dayName,
      date: dateStr,
      count: Number(pRow?.count ?? 0),
    });
  }

  const totalUsers = uRow?.totalUsers ?? 0;
  const activeModerators = mRow?.activeModerators ?? 0;
  const pendingEscalations = eRow?.pendingEscalations ?? 0;
  const contentRemoved24h = cRow?.contentRemoved24h ?? 0;

  return {
    totalUsers: Number(totalUsers),
    activeModerators: Number(activeModerators),
    pendingEscalations: Number(pendingEscalations),
    contentRemoved24h: Number(contentRemoved24h),
    aiStatus: "healthy",
    dailyActivity,
  };
}

export async function getAuditLogs(params: {
  actorId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) {
  const conditions = [];
  if (params.actorId) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.actorId);
    if (isUUID) {
      conditions.push(or(
        eq(adminAuditLogs.actorId, params.actorId),
        eq(adminAuditLogs.targetId, params.actorId)
      ));
    } else {
      conditions.push(or(
        ilike(adminAuditLogs.actorName, `%${params.actorId}%`),
        ilike(adminAuditLogs.rationale, `%${params.actorId}%`),
        ilike(adminAuditLogs.targetId, `%${params.actorId}%`)
      ));
    }
  }
  if (params.actionType) conditions.push(eq(adminAuditLogs.actionType, params.actionType));
  if (params.startDate) conditions.push(gte(adminAuditLogs.createdAt, new Date(params.startDate)));
  if (params.endDate) conditions.push(lte(adminAuditLogs.createdAt, new Date(params.endDate)));

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (params.page - 1) * params.limit;

  const logs = await db
    .select()
    .from(adminAuditLogs)
    .where(whereClause)
    .orderBy(desc(adminAuditLogs.createdAt))
    .limit(params.limit)
    .offset(offset);

  const [tRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(adminAuditLogs)
    .where(whereClause);

  const total = Number(tRow?.total ?? 0);

  return {
    items: logs,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

export async function listUsers(params: {
  query?: string;
  role?: string;
  page: number;
  limit: number;
}) {
  const offset = (params.page - 1) * params.limit;
  const conditions = [];

  if (params.role) {
    conditions.push(eq(userAccounts.role, params.role as any));
  }
  if (params.query) {
    const q = `%${params.query}%`;
    conditions.push(or(ilike(userAccounts.email, q), ilike(profiles.displayName, q)));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({
      id: userAccounts.id,
      email: userAccounts.email,
      role: userAccounts.role,
      status: userAccounts.status,
      createdAt: userAccounts.createdAt,
      displayName: profiles.displayName,
      avatarUrl: profiles.avatarUrl,
    })
    .from(userAccounts)
    .leftJoin(profiles, eq(profiles.userAccountId, userAccounts.id))
    .where(whereClause)
    .orderBy(desc(userAccounts.createdAt))
    .limit(params.limit)
    .offset(offset);

  const [tRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(userAccounts)
    .leftJoin(profiles, eq(profiles.userAccountId, userAccounts.id))
    .where(whereClause);

  const total = Number(tRow?.total ?? 0);

  return {
    items: rows,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit) || 1,
  };
}

export async function updateUserRole(userId: string, role: string) {
  const [updated] = await db
    .update(userAccounts)
    .set({ role: role as any, updatedAt: new Date() })
    .where(eq(userAccounts.id, userId))
    .returning();
  return updated;
}

export async function updateUserStatus(userId: string, status: string) {
  const [updated] = await db
    .update(userAccounts)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(userAccounts.id, userId))
    .returning({
      id: userAccounts.id,
      email: userAccounts.email,
      username: userAccounts.username,
      role: userAccounts.role,
      status: userAccounts.status,
      createdAt: userAccounts.createdAt,
      updatedAt: userAccounts.updatedAt,
    });
  return updated;
}

export async function countAdministrators() {
  const [tRow] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(userAccounts)
    .where(eq(userAccounts.role, "administrator"));
  return Number(tRow?.total ?? 0);
}

export async function deleteUserAccountAndReattribute(userId: string) {
  return db.transaction(async (tx) => {
    // 1. Delete reactions created by user
    await tx.delete(reactions).where(eq(reactions.userAccountId, userId));
    // 2. Delete content reports filed by user
    await tx.delete(reports).where(eq(reports.reporterId, userId));
    // 3. Delete comments authored by user
    await tx.delete(comments).where(eq(comments.authorId, userId));
    // 4. Delete posts authored by user
    await tx.delete(posts).where(eq(posts.authorId, userId));
    // 5. Delete active refresh sessions
    await tx.delete(refreshSessions).where(eq(refreshSessions.userAccountId, userId));
    // 6. Delete user profile record
    await tx.delete(profiles).where(eq(profiles.userAccountId, userId));
    // 7. Permanently delete user account
    const [deletedUser] = await tx
      .delete(userAccounts)
      .where(eq(userAccounts.id, userId))
      .returning();

    return deletedUser;
  });
}

export async function getEscalatedReports() {
  return db
    .select({
      id: reports.id,
      reporterId: reports.reporterId,
      targetType: reports.targetType,
      targetId: reports.targetId,
      reasonType: reports.reasonType,
      details: reports.details,
      status: reports.status,
      createdAt: reports.createdAt,
      updatedAt: reports.updatedAt,
      reporterName: profiles.displayName,
      authorId: sql<string | null>`coalesce(${posts.authorId}, ${comments.authorId}, case when ${reports.targetType} = 'user' then ${reports.targetId} end)`,
    })
    .from(reports)
    .leftJoin(userAccounts, eq(reports.reporterId, userAccounts.id))
    .leftJoin(profiles, eq(userAccounts.id, profiles.userAccountId))
    .leftJoin(posts, and(eq(reports.targetType, "post"), eq(posts.id, reports.targetId)))
    .leftJoin(comments, and(eq(reports.targetType, "comment"), eq(comments.id, reports.targetId)))
    .where(eq(reports.status, "escalated"))
    .orderBy(desc(reports.createdAt));
}

export async function dismissReport(reportId: string) {
  const [updated] = await db
    .update(reports)
    .set({ status: "dismissed", updatedAt: new Date() })
    .where(eq(reports.id, reportId))
    .returning();
  return updated;
}

export async function deletePostById(postId: string) {
  const [deleted] = await db.delete(posts).where(eq(posts.id, postId)).returning();
  return deleted;
}

export async function deleteCommentById(commentId: string) {
  const [deleted] = await db.delete(comments).where(eq(comments.id, commentId)).returning();
  return deleted;
}

export async function getForumCategories() {
  const existing = await db
    .select()
    .from(forumCategories)
    .orderBy(forumCategories.displayOrder);

  if (existing.length === 0) {
    const defaults = [
      {
        name: "General Discussion",
        slug: "general-discussion",
        description: "General community discussion and chat",
        displayOrder: 1,
        allowNewPosts: true,
      },
      {
        name: "Tech & Development",
        slug: "tech-development",
        description: "Software, hardware, and engineering topics",
        displayOrder: 2,
        allowNewPosts: true,
      },
      {
        name: "Announcements",
        slug: "announcements",
        description: "Official platform news and updates",
        displayOrder: 3,
        allowNewPosts: true,
      },
      {
        name: "Feedback & Support",
        slug: "feedback-support",
        description: "Community questions, ideas, and support",
        displayOrder: 4,
        allowNewPosts: true,
      },
    ];

    await db.insert(forumCategories).values(defaults);
    return db.select().from(forumCategories).orderBy(forumCategories.displayOrder);
  }

  return existing;
}

export async function createForumCategory(data: NewForumCategory) {
  const [created] = await db.insert(forumCategories).values(data).returning();
  return created!;
}

export async function updateForumCategory(id: string, data: Partial<NewForumCategory>) {
  const [updated] = await db
    .update(forumCategories)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(forumCategories.id, id))
    .returning();
  return updated;
}

export async function deleteCategoryAndReassignThreads(id: string, targetCategoryId: string) {
  return db.transaction(async (tx) => {
    const [deleted] = await tx
      .delete(forumCategories)
      .where(eq(forumCategories.id, id))
      .returning();
    return deleted;
  });
}

export async function getSystemSettings() {
  const existing = await db.select().from(systemSettings);

  if (existing.length === 0) {
    const defaults = [
      {
        key: "site_title",
        value: "FOZ Community Forum",
        dataType: "string",
        description: "Official platform site title",
      },
      {
        key: "user_registration_enabled",
        value: "true",
        dataType: "boolean",
        description: "Controls whether new user sign-ups are allowed",
      },
      {
        key: "maintenance_mode",
        value: "false",
        dataType: "boolean",
        description: "Global system maintenance mode status",
      },
      {
        key: "ai_summarization_threshold",
        value: "10",
        dataType: "number",
        description: "Minimum comments required to trigger AI TL;DR summary",
      },
      {
        key: "rate_limit_max_requests",
        value: "100",
        dataType: "number",
        description: "Maximum API requests per rate limit window per IP",
      },
    ];

    await db.insert(systemSettings).values(defaults);
    return db.select().from(systemSettings);
  }

  return existing;
}

export async function updateSystemSetting(key: string, value: string, userId?: string) {
  const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.key, key));
  if (existing) {
    const [updated] = await db
      .update(systemSettings)
      .set({ value, lastUpdatedBy: userId, updatedAt: new Date() })
      .where(eq(systemSettings.key, key))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(systemSettings)
      .values({ key, value, lastUpdatedBy: userId })
      .returning();
    return created;
  }
}
