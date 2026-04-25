"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/services/admin.service";
import type { AdminUserDetail, UserRole } from "@/types/admin.type";

interface EditUserModalProps {
  user: AdminUserDetail;
  currentAdminId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditUserModal({
  user,
  currentAdminId,
  onClose,
  onSuccess,
}: EditUserModalProps) {
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = user.id === currentAdminId;
  const roleChanged = role !== user.role;
  const willLoseAdmin = user.role === "ADMIN" && role === "USER";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: { email?: string; role?: UserRole } = {};
      if (email !== user.email) payload.email = email;
      if (role !== user.role) payload.role = role;
      if (Object.keys(payload).length > 0) {
        await adminService.updateUser(user.id, payload);
      }
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
        <h2 className="text-base font-semibold text-black mb-5">
          Modifier l&apos;utilisateur
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-black/60 mb-1">Rôle</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSelf}
              className="w-full border border-black/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
            {isSelf && (
              <p className="text-xs text-black/40 mt-1">
                Vous ne pouvez pas modifier votre propre rôle.
              </p>
            )}
          </div>

          {willLoseAdmin && roleChanged && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              Attention : cet utilisateur perdra l&apos;accès à l&apos;espace
              administration.
            </p>
          )}

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg text-sm border border-black/10 text-black/70 hover:bg-zinc-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-lg text-sm bg-black text-white hover:bg-black/80 disabled:opacity-50 transition-colors"
            >
              {loading ? "Enregistrement…" : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
