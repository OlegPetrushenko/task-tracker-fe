import React from "react";

type ActionsProps = {
    onCancel: () => void;
    onSave: () => void;
    disabled: boolean;
    isSaving: boolean;
};

const Actions: React.FC<ActionsProps> = React.memo(({onCancel, onSave, disabled, isSaving}) => (
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

export default Actions;
