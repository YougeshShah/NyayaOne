import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterOrganizationPage } from "../pages/auth/RegisterOrganizationPage";
import { VerifyEmailPage } from "../pages/auth/VerifyEmailPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { ClientsPage } from "../pages/clients/ClientsPage";
import { CasesPage } from "../pages/cases/CasesPage";
import { CaseDetailPage } from "../pages/cases/CaseDetailPage";
import { HearingsPage } from "../pages/hearings/HearingsPage";
import { UsersPage } from "../pages/users/UsersPage";
import { RolesPage } from "../pages/roles/RolesPage";
import { StudentsPage } from "../pages/students/StudentsPage";
import { LiveClassesPage } from "../pages/live-classes/LiveClassesPage";
import { ResourcesPage } from "../pages/resources/ResourcesPage";
import { InstitutionMockTestAdminPage } from "../pages/mock-tests/InstitutionMockTestAdminPage";
import { ReportsPage } from "../pages/reports/ReportsPage";
import { LibraryPage } from "../pages/library/LibraryPage";
import { SpeakingPromptAdminPage } from "../pages/speaking-admin/SpeakingPromptAdminPage";
import { AccountingPage } from "../pages/accounting/AccountingPage";
import { PendingApprovalsPage } from "../pages/students/PendingApprovalsPage";
import { UsageLimitAdminPage } from "../pages/usage-limit-admin/UsageLimitAdminPage";
import { PrecedentSearchPage } from "../pages/precedents/PrecedentSearchPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterOrganizationPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/hearings" element={<HearingsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/live-classes" element={<LiveClassesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/mock-tests" element={<InstitutionMockTestAdminPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/speaking-admin" element={<SpeakingPromptAdminPage />} />
          <Route path="/accounting" element={<AccountingPage />} />
          <Route path="/pending-approvals" element={<PendingApprovalsPage />} />
          <Route path="/usage-limits" element={<UsageLimitAdminPage />} />
          <Route path="/precedents" element={<PrecedentSearchPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
