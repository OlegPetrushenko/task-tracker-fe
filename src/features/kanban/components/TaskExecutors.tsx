import React from "react";
import type { ExecutorDto } from "../../tasks/types";
import type { ProjectWithColumnsResponse } from "../../projects/types";

type OwnerDto = ProjectWithColumnsResponse["owner"];

export const TaskExecutors: React.FC<{
    executors: ExecutorDto[] | undefined;
    projectOwner: OwnerDto | undefined;
}> = ({ executors, projectOwner }) => {
    const hasExecutors = executors && executors.length > 0;

    if (hasExecutors) {
        const firstExecutor = executors[0];
        const restCount = executors.length - 1;

        return (
            <span className="text-gray-700 font-normal">
                {firstExecutor.fullName}
                {restCount > 0 && (
                    <span className="ml-1 text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                        +{restCount}
                    </span>
                )}
            </span>
        );
    }

    if (projectOwner) {
        return (
            <span className="text-orange-600 font-medium italic">
                {projectOwner.name || projectOwner.email} (Owner)
            </span>
        );
    }

    return <span className="text-gray-400 font-normal">Not assigned</span>;
};
