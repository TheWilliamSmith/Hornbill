"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Leaf,
  Plus,
  Loader2,
  LayoutGrid,
  CalendarDays,
  BarChart3,
  Heart,
  Sparkles,
} from "lucide-react";
import { plantService } from "@/services/plant.service";
import type {
  Plant,
  PlantStats,
  TodayCareItem,
  WeekCareItem,
  PlantWishlistItem,
  CreatePlantRequest,
} from "@/types/plant.type";
import PlantStatsCards from "@/components/plants/PlantStatsCards";
import TodayCareChecklist from "@/components/plants/TodayCareChecklist";
import PlantCard from "@/components/plants/PlantCard";
import PlantDetailSidebar from "@/components/plants/PlantDetailSidebar";
import AddPlantModal from "@/components/plants/AddPlantModal";
import WeekView from "@/components/plants/WeekView";
import InsightsView from "@/components/plants/InsightsView";
import WishlistView from "@/components/plants/WishlistView";

type Tab = "today" | "plants" | "week" | "insights" | "wishlist";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "today", label: "Aujourd'hui", icon: Leaf },
  { id: "plants", label: "Mes plantes", icon: LayoutGrid },
  { id: "week", label: "Semaine", icon: CalendarDays },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "wishlist", label: "Wishlist", icon: Heart },
];

const EMPTY_STATS: PlantStats = {
  totalActive: 0,
  totalAll: 0,
  totalArchived: 0,
  survivalRate: 100,
  oldestPlant: null,
  weeklyWaterings: 0,
  mostNeedyPlantId: null,
};

export default function PlantsPage() {
  const [tab, setTab] = useState<Tab>("today");
  const [stats, setStats] = useState<PlantStats>(EMPTY_STATS);
  const [today, setToday] = useState<TodayCareItem | null>(null);
  const [week, setWeek] = useState<WeekCareItem | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [wishlist, setWishlist] = useState<PlantWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchAll = useCallback(async () => {
    try {
      const [s, t, w, p, wl] = await Promise.all([
        plantService.getStats().catch(() => EMPTY_STATS),
        plantService.getToday().catch(() => null),
        plantService.getWeek().catch(() => null),
        plantService.getPlants("ACTIVE").catch(() => []),
        plantService.getWishlist().catch(() => []),
      ]);
      setStats(s);
      setToday(t);
      setWeek(w);
      setPlants(p);
      setWishlist(wl);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAddPlant = async (data: CreatePlantRequest) => {
    await plantService.createPlant(data);
    fetchAll();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-[#468BE6]/40" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1A5799] to-[#468BE6] flex items-center justify-center shadow-lg shadow-[#468BE6]/25">
              <Leaf size={17} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">Mes Plantes</h1>
          </div>
          <p className="text-sm text-black/40 ml-[46px]">
            Suivez la croissance et les soins de votre jardin intérieur
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1A5799] to-[#468BE6] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#468BE6]/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          Nouvelle plante
        </button>
      </div>

      {/* KPIs */}
      <PlantStatsCards stats={stats} />

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-black/[0.03] rounded-2xl p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
              tab === id
                ? "bg-white text-black shadow-sm shadow-black/[0.06]"
                : "text-black/40 hover:text-black/60"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "today" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Checklist */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-semibold text-black tracking-tight">
                Soins du jour
              </h2>
              <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
                {new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              </span>
            </div>
            {today ? (
              <TodayCareChecklist grouped={today.grouped} onRefresh={fetchAll} />
            ) : (
              <p className="text-sm text-black/30 text-center py-8">Impossible de charger les soins</p>
            )}
          </div>

          {/* Sidebar: quick plant access + care streak */}
          <div className="space-y-4">
            {/* Plants needing attention */}
            <div className="bg-white rounded-2xl border border-black/[0.06] p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={14} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-black">Mes plantes</h3>
              </div>
              {plants.length === 0 ? (
                <div className="flex flex-col items-center py-6">
                  <p className="text-xs text-black/30">Aucune plante active</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-xs font-medium text-[#468BE6] hover:text-[#1A5799] transition-colors cursor-pointer"
                  >
                    + Ajouter
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {plants.slice(0, 5).map((plant) => (
                    <button
                      key={plant.id}
                      onClick={() => setSelectedPlant(plant)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#E9F5FF]/60 hover:border-[#93BFEF] border border-transparent transition-all text-left cursor-pointer"
                    >
                      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#1A5799] to-[#468BE6] flex items-center justify-center flex-shrink-0">
                        <span className="text-[9px] font-bold text-white">
                          {plant.customName.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-black truncate">{plant.customName}</p>
                        {plant.speciesName && (
                          <p className="text-[10px] text-black/35 truncate italic">{plant.speciesName}</p>
                        )}
                      </div>
                    </button>
                  ))}
                  {plants.length > 5 && (
                    <button
                      onClick={() => setTab("plants")}
                      className="w-full text-center text-xs text-[#468BE6] py-1 hover:text-[#1A5799] transition-colors cursor-pointer"
                    >
                      Voir toutes ({plants.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {tab === "plants" && (
        <div>
          {plants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-black/[0.06]">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1A5799] to-[#468BE6] flex items-center justify-center mb-4 shadow-lg shadow-[#468BE6]/25">
                <Leaf size={22} className="text-white" />
              </div>
              <p className="text-base font-semibold text-black mb-1">Aucune plante active</p>
              <p className="text-sm text-black/40 mb-4">Commencez par ajouter votre première plante</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1A5799] to-[#468BE6] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-[#468BE6]/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
              >
                <Plus size={16} />
                Ajouter une plante
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {plants.map((plant) => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  onClick={() => setSelectedPlant(plant)}
                />
              ))}
              {/* Add card */}
              <button
                onClick={() => setShowAddModal(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#93BFEF]/50 hover:border-[#468BE6] hover:bg-[#E9F5FF]/40 transition-all p-5 min-h-[140px] text-[#468BE6] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E9F5FF] flex items-center justify-center">
                  <Plus size={18} className="text-[#468BE6]" />
                </div>
                <span className="text-xs font-medium">Ajouter</span>
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "week" && (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-black">Calendrier des soins</h2>
            {week && (
              <span className="text-[10px] uppercase tracking-wide text-black/30">
                {new Date(week.from).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                {" — "}
                {new Date(week.to).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
              </span>
            )}
          </div>
          {week ? (
            <WeekView week={week} />
          ) : (
            <p className="text-sm text-black/30 text-center py-8">Impossible de charger la semaine</p>
          )}
        </div>
      )}

      {tab === "insights" && <InsightsView stats={stats} />}

      {tab === "wishlist" && (
        <div className="bg-white rounded-2xl border border-black/[0.06] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-black">Liste de souhaits</h2>
              <p className="text-xs text-black/35 mt-0.5">Les plantes qui vous font envie</p>
            </div>
            <span className="text-[10px] uppercase tracking-wide text-black/30">
              {wishlist.length} élément{wishlist.length !== 1 ? "s" : ""}
            </span>
          </div>
          <WishlistView items={wishlist} onRefresh={fetchAll} />
        </div>
      )}

      {/* Plant detail sidebar */}
      {selectedPlant && (
        <PlantDetailSidebar
          plant={selectedPlant}
          onClose={() => setSelectedPlant(null)}
        />
      )}

      {/* Add plant modal */}
      <AddPlantModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreate={handleAddPlant}
      />
    </div>
  );
}
