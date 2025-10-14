import { createAppSlice } from "../../../app/createAppSlice";
import * as api from "../services/api";
import type { UserProfileDto, UpdateProfilePayload } from "../services/api";

type ProfileSliceState = {
    data: UserProfileDto | null;
    isLoading: boolean;
    isSaving: boolean;
    loadError: string | null;
    saveError: string | null;
};

const initialState: ProfileSliceState = {
    data: null,
    isLoading: false,
    isSaving: false,
    loadError: null,
    saveError: null,
};

export const profileSlice = createAppSlice({
    name: "profile",
    initialState,
    reducers: (create) => ({
        // GET /users/profile
        fetchMyProfile: create.asyncThunk(
            async () => {
                const res = await api.getMyProfile();
                return res;
            },
            {
                pending: (state) => {
                    state.isLoading = true;
                    state.loadError = null;
                },
                fulfilled: (state, action) => {
                    state.isLoading = false;
                    state.data = action.payload;
                },
                rejected: (state, action) => {
                    state.isLoading = false;
                    state.loadError = (action.payload as string) ?? action.error.message ?? "Failed to load profile";
                },
            }
        ),

        // PUT /users/profile
        saveMyProfile: create.asyncThunk<UserProfileDto, UpdateProfilePayload>(
            async (payload) => {
                const res = await api.updateMyProfile(payload);
                return res;
            },
            {
                pending: (state) => {
                    state.isSaving = true;
                    state.saveError = null;
                },
                fulfilled: (state, action) => {
                    state.isSaving = false;
                    state.data = action.payload;
                },
                rejected: (state, action) => {
                    state.isSaving = false;
                    state.saveError = (action.payload as string) ?? action.error.message ?? "Failed to save profile";
                },
            }
        ),
    }),
    selectors: {
        selectProfileData: (state) => state.data,
        selectProfileLoading: (state) => state.isLoading,
        selectProfileSaving: (state) => state.isSaving,
        selectProfileLoadError: (state) => state.loadError,
        selectProfileSaveError: (state) => state.saveError,
    },
});

// actions
export const { fetchMyProfile, saveMyProfile } = profileSlice.actions;

// selectors
export const {
    selectProfileData,
    selectProfileLoading,
    selectProfileSaving,
    selectProfileLoadError,
    selectProfileSaveError,
} = profileSlice.selectors;
