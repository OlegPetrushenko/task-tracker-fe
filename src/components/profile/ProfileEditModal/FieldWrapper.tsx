import React from "react";

type FieldWrapperProps = {
    label: string;
    children: React.ReactNode;
};

const FieldWrapper: React.FC<FieldWrapperProps> = React.memo(({label, children}) => (
    <div>
        <label className="mb-1 block text-sm text-gray-600">{label}</label>
        {children}
    </div>
));

export default FieldWrapper;
