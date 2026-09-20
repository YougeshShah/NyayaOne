import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const FIRM_ACCOUNT_TYPES = ["LAW_FIRM_ADMIN", "LAWYER", "STAFF"];

export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!FIRM_ACCOUNT_TYPES.includes(user.accountType)) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
