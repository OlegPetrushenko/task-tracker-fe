import React, { useEffect, useMemo, useState } from "react";
import type { TaskDto } from "../types";
import { useAppDispatch } from "../../../app/hooks";
import { updateTask, deleteTask } from "../slice/tasksSlice";

type Props = {
  task: TaskDto;
  projectId: string;
  onEdit?: (t: TaskDto) => void;
};

function formatRemaining(ms: number) {
  if (ms <= 0) return "Due";
  const sec = Math.floor(ms / 1000);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export default function TaskCard({ task, projectId, onEdit }: Props) {
  const dispatch = useAppDispatch();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000); // обновляем каждые 30s
    return () => clearInterval(id);
  }, []);

  const dueMs = useMemo(() => (task.dueDate ? Date.parse(task.dueDate) - now : Infinity), [task.dueDate, now]);
  const remainingText = formatRemaining(dueMs);

  // color logic: completed -> green; else: >24h blue, <=24h yellow, <=6h orange, <=1h red, overdue red
  const colorClass = useMemo(() => {
    if (task.status === "DONE") return "bg-green-100 border-green-400";
    if (!isFinite(dueMs)) return "bg-slate-100 border-slate-300";
    const hours = dueMs / (1000 * 3600);
    if (hours <= 0) return "bg-red-100 border-red-400";
    if (hours <= 1) return "bg-red-100 border-red-400";
    if (hours <= 6) return "bg-orange-100 border-orange-400";
    if (hours <= 24) return "bg-yellow-100 border-yellow-400";
    return "bg-blue-100 border-blue-400";
  }, [task.status, dueMs]);

  const toggleComplete = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.checked) {
        await dispatch(updateTask({ id: task.id, dto: { ...task, status: "DONE" } })).unwrap();
      } else {
        await dispatch(updateTask({ id: task.id, dto: { ...task, status: "TODO" } })).unwrap();
      }
    } catch (err) {
      console.error("toggleComplete err", err);
      // показать UI-ошибку при необходимости
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    try {
      await dispatch(deleteTask({ id: task.id, projectId })).unwrap();
    } catch (err) {
      console.error("delete err", err);
    }
  };

  return (
    <article className={`border p-3 rounded mb-3 ${colorClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={task.status === "DONE"} onChange={toggleComplete} />
            <h4 className="font-semibold">{task.title}</h4>
          </div>
          {task.description && <p className="text-sm text-gray-700 mt-1">{task.description}</p>}
          <div className="text-xs text-gray-500 mt-2">
            created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
            {task.status === "DONE" && task.dueDate && <span> • completed</span>}
          </div>
        </div>

        <div className="text-right">
          <div className="text-sm font-medium">{remainingText}</div>
          <div className="flex gap-2 mt-2">
            <button className="px-2 py-1 border rounded text-sm" onClick={() => onEdit?.(task)}>
              Edit
            </button>
            <button className="px-2 py-1 border rounded text-sm text-red-600" onClick={onDelete}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
