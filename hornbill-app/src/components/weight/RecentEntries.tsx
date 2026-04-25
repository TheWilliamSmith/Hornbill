"use client";

import { useWeightEntries, useDeleteWeight } from "@/hooks/use-weight";
import { useEffect, useState } from "react";
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Loader2,
  Pencil,
  Trash2,
  Scale,
} from "lucide-react";
import type { WeightEntry } from "@/types/weight.type";
import DropdownMenu from "@/components/ui/DropdownMenu";
import Modal from "@/components/ui/Modal";
import EditWeightForm from "./EditWeightForm";

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
  const { deleteWeight, isLoading: isDeleting } = useDeleteWeight();
  const [editingEntry, setEditingEntry] = useState<WeightEntry | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<WeightEntry | null>(null);

  useEffect(() => {
    fetchEntries({ limit: 5 });
  }, [refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!deletingEntry) return;

    const success = await deleteWeight(deletingEntry.id);
    setDeletingEntry(null);

    if (success) {
      fetchEntries({ limit: 5 });
    }
  };

  const handleEditSuccess = () => {
    setEditingEntry(null);
    fetchEntries({ limit: 5 });
  };

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
    <>
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
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-black/25">
                  {formatDate(entry.measuredAt)}
                </span>
                <DropdownMenu
                  items={[
                    {
                      label: "Edit",
                      icon: <Pencil size={14} />,
                      onClick: () => setEditingEntry(entry),
                    },
                    {
                      label: "Delete",
                      icon: <Trash2 size={14} />,
                      onClick: () => setDeletingEntry(entry),
                      variant: "danger",
                    },
                  ]}
                />
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!editingEntry}
        onClose={() => setEditingEntry(null)}
        title="Edit weight entry"
        subtitle="Update your measurement"
        icon={<Scale size={18} />}
      >
        {editingEntry && (
          <EditWeightForm entry={editingEntry} onSuccess={handleEditSuccess} />
        )}
      </Modal>

      <Modal
        isOpen={!!deletingEntry}
        onClose={() => setDeletingEntry(null)}
        title="Delete entry"
        subtitle="This action cannot be undone"
        icon={<Trash2 size={18} className="text-red-500" />}
      >
        <div className="space-y-6">
          <p className="text-sm text-black/60">
            Are you sure you want to delete this weight entry?
          </p>
          {deletingEntry && (
            <div className="p-4 bg-black/[0.03] rounded-lg border border-black/[0.06]">
              <p className="text-sm font-medium text-black">
                {deletingEntry.weight}
                <span className="text-black/30 font-normal ml-1 text-xs">
                  {deletingEntry.unit.toLowerCase()}
                </span>
              </p>
              <p className="text-xs text-black/40 mt-1">
                {formatDate(deletingEntry.measuredAt)}
              </p>
              {deletingEntry.note && (
                <p className="text-xs text-black/40 mt-1">
                  {deletingEntry.note}
                </p>
              )}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setDeletingEntry(null)}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 bg-white text-black border border-black/10 text-sm font-medium rounded-xl hover:border-black/20 hover:shadow-sm active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white text-sm font-medium py-3 rounded-xl hover:bg-red-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
