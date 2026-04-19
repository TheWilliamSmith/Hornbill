export interface TaskWorkspace {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  position: number;
  totalTasks: number;
  doneTasks: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskWorkspaceFull {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  position: number;
  lists: TaskList[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskList {
  id: string;
  workspaceId: string;
  parentId?: string;
  name: string;
  position: number;
  isCollapsed: boolean;
  tasks: Task[];
  children: TaskList[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  listId: string;
  content: string;
  isDone: boolean;
  position: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Request types ────────────────────────────────────────

export interface CreateWorkspaceRequest {
  name: string;
  icon?: string;
  color?: string;
}

export interface UpdateWorkspaceRequest {
  name?: string;
  icon?: string;
  color?: string;
  position?: number;
}

export interface CreateListRequest {
  name: string;
}

export interface UpdateListRequest {
  name?: string;
  position?: number;
  isCollapsed?: boolean;
  parentId?: string | null;
}

export interface CreateTaskRequest {
  content: string;
}

export interface UpdateTaskRequest {
  content?: string;
  isDone?: boolean;
  position?: number;
  listId?: string;
}

export interface ReorderRequest {
  ids: string[];
}
