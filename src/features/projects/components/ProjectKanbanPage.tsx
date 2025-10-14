import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchColumns, selectColumnsByProject, selectColumnsLoading } from "../../columns/slice/columnsSlice";
import { selectProjects } from "../../projects/slice/projectsSlice";
import type { ColumnDto } from "../../columns/types";
import type { TaskDto } from "../../tasks/types";

export default function ProjectKanbanPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);

  const columns = useAppSelector((state) => {
    if (!projectId) return [];
    return selectColumnsByProject(state)[projectId] as ColumnDto[] || [];
  });

  const isLoading = useAppSelector(selectColumnsLoading);
  const currentProject = projects.find((p) => p.id === projectId);

  useEffect(() => {
    if (projectId) {
      dispatch(fetchColumns(projectId));
    }
  }, [dispatch, projectId]);

  if (!projectId) return <div className="p-4 text-red-500">No project selected</div>;
  if (isLoading) return <div className="p-4 text-center text-lg text-blue-500">Loading kanban board...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {currentProject ? `Project: ${currentProject.title}` : "Project"}
      </h1>

      <div className="grid grid-cols-3 gap-4">
        {[...columns]
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map((column: ColumnDto) => {
            const columnTasks = column.tasks || [];

          return (
            <div key={column.id} className="bg-gray-100 p-4 rounded shadow min-h-96 flex flex-col">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold">
                  {column.title} ({columnTasks.length})
                </h2>
                {/* Здесь можно добавить кнопки rename/delete */}
              </div>
              <div className="flex-grow overflow-y-auto">
                {columnTasks.length === 0 && (
                  <div className="text-sm text-gray-500 p-2 italic">No tasks</div>
                )}

                {[...columnTasks]
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((task: TaskDto) => (
                    <div key={task.title + (task.id || task.position)} className="bg-white p-3 rounded shadow mb-3 border cursor-pointer hover:border-blue-400 transition">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-600 truncate">{task.description}</p>
                    </div>
                  ))}
                </div>
              </div>
          );
        })}
      </div>
    </div>
  );
}
