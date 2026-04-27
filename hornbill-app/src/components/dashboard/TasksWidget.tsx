"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckSquare } from "lucide-react";
import Link from "next/link";
import { taskService } from "@/services/task.service";
import type { TaskWorkspace } from "@/types/task.type";

export default function TasksWidget() {
  const [workspaces, setWorkspaces] = useState<TaskWorkspace[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const data = await taskService.getWorkspaces();
      setWorkspaces(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const totalTasks = workspaces.reduce((sum, w) => sum + w.totalTasks, 0);
  const totalDone = workspaces.reduce((sum, w) => sum + w.doneTasks, 0);

  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-blue-500" />
          <span className="font-semibold text-sm text-zinc-900">Tâches</span>
        </div>
        <Link href="/dashboard/tasks" className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors">
          Voir tout →
        </Link>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-zinc-100 rounded animate-pulse" />
          ))}
        </div>
      ) : workspaces.length === 0 ? (
        <p className="text-xs text-zinc-400 text-center py-4">Aucun workspace créé</p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {workspaces.slice(0, 4).map((ws) => {
              const pct = ws.totalTasks > 0 ? (ws.doneTasks / ws.totalTasks) * 100 : 0;
              return (
                <div key={ws.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-700 truncate">
                      {ws.icon && <span className="mr-1">{ws.icon}</span>}
                      {ws.name}
                    </span>
                    <span className="text-xs text-zinc-400 shrink-0 ml-2">
                      {ws.doneTasks}/{ws.totalTasks}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-1">
                    <div
                      className="bg-blue-400 h-1 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-1 border-t border-zinc-100">
            <div className="flex justify-between text-xs text-zinc-500">
              <span>{totalDone} tâches terminées</span>
              <span>{totalTasks - totalDone} restantes</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
