import React from "react";

type TextAreaProps = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    rows?: number;
};

const TextArea: React.FC<TextAreaProps> = React.memo(
    ({value, placeholder, onChange, rows = 4}) => (
        <textarea
            rows={rows}
            className="w-full rounded border px-3 py-2"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    )
);

export default TextArea;
