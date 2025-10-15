import React, { useEffect, useMemo, useState } from "react";
import type { TaskDto, TaskStatus } from "../types";
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
        const id = setInterval(() => setNow(Date.now()), 30_000);
        return () => clearInterval(id);
    }, []);

    const dueMs = useMemo(() => (task.dueDate ? Date.parse(task.dueDate) - now : Infinity), [task.dueDate, now]);
    const remainingText = formatRemaining(dueMs);
    
    const colorClass = useMemo(() => {
        if (task.status === "DONE") return "bg-green-100 border-green-400";
        if (task.status === "IN_PROGRESS") return "bg-blue-100 border-blue-400";
        if (!isFinite(dueMs)) return "bg-slate-100 border-slate-300";
        const hours = dueMs / (1000 * 3600);
        if (hours <= 0) return "bg-red-100 border-red-400";
        if (hours <= 1) return "bg-red-100 border-red-400";
        if (hours <= 6) return "bg-orange-100 border-orange-400";
        if (hours <= 24) return "bg-yellow-100 border-yellow-400";
        return "bg-gray-100 border-gray-300"; // Default for TODO
    }, [task.status, dueMs]);
    
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value as TaskStatus;
        try {
            await dispatch(updateTask({ 
                id: task.id, 
                dto: { ...task, status: newStatus, project: { id: projectId } } 
            })).unwrap();
        } catch (err) {
            console.error("Failed to update status:", err);
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
                    <h4 className="font-semibold">{task.title}</h4>
                    {task.description && <p className="text-sm text-gray-700 mt-1">{task.description}</p>}
                    <div className="text-xs text-gray-500 mt-2">
                        Created: {task.createdAt ? new Date(task.createdAt).toLocaleString() : "—"}
                    </div>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">{remainingText}</div>
                    {/* NEW: Status Dropdown */}
                    <div className="mt-2">
                        <select 
                            value={task.status} 
                            onChange={handleStatusChange}
                            onClick={(e) => e.stopPropagation()} // Prevents card click when changing status
                            className="text-xs border border-gray-400 rounded p-1"
                        >
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                        </select>
                    </div>
                    <div className="flex gap-2 mt-2 justify-end">
                        <button className="px-2 py-1 border rounded text-sm bg-white" onClick={() => onEdit?.(task)}>
                            Edit
                        </button>
                        <button className="px-2 py-1 border rounded text-sm text-red-600 bg-white" onClick={onDelete}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </article>
    );
}