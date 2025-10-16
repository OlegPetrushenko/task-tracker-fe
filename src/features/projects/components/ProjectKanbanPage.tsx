import { useParams } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    fetchColumns,
    selectColumnsByProject,
    selectColumnsLoading,
    moveTask,
    createTaskThunk,
    updateTaskInStore,
    createColumn,
} from "../../columns/slice/columnsSlice";
import { selectProjects } from "../../projects/slice/projectsSlice";
import type { ColumnDto } from "../../columns/types";
import type { TaskDto, ExecutorDto, CreateTaskDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";
import type { MoveTaskDto } from "../../tasks/services/api";
import { EllipsisVertical, Plus } from "lucide-react";

interface TaskModalProps {
    task: TaskDto | null;
    onClose: () => void;
    onUpdate: (task: TaskDto) => void;
}
const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdate }) => {
    if (!task) return null;
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);

    const handleSave = () => {
        const updatedTask: TaskDto = { ...task, title: title }; // const result = await taskApi.updateTask(task.id, { title: title });
        onUpdate(updatedTask);
        setIsEditing(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-xl font-bold mb-4">{task.title} (Task View/Edit)</h2>
                {isEditing ? (
                    <div>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 w-full mb-4"
                        />
                        <button
                            onClick={handleSave}
                            className="bg-blue-500 text-white p-2 rounded mr-2"
                        >
                            Save
                        </button>
                    </div>
                ) : (
                    <div>
                        <p className="mb-4">Description: {task.description || "N/A"}</p>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-yellow-500 text-white p-2 rounded mr-2"
                        >
                            Edit
                        </button>
                    </div>
                )}
                <button onClick={onClose} className="bg-gray-500 text-white p-2 rounded">
                    Close
                </button>
            </div>
        </div>
    );
};

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
    isTarget: boolean; 
    onClick: (task: TaskDto) => void; 
}

