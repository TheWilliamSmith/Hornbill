"use client";

import { useState } from "react";
import { cryptoService } from "@/services/crypto.service";
import type {
  CryptoPosition,
  CreateCryptoPositionRequest,
  CreateSellTargetRequest,
  UpdateSellTargetRequest,
  SellTarget,
  PaginatedResponse,
} from "@/types/crypto.type";

// ─── Positions ──────────────────────────────────────────

export function useCryptoPositions() {
  const [positions, setPositions] = useState<CryptoPosition[]>([]);
  const [meta, setMeta] = useState<
    PaginatedResponse<CryptoPosition>["meta"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = async (params?: { page?: number; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await cryptoService.getPositions(params);
      setPositions(result.data);
      setMeta(result.meta);
    } catch {
      setError("Failed to load positions");
    } finally {
      setIsLoading(false);
    }
  };

  return { positions, meta, fetchPositions, isLoading, error };
}

export function useCreatePosition() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPosition = async (
    data: CreateCryptoPositionRequest,
  ): Promise<CryptoPosition | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cryptoService.createPosition(data);
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to create position");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { createPosition, isLoading, error };
}

export function useDeletePosition() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePosition = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await cryptoService.deletePosition(id);
      return true;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to delete position");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deletePosition, isLoading, error };
}

// ─── Sell Targets ───────────────────────────────────────

export function useAddTarget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTarget = async (
    positionId: string,
    data: CreateSellTargetRequest,
  ): Promise<SellTarget | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cryptoService.addTarget(positionId, data);
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to add target");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { addTarget, isLoading, error };
}

export function useUpdateTarget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTarget = async (
    targetId: string,
    data: UpdateSellTargetRequest,
  ): Promise<SellTarget | null> => {
    setIsLoading(true);
    setError(null);
    try {
      return await cryptoService.updateTarget(targetId, data);
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to update target");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateTarget, isLoading, error };
}

export function useDeleteTarget() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTarget = async (targetId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await cryptoService.deleteTarget(targetId);
      return true;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to delete target");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteTarget, isLoading, error };
}

// ─── Prices ─────────────────────────────────────────────

export function usePrices() {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async (forceRefresh = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = forceRefresh
        ? await cryptoService.refreshPrices()
        : await cryptoService.getPrices();
      setPrices(result.prices);
      setLastFetchTime(result.lastFetchTime);
    } catch {
      setError("Failed to load prices");
    } finally {
      setIsLoading(false);
    }
  };

  return { prices, lastFetchTime, fetchPrices, isLoading, error };
}
