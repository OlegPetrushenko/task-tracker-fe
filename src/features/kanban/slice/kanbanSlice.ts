import { createAppSlice } from "../../../app/createAppSlice";
import * as api from "../services/api";
import * as taskApi from "../../tasks/services/api";
import type { ColumnDto } from "../types";
import type { TaskDto, CreateTaskDto } from "../../tasks/types";
import type { MoveTaskArgs } from "../../tasks/services/api";

type ColumnsState = {
  columnsByProject: Record<string, ColumnDto[]>;
  isLoading: boolean;
  columnActionError: string | null;
  taskActionError: string | null;
};

const initialState: ColumnsState = {
  columnsByProject: {},
  isLoading: false,
  columnActionError: null,
  taskActionError: null,
};

export const columnsSlice = createAppSlice({
  name: "columns",
  initialState,
  reducers: (create) => ({
    fetchColumns: create.asyncThunk(
      async (projectId: string) => {
        const response = await api.fetchColumns(projectId);
        return { projectId, columns: response.columns };
      },
      {
        pending: (state) => { state.isLoading = true; state.columnActionError = null; },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.columnsByProject[action.payload.projectId] = action.payload.columns;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.columnActionError = action.error.message || null;
        },
      }
    ),

    createColumn: create.asyncThunk(
      async ({ projectId, title }: { projectId: string; title: string }) => {
        return await api.createColumn(projectId, title);
      },
      {
        fulfilled: (state, action) => {
          const projId = action.payload.projectId;
          state.columnsByProject[projId] = [
            ...(state.columnsByProject[projId] || []),
            action.payload,
          ];
        },
      }
    ),

    createTaskThunk: create.asyncThunk(
      async (dto: CreateTaskDto) => taskApi.createTask(dto),
      {
        fulfilled: (state, action) => {
          const newTask = action.payload;
          const projId = newTask.project?.id;
          const targetColumnId = newTask.column?.id;
          if (projId && targetColumnId && state.columnsByProject[projId]) {
            const col = state.columnsByProject[projId].find(c => c.id === targetColumnId);
            if (col) {
              if (!col.tasks) col.tasks = [];
              col.tasks.push(newTask);
            }
          }
        },
      }
    ),

    updateTaskInStore: create.reducer((state, action: { payload: TaskDto }) => {
      const t = action.payload;
      const projId = t.project?.id;
      const targetColumnId = t.column?.id;
      if (projId && targetColumnId && state.columnsByProject[projId]) {
        state.columnsByProject[projId].forEach(col => {
          if (col.tasks) {
            const idx = col.tasks.findIndex(task => task.id === t.id);
            if (idx !== -1) col.tasks[idx] = t;
          }
        });
      }
    }),

    moveTask: create.asyncThunk(
      async ({ projectId, taskId, dto }: MoveTaskArgs, { rejectWithValue }) => {
        try {
          return await taskApi.moveTask(projectId, taskId, dto);
        } catch (err) {
          return rejectWithValue((err as Error).message || "Failed to move task");
        }
      },
      {
        pending: (state, action) => {
          const { projectId, taskId, dto, sourceColumnId } = action.meta.arg;
          const targetColumnId = dto.columnId;
          const newPos = dto.position;
          const cols = state.columnsByProject[projectId];
          if (!cols) return;

          let movedTask: TaskDto | undefined;
          cols.forEach(col => {
            if (col.tasks) {
              col.tasks = col.tasks.filter(task => {
                if (task.id === taskId) { movedTask = { ...task, column: { id: targetColumnId }, position: newPos }; return false; }
                return true;
              });
            }
          });

          if (movedTask) {
            const targetCol = cols.find(c => c.id === targetColumnId);
            if (targetCol) {
              if (!targetCol.tasks) targetCol.tasks = [];
              targetCol.tasks.splice(newPos, 0, movedTask);
              // обновляем позиции
              targetCol.tasks.forEach((t, i) => t.position = i);
              const sourceCol = cols.find(c => c.id === sourceColumnId);
              if (sourceCol?.tasks) sourceCol.tasks.forEach((t, i) => t.position = i);
            }
          }
        },
      }
    ),
  }),

  selectors: {
    selectColumnsByProject: (state) => state.columnsByProject,
    selectColumnsLoading: (state) => state.isLoading,
  },
});

export const {
  fetchColumns,
  createColumn,
  createTaskThunk,
  updateTaskInStore,
  moveTask,
} = columnsSlice.actions;

export const { selectColumnsByProject, selectColumnsLoading } = columnsSlice.selectors;
