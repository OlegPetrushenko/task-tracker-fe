import axiosInstance from "../../../lib/axiosInstance";
import type { CreateTaskDto, TaskDto } from "../types";

const TASKS_BASE = "/tasks";

export interface MoveTaskDto {
  columnId: string;
  position: number;
}

export interface MoveTaskArgs {
  projectId: string;
  taskId: string;
  dto: MoveTaskDto;
  sourceColumnId: string;
}

/**
 * Moves a task to a new column and/or updates its position.
 * API: POST /projects/{projectId}/tasks/{taskId}/move
 */
export const moveTask = async (
  projectId: string,
  taskId: string,
  dto: MoveTaskDto
): Promise<TaskDto> => {
  const res = await axiosInstance.post(
    `/projects/${projectId}${TASKS_BASE}/${taskId}/move`,
    dto
  );
  return res.data;
};

export const fetchTasksByProject = async (projectId: string): Promise<TaskDto[]> => {
const res = await axiosInstance.get(TASKS_BASE, { params: { projectId } });
  return res.data;
};

export const fetchTask = async (id: string): Promise<TaskDto> => {
  const res = await axiosInstance.get(`${TASKS_BASE}/${id}`);
  return res.data;
};

export const createTask = async (dto: CreateTaskDto): Promise<TaskDto> => {
  const res = await axiosInstance.post(TASKS_BASE, dto);
  return res.data;
};

export const updateTask = async (id: string, dto: Partial<CreateTaskDto>): Promise<TaskDto> => {
  const res = await axiosInstance.put(`${TASKS_BASE}/${id}`, dto);
  return res.data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await axiosInstance.delete(`${TASKS_BASE}/${id}`);
};
