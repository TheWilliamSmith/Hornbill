"use client";

import { useState } from "react";
import { FolderPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";

const EMOJIS = [
  "📋",
  "🏠",
  "💼",
  "🎓",
  "💻",
  "🎯",
  "📱",
  "🛒",
  "✈️",
  "📚",
  "🎨",
  "⚡",
  "🔧",
  "🌱",
  "❤️",
  "🎮",
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, icon: string) => Promise<void>;
}

export default function CreateWorkspaceModal({
  isOpen,
  onClose,
  onCreate,
}: Props) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("📋");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreate(name.trim(), icon);
      setName("");
      setIcon("📋");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvel espace"
      subtitle="Créez un espace de travail pour organiser vos tâches"
      icon={<FolderPlus size={18} />}
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

        {/* Name input */}
        <div>
          <label className="block text-xs font-medium text-black/40 mb-1.5">
            Nom de l&apos;espace
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="ex: Maison, Epitech, Perso..."
            autoFocus
            className="w-full px-3.5 py-2.5 bg-black/[0.03] border border-black/[0.08] rounded-xl text-sm text-black placeholder:text-black/25 outline-none focus:ring-2 focus:ring-black/10 transition-all"
          />
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
            {submitting ? "Création..." : "Créer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
