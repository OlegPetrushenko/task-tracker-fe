import React from "react";
import { formatDate } from "../../../utils/formatDate";
import { TaskExecutors } from "./TaskExecutors";
import type { TaskDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";

type OwnerDto = ProjectWithColumnsResponse["owner"];

interface KanbanTaskCardProps {
    task: TaskDto;
    projectOwner: OwnerDto | undefined;
    currentColumnId: string;
    onClick: (task: TaskDto) => void;
    setDraggedTaskId: (taskId: string | null) => void;
}

export const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
    task,
    projectOwner,
    currentColumnId,
    onClick,
    setDraggedTaskId,
}) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <div
            key={task.id}
            data-task-id={task.id}
            className={`bg-white p-3 rounded-lg shadow-sm border cursor-grab hover:border-blue-500 transition active:cursor-grabbing mb-3`}
            draggable
            onClick={() => {
                onClick(task);
            }}
            onDragStart={(e) => {
                e.dataTransfer.setData("taskId", task.id);
                e.dataTransfer.setData("isTaskDrag", "true");
                setDraggedTaskId(task.id);
                if (currentColumnId) {
                    e.dataTransfer.setData("sourceColumnId", currentColumnId);
                } else {
                    console.error("Task being dragged has no column assigned.");
                    e.preventDefault();
                    return;
                }
                e.currentTarget.classList.add("opacity-50", "shadow-xl", "ring-2", "ring-blue-500");
            }}
            onDragEnd={(e) => {
                setDraggedTaskId(null);
                e.currentTarget.classList.remove(
                    "opacity-50",
                    "shadow-xl",
                    "ring-2",
                    "ring-blue-500"
                );
            }}
        >
            <h3 className="font-medium mb-1 text-base">{task.title}</h3>

            {task.description && (
                <p className="text-xs text-gray-600 mb-2 truncate">{task.description}</p>
            )}

            <div className="text-xs space-y-1">
                <p className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">Assignee:</span>
                    <TaskExecutors executors={task.executors} projectOwner={projectOwner} />
                </p>

                <p className="flex justify-between items-center">
                    <span className="font-medium text-gray-500">Due Date:</span>
                    {task.dueDate ? (
                        <span
                            className={
                                isOverdue ? "text-red-600 font-bold" : "text-green-600 font-medium"
                            }
                        >
                            {formatDate(task.dueDate)}
                        </span>
                    ) : (
                        <span className="text-gray-400">N/A</span>
                    )}
                </p>
            </div>
        </div>
    );
};
