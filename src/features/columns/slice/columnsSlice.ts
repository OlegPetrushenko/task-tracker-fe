import { createAppSlice } from "../../../app/createAppSlice";
import * as api from "../services/api";
import * as taskApi from "../../tasks/services/api";
import type { ColumnDto } from "../types";
import type { ProjectWithColumnsResponse, TaskDto, CreateTaskDto } from "../../tasks/types";
import { type MoveTaskArgs } from "../../tasks/services/api";

type ColumnsState = {
  columnsByProject: Record<string, ColumnDto[]>;
  isLoading: boolean;
  error?: string | null;
  columnActionError: string | null;
  taskActionError: string | null;
};

const initialState: ColumnsState = {
  columnsByProject: {},
  isLoading: false,
  error: null,
  columnActionError: null,
  taskActionError: null,
};

export const columnsSlice = createAppSlice({
  name: "columns",
  initialState,
  reducers: (create) => ({
    fetchColumns: create.asyncThunk(
      async (projectId: string): Promise<ColumnDto[]> => {
        const response: ProjectWithColumnsResponse = await api.fetchColumns(projectId);
        return response.columns;
      },
      {
        pending: (state) => {
          state.isLoading = true;
          state.columnActionError = null;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.columnsByProject[action.meta.arg] = action.payload;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.error = action.error.message;
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
            ...(state.columnsByProject[projId] || []), action.payload
          ];
          state.columnActionError = null;
        },
        rejected: (state, action) => {
          state.columnActionError = action.error.message || "Failed to create column.";
        }
      }
    ),

    updateColumn: create.asyncThunk(
      async ({ id, dto }: { id: string; dto: Partial<ColumnDto> }) => {
        return await api.updateColumn(id, dto);
      },
      {
        fulfilled: (state, action) => {
          const updated = action.payload;
          const projId = updated.projectId;
          state.columnsByProject[projId] = state.columnsByProject[projId].map(col =>
            col.id === updated.id ? updated : col
          );
          state.columnActionError = null;
        },
        rejected: (state, action) => {
          state.columnActionError = action.error.message || "Failed to update column.";
        }
      }
    ),

    deleteColumn: create.asyncThunk(
      async ({ columnId, projectId }: { columnId: string; projectId: string }) => {
        await api.deleteColumn(columnId);
        return { columnId, projectId };
      },
      {
        fulfilled: (state, action) => {
          const { columnId, projectId } = action.payload;
          state.columnsByProject[projectId] = state.columnsByProject[projectId].filter(c => c.id !== columnId);
          state.columnActionError = null;
        },
        rejected: (state, action) => {
          state.columnActionError = action.error.message || "Failed to delete column. Standard columns cannot be deleted.";
        }
      }
    ),

    createTaskThunk: create.asyncThunk(
      async (dto: CreateTaskDto) => {
        return await taskApi.createTask(dto);
      },
      {
        fulfilled: (state, action) => {
          const newTask = action.payload;
          const projId = newTask.project?.id;
          const targetColumnId = newTask.column?.id;

          if (projId && targetColumnId && state.columnsByProject[projId]) {
            const targetColumn = state.columnsByProject[projId].find(col => col.id === targetColumnId);
            if (targetColumn) {
              if (!targetColumn.tasks) {
                targetColumn.tasks = [];
              }
              targetColumn.tasks.push(newTask);
              state.taskActionError = null;
            }
          }
        },
        rejected: (state, action) => {
          state.taskActionError = action.error.message || "Failed to create task.";
        }
      }
    ),

    updateTaskInStore: create.reducer(
      (state, action: { payload: TaskDto }) => {
        const updatedTask = action.payload;
        const projId = updatedTask.project?.id;
        const targetColumnId = updatedTask.column?.id;

        if (projId && targetColumnId && state.columnsByProject[projId]) {
          const columns = state.columnsByProject[projId];
          columns.forEach(col => {
            if (col.tasks) {
              const taskIndex = col.tasks.findIndex(t => t.id === updatedTask.id);
              if (taskIndex !== -1) {
                col.tasks[taskIndex] = updatedTask;
              }
            }
          });
        }
      }
    ),

    moveTask: create.asyncThunk(
      async (
        { projectId, taskId, dto }: MoveTaskArgs,
        { rejectWithValue }
      ) => {
        try {
          const updatedTask = await taskApi.moveTask(projectId, taskId, dto);
          return updatedTask;
        } catch (error) {
          const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
          return rejectWithValue(errorMessage);
        }
      },
      {
        pending: (state, action) => {
          const { projectId, taskId, dto, sourceColumnId } = action.meta.arg;
          const targetColumnId = dto.columnId;
          const newPosition = dto.position;

          const columns = state.columnsByProject[projectId];

          if (!columns) return;

          let movedTask: TaskDto | undefined;
          columns.forEach(col => {
            if (col.tasks) {
              col.tasks = col.tasks.filter(task => {
                if (task.id === taskId) {
                  movedTask = { ...task, column: { id: targetColumnId }, position: newPosition };
                  return false;
            }
              return true;
            });
            }
          });

          if (movedTask) {
            const targetColumn = columns.find(col => col.id === targetColumnId);
            if (targetColumn) {
              if (!targetColumn.tasks) {
                targetColumn.tasks = [];
              }

              targetColumn.tasks.splice(newPosition, 0, movedTask);

              columns.forEach(col => {
                if (col.tasks) {
                  col.tasks.forEach((task, index) => {
                    if (col.id === targetColumnId || col.id === sourceColumnId) {
                      task.position = index;
                    }
                  });
                }
              });
              state.taskActionError = null;
            }
          }
        },
        fulfilled: (state) => {
          state.columnActionError = null;
        },
        rejected: (state, action) => {
          state.columnActionError = action.payload as string || "Failed to move task. Reverting changes.";
        //   dispatch(fetchColumns(projectId));
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
  updateColumn,
  deleteColumn,
  moveTask,
  createTaskThunk,
  updateTaskInStore,
} = columnsSlice.actions;

export const {
  selectColumnsByProject,
  selectColumnsLoading,
} = columnsSlice.selectors;
