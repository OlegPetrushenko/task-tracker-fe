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

// Helpers
const trimOrEmpty = (s?: string) => (s ?? "").trim();
const isHttpUrl = (s: string) => /^https?:\/\/[^\s]+$/i.test(s);

// ---------- Local subcomponents (in-file) ----------

// 1) Modal header: title + close (✕)
type ModalHeaderProps = { title: string; onClose: () => void };
const ModalHeader: React.FC<ModalHeaderProps> = React.memo(({ title, onClose }) => (
    <div className="mb-4 flex items-center justify-between">
        <h2 id="profile-edit-title" className="text-xl font-semibold">
            {title}
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
));

// 2) Label wrapper for any field
type FieldWrapperProps = { label: string; children: React.ReactNode };
const FieldWrapper: React.FC<FieldWrapperProps> = React.memo(({ label, children }) => (
    <div>
        <label className="mb-1 block text-sm text-gray-600">{label}</label>
        {children}
    </div>
));

// 3) Text input (supports type="url")
type TextInputProps = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "url";
};
const TextInput: React.FC<TextInputProps> = React.memo(({ value, placeholder, onChange, type = "text" }) => (
    <input
        type={type}
        className="w-full rounded border px-3 py-2"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
));

// 4) Text area
type TextAreaProps = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
};
const TextArea: React.FC<TextAreaProps> = React.memo(({ value, placeholder, onChange, rows = 4 }) => (
    <textarea
        rows={rows}
        className="w-full rounded border px-3 py-2"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
    />
));

// 5) Error alert
type ErrorAlertProps = { message: string };
const ErrorAlert: React.FC<ErrorAlertProps> = React.memo(({ message }) => (
    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>
));

// 6) Actions (Cancel/Save)
type ActionsProps = {
    onCancel: () => void;
    onSave: () => void;
    disabled: boolean;
    isSaving: boolean;
};
const Actions: React.FC<ActionsProps> = React.memo(({ onCancel, onSave, disabled, isSaving }) => (
    <div className="mt-6 flex justify-end gap-2">
        <button type="button" className="rounded border px-4 py-2" onClick={onCancel} disabled={isSaving}>
            Cancel
        </button>
        <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
            disabled={disabled}
            onClick={onSave}
        >
            {isSaving ? "Saving..." : "Save"}
        </button>
    </div>
));

// 7) Profile form fields group
type ProfileFormFieldsProps = {
    form: ProfileFormValues;
    onChange: (key: keyof ProfileFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};
const ProfileFormFields: React.FC<ProfileFormFieldsProps> = React.memo(({ form, onChange }) => {
    const avatar = trimOrEmpty(form.avatarUrl);
    const showUrlWarning = avatar.length > 0 && !isHttpUrl(avatar);

    return (
        <div className="space-y-4">
            <FieldWrapper label="Display name">
                <TextInput
                    value={form.displayName}
                    onChange={onChange("displayName")}
                    placeholder="e.g., Jane Doe (defaults to your email if empty)"
                />
            </FieldWrapper>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FieldWrapper label="Position">
                    <TextInput value={form.position} onChange={onChange("position")} placeholder="e.g., Developer" />
                </FieldWrapper>
                <FieldWrapper label="Department">
                    <TextInput value={form.department} onChange={onChange("department")} placeholder="e.g., Engineering / Team A" />
                </FieldWrapper>
            </div>

            <FieldWrapper label="Avatar URL">
                <>
                    <TextInput
                        type="url"
                        value={form.avatarUrl}
                        onChange={onChange("avatarUrl")}
                        placeholder="https://example.com/avatar.png"
                    />
                    {showUrlWarning && <p className="mt-1 text-sm text-red-600">Enter a valid URL (http/https).</p>}
                </>
            </FieldWrapper>

            <FieldWrapper label="Bio">
                <TextArea
                    value={form.bio}
                    onChange={onChange("bio")}
                    placeholder="A short info about you (optional)"
                    rows={4}
                />
            </FieldWrapper>
        </div>
    );
});

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
                <ModalHeader title="Edit profile" onClose={onClose} />

                {/* Form fields */}
                <ProfileFormFields form={form} onChange={handleChange} />

                {/* Error (if any) */}
                {errorMessage && <div className="mt-4"><ErrorAlert message={errorMessage} /></div>}

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
