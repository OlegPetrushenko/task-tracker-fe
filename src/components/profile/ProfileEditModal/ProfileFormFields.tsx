import React from "react";
import FieldWrapper from "./FieldWrapper.tsx";
import TextInput from "./TextInput.tsx";
import TextArea from "./TextArea.tsx";

const trimOrEmpty = (s?: string) => (s ?? "").trim();
const isHttpUrl = (s: string) => /^https?:\/\/[^\s]+$/i.test(s);

type ProfileFormFieldsProps = {
    form: {
        displayName: string;
        position: string;
        department: string;
        avatarUrl: string;
        bio: string;
    };
    onChange: (
        key: "displayName" | "position" | "department" | "avatarUrl" | "bio"
    ) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

const ProfileFormFields: React.FC<ProfileFormFieldsProps> = React.memo(({form, onChange}) => {
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
                    <TextInput value={form.position} onChange={onChange("position")} placeholder="e.g., Developer"/>
                </FieldWrapper>
                <FieldWrapper label="Department">
                    <TextInput value={form.department} onChange={onChange("department")}
                               placeholder="e.g., Engineering / Team A"/>
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

export default ProfileFormFields;
