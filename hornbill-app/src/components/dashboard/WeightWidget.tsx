"use client";

import { useEffect, useState, useCallback } from "react";
import { Activity, TrendingDown, TrendingUp, Minus } from "lucide-react";
import Link from "next/link";
import { weightService } from "@/services/weight.service";
import type { WeightEntry, WeightGoal } from "@/types/weight.type";
import { WeightGoalDirection, WeightGoalStatus } from "@/types/weight.type";

export default function WeightWidget() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [goal, setGoal] = useState<WeightGoal | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [entriesRes, goalsRes] = await Promise.all([
        weightService.getEntries({ limit: 7 }),
        weightService.getGoals({ limit: 1 }),
      ]);
      setEntries(entriesRes.data);
      const activeGoal = goalsRes.data.find(
        (g) => g.status === WeightGoalStatus.IN_PROGRESS,
      );
      setGoal(activeGoal ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const latest = entries[0];
  const previous = entries[1];
  const diff =
    latest && previous ? latest.weight - previous.weight : null;

  const goalProgress =
    goal && latest
      ? goal.direction === WeightGoalDirection.LOSE
        ? Math.min(
            100,
            Math.max(
              0,
              ((goal.targetWeight - latest.weight) /
                (goal.targetWeight - (previous?.weight ?? latest.weight))) *
                100,
            ),
          )
        : null
      : null;

  const TrendIcon =
    diff === null ? Minus : diff < 0 ? TrendingDown : diff > 0 ? TrendingUp : Minus;
  const trendColor =
    diff === null
      ? "text-zinc-400"
      : goal?.direction === WeightGoalDirection.LOSE
        ? diff < 0
          ? "text-emerald-600"
          : diff > 0
            ? "text-red-500"
            : "text-zinc-400"
        : diff > 0
          ? "text-emerald-600"
          : diff < 0
            ? "text-red-500"
            : "text-zinc-400";

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-sm text-zinc-900">
            Poids
          </span>
        </div>
        <Link
          href="/dashboard/weight"
          className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Voir tout →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
          ))}
        </div>
      ) : !latest ? (
        <p className="text-xs text-zinc-400 text-center py-4">
          Aucune mesure enregistrée
        </p>
      ) : (
        <>
          <div className="flex items-end gap-3">
            <div>
              <p className="text-xs text-zinc-400">Dernière mesure</p>
              <p className="text-2xl font-bold text-zinc-900">
                {latest.weight}
                <span className="text-sm font-normal text-zinc-400 ml-1">
                  {latest.unit.toLowerCase()}
                </span>
              </p>
            </div>
            {diff !== null && (
              <div className={`flex items-center gap-0.5 mb-1 ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {diff > 0 ? "+" : ""}
                  {diff.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {goal && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  Objectif :{" "}
                  {goal.direction === WeightGoalDirection.LOSE
                    ? "perdre"
                    : goal.direction === WeightGoalDirection.GAIN
                      ? "prendre"
                      : "maintenir"}{" "}
                  jusqu&apos;à {goal.targetWeight} {goal.unit.toLowerCase()}
                </span>
                <span>{Math.abs(latest.weight - goal.targetWeight).toFixed(1)} restants</span>
              </div>
              <div className="w-full bg-zinc-100 rounded-full h-1.5">
                <div
                  className="bg-purple-400 h-1.5 rounded-full transition-all"
                  style={{
                    width: `${goalProgress !== null ? goalProgress : 0}%`,
                  }}
                />
              </div>
            </div>
          )}

          <p className="text-xs text-zinc-400">
            {new Date(latest.measuredAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </>
      )}
    </div>
  );
}
