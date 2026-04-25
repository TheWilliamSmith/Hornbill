"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Flame, Plus } from "lucide-react";
import type { HabitToday, Habit } from "@/types/habit.type";

interface Props {
  habits: HabitToday[];
  onToggle: (habitId: string, completed: boolean) => void;
  onViewDetail: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onArchive: (id: string) => void;
  onAdd: () => void;
}

export default function TodayChecklist({
  habits,
  onToggle,
  onViewDetail,
  onEdit,
  onArchive,
  onAdd,
}: Props) {
  if (habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-black/30">
        <Flame size={28} className="mb-2 opacity-30" />
        <p className="text-sm mb-3">Aucune habitude pour le moment</p>
        <button
          onClick={onAdd}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-orange-500/25 active:scale-[0.97] transition-all cursor-pointer"
        >
          <Plus size={14} />
          Créer une habitude
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {habits.map((habit) => (
        <ChecklistRow
          key={habit.id}
          habit={habit}
          onToggle={() => onToggle(habit.id, habit.completedToday)}
          onViewDetail={() => onViewDetail(habit.id)}
          onEdit={() => onEdit(habit)}
          onArchive={() => onArchive(habit.id)}
        />
      ))}
      <button
        onClick={onAdd}
        className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs text-black/25 hover:text-black/40 border border-dashed border-black/[0.08] rounded-xl hover:border-black/15 hover:bg-black/[0.01] transition-all cursor-pointer"
      >
        <Plus size={12} />
        Ajouter
      </button>
    </div>
  );
}

function ChecklistRow({
  habit,
  onToggle,
  onViewDetail,
  onEdit,
  onArchive,
}: {
  habit: HabitToday;
  onToggle: () => void;
  onViewDetail: () => void;
  onEdit: () => void;
  onArchive: () => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const streakLabel =
    habit.frequency === "DAILY"
      ? habit.currentStreak > 0
        ? `${habit.currentStreak}j`
        : ""
      : habit.currentStreak > 0
        ? `${habit.currentStreak}s`
        : "";

  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
        habit.completedToday
          ? "bg-black/[0.02] opacity-70"
          : "hover:bg-black/[0.02]"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 rounded-md border-[1.5px] transition-all cursor-pointer flex items-center justify-center ${
          habit.completedToday
            ? "bg-orange-400 border-orange-400"
            : "border-black/20 hover:border-orange-300"
        }`}
      >
        {habit.completedToday && (
          <svg
            width="10"
            height="8"
            viewBox="0 0 10 8"
            fill="none"
            className="text-white"
          >
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Icon */}
      <span className="text-base flex-shrink-0">{habit.icon || "📌"}</span>

      {/* Name */}
      <button
        onClick={onViewDetail}
        className={`flex-1 text-left text-sm font-medium transition-colors cursor-pointer truncate ${
          habit.completedToday
            ? "text-black/40 line-through"
            : "text-black/70 hover:text-black"
        }`}
      >
        {habit.name}
      </button>

      {/* Weekly progress for WEEKLY habits */}
      {habit.frequency === "WEEKLY" && habit.targetPerWeek && (
        <div className="flex items-center gap-1 mr-1">
          <div className="flex gap-0.5">
            {Array.from({ length: habit.targetPerWeek }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i < habit.weekCompletions ? "bg-orange-400" : "bg-black/10"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-black/25">
            {habit.weekCompletions}/{habit.targetPerWeek}
          </span>
        </div>
      )}

      {/* Streak */}
      {streakLabel && (
        <div className="flex items-center gap-0.5 text-[11px] text-black/30 mr-1">
          <Flame size={10} className="text-orange-400" />
          {streakLabel}
        </div>
      )}

      {/* Menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-6 h-6 flex items-center justify-center rounded text-black/15 opacity-0 group-hover:opacity-100 hover:text-black/40 hover:bg-black/[0.04] transition-all cursor-pointer"
        >
          <MoreHorizontal size={14} />
        </button>

        {showMenu && (
          <div className="absolute top-full right-0 mt-1 w-36 bg-white rounded-xl border border-black/[0.08] shadow-lg shadow-black/5 z-50 py-1">
            <button
              onClick={() => {
                onViewDetail();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-black/70 hover:bg-black/[0.04] cursor-pointer"
            >
              Voir détails
            </button>
            <button
              onClick={() => {
                onEdit();
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-black/70 hover:bg-black/[0.04] cursor-pointer"
            >
              Modifier
            </button>
            <div className="border-t border-black/[0.06] my-1" />
            <button
              onClick={() => {
                if (confirm(`Archiver "${habit.name}" ?`)) {
                  onArchive();
                }
                setShowMenu(false);
              }}
              className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
            >
              Archiver
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
