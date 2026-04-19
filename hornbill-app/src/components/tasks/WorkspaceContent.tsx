"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { TaskWorkspaceFull } from "@/types/task.type";
import { taskService } from "@/services/task.service";
import TaskListComponent from "./TaskList";

interface Props {
  workspace: TaskWorkspaceFull;
  onRefresh: () => void;
}

export default function WorkspaceContent({ workspace, onRefresh }: Props) {
  const [newListName, setNewListName] = useState("");
  const [creatingList, setCreatingList] = useState(false);

  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    setCreatingList(true);
    try {
      await taskService.createList(workspace.id, { name: newListName.trim() });
      setNewListName("");
      onRefresh();
    } finally {
      setCreatingList(false);
    }
  };

  // Separate root lists (no parentId) from sublists
  const rootLists = workspace.lists.filter((l) => !l.parentId);

  return (
    <div className="space-y-3">
      {rootLists.map((list) => (
        <TaskListComponent
          key={list.id}
          list={list}
          workspaceId={workspace.id}
          allLists={workspace.lists}
          onRefresh={onRefresh}
          depth={0}
        />
      ))}

      {/* Add list input */}
      <div className="flex items-center gap-2 py-2">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleCreateList();
          }}
          placeholder="Nouvelle liste..."
          className="flex-1 px-3.5 py-2.5 bg-black/[0.02] border border-dashed border-black/[0.1] rounded-xl text-sm text-black placeholder:text-black/25 outline-none focus:border-black/20 focus:bg-white transition-all"
        />
        <button
          onClick={handleCreateList}
          disabled={!newListName.trim() || creatingList}
          className="flex items-center gap-1.5 px-3.5 py-2.5 bg-black/[0.04] text-black/50 text-sm rounded-xl hover:bg-black/[0.08] hover:text-black/70 disabled:opacity-30 transition-all cursor-pointer"
        >
          <Plus size={14} />
          Ajouter
        </button>
      </div>
    </div>
  );
}
