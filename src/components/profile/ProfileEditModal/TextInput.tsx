import React from "react";

type TextInputProps = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: "text" | "url";
};

const TextInput: React.FC<TextInputProps> = React.memo(
    ({value, placeholder, onChange, type = "text"}) => (
        <input
            type={type}
            className="w-full rounded border px-3 py-2"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
        />
    )
);

export default TextInput;
