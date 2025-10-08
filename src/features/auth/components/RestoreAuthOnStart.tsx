import { useEffect } from "react";
import axiosInstance from "../../../lib/axiosInstance";
import { useAppDispatch } from "../../../app/hooks";
import { bootstrapFromProfile } from "../slice/authSlice";

/**
 * RestoreAuthOnStart
 * Один раз при старте приложения спрашивает сервер,
 * есть ли действующая сессия (HttpOnly-кука).
 * Если да — восстанавливает пользователя и флаг isAuthenticated в сторе.
 */
export default function RestoreAuthOnStart() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            try {
                // BE: GET /api/v1/users/profile -> { email, role, confirmationStatus }
                const res = await axiosInstance.get("/users/profile");
                if (!cancelled && res?.data) {
                    dispatch(bootstrapFromProfile(res.data));
                }
            } catch {
                // 401 / network — user remains a "guest"
            }
        };

        run();
        return () => {
            cancelled = true;
        };
    }, [dispatch]);

    return null;
}
