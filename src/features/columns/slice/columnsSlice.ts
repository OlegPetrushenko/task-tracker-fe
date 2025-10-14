import { createAppSlice } from "../../../app/createAppSlice";
import * as api from "../services/api";
import type { ColumnDto } from "../types";
import type { ProjectWithColumnsResponse } from "../../tasks/types";

type ColumnsState = {
  columnsByProject: Record<string, ColumnDto[]>;
  isLoading: boolean;
  error?: string | null;
};

const initialState: ColumnsState = {
  columnsByProject: {},
  isLoading: false,
  error: null,
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
        },
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
        },
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
} = columnsSlice.actions;

export const {
  selectColumnsByProject,
  selectColumnsLoading,
} = columnsSlice.selectors;
