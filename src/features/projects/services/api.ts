import axiosInstance from "../../../lib/axiosInstance";
import type { CreateProjectDto } from "../types";
import { PROJECTS_BASE_PATH } from "../../apiPaths";

// we already added  prefix /api in axios config

export const fetchProjects = async () => {
  const res = await axiosInstance.get(`${PROJECTS_BASE_PATH}/my`);
  return res.data;
};

export const fetchCreateProject = async (projectDto: CreateProjectDto) => {
  const res = await axiosInstance.post(PROJECTS_BASE_PATH, projectDto);
  return res.data;
};

export const deleteProject = async (id: string) => {
  await axiosInstance.delete(`${PROJECTS_BASE_PATH}/${id}`);
};  

export const acceptInviteToProject = async (inviteToken: string) => {
  const res = await axiosInstance.post(`/invitations/accept`, null, {
    params: { inviteToken },
  });
  return res.data;
};
