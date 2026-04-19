"use client";

import { useState, useEffect, useCallback } from "react";
import { CheckSquare, Plus, Loader2 } from "lucide-react";
import { taskService } from "@/services/task.service";
import type { TaskWorkspace, TaskWorkspaceFull } from "@/types/task.type";
import WorkspaceTabs from "@/components/tasks/WorkspaceTabs";
import WorkspaceContent from "@/components/tasks/WorkspaceContent";
import CreateWorkspaceModal from "@/components/tasks/CreateWorkspaceModal";

export default function TasksPage() {
  const [workspaces, setWorkspaces] = useState<TaskWorkspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(
    null,
  );
  const [activeWorkspace, setActiveWorkspace] =
    useState<TaskWorkspaceFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const data = await taskService.getWorkspaces();
      setWorkspaces(data);
      if (data.length > 0 && !activeWorkspaceId) {
        setActiveWorkspaceId(data[0].id);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [activeWorkspaceId]);

  const fetchWorkspaceContent = useCallback(async (id: string) => {
    setContentLoading(true);
    try {
      const data = await taskService.getWorkspace(id);
      setActiveWorkspace(data);
    } catch {
      // ignore
    } finally {
      setContentLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  useEffect(() => {
    if (activeWorkspaceId) {
      fetchWorkspaceContent(activeWorkspaceId);
    }
  }, [activeWorkspaceId, fetchWorkspaceContent]);

  const refresh = () => {
    if (activeWorkspaceId) fetchWorkspaceContent(activeWorkspaceId);
    fetchWorkspaces();
  };

  const handleCreateWorkspace = async (name: string, icon: string) => {
    await taskService.createWorkspace({ name, icon: icon || undefined });
    setShowCreateModal(false);
    const data = await taskService.getWorkspaces();
    setWorkspaces(data);
    if (data.length > 0) {
      setActiveWorkspaceId(data[data.length - 1].id);
    }
  };

  const handleDeleteWorkspace = async (id: string) => {
    await taskService.deleteWorkspace(id);
    const data = await taskService.getWorkspaces();
    setWorkspaces(data);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(data.length > 0 ? data[0].id : null);
      if (data.length === 0) setActiveWorkspace(null);
    }
  };

  const handleRenameWorkspace = async (id: string, name: string) => {
    await taskService.updateWorkspace(id, { name });
    fetchWorkspaces();
  };

  const handleChangeIcon = async (id: string, icon: string) => {
    await taskService.updateWorkspace(id, { icon });
    fetchWorkspaces();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-black/20" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
          <CheckSquare size={17} className="text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-black">
            Tâches
          </h1>
          <p className="text-sm text-black/40">
            Organisez vos projets et listes de tâches
          </p>
        </div>
      </div>

      {/* Workspace Tabs */}
      <WorkspaceTabs
        workspaces={workspaces}
        activeId={activeWorkspaceId}
        onSelect={setActiveWorkspaceId}
        onCreate={() => setShowCreateModal(true)}
        onDelete={handleDeleteWorkspace}
        onRename={handleRenameWorkspace}
        onChangeIcon={handleChangeIcon}
      />

      {/* Workspace Content */}
      {activeWorkspace && !contentLoading ? (
        <WorkspaceContent workspace={activeWorkspace} onRefresh={refresh} />
      ) : contentLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={20} className="animate-spin text-black/20" />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-40 text-black/30">
          <CheckSquare size={32} className="mb-2 opacity-30" />
          <p className="text-sm">Créez un espace pour commencer</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-black text-white text-sm font-medium rounded-xl hover:bg-black/90 transition-colors cursor-pointer"
          >
            <Plus size={14} />
            Nouvel espace
          </button>
        </div>
      )}

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateWorkspace}
      />
    </div>
  );
}
