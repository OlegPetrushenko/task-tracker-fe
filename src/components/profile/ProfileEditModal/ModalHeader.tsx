import React from "react";

type ModalHeaderProps = {
    title: string;
    onClose: () => void;
};

const ModalHeader: React.FC<ModalHeaderProps> = React.memo(({title, onClose}) => (
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

export default ModalHeader;
