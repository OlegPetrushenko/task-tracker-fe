import React, { useEffect, useMemo, useState } from "react";

export type ProfileFormValues = {
    displayName: string;
    position: string;
    department: string;
    avatarUrl: string;
    bio: string;
};

type Props = {
    // Controls visibility of the modal
    isOpen: boolean;

    // Prefilled values (use current user profile)
    initialValues: ProfileFormValues;

    // Close handler (ESC/Close/Cancel)
    onClose: () => void;

    // Save handler: parent will call PUT /api/v1/users/profile with these values
    onSave: (values: ProfileFormValues) => void;

    // Optional UI flags
    isSaving?: boolean;
    errorMessage?: string | null;
};

// Helper
const trimOrEmpty = (s?: string) => (s ?? "").trim();

const ProfileEditModal: React.FC<Props> = ({
                                               isOpen,
                                               initialValues,
                                               onClose,
                                               onSave,
                                               isSaving = false,
                                               errorMessage = null,
                                           }) => {
    // Local form state
    const [form, setForm] = useState<ProfileFormValues>(initialValues);

    // Sync when initialValues change
    useEffect(() => {
        setForm(initialValues);
    }, [initialValues]);

    // Validation: only check avatarUrl format when provided
    const isValid = useMemo(() => {
        const url = trimOrEmpty(form.avatarUrl);
        return url.length === 0 || /^https?:\/\/[^\s]+$/i.test(url);
    }, [form.avatarUrl]);

    // Dirty flag: enable Save only if something actually changed
    const isDirty = useMemo(() => {
        const a = initialValues;
        const b = form;
        return (
            trimOrEmpty(a.displayName) !== trimOrEmpty(b.displayName) ||
            trimOrEmpty(a.position) !== trimOrEmpty(b.position) ||
            trimOrEmpty(a.department) !== trimOrEmpty(b.department) ||
            trimOrEmpty(a.avatarUrl) !== trimOrEmpty(b.avatarUrl) ||
            trimOrEmpty(a.bio) !== trimOrEmpty(b.bio)
        );
    }, [initialValues, form]);

    const handleChange =
        (key: keyof ProfileFormValues) =>
            (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                setForm((prev) => ({ ...prev, [key]: e.target.value }));
            };

    const handleSave = () => {
        if (!isValid || !isDirty || isSaving) return;
        onSave({
            displayName: trimOrEmpty(form.displayName),
            position: trimOrEmpty(form.position),
            department: trimOrEmpty(form.department),
            avatarUrl: trimOrEmpty(form.avatarUrl),
            bio: trimOrEmpty(form.bio),
        });
    };

    // Close on ESC
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-edit-title"
        >
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl">
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <h2 id="profile-edit-title" className="text-xl font-semibold">
                        Edit profile
                    </h2>
                    <button
                        type="button"
                        className="rounded px-2 py-1 text-gray-600 hover:bg-gray-100"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm text-gray-600">
                            Display name
                        </label>
                        <input
                            type="text"
                            className="w-full rounded border px-3 py-2"
                            value={form.displayName}
                            onChange={handleChange("displayName")}
                            placeholder="e.g., Jane Doe (defaults to your email if empty)"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">
                                Position
                            </label>
                            <input
                                type="text"
                                className="w-full rounded border px-3 py-2"
                                value={form.position}
                                onChange={handleChange("position")}
                                placeholder="e.g., Developer"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-sm text-gray-600">
                                Department
                            </label>
                            <input
                                type="text"
                                className="w-full rounded border px-3 py-2"
                                value={form.department}
                                onChange={handleChange("department")}
                                placeholder="e.g., Engineering / Team A"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-600">
                            Avatar URL
                        </label>
                        <input
                            type="url"
                            className="w-full rounded border px-3 py-2"
                            value={form.avatarUrl}
                            onChange={handleChange("avatarUrl")}
                            placeholder="https://example.com/avatar.png"
                        />
                        {trimOrEmpty(form.avatarUrl).length > 0 &&
                            !/^https?:\/\/[^\s]+$/i.test(trimOrEmpty(form.avatarUrl)) && (
                                <p className="mt-1 text-sm text-red-600">
                                    Enter a valid URL (http/https).
                                </p>
                            )}
                    </div>

                    <div>
                        <label className="mb-1 block text-sm text-gray-600">Bio</label>
                        <textarea
                            rows={4}
                            className="w-full rounded border px-3 py-2"
                            value={form.bio}
                            onChange={handleChange("bio")}
                            placeholder="A short info about you (optional)"
                        />
                    </div>

                    {errorMessage && (
                        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        className="rounded border px-4 py-2"
                        onClick={onClose}
                        disabled={isSaving}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                        disabled={!isValid || !isDirty || isSaving}
                        onClick={handleSave}
                    >
                        {isSaving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditModal;
