import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { CourseSelectPage } from "../pages/dashboard/CourseSelectPage";
import { CourseDetailPage } from "../pages/dashboard/CourseDetailPage";
import { McqPracticePage } from "../pages/dashboard/McqPracticePage";
import { SectionedTestTakePage } from "../pages/dashboard/SectionedTestTakePage";
import { ProfilePage } from "../pages/profile/ProfilePage";
import { MyProgressPage } from "../pages/progress/MyProgressPage";
import { BookmarksPage } from "../pages/bookmarks/BookmarksPage";
import { MyMistakesPage } from "../pages/dashboard/MyMistakesPage";
import { NotificationsPage } from "../pages/dashboard/NotificationsPage";
import { FlashcardStudyPage } from "../pages/dashboard/FlashcardStudyPage";
import { EsewaCallbackPage } from "../pages/payment/EsewaCallbackPage";
import { KhaltiCallbackPage } from "../pages/payment/KhaltiCallbackPage";
import { LibraryPage } from "../pages/library/LibraryPage";
import { DashboardLayout } from "../components/common/DashboardLayout";
import { ProtectedRoute } from "../components/common/ProtectedRoute";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<CourseSelectPage />} />
          <Route path="/courses/:courseId" element={<CourseDetailPage />} />
          <Route path="/courses/:courseId/practice" element={<McqPracticePage />} />
          <Route path="/courses/:courseId/mock-test/:mockTestId" element={<SectionedTestTakePage />} />
          <Route path="/courses/:courseId/library" element={<LibraryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/progress" element={<MyProgressPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/my-mistakes" element={<MyMistakesPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/courses/:courseId/flashcards" element={<FlashcardStudyPage />} />
          <Route path="/payment/esewa/success" element={<EsewaCallbackPage />} />
          <Route path="/payment/khalti/callback" element={<KhaltiCallbackPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
