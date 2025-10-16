import type { ColumnDto } from "../../kanban/types";

export interface Project {
  id: string;
  title: string;
  description: string;
}

export type CreateProjectDto = Omit<Project, "id">;

export interface ProjectsSliceState {
  projects: Project[];
  createProjectErrorMessage?: string;
  isLoading: boolean;
}

export interface ProjectWithColumnsResponse {
  id: string;
  title: string;
  description?: string;
  owner: ProjectOwnerDto;
  ownerAssigned: boolean;
  columns: ColumnDto[];
}

export interface ProjectOwnerDto {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface ProjectRefWithOwner {
  id: string;
  title?: string;
  owner: ProjectOwnerDto;
}
