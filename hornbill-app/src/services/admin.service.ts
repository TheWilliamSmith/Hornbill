import { apiClient } from "@/lib/api-client";
import type {
  AdminStats,
  AdminUserDetail,
  ListUsersParams,
  PaginatedAdminUsers,
  UpdateUserAdminRequest,
} from "@/types/admin.type";

function buildQuery(params: ListUsersParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== "" && v !== "all",
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

export const adminService = {
  getStats: () => apiClient.get<AdminStats>("admin/stats"),

  listUsers: (params: ListUsersParams = {}) =>
    apiClient.get<PaginatedAdminUsers>(`admin/users${buildQuery(params)}`),

  getUser: (id: string) =>
    apiClient.get<AdminUserDetail>(`admin/users/${encodeURIComponent(id)}`),

  updateUser: (id: string, data: UpdateUserAdminRequest) =>
    apiClient.patch<void>(`admin/users/${encodeURIComponent(id)}`, data),

  deactivateUser: (id: string) =>
    apiClient.patch<void>(`admin/users/${encodeURIComponent(id)}/deactivate`),

  activateUser: (id: string) =>
    apiClient.patch<void>(`admin/users/${encodeURIComponent(id)}/activate`),
};
