import axiosInstance from "../../../lib/axiosInstance";
import type { Credentials } from "../types";

// we already added  prefix /api in axios config

const LOGIN_PATH = "/auth/login";
const REGISTER_PATH = "/users/register";


export const fetchLogin = async (credentials: Credentials) => {
  const res = await axiosInstance.post(LOGIN_PATH, credentials);
  return res.data;
};


export const fetchRegister = async (credentials: Credentials) => {
  const res = await axiosInstance.post(REGISTER_PATH, credentials);
  return res.data;
};


export const fetchCurrentUser = async () => {
  const res = await axiosInstance.get('/users/me');
  return res.data;
};

export const updateCurrentUser = async (payload: Record<string, any>) => {
  const res = await axiosInstance.patch('/users/me', payload);
  return res.data;
};

export const deleteCurrentUser = async () => {
  const res = await axiosInstance.delete('/users/me');
  return res.data;
};
