"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Bitcoin,
  Plus,
  ArrowDownToLine,
  Crosshair,
  Trash2,
} from "lucide-react";
import Modal from "@/components/ui/Modal";
import CryptoStats from "@/components/crypto/CryptoStats";
import NextTargetCard from "@/components/crypto/NextTargetCard";
import PositionsTable from "@/components/crypto/PositionsTable";
import PositionSidebar from "@/components/crypto/PositionSidebar";
import AddPositionForm from "@/components/crypto/AddPositionForm";
import SellForm from "@/components/crypto/SellForm";
import AddTargetForm from "@/components/crypto/AddTargetForm";
import ConfirmDeleteModal from "@/components/crypto/ConfirmDeleteModal";
import LivePrices from "@/components/crypto/LivePrices";
import AssetsPieChart from "@/components/crypto/AssetsPieChart";
import { computeDashboard } from "@/lib/mock-crypto";
import {
  useCryptoPositions,
  useDeletePosition,
  useDeleteTarget,
  usePrices,
} from "@/hooks/use-crypto";
import { CryptoPosition, SellTarget } from "@/types/crypto.type";

export default function CryptoPage() {
  // Data (API)
  const { positions, fetchPositions, isLoading } = useCryptoPositions();
  const {
    prices,
    lastFetchTime,
    fetchPrices,
    isLoading: isPricesLoading,
  } = usePrices();
  const { deletePosition: deletePositionApi } = useDeletePosition();
  const { deleteTarget: deleteTargetApi } = useDeleteTarget();
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const refreshPrices = useCallback(async () => {
    await fetchPrices(true);
  }, [fetchPrices]);

  useEffect(() => {
    fetchPositions({ limit: 100 });
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const dashboard = computeDashboard(positions, prices);

  // Sidebar
  const [selectedPosition, setSelectedPosition] =
    useState<CryptoPosition | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Modals
  const [showAddPosition, setShowAddPosition] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddTarget, setShowAddTarget] = useState(false);
  const [showEditTarget, setShowEditTarget] = useState(false);
  const [showDeleteTarget, setShowDeleteTarget] = useState(false);

  const [sellPosition, setSellPosition] = useState<CryptoPosition | null>(null);
  const [deletePosition, setDeletePosition] = useState<CryptoPosition | null>(
    null,
  );
  const [editingTarget, setEditingTarget] = useState<SellTarget | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<SellTarget | null>(null);

  // Handlers
  const openSidebar = (pos: CryptoPosition) => {
    setSelectedPosition(pos);
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setSelectedPosition(null);
  };

  const handleSell = (pos: CryptoPosition) => {
    setSellPosition(pos);
    setShowSellModal(true);
  };

  const handleDelete = (pos: CryptoPosition) => {
    setDeletePosition(pos);
    setShowDeleteModal(true);
  };

  const handleAddTarget = () => {
    setShowAddTarget(true);
  };

  const handleEditTarget = (target: SellTarget) => {
    setEditingTarget(target);
    setShowEditTarget(true);
  };

  const handleDeleteTarget = (target: SellTarget) => {
    setDeletingTarget(target);
    setShowDeleteTarget(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <Bitcoin size={17} className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-black">
              Crypto Tracker
            </h1>
          </div>
          <p className="text-sm text-black/40 ml-[46px]">
            Suivez vos positions et paliers de vente
          </p>
        </div>

        <button
          onClick={() => setShowAddPosition(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.97] transition-all duration-200 cursor-pointer"
        >
          <Plus size={16} />
          Nouvel achat
        </button>
      </div>

      {/* Stats */}
      <CryptoStats dashboard={dashboard} />

      {/* Positions table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-visible">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-sm font-semibold text-black tracking-tight">
            Positions
          </h2>
          <span className="text-[10px] uppercase tracking-wide text-black/25 font-medium">
            {positions.length} position{positions.length > 1 ? "s" : ""}
          </span>
        </div>
        <PositionsTable
          positions={positions}
          prices={prices}
          onRowClick={openSidebar}
          onAddPosition={() => setShowAddPosition(true)}
          onSell={handleSell}
          onEdit={openSidebar}
          onDelete={handleDelete}
        />
      </div>

      {/* Pie Chart + Next Target + Live Prices */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <AssetsPieChart positions={positions} prices={prices} />
        <NextTargetCard dashboard={dashboard} />
        <LivePrices
          prices={prices}
          lastFetchTime={lastFetchTime}
          onRefresh={refreshPrices}
          isRefreshing={isPricesLoading}
        />
      </div>

      {/* Sidebar */}
      <PositionSidebar
        position={selectedPosition}
        currentPrice={
          selectedPosition ? (prices[selectedPosition.symbol] ?? 0) : 0
        }
        isOpen={sidebarOpen}
        onClose={closeSidebar}
        onAddTarget={handleAddTarget}
        onSell={() => {
          if (selectedPosition) handleSell(selectedPosition);
        }}
        onEditTarget={handleEditTarget}
        onDeleteTarget={handleDeleteTarget}
      />

      {/* Add Position Modal */}
      <Modal
        isOpen={showAddPosition}
        onClose={() => setShowAddPosition(false)}
        title="Nouvel achat"
        subtitle="Enregistrer une position crypto"
        icon={<Plus size={18} />}
      >
        <AddPositionForm
          onSuccess={() => {
            setShowAddPosition(false);
            refresh();
          }}
        />
      </Modal>

      {/* Sell Modal */}
      <Modal
        isOpen={showSellModal && !!sellPosition}
        onClose={() => {
          setShowSellModal(false);
          setSellPosition(null);
        }}
        title="Enregistrer une vente"
        subtitle={sellPosition ? `Vendre du ${sellPosition.symbol}` : ""}
        icon={<ArrowDownToLine size={18} />}
      >
        {sellPosition && (
          <SellForm
            position={sellPosition}
            currentPrice={prices[sellPosition.symbol] ?? 0}
            onSuccess={() => {
              setShowSellModal(false);
              setSellPosition(null);
              refresh();
            }}
          />
        )}
      </Modal>

      {/* Add Target Modal */}
      <Modal
        isOpen={showAddTarget && !!selectedPosition}
        onClose={() => setShowAddTarget(false)}
        title="Ajouter un target"
        subtitle={
          selectedPosition
            ? `Palier de vente pour ${selectedPosition.symbol}`
            : ""
        }
        icon={<Crosshair size={18} />}
      >
        {selectedPosition && (
          <AddTargetForm
            positionId={selectedPosition.id}
            costBasis={selectedPosition.costBasis}
            onSuccess={() => {
              setShowAddTarget(false);
              refresh();
            }}
          />
        )}
      </Modal>

      {/* Edit Target Modal */}
      <Modal
        isOpen={showEditTarget && !!editingTarget && !!selectedPosition}
        onClose={() => {
          setShowEditTarget(false);
          setEditingTarget(null);
        }}
        title="Modifier le target"
        subtitle={`+${editingTarget?.triggerPercent}% → vendre ${editingTarget?.sellPercent}%`}
        icon={<Crosshair size={18} />}
      >
        {editingTarget && selectedPosition && (
          <AddTargetForm
            positionId={selectedPosition.id}
            costBasis={selectedPosition.costBasis}
            existingTarget={editingTarget}
            onSuccess={() => {
              setShowEditTarget(false);
              setEditingTarget(null);
              refresh();
            }}
          />
        )}
      </Modal>

      {/* Delete Position Modal */}
      <Modal
        isOpen={showDeleteModal && !!deletePosition}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletePosition(null);
        }}
        title="Supprimer la position"
        icon={<Trash2 size={18} />}
      >
        <ConfirmDeleteModal
          title={`Supprimer ${deletePosition?.symbol} ?`}
          description={`Cette action est irréversible. La position ${deletePosition?.symbol} (${deletePosition?.platform}) et tous ses targets seront supprimés.`}
          onConfirm={async () => {
            if (deletePosition) {
              await deletePositionApi(deletePosition.id);
            }
            setShowDeleteModal(false);
            setDeletePosition(null);
            closeSidebar();
            refresh();
          }}
          onCancel={() => {
            setShowDeleteModal(false);
            setDeletePosition(null);
          }}
        />
      </Modal>

      {/* Delete Target Modal */}
      <Modal
        isOpen={showDeleteTarget && !!deletingTarget}
        onClose={() => {
          setShowDeleteTarget(false);
          setDeletingTarget(null);
        }}
        title="Supprimer le target"
        icon={<Trash2 size={18} />}
      >
        <ConfirmDeleteModal
          title={`Supprimer le target +${deletingTarget?.triggerPercent}% ?`}
          description="Ce palier de vente sera définitivement supprimé."
          onConfirm={async () => {
            if (deletingTarget) {
              await deleteTargetApi(deletingTarget.id);
            }
            setShowDeleteTarget(false);
            setDeletingTarget(null);
            refresh();
          }}
          onCancel={() => {
            setShowDeleteTarget(false);
            setDeletingTarget(null);
          }}
        />
      </Modal>
    </div>
  );
}
