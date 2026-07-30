import type { ReactNode } from "react";
import { useAppSelector } from "@store/hooks";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
    // A loaded user is the only signal available: the session itself lives in
    // httpOnly cookies that no script here can see.
    const user = useAppSelector((state) => state.auth.user);

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}
