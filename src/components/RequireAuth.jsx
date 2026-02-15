import { useLocation, Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const RequireAuth = ({ allowedPermission }) => {
    const { auth } = useAuth();
    const location = useLocation();

    return (
        auth?.accessToken && (allowedPermission ? auth?.permission === allowedPermission : true)
            ? <Outlet />
            : !!auth?.accessToken
                ? <Navigate to="/unauthorized" state={{ from: location }} replace />
                : <Navigate to="/login" state={{ from: location }} replace />
    );
}

export default RequireAuth;