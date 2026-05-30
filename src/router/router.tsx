import { createBrowserRouter, createRoutesFromElements, Outlet, Route, useRouteError } from 'react-router-dom';
import React, { Suspense, lazy, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Layouts
import PublicLayout from '@/layouts/publicLayout';
import AuthLayout from '@/layouts/authLayout';
import UserLayout from '@/layouts/userLayout';
import UserLayoutNoFooter from '@/layouts/userLayoutNoFooter';
import ExamLayout from '@/layouts/examLayout';
import HackathonLayout from '@/layouts/hackathonLayout';
import LectureLayout from '@/layouts/lectureLayout';
import AdminLayout from '@/layouts/adminLayout';
import ErrorLayout from '@/pages/public/error/ErrorLayout';

// Providers — both use useNavigate() so they must live inside the router tree.
import { AuthProvider } from '@/contexts/AuthContext';
import { ErrorHandlerProvider } from '@/contexts/ErrorHandlerContext';

// ProtectedRoute must be a static import — it calls useAuth() which requires AuthProvider.
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy-loaded page components
const LandingPage = lazy(() => import('@/pages/public/landingPage'));
const LoTrinhPage = lazy(() => import('@/pages/public/loTrinhPage'));
const CongDongPage = lazy(() => import('@/pages/public/congDongPage'));
const BangGiaPage = lazy(() => import('@/pages/public/bangGiaPage'));
const RegisterPage = lazy(() => import('@/pages/auth/registerPage'));
const LoginPage = lazy(() => import('@/pages/auth/loginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/forgotPassword'));
const ResetPasswordForm = lazy(() => import('@/pages/auth/resetPasswordForm'));
const ResetPasswordSuccess = lazy(() => import('@/pages/auth/resetPasswordSuccess'));
const GoogleSuccessPage = lazy(() => import('@/pages/auth/GoogleSuccessPage'));
const DashboardUser = lazy(() => import('@/pages/user/dashboardModule/dashboardUser'));
const DanhSachKhoaHocUser = lazy(() => import('@/pages/user/coursesModule/danhSachKhoaHocUser'));
const ChiTietKhoaHoc = lazy(() => import('@/pages/user/coursesModule/chiTietKhoaHoc'));
const LoTrinhHocUser = lazy(() => import('@/pages/user/loTrinhModule/loTrinhHocUser'));
const ChuongTrinhHocUser = lazy(() => import('@/pages/user/coursesModule/chuongTrinhHocUser'));
const StudyPage = lazy(() => import('@/pages/user/codeModule/studyPage'));
const HistoryStudyPage = lazy(() => import('@/pages/user/codeModule/historyStudyPage'));
const GioiThieuMinitest = lazy(() => import('@/pages/user/testModule/gioiThieuMinitest'));
const LamBaiMinitest = lazy(() => import('@/pages/user/testModule/lamBaiMiniest'));
const KetQuaMinitest = lazy(() => import('@/pages/user/testModule/ketQuaMinitest'));
const DashboardTienTrinhUser = lazy(() => import('@/pages/user/progressModule/dashboardTienTrinhUser'));
const ChiTietTienDoUser = lazy(() => import('@/pages/user/progressModule/chiTietTienDoUser'));
const DanhSachHackathon = lazy(() => import('@/pages/user/hackathonModule/danhSachHackathon'));
const DashboardUnlockCode = lazy(() => import('@/pages/user/DashboardUnlockCode'));
const CourseContentPage = lazy(() => import('@/pages/user/CourseContentPage'));
const ChiTietHackathon = lazy(() => import('@/pages/user/hackathonModule/chiTietHackathon'));
const GiaoDienLapTrinhHackathon = lazy(() => import('@/pages/user/hackathonModule/giaoDienLapTrinhHackathon'));
const LeaderboardHackathon = lazy(() => import('@/pages/user/hackathonModule/leadingBoardHackathon'));
const ProfilePageUser = lazy(() => import('@/pages/user/profileModule/profilePageUser'));
const ProfileEditPage = lazy(() => import('@/pages/user/profileModule/profileEditPage'));
const UserNotificationsPage = lazy(() => import('@/pages/user/notificationModule/userNotificationsPage'));
const CertificatePage = lazy(() => import('@/pages/user/certificateModule/certificatePage'));
const CertificateDetailPage = lazy(() => import('@/pages/user/certificateModule/certificateDetail'));
const GioiThieuDuAn = lazy(() => import('@/pages/user/projectModule/gioiThieuDuAn'));
const KetQuaDuAn = lazy(() => import('@/pages/user/projectModule/ketQuaDuAn'));
const NopDuAn = lazy(() => import('@/pages/user/projectModule/nopDuAn'));
const GioiThieuFinalTest = lazy(() => import('@/pages/user/finalTestModule/gioiThieuFinalTest'));
const LamBaiFinalTest = lazy(() => import('@/pages/user/finalTestModule/lamBaiFinalTest'));
const KetQuaFinalTest = lazy(() => import('@/pages/user/finalTestModule/ketQuaFinalTest'));
const VerifyCertificatePage = lazy(() => import('@/pages/public/verifyCertificatePage'));
const ActivateCodeScreen = lazy(() => import('@/pages/user/paymentModule/ActivateCodeScreen'));
const QRPaymentScreen = lazy(() => import('@/pages/user/paymentModule/QRPaymentScreen'));
const PaymentSuccessPage = lazy(() => import('@/pages/user/paymentModule/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('@/pages/user/paymentModule/PaymentCancelPage'));
const AdminDashboard = lazy(() => import('@/pages/admin/dashboardPage'));
const AdminCoursesPage = lazy(() => import('@/pages/admin/coursesPage'));
const AdminCourseEditPage = lazy(() => import('@/pages/admin/courseEditPage'));
const AdminContentEditorPage = lazy(() => import('@/pages/admin/contentEditorPage'));
const AdminLessonEditorPage = lazy(() => import('@/pages/admin/adminLessonEditorPage'));
const MinitestSettingsPage = lazy(() => import('@/pages/admin/minitestSettingsPage'));
const FinalTestSettingsPage = lazy(() => import('@/pages/admin/FinalTestSettingsPage'));
const FinalProjectSettingsPage = lazy(() => import('@/pages/admin/FinalProjectSettingsPage'));
const AdminInstructorsPage = lazy(() => import('@/pages/admin/instructorsPage'));
const InstructorDetailPage = lazy(() => import('@/pages/admin/instructorDetailPage'));
const AdminUsersPage = lazy(() => import('@/pages/admin/usersPage'));
const UserPreviewPage = lazy(() => import('@/pages/admin/userPreviewPage'));
const UserEditPage = lazy(() => import('@/pages/admin/userEditPage'));
const AdminMinitestsPage = lazy(() => import('@/pages/admin/minitestsPage'));
const AdminHackathonsPage = lazy(() => import('@/pages/admin/hackathonsPage'));
const HackathonCreatePage = lazy(() => import('@/pages/admin/hackathonCreatePage'));
const HackathonDetailPage = lazy(() => import('@/pages/admin/hackathonDetailPage'));
const HackathonEditPage = lazy(() => import('@/pages/admin/hackathonEditPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/admin/adminNotificationsPage'));
const AdminNotificationManagementPage = lazy(() => import('@/pages/admin/adminNotificationManagementPage'));
const LectureDashboardPage = lazy(() => import('@/pages/lecture/lectureDashboardPage'));
const LectureMyCoursesPage = lazy(() => import('@/pages/lecture/lectureMyCoursesPage'));
const LectureCourseDetailPage = lazy(() => import('@/pages/lecture/lectureCourseDetailPage'));
const LectureMinitestsPage = lazy(() => import('@/pages/lecture/lectureMinitestsPage'));
const LectureHackathonsPage = lazy(() => import('@/pages/lecture/lectureHackathonsPage'));
const LectureHackathonDetailPage = lazy(() => import('@/pages/lecture/lectureHackathonDetailPage'));
const LessonRequestsPage = lazy(() => import('@/pages/admin/lessonRequestsPage'));
const LessonRequestDetailPage = lazy(() => import('@/pages/admin/lessonRequestDetailPage'));
const LessonRequestCreatePage = lazy(() => import('@/pages/admin/lessonRequestCreatePage'));
const LessonReviewPage = lazy(() => import('@/pages/admin/lessonReviewPage'));
const LectureLessonRequestsPage = lazy(() => import('@/pages/lecture/lectureLessonRequestsPage'));
const LectureLessonEditorPage = lazy(() => import('@/pages/lecture/lectureLessonEditorPage'));
const LectureSubmissionsPage = lazy(() => import('@/pages/lecture/lectureSubmissionsPage'));
const LectureNotificationsPage = lazy(() => import('@/pages/lecture/lectureNotificationsPage'));
const LectureProfilePage = lazy(() => import('@/pages/lecture/lectureProfilePage'));
const LectureProfileEditPage = lazy(() => import('@/pages/lecture/lectureProfileEditPage'));
const UserLessonPage = lazy(() => import('@/pages/user/userLessonPage'));
const InstructorProfilePage = lazy(() => import('@/pages/user/profileModule/InstructorProfilePage'));
const ThongKeDashboard = lazy(() => import('@/pages/user/thongKeModule/thongKeDashboard'));
const AiAssistantPage = lazy(() => import('@/pages/user/aiAssistantModule/aiAssistantPage'));
const LoTrinhUserPage = lazy(() => import('@/pages/user/loTrinhModule/loTrinhUserPage'));
const TaiLieuPage = lazy(() => import('@/pages/user/taiLieuModule/taiLieuPage'));
const Error401 = lazy(() => import('@/pages/public/error/Error401'));
const Error403 = lazy(() => import('@/pages/public/error/Error403'));
const Error404 = lazy(() => import('@/pages/public/error/Error404'));
const Error500 = lazy(() => import('@/pages/public/error/Error500'));

/**
 * Error boundary component for root route
 */
function RootErrorBoundary() {
  useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to 404 page
    navigate('/error/404');
  }, [navigate]);

  return null;
}

/**
 * Wraps all providers that require router context (useNavigate).
 * Rendered as the root layout so it's available to every child route.
 * Outlet renders the matched child route.
 */
function Providers() {
  return (
    <AuthProvider>
      <ErrorHandlerProvider>
        <Outlet />
      </ErrorHandlerProvider>
    </AuthProvider>
  );
}

/**
 * Lazy wrapper with Suspense for page components.
 * Uses the lazy prop on Route directly for clean JSX route definitions.
 */
const pageFallback = (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500">Đang tải...</p>
    </div>
  </div>
);

type AllowedRole = 'admin' | 'lecture' | 'user';

/**
 * Element factory — returns a React element INSIDE the render cycle,
 * AFTER AuthProvider is mounted. This is the key to fixing the
 * useAuth() / useNavigate() dependency cycle.
 */
function protectedElement(allowedRoles: AllowedRole[], layout: React.ReactElement) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles}>
      {layout}
    </ProtectedRoute>
  );
}

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Providers />} errorElement={<RootErrorBoundary />}>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<Suspense fallback={pageFallback}><LandingPage /></Suspense>} />
        <Route path="lo-trinh" element={<Suspense fallback={pageFallback}><LoTrinhPage /></Suspense>} />
        <Route path="cong-dong" element={<Suspense fallback={pageFallback}><CongDongPage /></Suspense>} />
        <Route path="bang-gia" element={<Suspense fallback={pageFallback}><BangGiaPage /></Suspense>} />
      </Route>

      {/* Auth routes */}
      <Route path="/" element={<AuthLayout />}>
        <Route path="dang-ky" element={<Suspense fallback={pageFallback}><RegisterPage /></Suspense>} />
        <Route path="dang-nhap" element={<Suspense fallback={pageFallback}><LoginPage /></Suspense>} />
        <Route path="auth/google/success" element={<Suspense fallback={pageFallback}><GoogleSuccessPage /></Suspense>} />
        <Route path="quen-mat-khau" element={<Suspense fallback={pageFallback}><ForgotPasswordPage /></Suspense>} />
        <Route path="dat-lai-mat-khau" element={<Suspense fallback={pageFallback}><ResetPasswordForm /></Suspense>} />
        <Route path="dat-lai-mat-khau/thanh-cong" element={<Suspense fallback={pageFallback}><ResetPasswordSuccess /></Suspense>} />
      </Route>

      {/* User routes */}
      <Route path="/" element={protectedElement(['user'], <UserLayout />)}>
        <Route path="user/dashboard" element={<Suspense fallback={pageFallback}><DashboardUser /></Suspense>} />
        <Route path="user/thong-ke" element={<Suspense fallback={pageFallback}><ThongKeDashboard /></Suspense>} />
        <Route path="user/lo-trinh" element={<Suspense fallback={pageFallback}><LoTrinhUserPage /></Suspense>} />
        <Route path="user/tai-lieu" element={<Suspense fallback={pageFallback}><TaiLieuPage /></Suspense>} />
        <Route path="user/danh-sach-khoa-hoc" element={<Suspense fallback={pageFallback}><DanhSachKhoaHocUser /></Suspense>} />
        <Route path="user/courses/:id" element={<Suspense fallback={pageFallback}><ChiTietKhoaHoc /></Suspense>} />
        <Route path="user/lot-trinh/:routeLoTrinh" element={<Suspense fallback={pageFallback}><LoTrinhHocUser /></Suspense>} />
        <Route path="user/chuong-trinh/:chuongTrinhId" element={<Suspense fallback={pageFallback}><ChuongTrinhHocUser /></Suspense>} />
        <Route path="user/study/:problemId" element={<Suspense fallback={pageFallback}><StudyPage /></Suspense>} />
        <Route path="user/lich-su-nop-bai" element={<Suspense fallback={pageFallback}><HistoryStudyPage /></Suspense>} />
        <Route path="user/minitest/:minitestId" element={<Suspense fallback={pageFallback}><GioiThieuMinitest /></Suspense>} />
        <Route path="user/minitest/gioi-thieu" element={<Suspense fallback={pageFallback}><GioiThieuMinitest /></Suspense>} />
        <Route path="user/ket-qua-minitest" element={<Suspense fallback={pageFallback}><KetQuaMinitest /></Suspense>} />
        <Route path="user/tien-do-hoc-tap" element={<Suspense fallback={pageFallback}><DashboardTienTrinhUser /></Suspense>} />
        <Route path="user/chi-tiet-tien-do/:problemId" element={<Suspense fallback={pageFallback}><ChiTietTienDoUser /></Suspense>} />
        <Route path="user/hackathon" element={<Suspense fallback={pageFallback}><DanhSachHackathon /></Suspense>} />
        <Route path="user/hackathon/:hackathonId" element={<Suspense fallback={pageFallback}><ChiTietHackathon /></Suspense>} />
        <Route path="user/hackathon/:hackathonId/leaderboard" element={<Suspense fallback={pageFallback}><LeaderboardHackathon /></Suspense>} />
        <Route path="user/profile" element={<Suspense fallback={pageFallback}><ProfilePageUser /></Suspense>} />
        <Route path="user/profile/edit" element={<Suspense fallback={pageFallback}><ProfileEditPage /></Suspense>} />
        <Route path="user/notifications" element={<Suspense fallback={pageFallback}><UserNotificationsPage /></Suspense>} />
        <Route path="user/certificates" element={<Suspense fallback={pageFallback}><CertificatePage /></Suspense>} />
        <Route path="user/certificate/:certificateId" element={<Suspense fallback={pageFallback}><CertificateDetailPage /></Suspense>} />
        <Route path="user/project/:projectId" element={<Suspense fallback={pageFallback}><GioiThieuDuAn /></Suspense>} />
        <Route path="user/project/:projectId/result" element={<Suspense fallback={pageFallback}><KetQuaDuAn /></Suspense>} />
        <Route path="user/project/:projectId/submit" element={<Suspense fallback={pageFallback}><NopDuAn /></Suspense>} />
        <Route path="user/final-test/:finalTestId" element={<Suspense fallback={pageFallback}><GioiThieuFinalTest /></Suspense>} />
        <Route path="user/final-test/:finalTestId/lam-bai" element={<Suspense fallback={pageFallback}><LamBaiFinalTest /></Suspense>} />
        <Route path="user/final-test/:finalTestId/ket-qua" element={<Suspense fallback={pageFallback}><KetQuaFinalTest /></Suspense>} />
        <Route path="user/lesson/:lessonId" element={<Suspense fallback={pageFallback}><UserLessonPage /></Suspense>} />
        <Route path="user/lecture/:lectureId" element={<Suspense fallback={pageFallback}><InstructorProfilePage /></Suspense>} />
        <Route path="user/payment/activate/:courseId?" element={<Suspense fallback={pageFallback}><ActivateCodeScreen /></Suspense>} />
        <Route path="user/payment/qr/:courseId?" element={<Suspense fallback={pageFallback}><QRPaymentScreen /></Suspense>} />
        <Route path="user/payment/success" element={<Suspense fallback={pageFallback}><PaymentSuccessPage /></Suspense>} />
        <Route path="user/payment/cancel" element={<Suspense fallback={pageFallback}><PaymentCancelPage /></Suspense>} />
        <Route path="user/nhap-ma-kich-hoat" element={<Suspense fallback={pageFallback}><DashboardUnlockCode /></Suspense>} />
        <Route path="user/courses/:id/content" element={<Suspense fallback={pageFallback}><CourseContentPage /></Suspense>} />
      </Route>

      {/* User routes — no footer layout */}
      <Route path="/" element={protectedElement(['user'], <UserLayoutNoFooter />)}>
        <Route path="user/ai-assistant" element={<Suspense fallback={pageFallback}><AiAssistantPage /></Suspense>} />
      </Route>

      {/* User routes — hackathon layout */}
      <Route path="/" element={protectedElement(['user'], <HackathonLayout />)}>
        <Route path="user/hackathon/:hackathonId/problem/:problemId" element={<Suspense fallback={pageFallback}><GiaoDienLapTrinhHackathon /></Suspense>} />
      </Route>

      {/* User routes — exam layout */}
      <Route path="/" element={protectedElement(['user'], <ExamLayout />)}>
        <Route path="user/minitest/lam-bai" element={<Suspense fallback={pageFallback}><LamBaiMinitest /></Suspense>} />
      </Route>

      {/* Admin routes */}
      <Route path="/" element={protectedElement(['admin'], <AdminLayout />)}>
        <Route path="admin" element={<Suspense fallback={pageFallback}><AdminDashboard /></Suspense>} />
        <Route path="admin/dashboard" element={<Suspense fallback={pageFallback}><AdminDashboard /></Suspense>} />
        <Route path="admin/courses" element={<Suspense fallback={pageFallback}><AdminCoursesPage /></Suspense>} />
        <Route path="admin/courses/new" element={<Suspense fallback={pageFallback}><AdminCourseEditPage /></Suspense>} />
        <Route path="admin/courses/:id/edit" element={<Suspense fallback={pageFallback}><AdminCourseEditPage /></Suspense>} />
        <Route path="admin/courses/:id/content" element={<Suspense fallback={pageFallback}><AdminContentEditorPage /></Suspense>} />
        <Route path="admin/courses/:id/editor" element={<Suspense fallback={pageFallback}><AdminContentEditorPage /></Suspense>} />
        <Route path="admin/courses/:id/minitests" element={<Suspense fallback={pageFallback}><MinitestSettingsPage /></Suspense>} />
        <Route path="admin/courses/:id/final-test/:hackathonId" element={<Suspense fallback={pageFallback}><FinalTestSettingsPage /></Suspense>} />
        <Route path="admin/courses/:id/final-project/:projectId" element={<Suspense fallback={pageFallback}><FinalProjectSettingsPage /></Suspense>} />
        <Route path="admin/courses/:courseId/lessons/:lessonId/edit" element={<Suspense fallback={pageFallback}><AdminLessonEditorPage /></Suspense>} />
        <Route path="admin/instructors" element={<Suspense fallback={pageFallback}><AdminInstructorsPage /></Suspense>} />
        <Route path="admin/instructors/:lectureId" element={<Suspense fallback={pageFallback}><InstructorDetailPage /></Suspense>} />
        <Route path="admin/users" element={<Suspense fallback={pageFallback}><AdminUsersPage /></Suspense>} />
        <Route path="admin/users/:userId" element={<Suspense fallback={pageFallback}><UserPreviewPage /></Suspense>} />
        <Route path="admin/users/:userId/edit" element={<Suspense fallback={pageFallback}><UserEditPage /></Suspense>} />
        <Route path="admin/minitests" element={<Suspense fallback={pageFallback}><AdminMinitestsPage /></Suspense>} />
        <Route path="admin/hackathons" element={<Suspense fallback={pageFallback}><AdminHackathonsPage /></Suspense>} />
        <Route path="admin/hackathons/create" element={<Suspense fallback={pageFallback}><HackathonCreatePage /></Suspense>} />
        <Route path="admin/hackathons/:id" element={<Suspense fallback={pageFallback}><HackathonDetailPage /></Suspense>} />
        <Route path="admin/hackathons/:id/edit" element={<Suspense fallback={pageFallback}><HackathonEditPage /></Suspense>} />
        <Route path="admin/notifications" element={<Suspense fallback={pageFallback}><AdminNotificationsPage /></Suspense>} />
        <Route path="admin/notifications/manage" element={<Suspense fallback={pageFallback}><AdminNotificationManagementPage /></Suspense>} />
        <Route path="admin/lesson-requests" element={<Suspense fallback={pageFallback}><LessonRequestsPage /></Suspense>} />
        <Route path="admin/lesson-requests/create" element={<Suspense fallback={pageFallback}><LessonRequestCreatePage /></Suspense>} />
        <Route path="admin/lesson-requests/:id" element={<Suspense fallback={pageFallback}><LessonRequestDetailPage /></Suspense>} />
        <Route path="admin/lesson-reviews" element={<Suspense fallback={pageFallback}><LessonReviewPage /></Suspense>} />
      </Route>

      {/* Lecture routes */}
      <Route path="/" element={protectedElement(['lecture'], <LectureLayout />)}>
        <Route path="lecture" element={<Suspense fallback={pageFallback}><LectureDashboardPage /></Suspense>} />
        <Route path="lecture/my-courses" element={<Suspense fallback={pageFallback}><LectureMyCoursesPage /></Suspense>} />
        <Route path="lecture/my-courses/:courseId" element={<Suspense fallback={pageFallback}><LectureCourseDetailPage /></Suspense>} />
        <Route path="lecture/minitests" element={<Suspense fallback={pageFallback}><LectureMinitestsPage /></Suspense>} />
        <Route path="lecture/hackathons" element={<Suspense fallback={pageFallback}><LectureHackathonsPage /></Suspense>} />
        <Route path="lecture/hackathons/:hackathonId" element={<Suspense fallback={pageFallback}><LectureHackathonDetailPage /></Suspense>} />
        <Route path="lecture/lesson-requests" element={<Suspense fallback={pageFallback}><LectureLessonRequestsPage /></Suspense>} />
        <Route path="lecture/lessons/:lessonId/edit" element={<Suspense fallback={pageFallback}><LectureLessonEditorPage /></Suspense>} />
        <Route path="lecture/submissions" element={<Suspense fallback={pageFallback}><LectureSubmissionsPage /></Suspense>} />
        <Route path="lecture/notifications" element={<Suspense fallback={pageFallback}><LectureNotificationsPage /></Suspense>} />
        <Route path="lecture/profile" element={<Suspense fallback={pageFallback}><LectureProfilePage /></Suspense>} />
        <Route path="lecture/profile/edit" element={<Suspense fallback={pageFallback}><LectureProfileEditPage /></Suspense>} />
      </Route>

      {/* Error routes */}
      <Route path="/error" element={<ErrorLayout />}>
        <Route path="401" element={<Suspense fallback={pageFallback}><Error401 /></Suspense>} />
        <Route path="403" element={<Suspense fallback={pageFallback}><Error403 /></Suspense>} />
        <Route path="404" element={<Suspense fallback={pageFallback}><Error404 /></Suspense>} />
        <Route path="500" element={<Suspense fallback={pageFallback}><Error500 /></Suspense>} />
        <Route path="*" element={<Suspense fallback={pageFallback}><Error404 /></Suspense>} />
      </Route>

      {/* Public verify certificate route (no layout) */}
      <Route path="/verify/:certificateId" element={<Suspense fallback={pageFallback}><VerifyCertificatePage /></Suspense>} />
    </Route>
  )
);
