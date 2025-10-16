import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectProjects, getAllProjects } from "../features/projects/slice/projectsSlice";
import { getTasksByProject, selectTasksByProject } from "../features/tasks/slice/tasksSlice";
import TaskCard from "../features/tasks/components/TaskCard";
import TaskForm from "../features/tasks/components/TaskForm";
import type { TaskDto, TaskStatus } from "../features/tasks/types";
import type { Project } from "../features/projects/types";
type SortByType = "title-asc" | "title-desc" | "due-asc" | "due-desc";

export default function TasksPage() {
    const dispatch = useAppDispatch();
    const projects = useAppSelector(selectProjects);
    const tasksByProject = useAppSelector(selectTasksByProject);

    // STATE for UI controls
    const [openProject, setOpenProject] = useState<string | null>(null);
    const [creatingFor, setCreatingFor] = useState<string | null>(null);
    const [editingTask, setEditingTask] = useState<TaskDto | null>(null);

    // STATE for search, filter, and sort
    const [searchTerm, setSearchTerm] = useState("");
    const [searchMode, setSearchMode] = useState<"project" | "task">("project");
    const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
    const [sortBy, setSortBy] = useState<SortByType>("title-asc");

    

    useEffect(() => {
        dispatch(getAllProjects());
    }, [dispatch]);

    useEffect(() => {
  if (!projects || projects.length === 0) return;
  // Опция A: загрузить задачи для ВСЕХ проектов (подходит для небольшого числа проектов)
  projects.forEach(p => {
    // избегаем лишних запросов: можно проверить, есть ли уже state.tasksByProject[p.id]
    dispatch(getTasksByProject(p.id));
  });

  // Опция B (оптимизировано): только для первого проекта
  // dispatch(getTasksByProject(projects[0].id));
}, [projects, dispatch]);

    const onToggle = (projectId: string) => {
        if (openProject === projectId) {
            setOpenProject(null);
            return;
        }
        setOpenProject(projectId);
        if (!tasksByProject[projectId]) {
            dispatch(getTasksByProject(projectId));
        }
    };
    
    // LOGIC: Filtering and Sorting Projects/Tasks
    const filteredAndSortedProjects = useMemo(() => {
        let processedProjects = [...projects];

        // 1. Searching
        if (searchTerm) {
            const lowerSearchTerm = searchTerm.toLowerCase();
            if (searchMode === 'project') {
                processedProjects = processedProjects.filter(p => 
                    p.title.toLowerCase().includes(lowerSearchTerm)
                );
            } else { // searchMode === 'task'
                processedProjects = processedProjects.filter(p => {
                    const tasks = tasksByProject[p.id] || [];
                    return tasks.some(t => t.title.toLowerCase().includes(lowerSearchTerm));
                });
            }
        }
        
        // 2. Sorting Projects
        processedProjects.sort((a, b) => a.title.localeCompare(b.title));

        return processedProjects;

    }, [projects, searchTerm, searchMode, tasksByProject]);
    
    // LOGIC: Filtering and Sorting Tasks within a project
    const getVisibleTasks = (projectId: string) => {
        let tasks = tasksByProject[projectId] || [];
        const lowerSearchTerm = searchTerm.toLowerCase();

        // 1. Filter by Status
        if (statusFilter !== 'ALL') {
            tasks = tasks.filter(t => t.status === statusFilter);
        }

        // 2. Filter by Search Term (if in task mode)
        if (searchMode === 'task' && searchTerm) {
             tasks = tasks.filter(t => t.title.toLowerCase().includes(lowerSearchTerm));
        }

        // 3. Sort Tasks
        const sortedTasks = [...tasks].sort((a, b) => { 
            switch (sortBy) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'due-asc':
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                case 'due-desc':
                     if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
                default:
                    return 0;
            }
        });
        
        return sortedTasks;
    };


    return (
        <div>
            <h1 className="text-2xl font-semibold mb-4">Tasks Dashboard</h1>
            
            {/* CONTROLS: Search, Filter, Sort */}
            <div className="p-4 mb-4 bg-gray-100 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Search</label>
                    <div className="flex">
                        <input 
                            type="text"
                            placeholder={searchMode === 'project' ? "Search projects..." : "Search tasks..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="flex-grow p-2 border border-gray-300 rounded-l-md"
                        />
                        <select 
                            value={searchMode} 
                            onChange={e => setSearchMode(e.target.value as "project" | "task")}
                            className="p-2 border-t border-b border-r border-gray-300 rounded-r-md bg-white"
                        >
                            <option value="project">by Project</option>
                            <option value="task">by Task</option>
                        </select>
                    </div>
                </div>
                {/* Filter by Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status Filter</label>
                    <select 
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value as TaskStatus | 'ALL')}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                    </select>
                </div>
                 {/* Sort By */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Sort Tasks By</label>
                     <select 
                        value={sortBy}
                        // ✅ 3. UPDATE THE HANDLER WITH THE CORRECT TYPE ASSERTION
                        onChange={e => setSortBy(e.target.value as SortByType)}
                        className="w-full p-2 border border-gray-300 rounded-md bg-white"
                    >
                        <option value="title-asc">Title (A-Z)</option>
                        <option value="title-desc">Title (Z-A)</option>
                        <option value="due-asc">Due Date (Soonest)</option>
                        <option value="due-desc">Due Date (Latest)</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {filteredAndSortedProjects.map((p: Project) => {
                    const visibleTasks = getVisibleTasks(p.id);
                    const isOpen = openProject === p.id || (searchMode === 'task' && searchTerm.length > 0 && visibleTasks.length > 0);
                    
                    return (
                        <section key={p.id} className="border rounded bg-white p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <button className="font-medium text-left text-lg" onClick={() => onToggle(p.id)}>
                                        {p.title}
                                    </button>
                                    <div className="text-xs text-gray-500">{visibleTasks.length} task(s) visible</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setCreatingFor(p.id)} className="px-2 py-1 border rounded bg-black text-white hover:bg-gray-800">
                                        + Add Task
                                    </button>
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
                                <div className="mt-3 border-t pt-3">
                                    {visibleTasks.length === 0 && <div className="text-sm text-gray-500">No matching tasks found.</div>}
                                    {visibleTasks.map((t: TaskDto) => (
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
                 {filteredAndSortedProjects.length === 0 && searchTerm && (
                    <div className="text-center p-6 bg-white rounded-lg border">
                        <p className="text-gray-600">No projects match your search criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
}