const KanbanTaskCard: React.FC<KanbanTaskCardProps> = ({
    task,
    projectOwner,
    currentColumnId,
    isTarget,
    onClick,
}) => {
    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
    const targetClass = isTarget
        ? "border-4 border-dashed border-blue-600 ring-2 ring-blue-600 bg-blue-50"
        : "";

    return (
        <div
            key={task.id}
            className={`bg-white p-3 rounded-lg shadow-sm border cursor-grab hover:border-blue-500 transition active:cursor-grabbing mb-3 ${targetClass}`}
            draggable
            onClick={() => onClick(task)}
            onDragStart={(e) => {
                e.dataTransfer.setData("taskId", task.id);
                e.dataTransfer.setData("isTaskDrag", "true");
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
    onTaskClick: (task: TaskDto) => void; 
    draggedTaskId: string | null; 
    targetTaskDropIndex: number | null;
    onAddTask: (columnId: string) => void;
    targetColumnDropId: string | null;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
    column,
    projectOwner,
    onDropTask,
    onTaskClick,
    draggedTaskId,
    targetTaskDropIndex,
    onAddTask,
    targetColumnDropId,
}) => {
    const columnRef = useRef<HTMLDivElement>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    // const [isTaskDragOver, setIsTaskDragOver] = useState(false);

    const columnTasks = useMemo(
        () => [...(column.tasks || [])].sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
        [column.tasks]
    );

    const calculateDropIndex = (e: React.DragEvent, taskElements: HTMLElement[]): number => {
        const mouseY = e.clientY;
        for (let i = 0; i < taskElements.length; i++) {
            const el = taskElements[i];
            const rect = el.getBoundingClientRect();
            const middleY = rect.top + rect.height / 2;
            if (mouseY < middleY) {
                return i;
            }
        }
        return taskElements.length; 
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const isTaskDrag = e.dataTransfer.getData("isTaskDrag") === "true"; 
        if (isTaskDrag) {
            // Логика для подсчета индекса и обновления стейта в родительском компоненте
        }
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const isTaskDrag = e.dataTransfer.getData("isTaskDrag") === "true";

        const taskId = e.dataTransfer.getData("taskId");
        const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
        const targetColumnId = column.id;
        const mouseY = e.clientY;

        if (isTaskDrag) {
            const taskId = e.dataTransfer.getData("taskId");
            const sourceColumnId = e.dataTransfer.getData("sourceColumnId");
            const targetColumnId = column.id;
            const mouseY = e.clientY;

            if (taskId && sourceColumnId) {
                const taskListElement = document.getElementById(`task-list-${targetColumnId}`);
                let insertionIndex = columnTasks.length; 

                if (taskListElement) {
                    const taskElements = Array.from(
                        taskListElement.querySelectorAll<HTMLElement>('[draggable="true"]')
                    );
                    const visibleTaskElements = taskElements.filter(
                        (el) => el.getAttribute("data-task-id") !== taskId
                    );
                    insertionIndex = calculateDropIndex(e, taskElements);
                } 

                onDropTask(taskId, sourceColumnId, targetColumnId, mouseY, columnTasks);
            }
        }
    };

    const columnHighlightClass =
        targetColumnDropId === column.id ? "ring-4 ring-green-500 ring-offset-2" : ""; 

    return (
        <div
            ref={columnRef}
            key={column.id}
            className={`bg-gray-100 p-3 rounded-xl shadow-md min-h-96 flex flex-col max-h-[90vh] transition-all duration-200 ${columnHighlightClass}`}
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
                {columnTasks.map((task: TaskDto, index: number) => (
                    <KanbanTaskCard
                        key={task.id}
                        task={task}
                        projectOwner={projectOwner}
                        currentColumnId={column.id}
                        onClick={onTaskClick}
                        isTarget={
                            draggedTaskId !== null &&
                            column.id === targetColumnDropId &&
                            index === targetTaskDropIndex
                        }
                    />
                ))}
                {/* Button "Add Task" */}
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

// --- Main Kanban Page Component ---

export default function ProjectKanbanPage() {
    const { projectId } = useParams<{ projectId: string }>();
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectProjects);

    const [selectedTask, setSelectedTask] = useState<TaskDto | null>(null); 
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null); 
    const [targetTaskDropIndex, setTargetTaskDropIndex] = useState<number | null>(null); 
    const [targetColumnDropId, setTargetColumnDropId] = useState<string | null>(null); 

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

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
        e.dataTransfer.setData("columnId", columnId); 
    };

    const handleDragEnterColumn = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
        if (e.dataTransfer.types.includes("taskId")) {
            setTargetColumnDropId(columnId); 
        } 
    };

    const handleDragLeaveColumn = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
        if (targetColumnDropId === columnId) {
            // setTargetColumnDropId(null); 
        }
    };

    const handleDropTask = (
        taskId: string,
        sourceColumnId: string,
        targetColumnId: string,
        mouseY: number,
        tasksInTarget: TaskDto[]
    ) => {
        if (!projectId) return;

        let insertionIndex = tasksInTarget.length;

        const taskListElement = document.getElementById(`task-list-${targetColumnId}`);
        if (taskListElement) {
            const taskElements = Array.from(
                taskListElement.querySelectorAll<HTMLElement>('[draggable="true"]')
            );

            insertionIndex = taskElements.length; 

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

        const moveDto: MoveTaskDto = { columnId: targetColumnId, position: insertionIndex };

        dispatch(moveTask({ projectId, taskId, dto: moveDto, sourceColumnId }));

        setDraggedTaskId(null);
        setTargetColumnDropId(null);
        setTargetTaskDropIndex(null);
    };

    const handleTaskClick = (task: TaskDto) => {
        setSelectedTask(task);
    }; 

    const handleTaskModalClose = () => {
        setSelectedTask(null);
    };

    const handleTaskUpdate = (updatedTask: TaskDto) => {
        dispatch(updateTaskInStore(updatedTask)); 
    }; 

    const handleAddTask = (columnId: string) => {
        if (!projectId) return;

        const taskToCreate: CreateTaskDto = {
            title: "New Task Title", 
            status: "TODO",
            project: { id: projectId },
            column: { id: columnId }, 
        }; 

        dispatch(createTaskThunk(taskToCreate as any)); 
    }

    const handleAddColumn = () => {
        if (!projectId) return; 
        dispatch(createColumn({ projectId, title: "New Column" }));
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
                        onDragEnter={(e) => handleDragEnterColumn(e, column.id)}
                        onDragLeave={(e) => handleDragLeaveColumn(e, column.id)}
                    >
                        <KanbanColumn
                            column={column}
                            projectOwner={projectOwner}
                            onDropTask={handleDropTask}
                            onTaskClick={handleTaskClick}
                            draggedTaskId={draggedTaskId}
                            targetTaskDropIndex={targetTaskDropIndex}
                            onAddTask={handleAddTask}
                            targetColumnDropId={targetColumnDropId}
                        />
                    </div>
                ))}
                <div className="flex-shrink-0 w-80 p-3">
                    <button
                        onClick={handleAddColumn}
                        className="w-full h-full bg-gray-200 border-2 border-dashed border-gray-400 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-300 transition duration-150"
                        title="Add new column"
                    >
                        <Plus className="h-6 w-6 mr-2" />
                        Add Column
                    </button>
                </div>
            </div>

            <TaskModal
                task={selectedTask}
                onClose={handleTaskModalClose}
                onUpdate={handleTaskUpdate}
            />
        </div>
    );
}
