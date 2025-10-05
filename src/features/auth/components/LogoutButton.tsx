import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { logout, selectIsLoggingOut } from "../slice/authSlice";

export default function LogoutButton() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const isLoggingOut = useAppSelector(selectIsLoggingOut);

    const onClick = () => {
        Promise.resolve(dispatch(logout()))
            .then(() => navigate("/login", { replace: true }))
            .catch(() => {
                // опционально: показать тост
            });
    };

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={isLoggingOut}
            className="rounded border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:border-black transition-colors disabled:opacity-60"
        >
            {isLoggingOut ? "Signing out…" : "Logout"}
        </button>
    );
}
