"use client";

import { useState, useEffect } from "react";
import { Scale, Target, Activity, Plus, TrendingUp } from "lucide-react";
import Modal from "@/components/ui/Modal";
import AddWeightForm from "@/components/weight/AddWeightForm";
import AddGoalForm from "@/components/weight/AddGoalForm";
import RecentEntries from "@/components/weight/RecentEntries";
import ActiveGoals from "@/components/weight/ActiveGoals";
import WeightChart from "@/components/weight/WeightChart";
import WeightStats from "@/components/weight/WeightStats";
import { useWeightEntries, useWeightGoals } from "@/hooks/use-weight";

export default function WeightPage() {
  const [entryRefreshKey, setEntryRefreshKey] = useState(0);
  const [goalRefreshKey, setGoalRefreshKey] = useState(0);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  const {
    entries,
    fetchEntries,
    isLoading: entriesLoading,
  } = useWeightEntries();
  const { goals, fetchGoals, isLoading: goalsLoading } = useWeightGoals();

  useEffect(() => {
    fetchEntries({ limit: 20 });
  }, [entryRefreshKey]);

  useEffect(() => {
    fetchGoals({ limit: 10 });
  }, [goalRefreshKey]);

  const handleWeightSuccess = () => {
    setShowWeightModal(false);
    setEntryRefreshKey((k) => k + 1);
  };

  const handleGoalSuccess = () => {
    setShowGoalModal(false);
    setGoalRefreshKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Activity size={17} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Weight Tracker
            </h1>
          </div>
          <p className="text-sm text-black/40 ml-[46px]">
            Track your progress, reach your goals
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-violet-500/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
          >
            <Plus size={16} />
            Log weight
          </button>
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-black border border-black/10 text-sm font-medium rounded-xl hover:border-black/20 hover:shadow-sm active:scale-[0.97] transition-all duration-200 cursor-pointer"
          >
            <Target size={15} />
            New goal
          </button>
        </div>
      </div>

      {/* Stats row */}
      <WeightStats entries={entries} goals={goals} />

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-violet-500" />
            <h2 className="text-sm font-semibold text-black tracking-tight">
              Progress
            </h2>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
            All entries
          </span>
        </div>
        <WeightChart
          entries={entries}
          goals={goals}
          isLoading={entriesLoading}
        />
      </div>

      {/* Bottom grid — entries + goals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent entries */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Scale size={15} className="text-violet-500" />
              <h2 className="text-sm font-semibold text-black tracking-tight">
                Recent Entries
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
              Latest
            </span>
          </div>
          <RecentEntries refreshKey={entryRefreshKey} />
        </div>

        {/* Active goals */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-pink-500" />
              <h2 className="text-sm font-semibold text-black tracking-tight">
                Goals
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
              Active
            </span>
          </div>
          <ActiveGoals refreshKey={goalRefreshKey} />
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        title="Log weight"
        subtitle="Record a new measurement"
        icon={<Scale size={18} />}
      >
        <AddWeightForm onSuccess={handleWeightSuccess} />
      </Modal>

      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title="New goal"
        subtitle="Set a target to work towards"
        icon={<Target size={18} />}
      >
        <AddGoalForm onSuccess={handleGoalSuccess} />
      </Modal>
    </div>
  );
}
