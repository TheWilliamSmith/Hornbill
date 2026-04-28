"use client";

import { Droplets, Calendar, MoreHorizontal } from "lucide-react";
import type { Plant } from "@/types/plant.type";

const GRADIENT_PALETTE = [
  "from-[#1A5799] to-[#468BE6]",
  "from-[#468BE6] to-[#93BFEF]",
  "from-emerald-500 to-teal-400",
  "from-violet-500 to-purple-400",
  "from-orange-400 to-amber-300",
  "from-rose-400 to-pink-300",
  "from-cyan-500 to-sky-400",
  "from-indigo-500 to-blue-400",
];

function getGradient(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENT_PALETTE[Math.abs(hash) % GRADIENT_PALETTE.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2).toUpperCase();
}

function daysAgo(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

interface Props {
  plant: Plant;
  onClick: () => void;
}

export default function PlantCard({ plant, onClick }: Props) {
  const gradient = getGradient(plant.customName);
  const age = daysAgo(plant.acquiredAt);

  return (
    <button
      onClick={onClick}
      className="group w-full text-left bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-lg hover:shadow-black/[0.08] hover:border-[#93BFEF] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
    >
      {/* Avatar + menu */}
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-sm`}
        >
          <span className="text-sm font-bold text-white/90">
            {getInitials(plant.customName)}
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-black/[0.05] transition-all">
          <MoreHorizontal size={14} className="text-black/30" />
        </div>
      </div>

      {/* Names */}
      <p className="text-sm font-semibold text-black truncate mb-0.5">
        {plant.customName}
      </p>
      {plant.speciesName && (
        <p className="text-xs text-black/40 truncate italic mb-3">
          {plant.speciesName}
        </p>
      )}
      {!plant.speciesName && <div className="mb-3" />}

      {/* Meta */}
      <div className="flex items-center gap-3 mt-auto">
        {age !== null && (
          <div className="flex items-center gap-1.5">
            <Calendar size={11} className="text-black/25" />
            <span className="text-[11px] text-black/35">
              {age > 365
                ? `${Math.floor(age / 365)}a`
                : age > 30
                  ? `${Math.floor(age / 30)}m`
                  : `${age}j`}
            </span>
          </div>
        )}
        <div className="flex items-center gap-1.5 ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-black/35">Actif</span>
        </div>
      </div>
    </button>
  );
}
