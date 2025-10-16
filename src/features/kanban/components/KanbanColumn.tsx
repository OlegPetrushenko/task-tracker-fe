import React, { useRef, useMemo } from "react";
import { EllipsisVertical, Plus } from "lucide-react";
import { KanbanTaskCard } from "./KanbanTaskCard";
import { TargetDropIndicator } from "./TargetDropIndicator";
import type { ColumnDto } from "../../kanban/types";
import type { TaskDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../projects/types";

type OwnerDto = ProjectWithColumnsResponse["owner"];

interface KanbanColumnProps {
    column: ColumnDto;
    projectOwner: OwnerDto | undefined;
    onDropTask: (
        taskId: string,
        sourceColumnId: string,
        targetColumnId: string,
        tasksInTarget: TaskDto[]
    ) => void;
    onTaskClick: (task: TaskDto) => void;
    draggedTaskId: string | null;
    targetTaskDropIndex: number | null;
    onAddTask: (columnId: string) => void;
    targetColumnDropId: string | null;
    onDragOverTask: (columnId: string, mouseY: number, currentTasks: TaskDto[]) => void;
    setDraggedTaskId: (taskId: string | null) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    column,
    projectOwner,
    onDropTask,
    onTaskClick,
    draggedTaskId,
    targetTaskDropIndex,
    onAddTask,
    targetColumnDropId,
    onDragOverTask,
    setDraggedTaskId,
}) => {
    const columnRef = useRef<HTMLDivElement>(null);

    const columnTasks = useMemo(
        () => [...(column.tasks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
        [column.tasks]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const isTaskDrag = e.dataTransfer.getData("isTaskDrag") === "true";
        if (isTaskDrag) {
            onDragOverTask(column.id, e.clientY, columnTasks);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const isTaskDrag = e.dataTransfer.getData("isTaskDrag") === "true";

        const taskId = e.dataTransfer.getData("taskId");
        const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
        const targetColumnId = column.id;
        const tasksInTarget = columnTasks;

        if (isTaskDrag && taskId && sourceColumnId) {
            onDropTask(taskId, sourceColumnId, targetColumnId, tasksInTarget);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        const isTaskDrag = e.dataTransfer.getData("isTaskDrag") === "true";
        if (isTaskDrag) {
            onDragOverTask(column.id, e.clientY, columnTasks);
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        if (e.clientY < rect.top || e.clientY > rect.bottom) {
            onDragOverTask("", -1, columnTasks);
        }
    };

    const columnHighlightClass =
        targetColumnDropId === column.id ? "ring-4 ring-green-500 ring-offset-2" : "";
    const isTargetColumn = targetColumnDropId === column.id;

    return (
        <div
            ref={columnRef}
            key={column.id}
            className={`bg-gray-100 p-3 rounded-xl shadow-md min-h-96 flex flex-col max-h-[90vh] transition-all duration-200 ${columnHighlightClass}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
        >
            <div className="flex justify-between items-center mb-3 p-1">
                <h2 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    {column.title}{" "}
                    <span className="text-gray-500 font-normal">({columnTasks.length})</span>
                </h2>
                <button title="Manage column" className="p-1 rounded hover:bg-gray-200 transition">
                    <EllipsisVertical className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto space-y-3 pr-1" id={`task-list-${column.id}`}>
                {columnTasks.length === 0 && (
                    <div className="text-sm text-gray-500 p-2 italic text-center">No tasks</div>
                )}

                {columnTasks.length === 0 && isTargetColumn && <TargetDropIndicator />}

                {columnTasks.map((task: TaskDto, index: number) => (
                    <React.Fragment key={task.id}>
                        {isTargetColumn &&
                            draggedTaskId !== task.id &&
                            index === targetTaskDropIndex && <TargetDropIndicator />}

                        <KanbanTaskCard
                            task={task}
                            projectOwner={projectOwner}
                            currentColumnId={column.id}
                            onClick={onTaskClick}
                            setDraggedTaskId={setDraggedTaskId}
                        />
                    </React.Fragment>
                ))}

                {isTargetColumn && targetTaskDropIndex === columnTasks.length && (
                    <TargetDropIndicator />
                )}

                <button
                    onClick={() => onAddTask(column.id)}
                    className="w-full text-left p-3 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-lg transition duration-150 flex items-center"
                >
                    <Plus className="h-5 w-5 mr-1" />
                    Add Task
                </button>
            </div>
        </div>
    );
};
