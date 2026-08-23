import { z } from "zod";
import { accountStatuses } from "../schema-enums.js";

export const UserRoleEnum = z.enum(["guest", "standard", "moderator", "administrator"]);
export type UserRoleEnum = z.infer<typeof UserRoleEnum>;

export const AccountStatusEnum = z.enum(accountStatuses);
export type AccountStatusEnum = z.infer<typeof AccountStatusEnum>;

export const AuditActionTypeEnum = z.enum([
  "ROLE_ASSIGN",
  "ROLE_REVOKE",
  "USER_DELETE",
  "USER_SUSPEND",
  "USER_BAN",
  "USER_REINSTATE",
  "CONTENT_DELETE",
  "REPORT_FORWARD",
  "REPORT_DISMISS",
  "CATEGORY_CREATE",
  "CATEGORY_UPDATE",
  "CATEGORY_DELETE",
  "SETTING_UPDATE",
]);
export type AuditActionTypeEnum = z.infer<typeof AuditActionTypeEnum>;

export const AuditTargetTypeEnum = z.enum([
  "USER",
  "POST",
  "COMMENT",
  "CATEGORY",
  "SYSTEM_SETTING",
]);
export type AuditTargetTypeEnum = z.infer<typeof AuditTargetTypeEnum>;

export const AssignRoleRequest = z.object({
  role: z.enum(["standard", "moderator"]),
  rationale: z.string().min(3).max(500).optional(),
});
export type AssignRoleRequest = z.infer<typeof AssignRoleRequest>;

export const DeleteUserRequest = z.object({
  rationale: z.string().min(5, "Rationale must be at least 5 characters").max(1000),
});
export type DeleteUserRequest = z.infer<typeof DeleteUserRequest>;

export const SetUserStatusRequest = z.object({
  status: z.enum(["active", "suspended", "banned"]),
  rationale: z.string().min(5, "Rationale must be at least 5 characters").max(1000),
});
export type SetUserStatusRequest = z.infer<typeof SetUserStatusRequest>;

export const InstantDeleteContentRequest = z.object({
  rationale: z.string().min(3, "Rationale is required").max(1000),
});
export type InstantDeleteContentRequest = z.infer<typeof InstantDeleteContentRequest>;

export const CreateCategoryRequest = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional(),
  displayOrder: z.number().int().min(0).default(0),
  allowNewPosts: z.boolean().default(true),
});
export type CreateCategoryRequest = z.infer<typeof CreateCategoryRequest>;

export const UpdateCategoryRequest = CreateCategoryRequest.partial();
export type UpdateCategoryRequest = z.infer<typeof UpdateCategoryRequest>;

export const DeleteCategoryRequest = z.object({
  targetCategoryId: z.string().uuid("Target category ID must be a valid UUID"),
});
export type DeleteCategoryRequest = z.infer<typeof DeleteCategoryRequest>;

export const UpdateSystemSettingRequest = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.string(),
  rationale: z.string().optional(),
});
export type UpdateSystemSettingRequest = z.infer<typeof UpdateSystemSettingRequest>;

export const AuditLogQuery = z.object({
  actorId: z.string().uuid().optional(),
  actionType: AuditActionTypeEnum.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type AuditLogQuery = z.infer<typeof AuditLogQuery>;
