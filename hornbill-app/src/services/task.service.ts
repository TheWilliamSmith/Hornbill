import { apiClient } from "@/lib/api-client";
import type {
  TaskWorkspace,
  TaskWorkspaceFull,
  TaskList,
  Task,
  CreateWorkspaceRequest,
  UpdateWorkspaceRequest,
  CreateListRequest,
  UpdateListRequest,
  CreateTaskRequest,
  UpdateTaskRequest,
  ReorderRequest,
} from "@/types/task.type";

export const taskService = {
  // ─── Workspaces ─────────────────────────────────────────

  getWorkspaces: () => apiClient.get<TaskWorkspace[]>("tasks/workspaces"),

  getWorkspace: (id: string) =>
    apiClient.get<TaskWorkspaceFull>(
      `tasks/workspaces/${encodeURIComponent(id)}`,
    ),

  createWorkspace: (data: CreateWorkspaceRequest) =>
    apiClient.post<TaskWorkspace>("tasks/workspaces", data),

  updateWorkspace: (id: string, data: UpdateWorkspaceRequest) =>
    apiClient.patch<TaskWorkspace>(
      `tasks/workspaces/${encodeURIComponent(id)}`,
      data,
    ),

  deleteWorkspace: (id: string) =>
    apiClient.delete(`tasks/workspaces/${encodeURIComponent(id)}`),

  // ─── Lists ──────────────────────────────────────────────

  createList: (workspaceId: string, data: CreateListRequest) =>
    apiClient.post<TaskList>(
      `tasks/workspaces/${encodeURIComponent(workspaceId)}/lists`,
      data,
    ),

  createSublist: (listId: string, data: CreateListRequest) =>
    apiClient.post<TaskList>(
      `tasks/lists/${encodeURIComponent(listId)}/sublists`,
      data,
    ),

  updateList: (id: string, data: UpdateListRequest) =>
    apiClient.patch<TaskList>(`tasks/lists/${encodeURIComponent(id)}`, data),

  deleteList: (id: string) =>
    apiClient.delete(`tasks/lists/${encodeURIComponent(id)}`),

  // ─── Tasks ──────────────────────────────────────────────

  createTask: (listId: string, data: CreateTaskRequest) =>
    apiClient.post<Task>(
      `tasks/lists/${encodeURIComponent(listId)}/tasks`,
      data,
    ),

  updateTask: (id: string, data: UpdateTaskRequest) =>
    apiClient.patch<Task>(`tasks/tasks/${encodeURIComponent(id)}`, data),

  toggleTask: (id: string) =>
    apiClient.patch<Task>(`tasks/tasks/${encodeURIComponent(id)}/toggle`),

  deleteTask: (id: string) =>
    apiClient.delete(`tasks/tasks/${encodeURIComponent(id)}`),

  reorderTasks: (listId: string, data: ReorderRequest) =>
    apiClient.patch(`tasks/lists/${encodeURIComponent(listId)}/reorder`, data),

  clearDoneTasks: (listId: string) =>
    apiClient.delete(`tasks/lists/${encodeURIComponent(listId)}/clear-done`),
};
