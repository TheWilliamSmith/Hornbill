"use client";

import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  title,
  description,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={18} className="text-red-500" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-black">{title}</h3>
          <p className="text-sm text-black/50 mt-1">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-black/60 hover:text-black hover:bg-black/5 rounded-xl transition-all cursor-pointer"
        >
          Annuler
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-xl hover:bg-red-600 active:scale-[0.97] transition-all cursor-pointer"
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}
