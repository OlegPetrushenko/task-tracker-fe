import React from "react";

type ErrorAlertProps = { message: string };

const ErrorAlert: React.FC<ErrorAlertProps> = React.memo(({message}) => (
    <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {message}
    </div>
));

export default ErrorAlert;
