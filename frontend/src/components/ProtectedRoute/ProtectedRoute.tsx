import { useAppSelector } from "@store/hooks";
import { Navigate } from "react-router";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, token } = useAppSelector((state) => state.auth);

    if (!user || !token) {
        return <Navigate to="/login" replace />;
    }

    return <>{children}</>;
}