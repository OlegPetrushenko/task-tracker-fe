import type { TaskDto } from "../../tasks/types";

export interface ColumnDto {
    id: string;
    title: string;
    projectId: string;
    orderIndex: number;
    order?: number;
    isProtected?: boolean;
    tasks?: TaskDto[];
}

export type CreateColumnDto = Pick<ColumnDto, "title" | "projectId">;

export interface ColumnRef {
    id: string;
    title?: string;
    orderIndex?: number;
}
