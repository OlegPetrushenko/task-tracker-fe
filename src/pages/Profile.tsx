import React, { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "../lib/axiosInstance";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { selectUser } from "../features/auth/slice/authSlice";
import { selectProjects } from "../features/projects/slice/projectsSlice";
import ProfileEditModal from "../components/profile/ProfileEditModal/ProfileEditModal.tsx";

import {
    fetchMyProfile,
    saveMyProfile,
    selectProfileData,
    selectProfileSaving,
    selectProfileSaveError,
} from "../features/profile/slice/profileSlice";
import { selectTasksByProject } from "../features/tasks/slice/tasksSlice";

/**
 * Profile page / dashboard
 *
 * Endpoints:
 * GET    /users/profile          (via slice for modal sync)
 * PUT    /users/profile          (via slice for modal save; inline editors keep axiosInstance)
 * DELETE /users/profile          (inline, unchanged)
 */

type UserProfile = {
    id?: number | string;
    email?: string;
    displayName?: string;
    role?: string;

    // extended (supported by BE update endpoint)
    position?: string;
    department?: string;
    avatarUrl?: string;
    bio?: string;
};

//type Project = {
//  tasks?: Array<{
//    completed?: boolean;
//    dueDate?: string;
//    endDate?: string;
//    deadline?: string;
//  }>;
//};

const Profile: React.FC = () => {
    const dispatch = useAppDispatch();

    const authUser = useAppSelector(selectUser);
    const projects = useAppSelector(selectProjects);

    // slice-driven profile (kept in sync with local UI state)
    const profileData = useAppSelector(selectProfileData);
    const savingViaSlice = useAppSelector(selectProfileSaving);
    const saveErrorViaSlice = useAppSelector(selectProfileSaveError);

    const projectsList = useMemo(() => projects ?? [], [projects]);

    const [user, setUser] = useState<UserProfile | undefined>(authUser);
    const [loading, setLoading] = useState(false);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [formValue, setFormValue] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // modal state
    const [isProfileEditOpen, setProfileEditOpen] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // keep local user in sync with store's profile when it changes
    useEffect(() => {
        if (profileData) setUser(profileData);
    }, [profileData]);

    // initial load via slice (for modal/state sync)
    useEffect(() => {
        dispatch(fetchMyProfile()).unwrap().catch(() => {
            /* ignore, keep auth store user */
        });
    }, [dispatch]);
  const tasksByProject = useAppSelector(selectTasksByProject);

  const projectCount = projectsList.length;
  const { totalTasks, completedTasks, missedTasks } = React.useMemo(() => {
  let total = 0, completed = 0, missed = 0;
  const now = Date.now();

  // tasksByProject: Record<string, TaskDto[]>
  for (const projId in tasksByProject) {
    const tasks = tasksByProject[projId] || [];
    total += tasks.length;
    for (const t of tasks) {
      if (!t) continue;
      if (t.status === "DONE") completed++;
      const due = t.dueDate;
      if (due && t.status !== "DONE") {
        const d = Date.parse(due);
        if (!Number.isNaN(d) && d < now) missed++;
      }
    }
  }

  return { totalTasks: total, completedTasks: completed, missedTasks: missed };
}, [tasksByProject]);

    // inline editors (email/password) only
    const startEditing = (field: "email" | "password") => {
        setEditingField(field);
        setFormValue((user?.[field as keyof UserProfile] as string) ?? "");
        setMessage(null);

        if (field === "password") {
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setFormValue("");
        } else {
            setFormValue((user?.[field as keyof UserProfile] as string) ?? "");
        }
    };

    const cancelEditing = () => {
        setEditingField(null);
        setFormValue("");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
    };

    const savePasswordField = async () => {
        setLoading(true);
        setMessage(null);

        try {
            if (newPassword !== confirmPassword) {
                setMessage("The new password and confirmation do not match");
                return;
            }

            await axiosInstance.post("/users/profile/change-password", {
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setMessage("Password has been successfully changed");
            setEditingField(null);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setFormValue("");
        } catch (err: unknown) {
            const msg =
                (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (err as Error)?.message ??
                "Failed to change password";
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };


    const saveField = async () => {
        if (!editingField) return;
        setLoading(true);
        setMessage(null);
        try {
            const payload: Record<string, string> = {};
            if (editingField === "password") {
                payload.password = formValue;
            } else {
                payload[editingField] = formValue;
            }
            const res = await axiosInstance.put("/users/profile", payload);
            setUser(res.data);
            setMessage("Saved successfully");
            setEditingField(null);
        } catch (err: unknown) {
            const error = err as { response?: { data?: { message?: string } } };
            const msg = error?.response?.data?.message ?? "Failed to save";
            setMessage(msg);
        } finally {
            setLoading(false);
        }
    };



    const deleteAccount = async () => {
        if (!confirm("Delete your account? This cannot be undone.")) return;
        setLoading(true);
        try {
            await axiosInstance.delete("/users/profile");
            window.location.href = "/";
        } catch {
            setMessage("Failed to delete account");
        } finally {
            setLoading(false);
        }
    };

    // helpers for modal initial values
    const initialModalValues = {
        displayName: (user?.displayName ?? user?.email?.split("@")[0] ?? "").trim(),
        position: (user?.position ?? "").toString(),
        department: (user?.department ?? "").toString(),
        avatarUrl: (user?.avatarUrl ?? "").toString(),
        bio: (user?.bio ?? "").toString(),
    };

    // profile completeness -> CTA label
    const isIncomplete =
        !initialModalValues.displayName.trim() ||
        !initialModalValues.position.trim() ||
        !initialModalValues.department.trim() ||
        !initialModalValues.avatarUrl.trim() ||
        !initialModalValues.bio.trim();

    // modal handlers
    const openProfileEdit = () => {
        setSaveError(null);
        setProfileEditOpen(true);
    };
    const closeProfileEdit = () => {
        setSaveError(null);
        setProfileEditOpen(false);
    };

    const handleSaveProfile = useCallback(
        async (values: typeof initialModalValues) => {
            setSaveError(null);
            try {
                const dto = await dispatch(
                    saveMyProfile({
                        displayName: values.displayName,
                        position: values.position,
                        department: values.department,
                        avatarUrl: values.avatarUrl,
                        bio: values.bio,
                    })
                ).unwrap();

                setUser(dto);
                setProfileEditOpen(false);
            } catch (err: unknown) {
                const error = err as { response?: { data?: { message?: string } } };
                setSaveError(error?.response?.data?.message ?? "Failed to update profile");
            }
        },
        [dispatch]
    );

    return (
        <div className="max-w-3xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-4">Your profile</h1>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <div>
                        <div className="text-sm text-gray-500 mb-1">DisplayName</div>
                        <div className="flex items-center gap-2">
                            <div className="font-medium">
                                {user?.displayName ?? user?.email?.split("@")[0] ?? "—"}
                            </div>
                            {/* inline edit for displayName removed; use modal */}
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">Email</div>
                        <div className="flex items-center gap-2">
                            <div className="font-medium">{user?.email ?? "—"}</div>
                            <button
                                className="text-sm px-2 py-1 border rounded text-blue-600"
                                onClick={() => startEditing("email")}
                            >
                                Edit
                            </button>
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-gray-500 mb-1">Password</div>
                        <div className="flex items-center gap-2">
                            <div className="font-medium">{showPassword ? "••••••••" : "••••••••"}</div>
                            <button
                                className="text-sm px-2 py-1 border rounded"
                                onClick={() => setShowPassword((s) => !s)}
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                            <button
                                className="text-sm px-2 py-1 border rounded text-blue-600"
                                onClick={() => startEditing("password")}
                            >
                                Change
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">Projects</div>
                        <div className="text-xl font-bold">{projectCount}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">Total tasks</div>
                        <div className="text-xl font-bold">{totalTasks}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">Completed</div>
                        <div className="text-xl font-bold">{completedTasks}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                        <div className="text-xs text-gray-500">Missed</div>
                        <div className="text-xl font-bold">{missedTasks}</div>
                    </div>
                </div>

                {/* CTA: Complete / Edit profile */}
                <div className="mt-6">
                    <button
                        type="button"
                        className="text-sm px-2 py-1 border rounded text-blue-600 hover:bg-gray-50"
                        onClick={openProfileEdit}
                    >
                        {isIncomplete ? "Complete profile" : "Edit profile"}
                    </button>
                </div>

                <div className="mt-6">
                    <div className="text-sm text-gray-500 mb-1">Profile status</div>
                    <div className="font-medium">{user?.role ?? "ROLE_USER"}</div>
                </div>

                {editingField && (
                    <div className="mt-6 p-4 border rounded bg-gray-50">
                        <div className="mb-2 font-medium">Edit {editingField}</div>

                        {editingField === "password" ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Current password</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        type="password"
                                        autoComplete="current-password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">New password</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-600 mb-1">Confirm new password</label>
                                    <input
                                        className="w-full border rounded px-3 py-2"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        ):  <input
                            className="w-full border rounded px-3 py-2"
                            value={formValue}
                            onChange={(e) => setFormValue(e.target.value)}
                            type={editingField === "password" ? "password" : "text"}
                        />}

                        <div className="flex gap-2 mt-3">
                            <button
                                className="px-3 py-2 bg-blue-600 text-white rounded"
                                onClick={editingField === "password" ? savePasswordField : saveField}
                                disabled={loading}
                            >

                                Save
                            </button>
                            <button
                                className="px-3 py-2 border rounded"
                                onClick={cancelEditing}
                                disabled={loading}
                            >
                                Cancel
                            </button>
                        </div>
                        {message && <div className="mt-2 text-sm text-red-600">{message}</div>}
                    </div>
                )}

                <div className="mt-6">
                    <button
                        className="px-4 py-2 text-red-600 border rounded"
                        onClick={deleteAccount}
                        disabled={loading}
                    >
                        Delete account
                    </button>
                </div>
            </div>

            {/* Profile edit modal (slice-powered) */}
            <ProfileEditModal
                isOpen={isProfileEditOpen}
                initialValues={initialModalValues}
                onClose={closeProfileEdit}
                onSave={handleSaveProfile}
                isSaving={savingViaSlice}
                errorMessage={saveError ?? saveErrorViaSlice ?? undefined}
            />
        </div>
    );
};

export default Profile;

