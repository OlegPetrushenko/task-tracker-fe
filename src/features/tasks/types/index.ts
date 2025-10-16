import type { ColumnDto } from "../../kanban/types";

export interface ExecutorDto {
  id: string;
  fullName: string;
  email?: string;
}

export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface ColumnRef {
  id: string;
  title?: string;
  orderIndex?: number;
}

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

export interface ProjectWithColumnsResponse {
  id: string;
  title: string;
  description?: string;
  owner: {
    id: string;
    name: string | null;
    email: string;
    avatar: string | null;
  };
  ownerAssigned: boolean;
  columns: ColumnDto[];
}

export type CreateTaskDto = Omit<TaskDto, "id" | "createdAt" | "executors">;
