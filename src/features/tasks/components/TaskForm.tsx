import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch } from "../../../app/hooks";
import { createTask, updateTask } from "../slice/tasksSlice";
import type { TaskDto, CreateTaskDto } from "../types";

type Props = {
  projectId: string;
  initial?: Partial<TaskDto>;
  onSaved?: () => void;
  onCancel?: () => void;
};

export default function TaskForm({ projectId, initial, onSaved, onCancel }: Props) {
  const dispatch = useAppDispatch();
  const isEdit = Boolean(initial?.id);

  const formik = useFormik({
    initialValues: {
      title: initial?.title || "",
      description: initial?.description || "",
      dueDate:  "2025-10-01T15:00:00", // for datetime-local
      // dueDate: initial?.dueDate ? initial.dueDate.slice(0, 16) : "", // for datetime-local
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Title is required"),
    }),
  onSubmit: async (values) => {
    try {
   
      const dto: CreateTaskDto = {
        title: values.title,
        description: values.description,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        project: { id: projectId },
        status: initial?.status || "TODO", 
      };

      if (isEdit && initial?.id) {
        const updateDto: Partial<TaskDto> = {
            title: values.title,
            description: values.description,
            dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
            status: initial.status || "TODO",
        }
        await dispatch(updateTask({ id: initial.id as string, projectId, dto: updateDto })).unwrap();
      } else {
        await dispatch(createTask({ projectId, dto })).unwrap();
      }
      onSaved?.();
    } catch (err) {
      console.error("save task error", err);
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
        {formik.touched.title && formik.errors.title && <div className="text-red-600 text-sm">{formik.errors.title}</div>}
      </div>
      <div className="mb-2">
        <textarea placeholder="Description" {...formik.getFieldProps("description")} className="w-full border px-2 py-1 rounded" />
      </div>
      <div className="mb-2">
        <label className="block text-xs text-gray-600">Due</label>
        <input type="datetime-local" {...formik.getFieldProps("dueDate")} className="w-full border px-2 py-1 rounded" />
      </div>
      <div className="flex gap-2">
        <button type="submit" className="px-3 py-1 bg-black text-white rounded">
          {isEdit ? "Save" : "Create"}
        </button>
        <button type="button" className="px-3 py-1 border rounded" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
