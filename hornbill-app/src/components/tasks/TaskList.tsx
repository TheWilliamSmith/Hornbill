"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronRight, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import type { TaskList, Task } from "@/types/task.type";
import { taskService } from "@/services/task.service";
import TaskItem from "./TaskItem";

interface Props {
  list: TaskList;
  workspaceId: string;
  allLists: TaskList[];
  onRefresh: () => void;
  depth: number;
}

export default function TaskListComponent({
  list,
  workspaceId,
  allLists,
  onRefresh,
  depth,
}: Props) {
  const [collapsed, setCollapsed] = useState(list.isCollapsed);
  const [showMenu, setShowMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(list.name);
  const [newTaskContent, setNewTaskContent] = useState("");
  const [showDone, setShowDone] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleRename = async () => {
    if (editValue.trim() && editValue.trim() !== list.name) {
      await taskService.updateList(list.id, { name: editValue.trim() });
      onRefresh();
    }
    setEditing(false);
  };

  const handleToggleCollapse = async () => {
    const next = !collapsed;
    setCollapsed(next);
    await taskService.updateList(list.id, { isCollapsed: next });
  };

  const handleAddTask = async () => {
    if (!newTaskContent.trim()) return;
    await taskService.createTask(list.id, { content: newTaskContent.trim() });
    setNewTaskContent("");
    onRefresh();
  };

  const handleAddSublist = async () => {
    const name = prompt("Nom de la sous-liste");
    if (!name?.trim()) return;
    await taskService.createSublist(list.id, { name: name.trim() });
    onRefresh();
  };

  const handleDeleteList = async () => {
    if (confirm(`Supprimer la liste "${list.name}" et toutes ses tâches ?`)) {
      await taskService.deleteList(list.id);
      onRefresh();
    }
  };

  const handleClearDone = async () => {
    await taskService.clearDoneTasks(list.id);
    onRefresh();
  };

  const handleToggleTask = async (taskId: string) => {
    await taskService.toggleTask(taskId);
    onRefresh();
  };

  const handleUpdateTask = async (taskId: string, content: string) => {
    await taskService.updateTask(taskId, { content });
    onRefresh();
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    onRefresh();
  };

  const pendingTasks = (list.tasks || []).filter((t: Task) => !t.isDone);
  const doneTasks = (list.tasks || []).filter((t: Task) => t.isDone);
  const children = list.children || [];

  return (
    <div
      className={`${depth > 0 ? "ml-6 border-l-2 border-black/[0.06] pl-4" : ""}`}
    >
      {/* List header */}
      <div className="group flex items-center gap-1.5 py-1.5">
        <button
          onClick={handleToggleCollapse}
          className="w-5 h-5 flex items-center justify-center text-black/30 hover:text-black/50 transition-colors cursor-pointer"
        >
          <ChevronRight
            size={14}
            className={`transition-transform ${!collapsed ? "rotate-90" : ""}`}
          />
        </button>

        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setEditing(false);
            }}
            className="flex-1 text-sm font-semibold text-black bg-transparent outline-none border-b border-black/20"
          />
        ) : (
          <span
            onDoubleClick={() => {
              setEditValue(list.name);
              setEditing(true);
            }}
            className="flex-1 text-sm font-semibold text-black/80 select-none"
          >
            {list.name}
          </span>
        )}

        {(list.tasks || []).length > 0 && (
          <span className="text-[10px] text-black/25 mr-1">
            {pendingTasks.length > 0 ? pendingTasks.length : "✓"}
          </span>
        )}

        {/* Menu trigger */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-6 h-6 flex items-center justify-center rounded text-black/20 opacity-0 group-hover:opacity-100 hover:text-black/50 hover:bg-black/[0.04] transition-all cursor-pointer"
          >
            <MoreHorizontal size={14} />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-1 w-40 bg-white rounded-xl border border-black/[0.08] shadow-lg shadow-black/5 z-50 py-1">
              <button
                onClick={() => {
                  setEditValue(list.name);
                  setEditing(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-black/70 hover:bg-black/[0.04] cursor-pointer"
              >
                Renommer
              </button>
              {depth === 0 && (
                <button
                  onClick={() => {
                    handleAddSublist();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-black/70 hover:bg-black/[0.04] cursor-pointer"
                >
                  Ajouter sous-liste
                </button>
              )}
              {doneTasks.length > 0 && (
                <button
                  onClick={() => {
                    handleClearDone();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-black/70 hover:bg-black/[0.04] cursor-pointer"
                >
                  Vider terminées
                </button>
              )}
              <div className="border-t border-black/[0.06] my-1" />
              <button
                onClick={() => {
                  handleDeleteList();
                  setShowMenu(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Collapsed content */}
      {!collapsed && (
        <div className="ml-5">
          {/* Pending tasks */}
          {pendingTasks.map((task: Task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => handleToggleTask(task.id)}
              onUpdate={(content) => handleUpdateTask(task.id, content)}
              onDelete={() => handleDeleteTask(task.id)}
            />
          ))}

          {/* Quick add task */}
          <div className="flex items-center gap-2 py-1">
            <input
              type="text"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddTask();
              }}
              placeholder="Ajouter une tâche..."
              className="flex-1 px-2.5 py-1.5 text-sm text-black placeholder:text-black/20 bg-transparent outline-none"
            />
            {newTaskContent.trim() && (
              <button
                onClick={handleAddTask}
                className="w-5 h-5 flex items-center justify-center text-black/30 hover:text-black/50 cursor-pointer"
              >
                <Plus size={14} />
              </button>
            )}
          </div>

          {/* Done tasks */}
          {doneTasks.length > 0 && (
            <div className="mt-1">
              <button
                onClick={() => setShowDone(!showDone)}
                className="flex items-center gap-1.5 text-xs text-black/30 hover:text-black/50 py-1 cursor-pointer"
              >
                <ChevronRight
                  size={10}
                  className={`transition-transform ${showDone ? "rotate-90" : ""}`}
                />
                Terminées ({doneTasks.length})
              </button>
              {showDone &&
                doneTasks.map((task: Task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggleTask(task.id)}
                    onUpdate={(content) => handleUpdateTask(task.id, content)}
                    onDelete={() => handleDeleteTask(task.id)}
                  />
                ))}
            </div>
          )}

          {/* Children (sublists) */}
          {children.map((child: TaskList) => (
            <TaskListComponent
              key={child.id}
              list={child}
              workspaceId={workspaceId}
              allLists={allLists}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
