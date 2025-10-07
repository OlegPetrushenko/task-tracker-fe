import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { getAllProjects, selectProjects, deleteProject } from "../slice/projectsSlice";

export default function ProjectsList() {
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(getAllProjects());
  }, [dispatch]);
  const projects = useAppSelector(selectProjects);
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
          <li key={project.id} className="p-4 border rounded-lg bg-white shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{project.title}</h3>
              <span className="text-sm text-gray-600">{project.description}</span>
            </div>
            {/* V-- ДОБАВЛЕНА КНОПКА --V */}
            <button 
              onClick={() => handleDelete(project.id, project.title)}
              className="px-3 py-1 border rounded text-sm text-red-600 hover:bg-red-50"
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