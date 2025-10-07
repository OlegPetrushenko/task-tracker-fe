import axiosInstance from "../../../lib/axiosInstance";
interface Credentials {
  email: string;
  password: string;
}

// we already added prefix /api in axios config

const LOGIN_PATH = "/auth/login";
const REGISTER_PATH = "/users/register";
const LOGOUT_PATH = "/auth/logout";


// Добавьте этот интерфейс для updateCurrentUser
interface UpdateUserData {
  email?: string;
  nickname?: string;
  password?: string;
  role?: string;
}

export const fetchLogin = async (credentials: Credentials) => {
  const res = await axiosInstance.post(LOGIN_PATH, credentials);
  return res.data;
};

export const fetchRegister = async (credentials: Credentials) => {
  const res = await axiosInstance.post(REGISTER_PATH, credentials);
  return res.data;
};

export async function fetchLogout(): Promise<void> {
    await axiosInstance.post(LOGOUT_PATH);
}

export const fetchCurrentUser = async () => {
  const res = await axiosInstance.get('/users/me');
  return res.data;
};

// ИСПРАВЛЕННАЯ СТРОКА 27 - замените any на UpdateUserData
export const updateCurrentUser = async (payload: UpdateUserData) => {
  const res = await axiosInstance.patch('/users/me', payload);
  return res.data;
};

export const deleteCurrentUser = async () => {
  const res = await axiosInstance.delete('/users/me');
  return res.data;
};