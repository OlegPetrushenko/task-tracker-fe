import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectProjects, getAllProjects, deleteProject } from "../features/projects/slice/projectsSlice";
import { getTasksByProject, selectTasksByProject } from "../features/tasks/slice/tasksSlice";
import TaskCard from "../features/tasks/components/TaskCard";
import TaskForm from "../features/tasks/components/TaskForm";
import type { TaskDto } from "../features/tasks/types";
import type { Project } from "../features/projects/types";

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProjects);
  const tasksByProject = useAppSelector(selectTasksByProject);
  const [openProject, setOpenProject] = useState<string | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);

  const handleDeleteProject = (projectId: string, projectTitle: string) => {
    if (window.confirm(`Are you sure you want to delete project "${projectTitle}" and all its tasks?`)) {
      dispatch(deleteProject(projectId));
    }
  };

  useEffect(() => {
    dispatch(getAllProjects()); // load folders
  }, [dispatch]);

  const onToggle = (projectId: string) => {
    if (openProject === projectId) {
      setOpenProject(null);
      return;
    }
    setOpenProject(projectId);
    // fetch tasks for this project
    dispatch(getTasksByProject(projectId));
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Tasks / Folders</h1>

      <div className="space-y-4">
        {projects.map((p: Project) => {
          const tasks = tasksByProject[p.id] || [];
          const isOpen = openProject === p.id;
          return (
            <section key={p.id} className="border rounded bg-white p-3">
              <div className="flex items-center justify-between">
                <div>
                  <button className="font-medium text-left" onClick={() => onToggle(p.id)}>
                    {p.title}
                  </button>
                  <div className="text-xs text-gray-500">{tasks.length} task(s)</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setCreatingFor(p.id)} className="px-2 py-1 border rounded">
                    + Task
                  </button>
                  {/* V-- ВОТ ЭТА КНОПКА БЫЛА ДОБАВЛЕНА --V */}
                  <button
                    onClick={() => handleDeleteProject(p.id, p.title)}
                    className="px-2 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete Project
                  </button>
                  {/* A-- КОНЕЦ ДОБАВЛЕНИЯ --A */}
                </div>
              </div>

              {creatingFor === p.id && (
                <TaskForm
                  projectId={p.id}
                  onSaved={() => {
                    setCreatingFor(null);
                    dispatch(getTasksByProject(p.id));
                  }}
                  onCancel={() => setCreatingFor(null)}
                />
              )}

              {isOpen && (
                <div className="mt-3">
                  {tasks.length === 0 && <div className="text-sm text-gray-500">No tasks</div>}
                  {tasks.map((t: TaskDto) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      projectId={p.id}
                      onEdit={(task: TaskDto) => {
                        setEditingTask(task);
                        setCreatingFor(null);
                      }}
                    />
                  ))}
                  {editingTask && editingTask.project?.id === p.id && (
                    <TaskForm
                      projectId={p.id}
                      initial={editingTask}
                      onSaved={() => {
                        setEditingTask(null);
                        dispatch(getTasksByProject(p.id));
                      }}
                      onCancel={() => setEditingTask(null)}
                    />
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
