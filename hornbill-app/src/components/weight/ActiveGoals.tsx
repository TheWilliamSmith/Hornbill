"use client";

import { useWeightGoals } from "@/hooks/use-weight";
import { useEffect } from "react";
import {
  Target,
  Loader2,
  ArrowUp,
  ArrowDown,
  Equal,
  Clock,
  Crosshair,
} from "lucide-react";
import {
  WeightGoalDirection,
  WeightGoalMode,
  WeightGoalStatus,
} from "@/types/weight.type";

interface ActiveGoalsProps {
  refreshKey?: number;
}

const statusConfig = {
  [WeightGoalStatus.IN_PROGRESS]: { label: "Active", color: "bg-blue-500" },
  [WeightGoalStatus.SUCCESS]: { label: "Achieved", color: "bg-emerald-500" },
  [WeightGoalStatus.FAILED]: { label: "Failed", color: "bg-red-400" },
};

const directionIcon = {
  [WeightGoalDirection.LOSE]: (
    <ArrowDown size={12} className="text-emerald-500" />
  ),
  [WeightGoalDirection.GAIN]: <ArrowUp size={12} className="text-orange-500" />,
  [WeightGoalDirection.MAINTAIN]: <Equal size={12} className="text-blue-500" />,
};

export default function ActiveGoals({ refreshKey }: ActiveGoalsProps) {
  const { goals, fetchGoals, isLoading } = useWeightGoals();

  useEffect(() => {
    fetchGoals({ limit: 5 });
  }, [refreshKey]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 size={18} className="animate-spin text-black/20" />
      </div>
    );
  }

  if (goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="w-10 h-10 rounded-full bg-black/[0.03] flex items-center justify-center mb-3">
          <Target size={16} className="text-black/20" />
        </div>
        <p className="text-sm text-black/30">No goals yet</p>
        <p className="text-[11px] text-black/20 mt-0.5">
          Set a goal to track your progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {goals.map((goal) => {
        const status = statusConfig[goal.status];
        return (
          <div
            key={goal.id}
            className="flex items-center justify-between p-3 rounded-xl border border-black/[0.06] hover:border-black/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black/[0.03] flex items-center justify-center">
                {directionIcon[goal.direction]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-black">
                    {goal.targetWeight}
                    <span className="text-black/30 font-normal ml-1 text-xs">
                      {goal.unit.toLowerCase()}
                    </span>
                  </p>
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${status.color}`}
                  />
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {goal.mode === WeightGoalMode.DEADLINE ? (
                    <span className="flex items-center gap-1 text-[11px] text-black/30">
                      <Clock size={10} />
                      {goal.deadline
                        ? new Date(goal.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "No deadline"}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] text-black/30">
                      <Crosshair size={10} />
                      Milestone
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
              {goal.direction.toLowerCase()}
            </span>
          </div>
        );
      })}
    </div>
  );
}
