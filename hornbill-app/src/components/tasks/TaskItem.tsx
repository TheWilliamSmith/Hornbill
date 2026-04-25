"use client";

import { useState, useRef, useEffect } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  task: { id: string; content: string; isDone: boolean };
  onToggle: () => void;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}

export default function TaskItem({
  task,
  onToggle,
  onUpdate,
  onDelete,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.content);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleSubmit = () => {
    if (editValue.trim() && editValue.trim() !== task.content) {
      onUpdate(editValue.trim());
    }
    setEditing(false);
  };

  return (
    <div className="group flex items-center gap-2 py-1 rounded-lg hover:bg-black/[0.02] px-1 -mx-1 transition-colors">
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`flex-shrink-0 w-4 h-4 rounded border-[1.5px] transition-all cursor-pointer flex items-center justify-center ${
          task.isDone
            ? "bg-black/70 border-black/70"
            : "border-black/20 hover:border-black/40"
        }`}
      >
        {task.isDone && (
          <svg
            width="8"
            height="6"
            viewBox="0 0 8 6"
            fill="none"
            className="text-white"
          >
            <path
              d="M1 3L3 5L7 1"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Content */}
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSubmit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="flex-1 text-sm text-black bg-transparent outline-none border-b border-black/20"
        />
      ) : (
        <span
          onDoubleClick={() => {
            setEditValue(task.content);
            setEditing(true);
          }}
          className={`flex-1 text-sm select-none ${
            task.isDone ? "text-black/30 line-through" : "text-black/70"
          }`}
        >
          {task.content}
        </span>
      )}

      {/* Delete */}
      <button
        onClick={onDelete}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-black/15 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}
