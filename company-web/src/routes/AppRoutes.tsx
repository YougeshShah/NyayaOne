import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LawFirmsPage } from "../pages/lawfirms/LawFirmsPage";
import { CourtsPage } from "../pages/courts/CourtsPage";
import { NotificationsPage } from "../pages/notifications/NotificationsPage";
import { AuditLogsPage } from "../pages/audit-logs/AuditLogsPage";
import { LibraryPage } from "../pages/library/LibraryPage";
import { CompanyStaffPage } from "../pages/company-staff/CompanyStaffPage";
import { SubscriptionsPage } from "../pages/subscriptions/SubscriptionsPage";
import { DocumentTemplatesPage } from "../pages/document-templates/DocumentTemplatesPage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/law-firms" element={<LawFirmsPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/company-staff" element={<CompanyStaffPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/document-templates" element={<DocumentTemplatesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
