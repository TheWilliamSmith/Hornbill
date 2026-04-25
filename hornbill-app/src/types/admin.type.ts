export type UserRole = "USER" | "ADMIN";

export interface AdminUserListItem {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
  modulesCount: number;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  deactivatedAt: string | null;
  deactivatedByEmail: string | null;
  stats: {
    cryptoPositions: number;
    activeHabits: number;
    taskWorkspaces: number;
    totalTasks: number;
    doneTasks: number;
    weightEntries: number;
    activeSessions: number;
    lastActivityAt: string | null;
  };
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedAdminUsers {
  data: AdminUserListItem[];
  meta: PaginatedMeta;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newUsersLast7d: number;
  newUsersLast30d: number;
  usersWithActivityLast7d: number;
}

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "createdAt" | "lastLogin" | "email";
  sortOrder?: "asc" | "desc";
  status?: "active" | "inactive" | "all";
  role?: string;
}

export interface UpdateUserAdminRequest {
  email?: string;
  role?: UserRole;
}
