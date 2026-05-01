"use client";

import { X, Loader2 } from "lucide-react";
import type { ImportJob } from "@/types/manga.type";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface ImportJobSidebarProps {
  job: ImportJob;
  onClose: () => void;
}

function StatRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
      <span className="text-sm text-black/50">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function ImportJobSidebar({
  job,
  onClose,
}: ImportJobSidebarProps) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full max-w-md h-full flex flex-col shadow-xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 sticky top-0 bg-white">
          <div>
            <h2 className="font-semibold">Détail de l&apos;import</h2>
            <p className="text-xs text-black/40 mt-0.5 font-mono">{job.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs bg-zinc-100 px-2 py-1 rounded">
              {job.type}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                job.status === "COMPLETED"
                  ? "bg-green-50 text-green-700"
                  : job.status === "RUNNING"
                    ? "bg-blue-50 text-blue-700"
                    : job.status === "FAILED"
                      ? "bg-red-50 text-red-700"
                      : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {job.status === "RUNNING" && (
                <Loader2 size={11} className="animate-spin" />
              )}
              {job.status}
            </span>
          </div>

          {/* Stats */}
          <div>
            <h3 className="text-xs font-medium text-black/50 uppercase tracking-wide mb-3">
              Statistiques
            </h3>
            <div className="bg-zinc-50 rounded-xl px-4">
              <StatRow
                label="Lancé par"
                value={job.triggeredBy?.email ?? job.triggeredById}
              />
              <StatRow
                label="Pages traitées"
                value={
                  job.totalPages
                    ? `${job.currentPage} / ${job.totalPages}`
                    : job.currentPage
                }
              />
              <StatRow label="Importés" value={job.totalImported} />
              <StatRow label="Mis à jour" value={job.totalUpdated} />
              <StatRow label="Ignorés" value={job.totalSkipped} />
              <StatRow label="Erreurs" value={job.totalErrors} />
              {job.startedAt && (
                <StatRow
                  label="Démarré"
                  value={format(new Date(job.startedAt), "d MMM yyyy à HH:mm", {
                    locale: fr,
                  })}
                />
              )}
              {job.completedAt && (
                <StatRow
                  label="Terminé"
                  value={format(
                    new Date(job.completedAt),
                    "d MMM yyyy à HH:mm",
                    { locale: fr },
                  )}
                />
              )}
            </div>
          </div>

          {/* Error log */}
          {job.errorLog && (
            <div>
              <h3 className="text-xs font-medium text-red-500 uppercase tracking-wide mb-3">
                Journal d&apos;erreurs
              </h3>
              <pre className="bg-red-50 text-red-700 text-xs p-4 rounded-xl overflow-auto max-h-64 whitespace-pre-wrap break-words font-mono leading-5">
                {job.errorLog}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
