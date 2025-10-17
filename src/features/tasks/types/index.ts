import type { ColumnRef } from "../../kanban/types";
import type { ProjectRefWithOwner } from "../../projects/types";

export interface ExecutorDto {
  id: string;
  fullName: string;
  email?: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  createdAt?: string | null;
  status: TaskStatus; 
  project?: { id: string; title?: string };
  executors?: ExecutorDto[];
  column?: ColumnRef;
  position?: number;
}

export type CreateTaskDto = Omit<TaskDto, "id" | "createdAt" | "executors">;

export interface TaskDtoWithProjectOwner extends Omit<TaskDto, "project"> {
    project?: ProjectRefWithOwner;
}
