import axiosInstance from "../../../lib/axiosInstance";


interface Credentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  nickname?: string;
}

interface UpdateUserData {
  email?: string;
  nickname?: string;
}

const LOGIN_PATH = "/auth/login";
const REGISTER_PATH = "/users/register"
const PROFILE_PATH = "/users/profile";


export const fetchLogin = async (credentials: Credentials) => {
  const res = await axiosInstance.post(LOGIN_PATH, credentials);
  return res.data;
};

export const fetchRegister = async (payload: RegisterData) => {
  const res = await axiosInstance.post(REGISTER_PATH, payload);
  return res.data;
};


export const fetchCurrentUser = async () => {
  const res = await axiosInstance.get(PROFILE_PATH);
  return res.data;
};

export const updateCurrentUser = async (payload: UpdateUserData) => {
  const res = await axiosInstance.put(PROFILE_PATH, payload);
  return res.data;
};

export const deleteCurrentUser = async () => {
  const res = await axiosInstance.delete(PROFILE_PATH);
  return res.data;
};

export const changePassword = async (payload: { currentPassword: string; newPassword: string }) => {
  const res = await axiosInstance.post(`${PROFILE_PATH}/change-password`, payload);
  return res.data;
};
