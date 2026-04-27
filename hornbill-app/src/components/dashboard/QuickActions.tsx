"use client";

import { useState } from "react";
import {
  Flame,
  Scale,
  CheckSquare,
  Bitcoin,
  Plus,
  X,
  Loader2,
} from "lucide-react";
import { habitService } from "@/services/habit.service";
import { weightService } from "@/services/weight.service";
import { taskService } from "@/services/task.service";
import { WeightUnit } from "@/types/weight.type";
import type { HabitToday } from "@/types/habit.type";
import Link from "next/link";

// ─── Log Habit Quick Action ──────────────────────────────

function LogHabitAction() {
  const [open, setOpen] = useState(false);
  const [habits, setHabits] = useState<HabitToday[]>([]);
  const [loading, setLoading] = useState(false);
  const [logged, setLogged] = useState<Set<string>>(new Set());

  const openPanel = async () => {
    setOpen(true);
    setLoading(true);
    try {
      const data = await habitService.getToday();
      setHabits(data.filter((h) => !h.completedToday));
      setLogged(new Set(data.filter((h) => h.completedToday).map((h) => h.id)));
    } finally {
      setLoading(false);
    }
  };

  const log = async (id: string) => {
    await habitService.logHabit(id);
    setLogged((prev) => new Set([...prev, id]));
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <div className="relative">
      <button
        onClick={open ? () => setOpen(false) : openPanel}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-sm font-medium text-orange-700 w-full"
      >
        <Flame className="w-4 h-4" />
        Log habitude
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600">Habitudes restantes</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400 mx-auto my-3" />
          ) : habits.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-2">
              {logged.size > 0 ? "Tout est fait ! 🎉" : "Aucune habitude pour aujourd'hui"}
            </p>
          ) : (
            <div className="flex flex-col gap-1">
              {habits.map((h) => (
                <button
                  key={h.id}
                  onClick={() => log(h.id)}
                  className="flex items-center gap-2 text-sm text-zinc-700 hover:bg-zinc-50 rounded-lg px-2 py-1.5 text-left w-full transition-colors"
                >
                  {h.icon && <span>{h.icon}</span>}
                  <span className="truncate">{h.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Add Weight Quick Action ─────────────────────────────

function AddWeightAction() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    const num = parseFloat(value);
    if (isNaN(num) || num <= 0) return;
    setLoading(true);
    try {
      await weightService.createEntry({ weight: num, unit: WeightUnit.KG });
      setDone(true);
      setTimeout(() => {
        setOpen(false);
        setDone(false);
        setValue("");
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-sm font-medium text-purple-700 w-full"
      >
        <Scale className="w-4 h-4" />
        Ajouter poids
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-20 bg-white border border-zinc-200 rounded-xl shadow-lg p-3 w-52">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-600">Nouvelle mesure (kg)</span>
            <button onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          </div>
          {done ? (
            <p className="text-xs text-emerald-600 text-center py-1">✓ Enregistré !</p>
          ) : (
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                placeholder="70.5"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                className="flex-1 border border-zinc-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-purple-400"
                autoFocus
              />
              <button
                onClick={submit}
                disabled={loading || !value}
                className="bg-purple-500 hover:bg-purple-600 text-white rounded-lg px-2 py-1 text-sm disabled:opacity-50 transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Quick Actions Panel ─────────────────────────────────

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-sm text-zinc-900">Actions rapides</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <LogHabitAction />
        <AddWeightAction />
        <Link
          href="/dashboard/tasks"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700"
        >
          <CheckSquare className="w-4 h-4" />
          Créer tâche
        </Link>
        <Link
          href="/dashboard/crypto"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors text-sm font-medium text-yellow-700"
        >
          <Bitcoin className="w-4 h-4" />
          Ajouter position
        </Link>
      </div>
    </div>
  );
}
