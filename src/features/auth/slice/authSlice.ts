import { createAppSlice } from "../../../app/createAppSlice";
import type {
  AuthSliceState,
  Credentials,
  UserRegistrationDto,
} from "../types";
import * as api from "../services/api";
import { isAxiosError } from "axios";

const initialState: AuthSliceState = {
  isAuthenticated: false,
  user: undefined,
  isLoggingOut: false,
  logoutError: null,
  loginErrorMessage: undefined,
  resetPasswordErrorMessage: undefined,
  resetPasswordSuccess: false,
};

export const authSlice = createAppSlice({
  name: "auth",
  initialState,
  reducers: (create) => ({
    login: create.asyncThunk(
      async (credentials: Credentials) => {
        return api.fetchLogin(credentials).catch((err) => {
          if (isAxiosError(err)) {
            throw new Error(
              err.response?.data?.message || "Internal Server Error"
            );
          }
        });
      },
      {
        pending: (state) => {
          state.isAuthenticated = false;
        },
        fulfilled: (state, action) => {
          state.isAuthenticated = true;
          state.loginErrorMessage = undefined;
          state.user = action.payload.user; // если бэк возвращает { user, token }
  state.token = action.payload.token; // сохраняем токен в state
  localStorage.setItem("token", action.payload.token);
  
        },
        rejected: (state, action) => {
          state.isAuthenticated = false;
          state.user = undefined;
          state.loginErrorMessage = action.error.message;
        },
      }
    ),

    register: create.asyncThunk(
      async (dto: UserRegistrationDto) => {
        return api.fetchRegister(dto);
      },
      {
        pending: (state) => {
          state.isAuthenticated = false;
        },
        fulfilled: (state, action) => {
          state.isAuthenticated = true;
          state.user = action.payload;
        },
        rejected: (state) => {
          state.isAuthenticated = false;
          state.user = undefined;
        },
      }
    ),

    // 1) thunk-экшен logout
    logout: create.asyncThunk(
      async () => {
        return api.fetchLogout();
      },
      {
        pending: (state) => {
          state.isLoggingOut = true;
          state.logoutError = null;
        },
        fulfilled: (state) => {
          state.isLoggingOut = false;
          state.isAuthenticated = false;
          state.user = undefined;
        },
        rejected: (state, action) => {
          state.isLoggingOut = false;
          state.logoutError = action.error.message ?? null;
        },
      }
    ),

    // 2) thunk-экшен resetPassword
    resetPassword: create.asyncThunk(
      async (email: string) => {
        return api.fetchResetPassword(email);
      },
      {
        pending: (state) => {
          state.resetPasswordErrorMessage = undefined;
          state.resetPasswordSuccess = false;
        },
        fulfilled: (state) => {
          state.resetPasswordSuccess = true;
        },
        rejected: (state, action) => {
          state.resetPasswordErrorMessage = action.error.message;
        },
      }
    ),

      // bootstrap auth from /users/profile at app start
      bootstrapFromProfile: create.reducer<NonNullable<AuthSliceState["user"]>>(
          (state, action) => {
              state.isAuthenticated = true;
              state.loginErrorMessage = undefined;
              state.user = action.payload; // payload = { email, role, confirmationStatus } от BE
          }
      ),
  }),

  selectors: {
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectUser: (state) => state.user,
    selectRole: (state) => state.user?.role,
    selectLoginError: (state) => state.loginErrorMessage,

    // — вот эти селекторы до сих пор не было
    selectResetPasswordError: (state) => state.resetPasswordErrorMessage,
    selectResetPasswordSuccess: (state) => state.resetPasswordSuccess,

    selectIsLoggingOut: (state) => state.isLoggingOut,
    selectLogoutError: (state) => state.logoutError,
  },
});

// Экспортируем экшен-криэйторы
export const { login, register, logout, resetPassword, bootstrapFromProfile } =
  authSlice.actions;

// Экспортируем все селекторы одним набором
export const {
  selectIsAuthenticated,
  selectUser,
  selectRole,
  selectLoginError,
  selectResetPasswordError,
  selectResetPasswordSuccess, 
  selectIsLoggingOut,
  selectLogoutError,
} = authSlice.selectors;

