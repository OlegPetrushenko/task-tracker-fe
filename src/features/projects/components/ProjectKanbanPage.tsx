import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
    fetchColumns,
    selectColumnsByProject,
    selectColumnsLoading,
    moveTask,
    createTaskThunk,
    updateTaskInStore,
    createColumn,
} from "../../kanban/slice/kanbanSlice";
import { selectProjects } from "../../projects/slice/projectsSlice";
import type { ColumnDto } from "../../kanban/types";
import type { TaskDto, CreateTaskDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";
import type { MoveTaskDto } from "../../tasks/services/api";
import { Plus } from "lucide-react";
import { KanbanColumn } from "../../kanban/components/KanbanColumn";
import { TaskModal } from "../../kanban/components/TaskModal";

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

    const handleDragOverTaskColumn = (
        columnId: string,
        mouseY: number,
        currentTasks: TaskDto[]
    ) => {
        if (!columnId || mouseY === -1) {
            setTargetColumnDropId(null);
            setTargetTaskDropIndex(null);
            return;
        }

        setTargetColumnDropId(columnId);

        const taskListElement = document.getElementById(`task-list-${columnId}`);
        let insertionIndex: number = currentTasks.length;

        if (taskListElement && draggedTaskId) {
            const taskElements = Array.from(
                taskListElement.querySelectorAll<HTMLElement>("[data-task-id]")
            ).filter((el) => el.getAttribute("data-task-id") !== draggedTaskId);

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
        setTargetTaskDropIndex(insertionIndex);
    };

    const handleDropTask = (
        taskId: string,
        sourceColumnId: string,
        targetColumnId: string,
        tasksInTarget: TaskDto[]
    ) => {
        if (!projectId) return;

        const insertionIndex = targetTaskDropIndex ?? tasksInTarget.length;

        if (targetTaskDropIndex === null) {
            console.warn("Dropped without targetTaskDropIndex set. Using end position.");
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
        // dispatch(fetchColumns(projectId!));
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
    };

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
                <p>Please sign in to your account</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 min-h-screen bg-gray-50 font-[Inter] overflow-hidden">
            <h1 className="text-3xl font-extrabold mb-4 text-gray-800 text-center">
                {currentProject ? `Project: ${currentProject.title}` : "Project"}
            </h1>

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
                            onTaskClick={handleTaskClick}
                            draggedTaskId={draggedTaskId}
                            targetTaskDropIndex={targetTaskDropIndex}
                            onAddTask={handleAddTask}
                            targetColumnDropId={targetColumnDropId}
                            onDragOverTask={handleDragOverTaskColumn}
                            setDraggedTaskId={setDraggedTaskId}
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
