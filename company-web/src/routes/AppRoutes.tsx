import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { LawFirmsPage } from "../pages/lawfirms/LawFirmsPage";
import { RolesPage } from "../pages/roles/RolesPage";
import { CourtsPage } from "../pages/courts/CourtsPage";
import { NotificationsPage } from "../pages/notifications/NotificationsPage";
import { AuditLogsPage } from "../pages/audit-logs/AuditLogsPage";
import { LibraryPage } from "../pages/library/LibraryPage";
import { CompanyStaffPage } from "../pages/company-staff/CompanyStaffPage";
import { SubscriptionsPage } from "../pages/subscriptions/SubscriptionsPage";
import { DocumentTemplatesPage } from "../pages/document-templates/DocumentTemplatesPage";
import { CoursesAdminPage } from "../pages/courses-admin/CoursesAdminPage";
import { McqAdminPage } from "../pages/mcq-admin/McqAdminPage";
import { FlashcardAdminPage } from "../pages/flashcard-admin/FlashcardAdminPage";
import { MockTestAdminPage } from "../pages/mock-test-admin/MockTestAdminPage";
import { LiveClassAdminPage } from "../pages/live-class-admin/LiveClassAdminPage";
import { GrantSubscriptionPage } from "../pages/grant-subscription/GrantSubscriptionPage";
import { WritingGradingPage } from "../pages/writing-grading/WritingGradingPage";
import { ContentGeneratorPage } from "../pages/content-generator/ContentGeneratorPage";
import { PhotoEditorPage } from "../pages/photo-editor/PhotoEditorPage";
import { TransactionsPage } from "../pages/transactions/TransactionsPage";
import { UserAdminPage } from "../pages/user-admin/UserAdminPage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/law-firms" element={<LawFirmsPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/courts" element={<CourtsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/audit-logs" element={<AuditLogsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/company-staff" element={<CompanyStaffPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/document-templates" element={<DocumentTemplatesPage />} />
          <Route path="/courses-admin" element={<CoursesAdminPage />} />
          <Route path="/mcq-admin" element={<McqAdminPage />} />
          <Route path="/flashcard-admin" element={<FlashcardAdminPage />} />
          <Route path="/mock-test-admin" element={<MockTestAdminPage />} />
          <Route path="/live-class-admin" element={<LiveClassAdminPage />} />
          <Route path="/grant-subscription" element={<GrantSubscriptionPage />} />
          <Route path="/writing-grading" element={<WritingGradingPage />} />
          <Route path="/content-generator" element={<ContentGeneratorPage />} />
          <Route path="/photo-editor" element={<PhotoEditorPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/user-admin" element={<UserAdminPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
