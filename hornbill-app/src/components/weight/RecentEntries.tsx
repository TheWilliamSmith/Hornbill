"use client";

import { useWeightEntries } from "@/hooks/use-weight";
import { useEffect } from "react";
import { TrendingDown, TrendingUp, Minus, Loader2 } from "lucide-react";
import type { WeightEntry } from "@/types/weight.type";

interface RecentEntriesProps {
  refreshKey?: number;
}

function getTrend(entries: WeightEntry[], index: number) {
  if (index >= entries.length - 1) return null;
  const current = entries[index].weight;
  const previous = entries[index + 1].weight;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
  if (diffHours < 48) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function RecentEntries({ refreshKey }: RecentEntriesProps) {
  const { entries, fetchEntries, isLoading } = useWeightEntries();

  useEffect(() => {
    fetchEntries({ limit: 5 });
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-black/20" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center mb-3">
          <TrendingDown size={16} className="text-black/20" />
        </div>
        <p className="text-sm text-black/30">No entries yet</p>
        <p className="text-[11px] text-black/20 mt-0.5">
          Log your first weight above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {entries.map((entry, index) => {
        const trend = getTrend(entries, index);
        return (
          <div
            key={entry.id}
            className="flex items-center justify-between py-3 px-1 group"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  trend === "down"
                    ? "bg-emerald-50"
                    : trend === "up"
                      ? "bg-orange-50"
                      : "bg-black/[0.03]"
                }`}
              >
                {trend === "down" ? (
                  <TrendingDown size={14} className="text-emerald-500" />
                ) : trend === "up" ? (
                  <TrendingUp size={14} className="text-orange-500" />
                ) : (
                  <Minus size={14} className="text-black/20" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-black">
                  {entry.weight}
                  <span className="text-black/30 font-normal ml-1 text-xs">
                    {entry.unit.toLowerCase()}
                  </span>
                </p>
                {entry.note && (
                  <p className="text-[11px] text-black/30 mt-0.5 max-w-[180px] truncate">
                    {entry.note}
                  </p>
                )}
              </div>
            </div>
            <span className="text-[11px] text-black/25">
              {formatDate(entry.measuredAt)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
