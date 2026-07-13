import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

/**
 * Guards company-dashboard routes. Redirects to /login if not authenticated,
 * or if the logged-in user is not a COMPANY account (e.g. a law firm admin
 * accidentally opened this portal).
 */
export function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.accountType !== "COMPANY") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
