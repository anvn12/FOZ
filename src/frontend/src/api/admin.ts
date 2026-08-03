import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "#frontend/stores/auth";
import type {
  AssignRoleRequest,
  DeleteUserRequest,
  InstantDeleteContentRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  DeleteCategoryRequest,
  UpdateSystemSettingRequest,
} from "#shared/schemas/admin";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init?.headers as Record<string, string>) || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(path, {
    ...init,
    credentials: "include",
    headers,
  });

  if (!res.ok) {
    const env = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string; fields?: Record<string, string> } } | null;
    throw new ApiError(
      res.status,
      env?.error?.code ?? "UNKNOWN",
      env?.error?.message ?? "Request failed",
      env?.error?.fields,
    );
  }

  return res.json() as Promise<T>;
}

// 1. Control Center Metrics
export interface DailyActivityItem {
  day: string;
  date: string;
  count: number;
}

export interface AdminMetrics {
  totalUsers: number;
  activeModerators: number;
  pendingEscalations: number;
  contentRemoved24h: number;
  aiStatus: string;
  dailyActivity?: DailyActivityItem[];
}

export function fetchAdminMetrics() {
  return call<AdminMetrics>("/api/v1/admin/metrics");
}

export function useAdminMetrics() {
  return useQuery({
    queryKey: ["admin", "metrics"],
    queryFn: fetchAdminMetrics,
    refetchInterval: 10000,
  });
}

// 2. Audit Logs
export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  actionType: string;
  targetType: string;
  targetId: string;
  rationale: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function fetchAuditLogs(params: {
  actorId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params.actorId) searchParams.set("actorId", params.actorId);
  if (params.actionType) searchParams.set("actionType", params.actionType);
  if (params.startDate) searchParams.set("startDate", params.startDate);
  if (params.endDate) searchParams.set("endDate", params.endDate);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  return call<AuditLogsResponse>(`/api/v1/admin/audit-logs?${searchParams.toString()}`);
}

export function useAuditLogs(params: {
  actorId?: string;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ["admin", "audit-logs", params],
    queryFn: () => fetchAuditLogs(params),
  });
}

// 3. User Management
export interface AdminUserItem {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  displayName: string | null;
  avatarUrl: string | null;
}

export interface AdminUsersResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function fetchAdminUsers(params: { query?: string; role?: string; page?: number; limit?: number }) {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set("query", params.query);
  if (params.role) searchParams.set("role", params.role);
  if (params.page) searchParams.set("page", String(params.page));
  if (params.limit) searchParams.set("limit", String(params.limit));

  return call<AdminUsersResponse>(`/api/v1/admin/users?${searchParams.toString()}`);
}

export function useAdminUsers(params: { query?: string; role?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: () => fetchAdminUsers(params),
  });
}

export function assignUserRole(userId: string, input: AssignRoleRequest) {
  return call<{ user: AdminUserItem }>(`/api/v1/admin/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function useAssignUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: AssignRoleRequest }) =>
      assignUserRole(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function deleteUserAccount(userId: string, input: DeleteUserRequest) {
  return call<{ message: string }>(`/api/v1/admin/users/${userId}`, {
    method: "DELETE",
    body: JSON.stringify(input),
  });
}

export function useDeleteUserAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: DeleteUserRequest }) =>
      deleteUserAccount(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

// 4. Escalated Reports & Instant Delete
export interface EscalatedReport {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reasonType: string;
  details: string | null;
  status: string;
  createdAt: string;
}

export function fetchEscalatedReports() {
  return call<{ reports: EscalatedReport[] }>("/api/v1/admin/reports");
}

export function useEscalatedReports() {
  return useQuery({
    queryKey: ["admin", "reports"],
    queryFn: fetchEscalatedReports,
  });
}

export function instantDeleteContent(type: "post" | "comment", id: string, input: InstantDeleteContentRequest) {
  return call<{ message: string }>(`/api/v1/admin/content/${type}/${id}`, {
    method: "DELETE",
    body: JSON.stringify(input),
  });
}

export function useInstantDeleteContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, input }: { type: "post" | "comment"; id: string; input: InstantDeleteContentRequest }) =>
      instantDeleteContent(type, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "metrics"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

// 5. Category Management
export interface ForumCategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isArchived: boolean;
  allowNewPosts: boolean;
  createdAt: string;
}

export function fetchForumCategories() {
  return call<{ categories: ForumCategoryItem[] }>("/api/v1/admin/categories");
}

export function useForumCategories() {
  return useQuery({
    queryKey: ["admin", "categories"],
    queryFn: fetchForumCategories,
  });
}

export function createForumCategory(input: CreateCategoryRequest) {
  return call<{ category: ForumCategoryItem }>("/api/v1/admin/categories", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function useCreateForumCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createForumCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function updateForumCategory(id: string, input: UpdateCategoryRequest) {
  return call<{ category: ForumCategoryItem }>(`/api/v1/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function useUpdateForumCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryRequest }) =>
      updateForumCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

export function deleteForumCategory(id: string, input: DeleteCategoryRequest) {
  return call<{ message: string }>(`/api/v1/admin/categories/${id}`, {
    method: "DELETE",
    body: JSON.stringify(input),
  });
}

export function useDeleteForumCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: DeleteCategoryRequest }) =>
      deleteForumCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}

// 6. System Settings
export interface SystemSettingItem {
  key: string;
  value: string;
  dataType: string;
  description: string | null;
  lastUpdatedBy: string | null;
  updatedAt: string;
}

export function fetchSystemSettings() {
  return call<{ settings: SystemSettingItem[] }>("/api/v1/admin/settings");
}

export function useSystemSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: fetchSystemSettings,
  });
}

export function updateSystemSetting(input: UpdateSystemSettingRequest) {
  return call<{ setting: SystemSettingItem }>("/api/v1/admin/settings", {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSystemSetting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "audit-logs"] });
    },
  });
}
