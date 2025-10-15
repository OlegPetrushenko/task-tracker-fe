import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { createTask, updateTask } from "../slice/tasksSlice";
import { selectColumnsByProject } from "../../columns/slice/columnsSlice";
import type { TaskDto } from "../types";

type Props = {
  projectId: string;
  initial?: Partial<TaskDto>;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function TaskForm({ projectId, initial, onSaved, onCancel }: Props) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?.id);

  // колонки проекта из стора
  const columnsByProject = useAppSelector(selectColumnsByProject);
  const projectColumns = columnsByProject[projectId] || [];

  // helper для поиска колонки по статусу
  const findColumnForStatus = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === "todo" || lower === "to_do" || lower === "to do") {
      return projectColumns.find((c) => c.title.toLowerCase() === "to do");
    }
    if (lower === "in_progress" || lower === "in progress") {
      return projectColumns.find((c) => c.title.toLowerCase() === "in progress");
    }
    if (lower === "done") {
      return projectColumns.find((c) => c.title.toLowerCase() === "done");
    }
    return projectColumns.find((c) => c.title.toLowerCase() === lower);
  };

  const formik = useFormik({
    initialValues: {
      title: initial?.title || "",
      description: initial?.description || "",
      dueDate: initial?.dueDate ? initial.dueDate.slice(0, 16) : "",
      status: initial?.status || "TODO",
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        // === СОЗДАНИЕ ===
        if (!isEdit) {
          // находим колонку "To Do"
          const todoColumn = findColumnForStatus("TODO");

          if (!todoColumn) {
            // если колонки не загружены или отсутствует To Do
            alert("Колонка 'To Do' не найдена для проекта. Проверьте колонки.");
            setSubmitting(false);
            return;
          }

          const dto: Partial<TaskDto> = {
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            project: { id: projectId },
            column: { id: todoColumn.id, title: todoColumn.title || "To Do" }, // гарантируем title
            position: 1,
            dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
            status: "TODO",
          };

          await dispatch(
            createTask({ projectId, columnId: todoColumn.id, dto })
          ).unwrap();

          onSaved?.();
          setSubmitting(false);
          return;
        }

        // === ОБНОВЛЕНИЕ ===
        if (isEdit && initial?.id) {
          const newStatus = values.status;
          const targetColumn = findColumnForStatus(newStatus);

          const updateDto: Partial<TaskDto> = {
            title: values.title.trim(),
            description: values.description?.trim() || undefined,
            dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
            status: newStatus as TaskDto["status"],
            project: { id: projectId },
          };

          if (targetColumn) {
            updateDto.column = {
              id: targetColumn.id,
              title: targetColumn.title || "To Do", // добавили title
            };
          }

          await dispatch(
            updateTask({ id: initial.id as string, projectId, dto: updateDto })
          ).unwrap();

          onSaved?.();
          setSubmitting(false);
        }
      } catch (err: unknown) {
        console.error("save task error", err);

        let msg = "Ошибка при сохранении задачи";
        if (err instanceof Error) msg = err.message;
        alert(msg);
        setSubmitting(false);
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="p-3 border rounded bg-white mb-3">
      <div className="mb-2">
        <input
          placeholder="Title"
          {...formik.getFieldProps("title")}
          className="w-full border px-2 py-1 rounded"
        />
        {formik.touched.title && formik.errors.title && (
          <div className="text-red-600 text-sm">{formik.errors.title}</div>
        )}
      </div>

      <div className="mb-2">
        <textarea
          placeholder="Description"
          {...formik.getFieldProps("description")}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      <div className="mb-2">
        <label className="block text-xs text-gray-600">Due date</label>
        <input
          type="datetime-local"
          {...formik.getFieldProps("dueDate")}
          className="w-full border px-2 py-1 rounded"
        />
      </div>

      {isEdit && (
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Status</label>
          <select
            {...formik.getFieldProps("status")}
            className="w-full border px-2 py-1 rounded"
          >
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className="px-3 py-1 bg-black text-white rounded"
        >
          {isEdit ? "Save" : "Create"}
        </button>
        <button type="button" className="px-3 py-1 border rounded" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
