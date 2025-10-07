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
}

// Убедитесь, что status включен в тип для создания задачи
export type CreateTaskDto = Omit<TaskDto, "id" | "createdAt">;
