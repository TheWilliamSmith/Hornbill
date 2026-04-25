"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";

interface ActivateModalProps {
  userId: string;
  email: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ActivateModal({
  userId,
  email,
  onClose,
  onSuccess,
}: ActivateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await adminService.activateUser(userId);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Une erreur est survenue.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 className="text-base font-semibold text-black mb-2">
          Réactiver le compte
        </h2>
        <p className="text-sm text-black/60 mb-5">
          L&apos;utilisateur{" "}
          <span className="font-medium text-black">{email}</span> pourra à
          nouveau se connecter.
        </p>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg text-sm border border-black/10 text-black/70 hover:bg-zinc-50 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-lg text-sm bg-black text-white hover:bg-black/80 disabled:opacity-50 transition-colors"
          >
            {loading ? "Réactivation…" : "Réactiver"}
          </button>
        </div>
      </div>
    </div>
  );
}
