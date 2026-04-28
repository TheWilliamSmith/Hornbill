import { apiClient } from "@/lib/api-client";
import type {
  Plant,
  PlantCareProfile,
  PlantCareReminder,
  PlantCareLog,
  PlantGrowthLog,
  PlantHealthLog,
  PlantWishlistItem,
  PlantStats,
  TodayCareItem,
  WeekCareItem,
  CreatePlantRequest,
  CreateCareLogRequest,
  CreateGrowthLogRequest,
  CreateWishlistItemRequest,
} from "@/types/plant.type";
import type { PaginatedResponse } from "@/types/weight.type";

export const plantService = {
  // ─── Stats ──────────────────────────────────────────────
  getStats: () => apiClient.get<PlantStats>("plants/stats"),
  getToday: () => apiClient.get<TodayCareItem>("plants/today"),
  getWeek: () => apiClient.get<WeekCareItem>("plants/week"),

  // ─── Plants ─────────────────────────────────────────────
  getPlants: (status?: "ACTIVE" | "ARCHIVED") =>
    apiClient
      .get<
        PaginatedResponse<Plant>
      >(`plants${status ? `?status=${status}` : ""}`)
      .then((res) => res.data),

  getPlant: (id: string) =>
    apiClient.get<Plant>(`plants/${encodeURIComponent(id)}`),

  createPlant: (data: CreatePlantRequest) =>
    apiClient.post<Plant>("plants", data),

  updatePlant: (id: string, data: Partial<CreatePlantRequest>) =>
    apiClient.patch<Plant>(`plants/${encodeURIComponent(id)}`, data),

  archivePlant: (id: string) =>
    apiClient.post<Plant>(`plants/${encodeURIComponent(id)}/archive`, {}),

  deletePlant: (id: string) =>
    apiClient.delete(`plants/${encodeURIComponent(id)}`),

  // ─── Care Profile ────────────────────────────────────────
  getCareProfile: (plantId: string) =>
    apiClient.get<PlantCareProfile>(
      `plants/${encodeURIComponent(plantId)}/care-profile`,
    ),

  // ─── Reminders ──────────────────────────────────────────
  getReminders: (plantId: string) =>
    apiClient.get<PlantCareReminder[]>(
      `plants/${encodeURIComponent(plantId)}/reminders`,
    ),

  // ─── Care Logs ──────────────────────────────────────────
  getCareLogs: (plantId: string, limit = 20) =>
    apiClient
      .get<
        PaginatedResponse<PlantCareLog>
      >(`plants/${encodeURIComponent(plantId)}/care-logs?limit=${limit}`)
      .then((res) => res.data),

  createCareLog: (plantId: string, data: CreateCareLogRequest) =>
    apiClient.post<PlantCareLog>(
      `plants/${encodeURIComponent(plantId)}/care-logs`,
      data,
    ),

  // ─── Growth Logs ────────────────────────────────────────
  getGrowthLogs: (plantId: string) =>
    apiClient
      .get<
        PaginatedResponse<PlantGrowthLog>
      >(`plants/${encodeURIComponent(plantId)}/growth-logs`)
      .then((res) => res.data),

  createGrowthLog: (plantId: string, data: CreateGrowthLogRequest) =>
    apiClient.post<PlantGrowthLog>(
      `plants/${encodeURIComponent(plantId)}/growth-logs`,
      data,
    ),

  // ─── Health Logs ────────────────────────────────────────
  getHealthLogs: (plantId: string) =>
    apiClient
      .get<
        PaginatedResponse<PlantHealthLog>
      >(`plants/${encodeURIComponent(plantId)}/health-logs`)
      .then((res) => res.data),

  // ─── Wishlist ────────────────────────────────────────────
  getWishlist: () =>
    apiClient
      .get<PaginatedResponse<PlantWishlistItem>>("plant-wishlist")
      .then((res) => res.data),

  createWishlistItem: (data: CreateWishlistItemRequest) =>
    apiClient.post<PlantWishlistItem>("plant-wishlist", data),

  deleteWishlistItem: (id: string) =>
    apiClient.delete(`plant-wishlist/${encodeURIComponent(id)}`),
};
