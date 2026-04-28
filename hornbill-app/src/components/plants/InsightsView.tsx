"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type { PlantStats } from "@/types/plant.type";

const CARE_DISTRIBUTION_MOCK = [
  { name: "Arrosage", count: 42, fill: "#468BE6" },
  { name: "Engrais", count: 12, fill: "#f59e0b" },
  { name: "Rempotage", count: 3, fill: "#10b981" },
  { name: "Brumisation", count: 28, fill: "#93BFEF" },
  { name: "Nettoyage", count: 8, fill: "#22c55e" },
  { name: "Autre", count: 5, fill: "rgba(0,0,0,0.15)" },
];

const MONTHLY_CARE_MOCK = [
  { month: "Nov", count: 18 },
  { month: "Déc", count: 22 },
  { month: "Jan", count: 19 },
  { month: "Fév", count: 26 },
  { month: "Mar", count: 31 },
  { month: "Avr", count: 28 },
];

const HEALTH_PIE = [
  { name: "Excellent", value: 40, fill: "#10b981" },
  { name: "Bon", value: 35, fill: "#468BE6" },
  { name: "Moyen", value: 15, fill: "#f59e0b" },
  { name: "Mauvais", value: 10, fill: "#f43f5e" },
];

interface Props {
  stats: PlantStats;
}

export default function InsightsView({ stats }: Props) {
  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Taux de survie", value: `${stats.survivalRate}%`, sub: "Plantes actives vs total", color: "#10b981" },
          { label: "Arrosages / sem.", value: String(stats.weeklyWaterings), sub: "Moyenne des 4 dernières semaines", color: "#468BE6" },
          { label: "Plantes actives", value: String(stats.totalActive), sub: `Sur ${stats.totalAll} au total`, color: "#8b5cf6" },
          { label: "Archivées", value: String(stats.totalArchived), sub: "Depuis le début", color: "#f59e0b" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <p className="text-3xl font-semibold tracking-tight" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
            <p className="text-xs font-medium text-black/60 mt-1">{kpi.label}</p>
            <p className="text-[10px] text-black/30 mt-0.5">{kpi.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly care bar chart */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-black">Soins mensuels</h3>
            <span className="text-[10px] uppercase tracking-wide text-black/30">6 derniers mois</span>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_CARE_MOCK} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                />
                <Bar dataKey="count" fill="#468BE6" radius={[6, 6, 0, 0]} name="Soins" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health donut */}
        <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-black">Santé globale</h3>
            <span className="text-[10px] uppercase tracking-wide text-black/30">Distribution</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-36 h-36 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={HEALTH_PIE}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {HEALTH_PIE.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2">
              {HEALTH_PIE.map((entry) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: entry.fill }} />
                  <span className="text-xs text-black/50">{entry.name}</span>
                  <span className="text-xs font-medium text-black/70 ml-auto">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Care distribution */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-black">Types de soins</h3>
          <span className="text-[10px] uppercase tracking-wide text-black/30">Toutes plantes</span>
        </div>
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={CARE_DISTRIBUTION_MOCK}
              layout="vertical"
              margin={{ top: 0, right: 24, bottom: 0, left: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "rgba(0,0,0,0.35)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: "rgba(0,0,0,0.45)" }}
                axisLine={false}
                tickLine={false}
                width={56}
              />
              <Tooltip
                contentStyle={{
                  background: "white",
                  border: "1px solid rgba(0,0,0,0.08)",
                  borderRadius: 12,
                  fontSize: 12,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} name="Nombre">
                {CARE_DISTRIBUTION_MOCK.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
