"use client";

import { useEffect, useCallback, useState } from "react";
import { X } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type { AdminUserDetail } from "@/types/admin.type";
import EditUserModal from "./EditUserModal";
import DeactivateModal from "./DeactivateModal";
import ActivateModal from "./ActivateModal";
import { formatDistanceToNow } from "@/utils/date.utils";

interface UserDetailSidebarProps {
  userId: string;
  currentAdminId: string;
  onClose: () => void;
  onRefresh: () => void;
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function UserDetailSidebar({
  userId,
  currentAdminId,
  onClose,
  onRefresh,
}: UserDetailSidebarProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"edit" | "deactivate" | "activate" | null>(null);

  const isSelf = userId === currentAdminId;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUser(userId);
      setUser(data);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !modal) onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, modal]);

  function handleModalSuccess() {
    setModal(null);
    load();
    onRefresh();
  }

  return (
    <>
      <div
        className="fixed inset-0 z-30 bg-black/10"
        onClick={() => !modal && onClose()}
      />
      <aside className="fixed right-0 top-0 h-full w-full max-w-md z-40 bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/[0.06]">
          <span className="text-sm font-semibold text-black">Détail utilisateur</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-black/40 hover:text-black transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {loading || !user ? (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm text-black/40">Chargement…</span>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Banner if deactivated */}
            {!user.isActive && (
              <div className="px-6 py-3 bg-zinc-100 text-xs text-black/60">
                Compte désactivé le{" "}
                {user.deactivatedAt
                  ? new Date(user.deactivatedAt).toLocaleDateString("fr-FR")
                  : "—"}
                {user.deactivatedByEmail && ` par ${user.deactivatedByEmail}`}
              </div>
            )}

            {/* User header */}
            <div className="px-6 py-5 flex items-center gap-4 border-b border-black/[0.06]">
              <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-black">
                  {getInitials(user.firstName, user.lastName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-black truncate">{user.email}</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.role === "ADMIN"
                        ? "bg-zinc-800 text-white"
                        : "bg-zinc-100 text-black/60"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-green-500" : "bg-red-400"}`}
                  />
                  <span className="text-xs text-black/50">
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>

            {/* Informations */}
            <section className="px-6 py-5 border-b border-black/[0.06]">
              <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-3">
                Informations
              </h3>
              <dl className="space-y-2">
                <Row label="Email" value={user.email} />
                <Row label="Nom d'utilisateur" value={`@${user.username}`} />
                <Row label="Rôle" value={user.role} />
                <Row
                  label="Inscription"
                  value={formatDistanceToNow(user.createdAt)}
                />
                <Row
                  label="Dernière connexion"
                  value={user.lastLoginAt ? formatDistanceToNow(user.lastLoginAt) : "Jamais"}
                />
                <Row
                  label="Sessions actives"
                  value={String(user.stats.activeSessions)}
                />
              </dl>
            </section>

            {/* Utilisation */}
            <section className="px-6 py-5 border-b border-black/[0.06]">
              <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-3">
                Utilisation
              </h3>
              <dl className="space-y-2">
                <Row
                  label="Positions crypto"
                  value={String(user.stats.cryptoPositions)}
                />
                <Row
                  label="Habitudes actives"
                  value={String(user.stats.activeHabits)}
                />
                <Row
                  label="Espaces de tâches"
                  value={String(user.stats.taskWorkspaces)}
                />
                <Row
                  label="Tâches (faites/total)"
                  value={`${user.stats.doneTasks}/${user.stats.totalTasks}`}
                />
                <Row
                  label="Entrées poids"
                  value={String(user.stats.weightEntries)}
                />
                <Row
                  label="Dernière activité"
                  value={
                    user.stats.lastActivityAt
                      ? formatDistanceToNow(user.stats.lastActivityAt)
                      : "Aucune"
                  }
                />
              </dl>
            </section>

            {/* Actions */}
            <section className="px-6 py-5">
              <h3 className="text-xs font-semibold text-black/40 uppercase tracking-wide mb-3">
                Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setModal("edit")}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm border border-black/10 hover:bg-zinc-50 transition-colors"
                >
                  Modifier
                </button>
                {!isSelf && (
                  user.isActive ? (
                    <button
                      onClick={() => setModal("deactivate")}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm border border-black/10 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Désactiver le compte
                    </button>
                  ) : (
                    <button
                      onClick={() => setModal("activate")}
                      className="w-full text-left px-4 py-2.5 rounded-xl text-sm border border-black/10 hover:bg-zinc-50 transition-colors"
                    >
                      Réactiver le compte
                    </button>
                  )
                )}
              </div>
            </section>
          </div>
        )}
      </aside>

      {modal === "edit" && user && (
        <EditUserModal
          user={user}
          currentAdminId={currentAdminId}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modal === "deactivate" && user && (
        <DeactivateModal
          userId={user.id}
          email={user.email}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modal === "activate" && user && (
        <ActivateModal
          userId={user.id}
          email={user.email}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center gap-4">
      <dt className="text-xs text-black/50 shrink-0">{label}</dt>
      <dd className="text-xs text-black font-medium truncate text-right">{value}</dd>
    </div>
  );
}
