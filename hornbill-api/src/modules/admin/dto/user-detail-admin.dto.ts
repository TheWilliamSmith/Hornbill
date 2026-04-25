export class AdminUserListItemDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
  modulesCount: number;
}

export class AdminUserDetailDto {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
  deactivatedAt: Date | null;
  deactivatedByEmail: string | null;
  stats: {
    cryptoPositions: number;
    activeHabits: number;
    taskWorkspaces: number;
    totalTasks: number;
    doneTasks: number;
    weightEntries: number;
    activeSessions: number;
    lastActivityAt: Date | null;
  };
}
