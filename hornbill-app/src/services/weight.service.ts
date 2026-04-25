import { apiClient } from "@/lib/api-client";
import type {
  CreateWeightEntryRequest,
  CreateWeightGoalRequest,
  PaginatedResponse,
  WeightEntry,
  WeightGoal,
} from "@/types/weight.type";

export const weightService = {
  createEntry: (data: CreateWeightEntryRequest) =>
    apiClient.post<WeightEntry>("weight/entry", data),

  getEntries: (params?: { page?: number; limit?: number; from?: string; to?: string }) =>
    apiClient.get<PaginatedResponse<WeightEntry>>("weight/entries", {
      searchParams: params as Record<string, string | number>,
    }),

  updateEntry: (id: string, data: Partial<CreateWeightEntryRequest>) =>
    apiClient.patch<WeightEntry>(`weight/entry/${encodeURIComponent(id)}`, data),

  deleteEntry: (id: string) =>
    apiClient.delete(`weight/entry/${encodeURIComponent(id)}`),

  createGoal: (data: CreateWeightGoalRequest) =>
    apiClient.post<WeightGoal>("weight/goal", data),

  getGoals: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<WeightGoal>>("weight/goals", {
      searchParams: params as Record<string, string | number>,
    }),

  getGoal: (id: string) =>
    apiClient.get<WeightGoal>(`weight/goal/${encodeURIComponent(id)}`),

  updateGoal: (id: string, data: Partial<CreateWeightGoalRequest>) =>
    apiClient.patch<WeightGoal>(`weight/goal/${encodeURIComponent(id)}`, data),

  deleteGoal: (id: string) =>
    apiClient.delete(`weight/goal/${encodeURIComponent(id)}`),
};
