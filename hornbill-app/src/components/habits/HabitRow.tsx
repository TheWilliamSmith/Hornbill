"use client";

import { MoreHorizontal, Flame } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { HabitToday } from "@/types/habit.type";

interface Props {
  habit: HabitToday;
  onToggle: () => void;
  onViewDetail: () => void;
  onEdit: () => void;
  onArchive: () => void;
}

export default function HabitRow({
  habit,
  onToggle,
  onViewDetail,
  onEdit,
  onArchive,
}: Props) {
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
          ? "bg-black/[0.02] opacity-75"
          : "hover:bg-black/[0.02]"
      }`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-5 h-5 rounded-md border-[1.5px] transition-all cursor-pointer flex items-center justify-center ${
          habit.completedToday
            ? "bg-black/70 border-black/70"
            : "border-black/20 hover:border-black/40"
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

      {/* Name — clickable for detail */}
      <button
        onClick={onViewDetail}
        className="flex-1 text-left text-sm font-medium text-black/70 hover:text-black transition-colors cursor-pointer truncate"
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
                  i < habit.weekCompletions ? "bg-black/50" : "bg-black/10"
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
