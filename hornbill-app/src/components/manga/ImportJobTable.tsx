"use client";

import { Loader2, Square } from "lucide-react";
import { useState } from "react";
import type { ImportJob } from "@/types/manga.type";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ImportJobTableProps {
  jobs: ImportJob[];
  onRowClick: (job: ImportJob) => void;
  onCancel?: (jobId: string) => Promise<void>;
}

function StatusBadge({ status }: { status: ImportJob["status"] }) {
  const styles: Record<ImportJob["status"], string> = {
    PENDING: "bg-zinc-100 text-zinc-600",
    RUNNING: "bg-blue-50 text-blue-700",
    COMPLETED: "bg-green-50 text-green-700",
    FAILED: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}
    >
      {status === "RUNNING" && <Loader2 size={11} className="animate-spin" />}
      {status}
    </span>
  );
}

export default function ImportJobTable({
  jobs,
  onRowClick,
  onCancel,
}: ImportJobTableProps) {
  if (jobs.length === 0) {
    return (
      <p className="text-sm text-black/40 py-6 text-center">
        Aucun import effectué
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/5">
            <th className="text-left pb-2 pr-4 font-medium text-black/50 text-xs uppercase tracking-wide">
              Type
            </th>
            <th className="text-left pb-2 pr-4 font-medium text-black/50 text-xs uppercase tracking-wide">
              Status
            </th>
            <th className="text-left pb-2 pr-4 font-medium text-black/50 text-xs uppercase tracking-wide">
              Lancé par
            </th>
            <th className="text-left pb-2 pr-4 font-medium text-black/50 text-xs uppercase tracking-wide">
              Progression
            </th>
            <th className="text-left pb-2 pr-4 font-medium text-black/50 text-xs uppercase tracking-wide">
              Résultat
            </th>
            <th className="text-left pb-2 font-medium text-black/50 text-xs uppercase tracking-wide">
              Date
            </th>
            {onCancel && (
              <th className="text-left pb-2 pl-4 font-medium text-black/50 text-xs uppercase tracking-wide" />
            )}
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow
              key={job.id}
              job={job}
              onRowClick={onRowClick}
              onCancel={onCancel}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobRow({
  job,
  onRowClick,
  onCancel,
}: {
  job: ImportJob;
  onRowClick: (job: ImportJob) => void;
  onCancel?: (jobId: string) => Promise<void>;
}) {
  const [cancelling, setCancelling] = useState(false);
  const isActive = job.status === "RUNNING" || job.status === "PENDING";

  const handleCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCancel) return;
    setCancelling(true);
    try {
      await onCancel(job.id);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <tr
      onClick={() => onRowClick(job)}
      className="border-b border-black/5 hover:bg-zinc-50 cursor-pointer transition-colors"
    >
      <td className="py-3 pr-4">
        <span className="font-mono text-xs bg-zinc-100 px-2 py-0.5 rounded">
          {job.type}
        </span>
      </td>
      <td className="py-3 pr-4">
        <StatusBadge status={job.status} />
      </td>
      <td className="py-3 pr-4 text-black/60">
        {job.triggeredBy?.email ?? "—"}
      </td>
      <td className="py-3 pr-4 text-black/60">
        {job.status === "PENDING" && "—"}
        {job.status === "RUNNING" && job.totalPages
          ? `${job.currentPage}/${job.totalPages}`
          : job.status === "RUNNING"
            ? `${job.currentPage}`
            : null}
        {(job.status === "COMPLETED" || job.status === "FAILED") &&
          (job.totalPages
            ? `${job.currentPage}/${job.totalPages}`
            : `${job.currentPage} pages`)}
      </td>
      <td className="py-3 pr-4 text-black/60 text-xs">
        {job.status === "PENDING" && "—"}
        {job.status !== "PENDING" && (
          <span>
            {job.totalImported} importés, {job.totalUpdated} MàJ
            {job.totalErrors > 0 && (
              <span className="text-red-500 ml-1">
                , {job.totalErrors} erreurs
              </span>
            )}
          </span>
        )}
      </td>
      <td className="py-3 text-black/40 text-xs">
        {formatDistanceToNow(new Date(job.createdAt), {
          addSuffix: true,
          locale: fr,
        })}
      </td>
      {onCancel && (
        <td className="py-3 pl-4">
          {isActive && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelling ? (
                <Loader2 size={11} className="animate-spin" />
              ) : (
                <Square size={11} fill="currentColor" />
              )}
              Stop
            </button>
          )}
        </td>
      )}
    </tr>
  );
}
