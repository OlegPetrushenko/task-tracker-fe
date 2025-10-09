import { createAppSlice } from "../../../app/createAppSlice";
import type { CreateProjectDto, ProjectsSliceState } from "../types";
import * as api from "../services/api";
import { isAxiosError, type AxiosError } from "axios";

const initialState: ProjectsSliceState = {
  projects: [],
  isLoading: false,
};

export const projectsSlice = createAppSlice({
  name: "projects",
  initialState,
  reducers: (create) => ({
    getAllProjects: create.asyncThunk(
      async () => {
        return api
          .fetchProjects()
          .catch((err: AxiosError<{ message: string }>) => {
            // раскрываем ошибку от аксиоса и получаем сообщение
            // бросаем новую ошибку, которая поподет в rejected case
            throw new Error(err.response?.data?.message);
          });
      },
      {
        pending: (state) => {
          state.isLoading = true;
        },
        fulfilled: (state, action) => {
          state.isLoading = false;
          state.projects = action.payload;
        },
        rejected: (state, action) => {
          state.isLoading = false;
          state.projects = [];
          console.log(action.error);
        },
      }
    ),

    createProject: create.asyncThunk(
      async (dto: CreateProjectDto) => {
        return api.fetchCreateProject(dto).catch((err) => {
          if (isAxiosError(err)) {
            throw new Error(
              err.response?.data?.message || "Internal Server Error"
            );
          }
          throw err;
        });
      },
      {
        pending: (state) => {
          // TODO add spinner here
          state.createProjectErrorMessage = "";
        },
        fulfilled: (state, action) => {
          state.projects.push(action.payload);
          state.createProjectErrorMessage = "";
        },
        rejected: (state, action) => {
          state.createProjectErrorMessage = action.error.message;
        },
      }
    ),

    // V-- ДОБАВЛЕНО НАЧАЛО --V
    deleteProject: create.asyncThunk(
      async (id: string, { rejectWithValue }) => {
        try {
          await api.deleteProject(id);
          return id; // Возвращаем id для удаления из стейта
        } catch (err) {
          if (isAxiosError(err)) {
            return rejectWithValue(
              err.response?.data?.message || "Failed to delete project"
            );
          }
          throw err;
        }
      },
      {
        fulfilled: (state, action) => {
          // action.payload будет содержать id удаленного проекта
          state.projects = state.projects.filter(
            (p) => p.id !== action.payload
          );
        },
        rejected: (_state, action) => {
          // Можно сохранить ошибку для отображения в UI
          console.error(
            "Delete project error:",
            action.payload || action.error.message
          );
        },
      }
    ),

    acceptInviteToProject: create.asyncThunk(
      async (inviteToken: string, { rejectWithValue }) => {
        try {
          return await api.acceptInviteToProject(inviteToken);
        } catch (err) {
          if (isAxiosError(err)) {
            return rejectWithValue(
              err.response?.data?.message || "Failed to accept invite"
            );
          }
          throw err;
        }
      },
      {
        fulfilled: (state, action) => {
          if (action.payload) {
            state.projects.push(action.payload);
          }
        },
        rejected: (_state, action) => {
          console.error(
            "Accept invite error:",
            action.payload || action.error.message
          );
        },
      }
    ),
    // A-- ДОБАВЛЕНО КОНЕЦ --A
  }),
  selectors: {
    selectProjects: (state) => state.projects,
    selectIsLoading: (state) => state.isLoading,
    selectCreateProjectErrorMessage: (state) =>
      state.createProjectErrorMessage,
  },
});

// V-- ИЗМЕНЕНИЕ: Добавлен экспорт deleteProject --V
export const { 
    createProject, 
    getAllProjects, 
    deleteProject, 
    acceptInviteToProject 
} = projectsSlice.actions;

export const {
  selectProjects,
  selectIsLoading,
  selectCreateProjectErrorMessage,
} = projectsSlice.selectors;
