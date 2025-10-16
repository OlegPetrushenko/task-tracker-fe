import axiosInstance from "../../../lib/axiosInstance";
import type { ColumnDto } from "../types";
import { PROJECTS_BASE_PATH, COLUMNS_BASE_PATH } from "../../apiPaths";
import type { ProjectWithColumnsResponse } from "../../projects/types";

export async function fetchColumns(projectId: string) {
  return axiosInstance.get<ProjectWithColumnsResponse>(`${PROJECTS_BASE_PATH}/${projectId}/columns`).then(res => res.data);
}

export async function createColumn(projectId: string, title: string) {
  const res = await axiosInstance.post<ColumnDto>(`${PROJECTS_BASE_PATH}/${projectId}/columns`, { title });
  return res.data
}

export async function updateColumn(columnId: string, dto: Partial<ColumnDto>) {
  return axiosInstance.put<ColumnDto>(`${COLUMNS_BASE_PATH}/${columnId}`, dto).then(res => res.data);
}

export async function deleteColumn(columnId: string) {
  return axiosInstance.delete(`${COLUMNS_BASE_PATH}/${columnId}`);
}
