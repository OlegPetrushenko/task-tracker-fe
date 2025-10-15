import { useParams } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { fetchColumns, selectColumnsByProject, selectColumnsLoading } from "../../columns/slice/columnsSlice";
import { selectProjects } from "../../projects/slice/projectsSlice";
import type { ColumnDto } from "../../columns/types";
import type { TaskDto, ExecutorDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";

const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString("ru-RU", {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
};

type OwnerDto = ProjectWithColumnsResponse['owner'];

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

  const projectOwner = (currentProject as unknown as ProjectWithColumnsResponse)?.owner;

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

      {/* Адаптивная сетка для колонок */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[...columns]
          .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
          .map((column: ColumnDto) => {
            const columnTasks = column.tasks || [];

          return (
            <div 
                key={column.id} 
                className="bg-gray-100 p-3 rounded-lg shadow-md min-h-96 flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-3 p-1">
                <h2 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis">
                  {column.title} <span className="text-gray-500 font-normal">({columnTasks.length})</span>
                </h2>
              </div>
              
              <div className="flex-grow overflow-y-auto space-y-3 pr-1">
                {columnTasks.length === 0 && (
                  <div className="text-sm text-gray-500 p-2 italic text-center">No tasks</div>
                )}

                {[...columnTasks]
                  .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                  .map((task: TaskDto) => {
                    const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                    return (
                        <div 
                            key={task.id || task.position} 
                            className="bg-white p-3 rounded-lg shadow-sm border cursor-pointer hover:border-blue-500 transition"
                        >
                          <h3 className="font-medium mb-2 text-base">{task.title}</h3>
                          
                          {/* ОТОБРАЖЕНИЕ КЛЮЧЕВОЙ ИНФОРМАЦИИ */}
                          <div className="text-xs space-y-1">
                            {/* ИСПОЛНИТЕЛЬ/ВЛАДЕЛЕЦ */}
                            <p className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Assignee:</span> 
                                {/* Передаем данные о владельце */}
                                <TaskExecutors 
                                    executors={task.executors} 
                                    projectOwner={projectOwner}
                                />
                            </p>
                            
                            {/* СРОК (dueDate) */}
                            <p className="flex justify-between items-center">
                                <span className="font-medium text-gray-500">Due Date:</span> 
                                {task.dueDate ? (
                                    <span className={isOverdue ? 'text-red-600 font-bold' : 'text-green-600 font-medium'}>
                                        {formatDate(task.dueDate)}
                                    </span>
                                ) : (
                                    <span className="text-gray-400">N/A</span>
                                )}
                            </p>
                          </div>
                          
                        </div>
                    );
                  })}
                </div>
              </div>
          );
        })}
      </div>
    </div>
  );
}
