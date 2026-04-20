"use client";

import { useState } from "react";
import { Pencil, Bell } from "lucide-react";
import Modal from "@/components/ui/Modal";
import type {
  Habit,
  UpdateHabitRequest,
  HabitFrequency,
  NotifyType,
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

const DAYS = [
  { value: 0, label: "Lun" },
  { value: 1, label: "Mar" },
  { value: 2, label: "Mer" },
  { value: 3, label: "Jeu" },
  { value: 4, label: "Ven" },
  { value: 5, label: "Sam" },
  { value: 6, label: "Dim" },
];

const NOTIFY_OPTIONS: { value: NotifyType; label: string; icon: string }[] = [
  { value: "PUSH", label: "Push", icon: "📲" },
  { value: "EMAIL", label: "Email", icon: "📧" },
  { value: "DISCORD", label: "Discord", icon: "💬" },
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
  const [reminderEnabled, setReminderEnabled] = useState(!!habit.reminderTime);
  const [reminderTime, setReminderTime] = useState(
    habit.reminderTime || "08:00",
  );
  const [reminderDays, setReminderDays] = useState<number[]>(
    habit.reminderDays?.length ? habit.reminderDays : [0, 1, 2, 3, 4],
  );
  const [notifyTypes, setNotifyTypes] = useState<NotifyType[]>(
    habit.notifyTypes?.length ? habit.notifyTypes : ["PUSH"],
  );
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setReminderDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const toggleNotify = (type: NotifyType) => {
    setNotifyTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

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
        reminderTime: reminderEnabled ? reminderTime : null,
        reminderDays: reminderEnabled ? reminderDays : [],
        notifyTypes: reminderEnabled ? notifyTypes : [],
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

        {/* Reminder section */}
        <div className="border-t border-black/[0.06] pt-4">
          <button
            type="button"
            onClick={() => setReminderEnabled(!reminderEnabled)}
            className="flex items-center gap-2 w-full cursor-pointer group"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                reminderEnabled ? "bg-orange-50" : "bg-black/[0.03]"
              }`}
            >
              <Bell
                size={14}
                className={
                  reminderEnabled ? "text-orange-500" : "text-black/30"
                }
              />
            </div>
            <div className="flex-1 text-left">
              <span className="text-xs font-medium text-black/60">Rappels</span>
              <p className="text-[10px] text-black/30">
                {reminderEnabled
                  ? `${reminderTime} — ${reminderDays.length} jour${reminderDays.length > 1 ? "s" : ""}`
                  : "Aucun rappel configuré"}
              </p>
            </div>
            <div
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                reminderEnabled ? "bg-orange-400" : "bg-black/10"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  reminderEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </div>
          </button>

          {reminderEnabled && (
            <div className="mt-3 space-y-3 pl-10">
              {/* Time */}
              <div>
                <label className="block text-[10px] font-medium text-black/35 mb-1">
                  Heure du rappel
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="px-3 py-1.5 bg-black/[0.03] border border-black/[0.08] rounded-lg text-sm text-black outline-none focus:ring-2 focus:ring-black/10 transition-all"
                />
              </div>

              {/* Days */}
              <div>
                <label className="block text-[10px] font-medium text-black/35 mb-1.5">
                  Jours
                </label>
                <div className="flex gap-1">
                  {DAYS.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`w-8 h-8 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        reminderDays.includes(day.value)
                          ? "bg-black text-white"
                          : "bg-black/[0.04] text-black/40 hover:bg-black/[0.08]"
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notify types */}
              <div>
                <label className="block text-[10px] font-medium text-black/35 mb-1.5">
                  Type de notification
                </label>
                <div className="flex gap-2">
                  {NOTIFY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleNotify(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        notifyTypes.includes(opt.value)
                          ? "bg-black text-white"
                          : "bg-black/[0.04] text-black/40 hover:bg-black/[0.08]"
                      }`}
                    >
                      <span>{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

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
