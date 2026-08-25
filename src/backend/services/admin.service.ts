import * as adminRepo from "#backend/db/repositories/admin.js";
import { getUserById } from "#backend/db/repositories/users.js";

export async function fetchAdminMetrics() {
  return adminRepo.getAdminMetrics();
}

export async function fetchAuditLogs(query: {
  actorId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page: number;
  limit: number;
}) {
  return adminRepo.getAuditLogs(query);
}

export async function fetchUsers(query: {
  query?: string;
  role?: string;
  page: number;
  limit: number;
}) {
  return adminRepo.listUsers(query);
}

export async function assignUserRole(params: {
  adminUser: { id: string; role: string };
  targetUserId: string;
  newRole: string;
  rationale?: string;
}) {
  // Prevent sole admin self-demotion
  if (params.targetUserId === params.adminUser.id && params.newRole !== "administrator") {
    const adminCount = await adminRepo.countAdministrators();
    if (adminCount <= 1) {
      throw new Error("Cannot demote the sole Administrator on the platform");
    }
  }

  const targetUser = await getUserById(params.targetUserId);
  if (!targetUser) {
    throw new Error("This user account is no longer available.");
  }

  const adminProfile = await getUserById(params.adminUser.id);
  const updatedUser = await adminRepo.updateUserRole(params.targetUserId, params.newRole);

  const actionType = params.newRole === "moderator" ? "ROLE_ASSIGN" : "ROLE_REVOKE";
  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType,
    targetType: "USER",
    targetId: params.targetUserId,
    rationale: params.rationale || `Changed role to ${params.newRole}`,
  });

  return updatedUser;
}

export async function permanentlyRemoveUser(params: {
  adminUser: { id: string; role: string };
  targetUserId: string;
  rationale: string;
}) {
  if (params.targetUserId === params.adminUser.id) {
    const adminCount = await adminRepo.countAdministrators();
    if (adminCount <= 1) {
      throw new Error("Cannot delete the sole Administrator account on the platform");
    }
  }

  const targetUser = await getUserById(params.targetUserId);
  if (!targetUser) {
    throw new Error("This user account is no longer available.");
  }

  const adminProfile = await getUserById(params.adminUser.id);
  const result = await adminRepo.deleteUserAccountAndReattribute(params.targetUserId);

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "USER_DELETE",
    targetType: "USER",
    targetId: params.targetUserId,
    rationale: params.rationale,
  });

  return result;
}

export async function setUserStatus(params: {
  adminUser: { id: string; role: string };
  targetUserId: string;
  status: "active" | "suspended" | "banned";
  rationale: string;
}) {
  const targetUser = await getUserById(params.targetUserId);
  if (!targetUser) {
    throw new Error("Target user account not found");
  }
  if (targetUser.role === "administrator") {
    throw new Error("Cannot change the status of an Administrator account");
  }

  const adminProfile = await getUserById(params.adminUser.id);
  const updatedUser = await adminRepo.updateUserStatus(params.targetUserId, params.status);

  const actionType =
    params.status === "suspended" ? "USER_SUSPEND" : params.status === "banned" ? "USER_BAN" : "USER_REINSTATE";
  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType,
    targetType: "USER",
    targetId: params.targetUserId,
    rationale: params.rationale,
  });

  return updatedUser;
}

export async function fetchEscalatedReports() {
  return adminRepo.getEscalatedReports();
}

export async function dismissReport(params: {
  adminUser: { id: string; role: string };
  reportId: string;
  rationale?: string;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  const updated = await adminRepo.dismissReport(params.reportId);

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "REPORT_DISMISS",
    targetType: "REPORT",
    targetId: params.reportId,
    rationale: params.rationale || "Report marked safe / dismissed",
  });

  return updated;
}

export async function instantDeleteContent(params: {
  adminUser: { id: string; role: string };
  contentType: "post" | "comment";
  contentId: string;
  rationale: string;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  let deleted;
  if (params.contentType === "post") {
    deleted = await adminRepo.deletePostById(params.contentId);
  } else {
    deleted = await adminRepo.deleteCommentById(params.contentId);
  }

  if (!deleted) {
    throw new Error("This content is no longer available.");
  }

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "CONTENT_DELETE",
    targetType: params.contentType.toUpperCase(),
    targetId: params.contentId,
    rationale: params.rationale,
  });

  return deleted;
}

export async function fetchCategories() {
  return adminRepo.getForumCategories();
}

export async function createCategory(params: {
  adminUser: { id: string; role: string };
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  allowNewPosts: boolean;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  const created = await adminRepo.createForumCategory({
    name: params.name,
    slug: params.slug,
    description: params.description,
    displayOrder: params.displayOrder,
    allowNewPosts: params.allowNewPosts,
  });

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "CATEGORY_CREATE",
    targetType: "CATEGORY",
    targetId: created.id,
    rationale: `Created category ${params.name}`,
  });

  return created;
}

export async function updateCategory(params: {
  adminUser: { id: string; role: string };
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  displayOrder?: number;
  allowNewPosts?: boolean;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  const updated = await adminRepo.updateForumCategory(params.id, {
    name: params.name,
    slug: params.slug,
    description: params.description,
    displayOrder: params.displayOrder,
    allowNewPosts: params.allowNewPosts,
  });

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "CATEGORY_UPDATE",
    targetType: "CATEGORY",
    targetId: params.id,
    rationale: `Updated category properties`,
  });

  return updated;
}

export async function deleteCategory(params: {
  adminUser: { id: string; role: string };
  id: string;
  targetCategoryId: string;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  const deleted = await adminRepo.deleteCategoryAndReassignThreads(params.id, params.targetCategoryId);

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "CATEGORY_DELETE",
    targetType: "CATEGORY",
    targetId: params.id,
    rationale: `Deleted category and reassigned threads to ${params.targetCategoryId}`,
  });

  return deleted;
}

export async function fetchSystemSettings() {
  return adminRepo.getSystemSettings();
}

export async function updateSetting(params: {
  adminUser: { id: string; role: string };
  key: string;
  value: string;
  rationale?: string;
}) {
  const adminProfile = await getUserById(params.adminUser.id);
  const updated = await adminRepo.updateSystemSetting(params.key, params.value, params.adminUser.id);

  await adminRepo.createAuditLog({
    actorId: params.adminUser.id,
    actorName: adminProfile?.email ?? "Administrator",
    actorRole: params.adminUser.role,
    actionType: "SETTING_UPDATE",
    targetType: "SYSTEM_SETTING",
    targetId: params.key,
    rationale: params.rationale || `Updated setting ${params.key}`,
  });

  return updated;
}
