"use client";

import { Leaf, Droplets, Heart, Archive, TrendingUp, Clock } from "lucide-react";
import type { PlantStats } from "@/types/plant.type";

interface Props {
  stats: PlantStats;
}

export default function PlantStatsCards({ stats }: Props) {
  const cards = [
    {
      label: "Plantes actives",
      value: String(stats.totalActive),
      icon: Leaf,
      iconBg: "bg-[#E9F5FF]",
      iconColor: "text-[#468BE6]",
      accent: "#468BE6",
    },
    {
      label: "Arrosages / sem.",
      value: String(stats.weeklyWaterings),
      icon: Droplets,
      iconBg: "bg-sky-50",
      iconColor: "text-sky-500",
      accent: "#0ea5e9",
    },
    {
      label: "Taux de survie",
      value: `${stats.survivalRate}%`,
      icon: Heart,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
      accent: "#10b981",
    },
    {
      label: "Archivées",
      value: String(stats.totalArchived),
      icon: Archive,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
      accent: "#f59e0b",
    },
    {
      label: "Total",
      value: String(stats.totalAll),
      icon: TrendingUp,
      iconBg: "bg-violet-50",
      iconColor: "text-violet-500",
      accent: "#8b5cf6",
    },
    {
      label: "Plus ancienne",
      value: stats.oldestPlant
        ? stats.oldestPlant.customName.length > 10
          ? stats.oldestPlant.customName.slice(0, 10) + "…"
          : stats.oldestPlant.customName
        : "—",
      icon: Clock,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
      accent: "#f43f5e",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="bg-white rounded-2xl border border-black/[0.06] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md hover:border-black/10 transition-all duration-300 group"
          >
            <div
              className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}
            >
              <Icon size={15} className={card.iconColor} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-black/35 mb-1 truncate">
              {card.label}
            </p>
            <p className="text-xl font-semibold text-black tracking-tight truncate">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
