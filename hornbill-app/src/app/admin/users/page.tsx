"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { adminService } from "@/services/admin.service";
import type {
  AdminStats,
  AdminUserListItem,
  PaginatedMeta,
  ListUsersParams,
  AdminUserDetail,
} from "@/types/admin.type";
import StatCards from "@/components/admin/StatCards";
import UserTable from "@/components/admin/UserTable";
import UserDetailSidebar from "@/components/admin/UserDetailSidebar";
import EditUserModal from "@/components/admin/EditUserModal";

const DEBOUNCE_MS = 300;

export default function AdminUsersPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUserListItem[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] = useState<"" | "USER" | "ADMIN">("");
  const [page, setPage] = useState(1);

  // UI state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editUserDetail, setEditUserDetail] = useState<AdminUserDetail | null>(null);

  // Current admin id — stored from a single users/me call via a cookie read
  const [currentAdminId, setCurrentAdminId] = useState<string>("");

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch current user id on mount
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setCurrentAdminId(d.id ?? ""))
      .catch(() => {});
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch {
      /* ignore */
    }
  }, []);

  const loadUsers = useCallback(
    async (params: ListUsersParams) => {
      setLoading(true);
      try {
        const res = await adminService.listUsers(params);
        setUsers(res.data);
        setMeta(res.meta);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Debounced search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
    }, DEBOUNCE_MS);
    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [search]);

  // Reload users on filter/page change
  useEffect(() => {
    const params: ListUsersParams = { page, limit: 20 };
    if (search) params.search = search;
    if (status !== "all") params.status = status;
    if (roleFilter) params.role = roleFilter;
    loadUsers(params);
  }, [page, search, status, roleFilter, loadUsers]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  function handleRefresh() {
    const params: ListUsersParams = { page, limit: 20 };
    if (search) params.search = search;
    if (status !== "all") params.status = status;
    if (roleFilter) params.role = roleFilter;
    loadUsers(params);
    loadStats();
  }

  async function handleEdit(userId: string) {
    try {
      const detail = await adminService.getUser(userId);
      setEditUserDetail(detail);
      setEditUserId(userId);
    } catch {
      /* ignore */
    }
  }

  const totalPages = meta?.totalPages ?? 1;
  const from = meta ? (meta.page - 1) * meta.limit + 1 : 0;
  const to = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-xl font-semibold text-black">Administration</h1>
        <p className="text-sm text-black/50 mt-1">Gestion des utilisateurs</p>
      </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8">
            <StatCards stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30"
            />
            <input
              type="text"
              placeholder="Rechercher par email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as typeof status);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>

          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value as typeof roleFilter);
              setPage(1);
            }}
            className="px-3 py-2 text-sm border border-black/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10 bg-white"
          >
            <option value="">Tous les rôles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5">
          {loading ? (
            <div className="py-12 text-center text-sm text-black/40">Chargement…</div>
          ) : (
            <UserTable
              users={users}
              currentAdminId={currentAdminId}
              onViewDetail={(id) => setSelectedUserId(id)}
              onEdit={handleEdit}
              onRefresh={handleRefresh}
            />
          )}

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-black/[0.06]">
              <p className="text-xs text-black/50">
                Affichage de {from} à {to} sur {meta.total} utilisateurs
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!meta.hasPreviousPage}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum =
                    totalPages <= 5
                      ? i + 1
                      : page <= 3
                      ? i + 1
                      : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs transition-colors ${
                        pageNum === page
                          ? "bg-black text-white"
                          : "hover:bg-zinc-100 text-black/60"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={!meta.hasNextPage}
                  className="p-1.5 rounded-lg hover:bg-zinc-100 text-black/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

      {/* Detail sidebar */}
      {selectedUserId && (
        <UserDetailSidebar
          userId={selectedUserId}
          currentAdminId={currentAdminId}
          onClose={() => setSelectedUserId(null)}
          onRefresh={handleRefresh}
        />
      )}

      {/* Edit modal (opened from table action menu) */}
      {editUserId && editUserDetail && (
        <EditUserModal
          user={editUserDetail}
          currentAdminId={currentAdminId}
          onClose={() => { setEditUserId(null); setEditUserDetail(null); }}
          onSuccess={() => {
            setEditUserId(null);
            setEditUserDetail(null);
            handleRefresh();
          }}
        />
      )}
    </div>
  );
}
