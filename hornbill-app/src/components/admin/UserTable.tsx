"use client";

import { useRef, useState } from "react";
import { MoreVertical } from "lucide-react";
import type { AdminUserListItem } from "@/types/admin.type";
import { formatDistanceToNow } from "@/utils/date.utils";
import DeactivateModal from "./DeactivateModal";
import ActivateModal from "./ActivateModal";

interface UserTableProps {
  users: AdminUserListItem[];
  currentAdminId: string;
  onViewDetail: (userId: string) => void;
  onEdit: (userId: string) => void;
  onRefresh: () => void;
}

interface ActionMenuProps {
  user: AdminUserListItem;
  currentAdminId: string;
  onView: () => void;
  onEdit: () => void;
  onRefresh: () => void;
}

function ActionMenu({ user, currentAdminId, onView, onEdit, onRefresh }: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"deactivate" | "activate" | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isSelf = user.id === currentAdminId;

  function handleModalSuccess() {
    setModal(null);
    setOpen(false);
    onRefresh();
  }

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
          className="p-1.5 rounded-lg hover:bg-zinc-100 text-black/40 hover:text-black transition-colors"
        >
          <MoreVertical size={14} />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />
            <div className="absolute right-0 z-20 mt-1 w-44 bg-white rounded-xl border border-black/[0.08] shadow-lg shadow-black/10 overflow-hidden">
              <button
                onClick={() => { setOpen(false); onView(); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors"
              >
                Voir détails
              </button>
              <button
                onClick={() => { setOpen(false); onEdit(); }}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors"
              >
                Modifier
              </button>
              {!isSelf && (
                user.isActive ? (
                  <button
                    onClick={() => { setModal("deactivate"); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Désactiver
                  </button>
                ) : (
                  <button
                    onClick={() => { setModal("activate"); setOpen(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-50 transition-colors"
                  >
                    Réactiver
                  </button>
                )
              )}
            </div>
          </>
        )}
      </div>

      {modal === "deactivate" && (
        <DeactivateModal
          userId={user.id}
          email={user.email}
          onClose={() => setModal(null)}
          onSuccess={handleModalSuccess}
        />
      )}
      {modal === "activate" && (
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

export default function UserTable({
  users,
  currentAdminId,
  onViewDetail,
  onEdit,
  onRefresh,
}: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-black/40">
        Aucun utilisateur trouvé.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/[0.06]">
            {["Email", "Rôle", "Statut", "Inscription", "Dernière connexion", "Activité", ""].map(
              (h) => (
                <th
                  key={h}
                  className="text-left text-xs font-medium text-black/40 pb-3 pr-4 last:pr-0 whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              onClick={() => onViewDetail(user.id)}
              className="border-b border-black/[0.04] hover:bg-zinc-50 cursor-pointer transition-colors"
            >
              <td className="py-3 pr-4">
                <div>
                  <p className="font-medium text-black truncate max-w-[200px]">{user.email}</p>
                  <p className="text-xs text-black/40">@{user.username}</p>
                </div>
              </td>
              <td className="py-3 pr-4">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                    user.role === "ADMIN"
                      ? "bg-zinc-800 text-white"
                      : "bg-zinc-100 text-black/60"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      user.isActive ? "bg-green-500" : "bg-red-400"
                    }`}
                  />
                  <span className="text-xs text-black/70">
                    {user.isActive ? "Actif" : "Inactif"}
                  </span>
                </div>
              </td>
              <td className="py-3 pr-4 text-xs text-black/60 whitespace-nowrap">
                {formatDistanceToNow(user.createdAt)}
              </td>
              <td className="py-3 pr-4 text-xs text-black/60 whitespace-nowrap">
                {user.lastLoginAt ? formatDistanceToNow(user.lastLoginAt) : "Jamais"}
              </td>
              <td className="py-3 pr-4 text-xs text-black/60">
                {user.modulesCount}
              </td>
              <td
                className="py-3"
                onClick={(e) => e.stopPropagation()}
              >
                <ActionMenu
                  user={user}
                  currentAdminId={currentAdminId}
                  onView={() => onViewDetail(user.id)}
                  onEdit={() => onEdit(user.id)}
                  onRefresh={onRefresh}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
