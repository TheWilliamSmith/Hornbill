"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, MoreHorizontal } from "lucide-react";
import type { TaskWorkspace } from "@/types/task.type";

interface Props {
  workspaces: TaskWorkspace[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onChangeIcon: (id: string, icon: string) => void;
}

const EMOJIS = [
  "📋",
  "🏠",
  "💼",
  "🎓",
  "💻",
  "🎯",
  "📱",
  "🛒",
  "✈️",
  "📚",
  "🎨",
  "⚡",
  "🔧",
  "🌱",
  "❤️",
  "🎮",
];

export default function WorkspaceTabs({
  workspaces,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onChangeIcon,
}: Props) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuId(null);
        setShowEmojiPicker(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId]);

  const handleRenameSubmit = (id: string) => {
    if (editValue.trim()) {
      onRename(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1 mb-5 overflow-x-auto pb-1 border-b border-black/[0.06]">
      {workspaces.map((ws) => (
        <div key={ws.id} className="relative flex-shrink-0 group">
          <button
            onClick={() => onSelect(ws.id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-t-lg transition-all cursor-pointer ${
              activeId === ws.id
                ? "bg-black/[0.05] text-black border-b-2 border-black"
                : "text-black/40 hover:text-black/60 hover:bg-black/[0.02]"
            }`}
          >
            {ws.icon && <span className="text-base">{ws.icon}</span>}
            {editingId === ws.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => handleRenameSubmit(ws.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRenameSubmit(ws.id);
                  if (e.key === "Escape") setEditingId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                className="bg-transparent border-none outline-none text-sm font-medium w-24"
              />
            ) : (
              <span>{ws.name}</span>
            )}
            {activeId === ws.id && ws.totalTasks > 0 && (
              <span className="text-[10px] text-black/30 ml-1">
                {ws.doneTasks}/{ws.totalTasks}
              </span>
            )}
          </button>

          {/* Context menu button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuId(menuId === ws.id ? null : ws.id);
              setShowEmojiPicker(null);
            }}
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white border border-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-black/[0.04]"
          >
            <MoreHorizontal size={10} />
          </button>

          {/* Context menu */}
          {menuId === ws.id && (
            <div
              ref={menuRef}
              className="absolute top-full left-0 mt-1 w-44 bg-white rounded-xl border border-black/[0.08] shadow-lg shadow-black/5 z-50 py-1 overflow-visible"
            >
              <button
                onClick={() => {
                  setEditValue(ws.name);
                  setEditingId(ws.id);
                  setMenuId(null);
                }}
                className="w-full text-left px-3 py-2 text-sm text-black/70 hover:bg-black/[0.04] transition-colors cursor-pointer"
              >
                Renommer
              </button>
              <button
                onClick={() =>
                  setShowEmojiPicker(showEmojiPicker === ws.id ? null : ws.id)
                }
                className="w-full text-left px-3 py-2 text-sm text-black/70 hover:bg-black/[0.04] transition-colors cursor-pointer"
              >
                Changer l&apos;icône
              </button>
              {showEmojiPicker === ws.id && (
                <div className="grid grid-cols-8 gap-1 px-2 py-2 border-t border-black/[0.06]">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => {
                        onChangeIcon(ws.id, emoji);
                        setShowEmojiPicker(null);
                        setMenuId(null);
                      }}
                      className="w-7 h-7 flex items-center justify-center rounded hover:bg-black/[0.06] cursor-pointer text-base"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
              <div className="border-t border-black/[0.06] my-1" />
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Supprimer l'espace "${ws.name}" ? Toutes les listes et tâches seront supprimées.`,
                    )
                  ) {
                    onDelete(ws.id);
                  }
                  setMenuId(null);
                }}
                className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
              >
                Supprimer
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add workspace button */}
      <button
        onClick={onCreate}
        className="flex-shrink-0 flex items-center gap-1 px-3 py-2 text-sm text-black/30 hover:text-black/50 transition-colors cursor-pointer"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
