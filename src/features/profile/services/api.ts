import axiosInstance from "../../../lib/axiosInstance";

export type UserProfileDto = {
    id?: number | string;
    email?: string;
    displayName?: string;
    role?: string;
    position?: string;
    department?: string;
    avatarUrl?: string;
    bio?: string;
};

export type UpdateProfilePayload = Partial<
    Pick<UserProfileDto, "displayName" | "position" | "department" | "avatarUrl" | "bio">
>;

export async function getMyProfile(): Promise<UserProfileDto> {
    const { data } = await axiosInstance.get("/users/profile");
    return data;
}

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfileDto> {
    const { data } = await axiosInstance.put("/users/profile", payload);
    return data;
}
