import { createAppSlice } from "../../../app/createAppSlice";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";
import type { TaskDto, CreateTaskDto } from "../types"; // ✅ вот эта строка


type TasksState = {
  tasksByProject: Record<string, TaskDto[]>;
  isLoading: boolean;
  error?: string | null;
};

const initialState: TasksState = {
  tasksByProject: {},
  isLoading: false,
  error: null,
};

export const tasksSlice = createAppSlice({
  name: "tasks",
  initialState,
  reducers: (create) => ({
    getTasksByProject: create.asyncThunk(
      async (projectId: string) => {
        return api.fetchTasksByProject(projectId).catch((err: AxiosError<{ message?: string }>) => {
          throw new Error(err.response?.data?.message || "Failed to load tasks");
        });
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.tasksByProject[action.meta.arg] = action.payload;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      }
    ),

    createTask: create.asyncThunk(
        async (payload: { projectId: string; dto: Partial<TaskDto> }) => {
    // Преобразуем dto в CreateTaskDto, добавив обязательное поле project
     const dto: CreateTaskDto = {
      ...(payload.dto as CreateTaskDto),
      project: { id: payload.projectId },
    };

    return api.createTask(dto).catch((err) => {
      if (isAxiosError(err)) throw new Error(err.response?.data?.message || "Failed to create");
      throw err;
    });
  },
  {
    pending: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fulfilled: (state, action) => {
      state.isLoading = false;
      const proj = action.meta.arg.projectId;
      state.tasksByProject[proj] = [...(state.tasksByProject[proj] || []), action.payload];
    },
    rejected: (state, action) => {
      state.isLoading = false;
      state.error = action.error.message;
    },
  }
),


    updateTask: create.asyncThunk(
      async (payload: { id: string; projectId?: string; dto: Partial<TaskDto> }) => {
        return api.updateTask(payload.id, payload.dto).catch((err) => {
          if (isAxiosError(err)) throw new Error(err.response?.data?.message || "Failed to update");
          throw err;
        });
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          const updated: TaskDto = action.payload;
          const projId = updated.project?.id ?? action.meta.arg.projectId;
          if (!projId) return;
          state.tasksByProject[projId] = (state.tasksByProject[projId] || []).map((t) =>
            t.id === updated.id ? updated : t
          );
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      }
    ),

    deleteTask: create.asyncThunk(
      async (payload: { id: string; projectId: string }) => {
        await api.deleteTask(payload.id);
        return payload;
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.error = null;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          const { id, projectId } = action.payload;
          state.tasksByProject[projectId] = (state.tasksByProject[projectId] || []).filter((t) => t.id !== id);
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
        },
      }
    ),
  }),

  selectors: {
    selectTasksByProject: (state) => state.tasksByProject,
    selectTasksLoading: (state) => state.isLoading,
    selectTasksError: (state) => state.error,
  },
});

export const { getTasksByProject, createTask, updateTask, deleteTask } = tasksSlice.actions;
export const { selectTasksByProject, selectTasksLoading, selectTasksError } = tasksSlice.selectors;
