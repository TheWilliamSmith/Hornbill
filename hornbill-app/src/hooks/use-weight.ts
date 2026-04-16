"use client";

import { useState } from "react";
import { weightService } from "@/services/weight.service";
import type {
  CreateWeightEntryRequest,
  CreateWeightGoalRequest,
  WeightEntry,
  WeightGoal,
  PaginatedResponse,
} from "@/types/weight.type";

export function useAddWeight() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addWeight = async (
    data: CreateWeightEntryRequest,
  ): Promise<WeightEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await weightService.createEntry(data);
      return result;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to add weight entry");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { addWeight, isLoading, error };
}

export function useUpdateWeight() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateWeight = async (
    id: string,
    data: Partial<CreateWeightEntryRequest>,
  ): Promise<WeightEntry | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await weightService.updateEntry(id, data);
      return result;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to update weight entry");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateWeight, isLoading, error };
}

export function useDeleteWeight() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteWeight = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await weightService.deleteEntry(id);
      return true;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to delete weight entry");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteWeight, isLoading, error };
}

export function useAddGoal() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addGoal = async (
    data: CreateWeightGoalRequest,
  ): Promise<WeightGoal | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await weightService.createGoal(data);
      return result;
    } catch (err: unknown) {
      const body = await (
        err as { response?: { json?: () => Promise<{ message?: string }> } }
      )?.response?.json?.();
      setError(body?.message || "Failed to create goal");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { addGoal, isLoading, error };
}

export function useWeightEntries() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [meta, setMeta] = useState<
    PaginatedResponse<WeightEntry>["meta"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async (params?: { page?: number; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await weightService.getEntries(params);
      setEntries(result.data);
      setMeta(result.meta);
    } catch {
      setError("Failed to load weight entries");
    } finally {
      setIsLoading(false);
    }
  };

  return { entries, meta, fetchEntries, isLoading, error };
}

export function useWeightGoals() {
  const [goals, setGoals] = useState<WeightGoal[]>([]);
  const [meta, setMeta] = useState<
    PaginatedResponse<WeightGoal>["meta"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = async (params?: { page?: number; limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await weightService.getGoals(params);
      setGoals(result.data);
      setMeta(result.meta);
    } catch {
      setError("Failed to load weight goals");
    } finally {
      setIsLoading(false);
    }
  };

  return { goals, meta, fetchGoals, isLoading, error };
}
