import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { TaskDto } from "../../tasks/types";
import { updateTask } from "../../tasks/services/api"; 
import { formatDate } from "../../../utils/formatDate"; 

interface TaskModalProps {
    task: TaskDto | null;
    onClose: () => void;
    onUpdate: (task: TaskDto) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task?.title || "");
    const [description, setDescription] = useState(task?.description || "");
    const projectOwner = (task as any)?.project?.owner;

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || "");
            setIsEditing(false);
        }
    }, [task]);

    if (!task) return null;

    const handleSave = async () => {
        const updatedTask: TaskDto = { ...task, title, description };
        onUpdate(updatedTask);
        setIsEditing(false);
        try {
            await updateTask(updatedTask.id, { title: updatedTask.title, description: updatedTask.description });
        } catch (err) {
            console.error("Failed to persist task update", err);
        }
    };

    const renderAssignee = () => {
        const executors = task.executors || [];
        if (executors.length > 0) {
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
            <div className="relative bg-white p-6 rounded-2xl w-full max-w-lg shadow-xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    aria-label="Close task"
                    className="absolute top-3 right-3 p-1 rounded hover:bg-gray-100 transition"
                >
                    <X className="w-5 h-5 text-gray-600" />
                </button>

                <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                    {isEditing ? "Edit Task" : task.title}
                </h2>

                {isEditing ? (
                    <>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="border p-2 w-full mb-4 rounded focus:ring-blue-500 focus:border-blue-500"
                        />

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="border p-2 w-full mb-4 resize-y rounded focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                            placeholder="Description..."
                        />
                    </>
                ) : (
                    <>
                        <p className="mb-2 bg-gray-50 p-3 rounded">
                            <span className="font-semibold block text-gray-700 mb-1">
                                Description:
                            </span>
                            {task.description || (
                                <span className="text-gray-400 italic">
                                    No description provided
                                </span>
                            )}
                        </p>

                        <p className="mb-2 flex justify-between items-center">
                            <span className="font-semibold text-gray-600">Assignee:</span>
                            {renderAssignee()}
                        </p>

                        {task.dueDate && (
                            <p className="mb-2 flex justify-between items-center">
                                <span className="font-semibold text-gray-600">Due Date:</span>
                                <span
                                    className={
                                        new Date(task.dueDate) < new Date()
                                            ? "text-red-600 font-bold"
                                            : "text-green-600 font-medium"
                                    }
                                >
                                    {formatDate(task.dueDate)}
                                </span>
                            </p>
                        )}
                    </>
                )}

                {/* Buttons row */}
                <div className="flex justify-end gap-2 mt-4">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSave}
                                className="min-w-[100px] bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="min-w-[100px] bg-gray-300 text-gray-800 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="min-w-[100px] bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition"
                        >
                            Edit
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="min-w-[100px] bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
