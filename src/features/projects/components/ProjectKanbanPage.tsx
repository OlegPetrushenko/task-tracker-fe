import { useParams } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    fetchColumns,
    selectColumnsByProject,
    selectColumnsLoading,
    moveTask,
} from "../../columns/slice/columnsSlice";
import { selectProjects } from "../../projects/slice/projectsSlice";
import type { ColumnDto } from "../../columns/types";
import type { TaskDto, ExecutorDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";
import type { MoveTaskDto } from "../../tasks/services/api";
import { EllipsisVertical, Plus } from "lucide-react";

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    try {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    } catch {
        return dateString || "";
    }
};

type OwnerDto = ProjectWithColumnsResponse["owner"];

const TaskExecutors: React.FC<{
    executors: ExecutorDto[] | undefined;
    projectOwner: OwnerDto | undefined;
}> = ({ executors, projectOwner }) => {
    const hasExecutors = executors && executors.length > 0;

    if (hasExecutors) {
        const firstExecutor = executors[0];
        const restCount = executors.length - 1;

        return (
            <span className="text-gray-700 font-normal">
                {firstExecutor.fullName}
                {restCount > 0 && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                        +{restCount}
                    </span>
                )}
            </span>
        );
    }

    if (projectOwner) {
        return (
            <span className="text-orange-600 font-medium italic">
                {projectOwner.name || projectOwner.email} (Owner)
            </span>
        );
    }

    return <span className="text-gray-400 font-normal">Not assigned</span>;
};

interface KanbanTaskCardProps {
    task: TaskDto;
    projectOwner: OwnerDto | undefined;
    currentColumnId: string;
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({ task, projectOwner, currentColumnId }) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

    return (
        <div
            key={task.id}
            className="bg-white p-3 rounded-lg shadow-sm border cursor-grab hover:border-blue-500 transition active:cursor-grabbing"
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData("taskId", task.id);
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
                e.currentTarget.classList.remove(
                    "opacity-50",
                    "shadow-xl",
                    "ring-2",
                    "ring-blue-500"
                );
            }}
        >
            <h3 className="font-medium mb-2 text-base">{task.title}</h3>

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

// --- Column Component (Drop Target) ---

