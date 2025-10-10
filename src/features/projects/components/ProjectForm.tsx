import { useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  createProject,
  selectCreateProjectErrorMessage,
  selectProjects,
} from "../slice/projectsSlice";

const ProjectForm = () => {
  const dispatch = useAppDispatch();
  const projectError = useAppSelector(selectCreateProjectErrorMessage);
  const projects = useAppSelector(selectProjects);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const prevProjectCountRef = useRef(projects.length);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        await dispatch(createProject(values)).unwrap();
      } catch (error) {
        console.error("Project creation failed:", error);
        setIsSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (isSubmitting && projects.length > prevProjectCountRef.current) {
      formik.resetForm();
      setSuccessMessage("Project created successfully!");
      setIsSubmitting(false);
      prevProjectCountRef.current = projects.length;

      setTimeout(() => {
        setIsFormOpen(false);
        setSuccessMessage("");
      }, 1500);
    }
  }, [projects.length, isSubmitting, formik]);

  return (
    <div
      className={`mx-auto max-w-md p-3 mt-10 rounded-lg border bg-white shadow-sm transition-all ${
        isFormOpen ? "space-y-6" : "flex items-center justify-center min-h-[48px] cursor-pointer hover:bg-gray-50"
      }`}
      onClick={() => !isFormOpen && setIsFormOpen(true)}
    >
      {!isFormOpen ? (
        <span className="text-sm font-medium text-gray-700">
          ➕ Add New Project
        </span>
      ) : (
        <>
          <div className="space-y-2 text-center">
            {projectError && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {projectError}
              </div>
            )}
            {successMessage && (
              <div className="rounded-md bg-green-50 p-3 text-sm text-green-700 border border-green-200">
                {successMessage}
              </div>
            )}
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                id="title"
                type="text"
                {...formik.getFieldProps("title")}
                className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
                  formik.touched.title && formik.errors.title
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input"
                }`}
                placeholder="Enter a title for the new project"
              />
              {formik.touched.title && formik.errors.title && (
                <p className="text-sm text-red-500">{formik.errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                {...formik.getFieldProps("description")}
                className={`w-full px-3 py-2 text-sm border rounded-md shadow-sm transition placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring ${
                  formik.touched.description && formik.errors.description
                    ? "border-red-500 focus:ring-red-500"
                    : "border-input"
                }`}
                placeholder="Enter a description for the new project"
                rows={4}
              />
              {formik.touched.description && formik.errors.description && (
                <p className="text-sm text-red-500">
                  {formik.errors.description}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex justify-between gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {isSubmitting ? "Creating..." : "Create Project"}
              </button>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ProjectForm;
