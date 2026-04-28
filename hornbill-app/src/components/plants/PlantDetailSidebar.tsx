"use client";

import { useEffect, useState } from "react";
import { X, Loader2, Droplets, TrendingUp, Calendar, Leaf } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Plant, PlantCareLog, PlantGrowthLog } from "@/types/plant.type";
import { plantService } from "@/services/plant.service";

const CARE_LABELS: Record<string, string> = {
  WATERING: "Arrosage",
  FERTILIZING: "Engrais",
  REPOTTING: "Rempotage",
  MISTING: "Brumisation",
  LEAF_CLEANING: "Nettoyage",
  ROTATION: "Rotation",
  TREATMENT: "Traitement",
  PRUNING: "Taille",
  OTHER: "Autre",
};

const CARE_COLORS: Record<string, string> = {
  WATERING: "bg-sky-50 text-sky-600",
  FERTILIZING: "bg-amber-50 text-amber-600",
  REPOTTING: "bg-emerald-50 text-emerald-600",
  MISTING: "bg-[#E9F5FF] text-[#1A5799]",
  LEAF_CLEANING: "bg-green-50 text-green-600",
  ROTATION: "bg-violet-50 text-violet-600",
  TREATMENT: "bg-red-50 text-red-600",
  PRUNING: "bg-orange-50 text-orange-600",
  OTHER: "bg-black/[0.04] text-black/50",
};

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

interface Props {
  plant: Plant;
  onClose: () => void;
}

export default function PlantDetailSidebar({ plant, onClose }: Props) {
  const [careLogs, setCareLogs] = useState<PlantCareLog[]>([]);
  const [growthLogs, setGrowthLogs] = useState<PlantGrowthLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      plantService.getCareLogs(plant.id, 15).catch(() => []),
      plantService.getGrowthLogs(plant.id).catch(() => []),
    ]).then(([care, growth]) => {
      if (cancelled) return;
      setCareLogs(care);
      setGrowthLogs(growth);
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [plant.id]);

  const gradient = getGradient(plant.customName);

  const chartData = [...growthLogs]
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
    .map((g) => ({
      date: new Date(g.measuredAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      }),
      height: g.heightCm,
      leaves: g.leafCount,
    }));

  const latestGrowth = growthLogs.length > 0
    ? growthLogs.reduce((a, b) =>
        new Date(a.measuredAt) > new Date(b.measuredAt) ? a : b,
      )
    : null;

  const acquiredDays = plant.acquiredAt
    ? Math.floor((Date.now() - new Date(plant.acquiredAt).getTime()) / 86400000)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] cursor-default"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl shadow-black/20 flex flex-col overflow-hidden">
        {/* Hero */}
        <div className={`bg-gradient-to-br ${gradient} px-6 pt-6 pb-5`}>
          <div className="flex items-start justify-between mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <span className="text-xl font-bold text-white">
                {plant.customName.slice(0, 2).toUpperCase()}
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} className="text-white" />
            </button>
          </div>
          <h2 className="text-xl font-semibold text-white">{plant.customName}</h2>
          {plant.speciesName && (
            <p className="text-sm text-white/70 italic mt-0.5">{plant.speciesName}</p>
          )}

          {/* Quick metrics */}
          <div className="flex gap-4 mt-4">
            {latestGrowth?.heightCm && (
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Hauteur</p>
                <p className="text-sm font-semibold text-white">{latestGrowth.heightCm} cm</p>
              </div>
            )}
            {latestGrowth?.leafCount && (
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Feuilles</p>
                <p className="text-sm font-semibold text-white">{latestGrowth.leafCount}</p>
              </div>
            )}
            {acquiredDays !== null && (
              <div className="bg-white/15 rounded-xl px-3 py-2">
                <p className="text-[10px] text-white/60 uppercase tracking-wide">Âge</p>
                <p className="text-sm font-semibold text-white">
                  {acquiredDays > 365
                    ? `${Math.floor(acquiredDays / 365)}a ${Math.floor((acquiredDays % 365) / 30)}m`
                    : acquiredDays > 30
                      ? `${Math.floor(acquiredDays / 30)}m`
                      : `${acquiredDays}j`}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-[#468BE6]" />
            </div>
          ) : (
            <>
              {/* Growth chart */}
              {chartData.length >= 2 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp size={14} className="text-[#468BE6]" />
                    <h3 className="text-sm font-semibold text-black">Courbe de croissance</h3>
                  </div>
                  <div className="h-36">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "rgba(0,0,0,0.35)" }}
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
                          labelStyle={{ color: "rgba(0,0,0,0.5)", fontSize: 11 }}
                        />
                        {chartData.some((d) => d.height !== null) && (
                          <Line
                            type="monotone"
                            dataKey="height"
                            stroke="#468BE6"
                            strokeWidth={2}
                            dot={false}
                            name="Hauteur (cm)"
                          />
                        )}
                        {chartData.some((d) => d.leaves !== null) && (
                          <Line
                            type="monotone"
                            dataKey="leaves"
                            stroke="#93BFEF"
                            strokeWidth={2}
                            dot={false}
                            name="Feuilles"
                            strokeDasharray="4 2"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Care log timeline */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Droplets size={14} className="text-[#468BE6]" />
                  <h3 className="text-sm font-semibold text-black">Journal de soins</h3>
                  <span className="text-[10px] text-black/30 ml-auto">15 derniers</span>
                </div>
                {careLogs.length === 0 ? (
                  <p className="text-xs text-black/30 py-4 text-center">Aucun soin enregistré</p>
                ) : (
                  <div className="relative pl-5 space-y-0">
                    {/* Vertical line */}
                    <div className="absolute left-[7px] top-1 bottom-1 w-px bg-black/[0.06]" />
                    {careLogs.map((log) => {
                      const colorClass = CARE_COLORS[log.careType] ?? CARE_COLORS.OTHER;
                      return (
                        <div key={log.id} className="relative pb-3 last:pb-0">
                          {/* Dot */}
                          <div className="absolute left-[-12px] top-1 w-2 h-2 rounded-full bg-[#468BE6]/30 border border-[#468BE6]/50" />
                          <div className="flex items-start gap-2">
                            <span
                              className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass} flex-shrink-0`}
                            >
                              {CARE_LABELS[log.careType] ?? log.careType}
                            </span>
                            <div className="min-w-0">
                              <span className="text-[10px] text-black/30">
                                {new Date(log.performedAt).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </span>
                              {log.note && (
                                <p className="text-xs text-black/50 mt-0.5 truncate">{log.note}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              {plant.notes && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Leaf size={14} className="text-[#468BE6]" />
                    <h3 className="text-sm font-semibold text-black">Notes</h3>
                  </div>
                  <p className="text-sm text-black/50 leading-relaxed bg-black/[0.02] rounded-xl p-3">
                    {plant.notes}
                  </p>
                </div>
              )}

              {/* Meta */}
              {plant.acquiredAt && (
                <div className="flex items-center gap-2 text-xs text-black/30">
                  <Calendar size={12} />
                  <span>
                    Acquise le{" "}
                    {new Date(plant.acquiredAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
