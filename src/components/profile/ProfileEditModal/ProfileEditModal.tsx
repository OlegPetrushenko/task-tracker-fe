import React, {useEffect, useMemo, useState} from "react";
import Actions from "./Actions.tsx";
import ModalHeader from "./ModalHeader.tsx";
import ErrorAlert from "./ErrorAlert.tsx";
import ProfileFormFields from "./ProfileFormFields.tsx";

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

// Helpers
const trimOrEmpty = (s?: string) => (s ?? "").trim();
const isHttpUrl = (s: string) => /^https?:\/\/[^\s]+$/i.test(s);

// ---------- Main component ----------
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
        return url.length === 0 || isHttpUrl(url);
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
                setForm((prev) => ({...prev, [key]: e.target.value}));
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
                <ModalHeader title="Edit profile" onClose={onClose}/>

                {/* Form fields */}
                <ProfileFormFields form={form} onChange={handleChange}/>

                {/* Error (if any) */}
                {errorMessage && <div className="mt-4"><ErrorAlert message={errorMessage}/></div>}

                {/* Actions */}
                <Actions
                    onCancel={onClose}
                    onSave={handleSave}
                    disabled={!isValid || !isDirty || isSaving}
                    isSaving={isSaving}
                    />
            </div>
        </div>
    );
};

export default ProfileEditModal;