interface KanbanColumnProps {
    column: ColumnDto;
    projectOwner: OwnerDto | undefined;
    onDropTask: (
        taskId: string,
        sourceColumnId: string,
        targetColumnId: string,
        mouseY: number,
        tasksInTarget: TaskDto[]
    ) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, projectOwner, onDropTask }) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const columnTasks = useMemo(
        () => [...(column.tasks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
        [column.tasks]
    );

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (!isDragOver) setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const taskId = e.dataTransfer.getData("taskId");
        const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
        const targetColumnId = column.id;
        const mouseY = e.clientY;

        if (taskId && sourceColumnId) {
            onDropTask(taskId, sourceColumnId, targetColumnId, mouseY, columnTasks);
        }
    };

    return (
        <div
            ref={columnRef}
            key={column.id}
            className={`bg-gray-100 p-3 rounded-xl shadow-md min-h-96 flex flex-col max-h-[90vh] transition-all duration-200
                ${isDragOver ? "ring-4 ring-blue-500 ring-offset-2" : ""}
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* COLUMN HEADER */}
            <div className="flex justify-between items-center mb-3 p-1">
                <h2 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                    {column.title}{" "}
                    <span className="text-gray-500 font-normal">({columnTasks.length})</span>
                </h2>
                <button title="Manage column" className="p-1 rounded hover:bg-gray-200 transition">
                    <EllipsisVertical className="w-5 h-5 text-gray-500" />
                </button>
            </div>

            {/* TASK LIST */}
            <div className="flex-grow overflow-y-auto space-y-3 pr-1" id={`task-list-${column.id}`}>
                {columnTasks.length === 0 && (
                    <div className="text-sm text-gray-500 p-2 italic text-center">No tasks</div>
                )}
                {columnTasks.map((task: TaskDto) => (
                    <KanbanTaskCard
                        key={task.id}
                        task={task}
                        projectOwner={projectOwner}
                        currentColumnId={column.id}
                    />
                ))}
                {/* Button "Add Task" */}
                <button className="w-full text-left p-3 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-lg transition duration-150 flex items-center">
                    <Plus className="h-5 w-5 mr-1" />
                    Add Task
                </button>
            </div>
        </div>
    );
};

// --- Main Kanban Page Component ---

export default function ProjectKanbanPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectProjects);

    const columns = useAppSelector((state) => {
        if (!projectId) return [];
        return (selectColumnsByProject(state)[projectId] as ColumnDto[]) || [];
    });

    const isLoading = useAppSelector(selectColumnsLoading);
    const currentProject = projects.find((p) => p.id === projectId);

    const projectOwner = (currentProject as unknown as ProjectWithColumnsResponse)?.owner;

    useEffect(() => {
        if (projectId) {
            dispatch(fetchColumns(projectId));
        }
    }, [dispatch, projectId]);

    const sortedColumns = useMemo(
        () => [...columns].sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0)),
        [columns]
    );

    // --- Drag and Drop Logic ---

    const handleDropTask = (
        taskId: string,
        sourceColumnId: string,
        targetColumnId: string,
        mouseY: number,
        tasksInTarget: TaskDto[]
    ) => {
        // if (!projectId || sourceColumnId === targetColumnId) return;
        if (!projectId) return;

        let insertionIndex = tasksInTarget.length;

        if (tasksInTarget.length === 0) {
            insertionIndex = 0;
        } else {
            const taskListElement = document.getElementById(`task-list-${targetColumnId}`);
            if (taskListElement) {
                const taskElements = Array.from(
                    taskListElement.querySelectorAll<HTMLElement>('[draggable="true"]')
                );

                insertionIndex = taskElements.length; // По умолчанию в конец

                for (let i = 0; i < taskElements.length; i++) {
                    const el = taskElements[i];
                    const rect = el.getBoundingClientRect();
                    const middleY = rect.top + rect.height / 2;

                    if (mouseY < middleY) {
                        insertionIndex = i;
                        break;
                    }
                }
            }
        }

        const moveDto: MoveTaskDto = { columnId: targetColumnId, position: insertionIndex };

        dispatch(moveTask({ projectId, taskId, dto: moveDto }));
    };

    if (!projectId) return <div className="p-4 text-red-500">No project selected</div>;
    if (isLoading)
        return <div className="p-4 text-center text-lg text-blue-500">Loading kanban board...</div>;

    if (sortedColumns.length === 0 && !isLoading) {
        return (
            <div className="p-4 text-center text-lg text-gray-500">
                <h2 className="text-xl font-bold mb-4">Columns not found</h2>
                <p>Add the first column to start working with the project</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-50 font-[Inter] overflow-hidden">
            <h1 className="text-3xl font-extrabold mb-4 text-gray-800 text-center">
                {currentProject ? `Project: ${currentProject.title}` : "Project"}
            </h1>
            {/* Main container with horizontal scrolling */}
            <div className="flex overflow-x-auto space-x-4 pb-4 h-[calc(100vh-120px)] items-start">
                {sortedColumns.map((column: ColumnDto) => (
                    <div
                        key={column.id}
                        id={`column-${column.id}`}
                        className="flex-shrink-0 w-80 h-full"
                    >
                        <KanbanColumn
                            column={column}
                            projectOwner={projectOwner}
                            onDropTask={handleDropTask}
                        />
                    </div>
                ))}
                <div className="flex-shrink-0 w-80 p-3">
                    <button
                        // onClick={() => dispatch(createColumn({ projectId, title: "New column" }))}
                        className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-300 transition duration-150"
                        title="Add new column"
                    >
                        <Plus className="h-6 w-6 mr-2" />
                        Add Column
                    </button>
                </div>
            </div>
        </div>
    );
}
