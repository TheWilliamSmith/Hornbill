"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type {
  Habit,
  UpdateHabitRequest,
  HabitFrequency,
} from "@/types/habit.type";

const EMOJIS = [
  "🏃",
  "💧",
  "📖",
  "💻",
  "🧘",
  "🏋️",
  "🎸",
  "✍️",
  "🌅",
  "💤",
  "🥗",
  "🧹",
  "📝",
  "🎯",
  "❤️",
  "🌱",
];

interface Props {
  habit: Habit;
  onClose: () => void;
  onSave: (data: UpdateHabitRequest) => Promise<void>;
}

export default function EditHabitModal({ habit, onClose, onSave }: Props) {
  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description || "");
  const [icon, setIcon] = useState(habit.icon || "🎯");
  const [frequency, setFrequency] = useState<HabitFrequency>(habit.frequency);
  const [targetPerWeek, setTargetPerWeek] = useState(habit.targetPerWeek || 5);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        icon,
        frequency,
        targetPerWeek: frequency === "WEEKLY" ? targetPerWeek : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Modifier l'habitude"
      icon={<Pencil size={18} />}
    >
      <div className="space-y-4">
        {/* Icon picker */}
        <div>
          <label className="block text-xs font-medium text-black/40 mb-2">
            Icône
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setIcon(emoji)}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all cursor-pointer ${
                  icon === emoji
                    ? "bg-black/[0.08] ring-2 ring-black/20"
                    : "hover:bg-black/[0.04]"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-medium text-black/40 mb-1.5">
            Nom
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            autoFocus
            className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-sm text-black placeholder:text-black/25 outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-black/40 mb-1.5">
            Description <span className="text-black/20">(optionnel)</span>
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Précisez le contexte..."
            className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-sm text-black placeholder:text-black/25 outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-medium text-black/40 mb-2">
            Fréquence
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFrequency("DAILY")}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                frequency === "DAILY"
                  ? "bg-black text-white"
                  : "bg-black/[0.04] text-black/50 hover:bg-black/[0.08]"
              }`}
            >
              Quotidienne
            </button>
            <button
              onClick={() => setFrequency("WEEKLY")}
              className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all cursor-pointer ${
                frequency === "WEEKLY"
                  ? "bg-black text-white"
                  : "bg-black/[0.04] text-black/50 hover:bg-black/[0.08]"
              }`}
            >
              Hebdomadaire
            </button>
          </div>
        </div>

        {frequency === "WEEKLY" && (
          <div>
            <label className="block text-xs font-medium text-black/40 mb-1.5">
              Objectif par semaine
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={1}
                max={7}
                value={targetPerWeek}
                onChange={(e) => setTargetPerWeek(Number(e.target.value))}
                className="flex-1 accent-black"
              />
              <span className="text-sm font-medium text-black/60 w-14 text-right">
                {targetPerWeek}x / sem.
              </span>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-black/40 hover:text-black/60 transition-colors cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || submitting}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {submitting ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
