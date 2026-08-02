import { eq, and, desc, count, gte, lte, ilike, or } from "drizzle-orm";
import { db } from "#backend/db/client.js";
import {
  userAccounts,
  profiles,
  posts,
  comments,
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
  const [uRow] = await db.select({ totalUsers: count() }).from(userAccounts);
  const [mRow] = await db
    .select({ activeModerators: count() })
    .from(userAccounts)
    .where(eq(userAccounts.role, "moderator"));

  const [eRow] = await db
    .select({ pendingEscalations: count() })
    .from(reports)
    .where(or(eq(reports.status, "open"), eq(reports.status, "escalated")));

  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [cRow] = await db
    .select({ contentRemoved24h: count() })
    .from(adminAuditLogs)
    .where(
      and(
        eq(adminAuditLogs.actionType, "CONTENT_DELETE"),
        gte(adminAuditLogs.createdAt, yesterday)
      )
    );

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
  if (params.actorId) conditions.push(eq(adminAuditLogs.actorId, params.actorId));
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
    .select({ total: count() })
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
    .select({ total: count() })
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

export async function countAdministrators() {
  const [tRow] = await db
    .select({ total: count() })
    .from(userAccounts)
    .where(eq(userAccounts.role, "administrator"));
  return Number(tRow?.total ?? 0);
}

export async function deleteUserAccountAndReattribute(userId: string) {
  return db.transaction(async (tx) => {
    await tx.delete(refreshSessions).where(eq(refreshSessions.userAccountId, userId));
    await tx.delete(profiles).where(eq(profiles.userAccountId, userId));
    const [deletedUser] = await tx
      .delete(userAccounts)
      .where(eq(userAccounts.id, userId))
      .returning();

    return deletedUser;
  });
}

export async function getEscalatedReports() {
  return db
    .select()
    .from(reports)
    .orderBy(desc(reports.createdAt));
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
  return db
    .select()
    .from(forumCategories)
    .orderBy(forumCategories.displayOrder);
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
  return db.select().from(systemSettings);
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
