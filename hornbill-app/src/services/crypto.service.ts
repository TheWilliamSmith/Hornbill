import { apiClient } from "@/lib/api-client";
import type {
  CryptoPosition,
  CreateCryptoPositionRequest,
  CreateSellTargetRequest,
  UpdateSellTargetRequest,
  CreateSellExecutionRequest,
  SellTarget,
  SellExecution,
  PaginatedResponse,
} from "@/types/crypto.type";

export const cryptoService = {
  // ─── Positions ──────────────────────────────────────────

  createPosition: (data: CreateCryptoPositionRequest) =>
    apiClient.post<CryptoPosition>("crypto/positions", data),

  getPositions: (params?: { page?: number; limit?: number }) =>
    apiClient.get<PaginatedResponse<CryptoPosition>>("crypto/positions", {
      searchParams: params as Record<string, string | number>,
    }),

  getPosition: (id: string) =>
    apiClient.get<CryptoPosition>(`crypto/positions/${encodeURIComponent(id)}`),

  deletePosition: (id: string) =>
    apiClient.delete(`crypto/positions/${encodeURIComponent(id)}`),

  // ─── Sell Targets ───────────────────────────────────────

  addTarget: (positionId: string, data: CreateSellTargetRequest) =>
    apiClient.post<SellTarget>(
      `crypto/positions/${encodeURIComponent(positionId)}/targets`,
      data,
    ),

  updateTarget: (targetId: string, data: UpdateSellTargetRequest) =>
    apiClient.patch<SellTarget>(
      `crypto/targets/${encodeURIComponent(targetId)}`,
      data,
    ),

  deleteTarget: (targetId: string) =>
    apiClient.delete(`crypto/targets/${encodeURIComponent(targetId)}`),

  // ─── Sell Executions ────────────────────────────────────

  createExecution: (data: CreateSellExecutionRequest) =>
    apiClient.post<SellExecution>("crypto/executions", data),

  getExecutions: (positionId: string) =>
    apiClient.get<SellExecution[]>(
      `crypto/positions/${encodeURIComponent(positionId)}/executions`,
    ),

  deleteExecution: (executionId: string) =>
    apiClient.delete(`crypto/executions/${encodeURIComponent(executionId)}`),

  // ─── Prices ─────────────────────────────────────────────

  getPrices: () =>
    apiClient.get<{
      prices: Record<string, number>;
      lastFetchTime: string | null;
    }>("crypto/prices"),

  refreshPrices: () =>
    apiClient.post<{
      prices: Record<string, number>;
      lastFetchTime: string | null;
    }>("crypto/prices/refresh"),
};
