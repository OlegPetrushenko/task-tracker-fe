import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getAllProjects, selectProjects, deleteProject } from "../slice/projectsSlice";
import { getTasksByProject, selectTasksByProject } from "../../tasks/slice/tasksSlice";
import { useNavigate } from "react-router-dom";

export default function ProjectsList() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const projects = useAppSelector(selectProjects);
  const tasksByProject = useAppSelector(selectTasksByProject);

  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);

  useEffect(() => {
    if (projects?.length) {
      projects.forEach((p) => dispatch(getTasksByProject(p.id)));
    }
  }, [dispatch, projects]);

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete project "${title}"?`)) {
      dispatch(deleteProject(id));
    }
  };

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4 text-center">List of Projects</h2>
      <ul className="space-y-3 max-w-md mx-auto">
        {projects?.map((project) => (
          <li 
            key={project.id} 
            onClick={() => navigate(`/project/${project.id}/kanban`)}
            className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center hover:bg-gray-50 cursor-pointer transition"
          >
            <div className="flex-1">
              <h3 className="font-semibold">{project.title}</h3>
              <span className="text-sm text-gray-600">
                {project.description}
              </span>
              <br />
              <span className="text-xs text-gray-500">
                Tasks: {tasksByProject[project.id]?.length ?? 0}
              </span>
            </div>
            {/* V-- ДОБАВЛЕНА КНОПКА --V */}
            <button 
              onClick={(e) => {
                e.stopPropagation(); // предотвращает переход по клику на Delete
                handleDelete(project.id, project.title);
              }}
              className="ml-4 px-3 py-1 border border-red-300 rounded text-sm text-red-600 hover:bg-red-100 hover:font-semibold transition cursor-pointer"
            >
              Delete
            </button>
            {/* A-- ДОБАВЛЕНА КНОПКА --A */}
          </li>
        ))}
      </ul>
    </section>
  );
}
