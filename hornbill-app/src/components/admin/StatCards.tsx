"use client";

import type { AdminStats } from "@/types/admin.type";

interface StatCardsProps {
  stats: AdminStats;
}

interface StatCardProps {
  label: string;
  value: number;
}

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-zinc-100 rounded-xl px-5 py-4">
      <p className="text-xs text-black/50 uppercase tracking-wide font-medium mb-1">{label}</p>
      <p className="text-2xl font-semibold text-black">{value}</p>
    </div>
  );
}

export default function StatCards({ stats }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <StatCard label="Total utilisateurs" value={stats.totalUsers} />
      <StatCard label="Actifs" value={stats.activeUsers} />
      <StatCard label="Inactifs" value={stats.inactiveUsers} />
      <StatCard label="Nouveaux (7j)" value={stats.newUsersLast7d} />
    </div>
  );
}
