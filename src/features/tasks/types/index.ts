export interface ExecutorDto {
  id: string;
  fullName: string;
  email?: string;
}

export interface TaskDto {
  id: string;
  title: string;
  description?: string;
  dueDate?: string | null;
  createdAt?: string | null;
  status?: "TODO" | "IN_PROGRESS" | "DONE";
  project?: { id: string; title?: string };
  executors?: ExecutorDto[];
}

export type CreateTaskDto = Omit<TaskDto, "id" | "createdAt">;

