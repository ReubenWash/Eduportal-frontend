import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute, { roleHome } from './routes/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import ToastContainer from './components/ui/Toast';

const LandingPage = lazy(() => import('./pages/Landing'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmail'));
const GenericPage = lazy(() => import('./pages/public/GenericPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Settings = lazy(() => import('./pages/settings/Settings'));
const Terms = lazy(() => import('./pages/terms/Terms'));
const Staff = lazy(() => import('./pages/staff/Staff'));
const Students = lazy(() => import('./pages/students/Students'));
const StudentDetail = lazy(() => import('./pages/students/StudentDetail'));
const Guardians = lazy(() => import('./pages/guardians/Guardians'));
const Classes = lazy(() => import('./pages/classes/Classes'));
const Subjects = lazy(() => import('./pages/subjects/Subjects'));
const Enrollments = lazy(() => import('./pages/enrollments/Enrollments'));
const Scores = lazy(() => import('./pages/scores/Scores'));
const Attendance = lazy(() => import('./pages/attendance/Attendance'));
const Reports = lazy(() => import('./pages/reports/Reports'));
const Analytics = lazy(() => import('./pages/analytics/Analytics'));
const Notifications = lazy(() => import('./pages/notifications/Notifications'));
const ParentPortal = lazy(() => import('./pages/parent/ParentPortal'));
const StudentPortal = lazy(() => import('./pages/student/StudentPortal'));
const SuperAdminDashboard = lazy(() => import('./pages/superadmin/SuperAdminDashboard'));
const AdminSchools = lazy(() => import('./pages/superadmin/AdminSchools'));
const AdminUsers = lazy(() => import('./pages/superadmin/AdminUsers'));
const AdminApplications = lazy(() => import('./pages/superadmin/AdminApplications'));
const AdminIntegrations = lazy(() => import('./pages/superadmin/AdminIntegrations'));
const AdminSubscriptions = lazy(() => import('./pages/superadmin/AdminSubscriptions'));
const AdminRoles = lazy(() => import('./pages/superadmin/AdminRoles'));
const AdminAnalytics = lazy(() => import('./pages/superadmin/AdminAnalytics'));
const AdminSecurity = lazy(() => import('./pages/superadmin/AdminSecurity'));
const AdminNotificationsCenter = lazy(() => import('./pages/superadmin/AdminNotificationsCenter'));
const AdminBackup = lazy(() => import('./pages/superadmin/AdminBackup'));
const AdminSupport = lazy(() => import('./pages/superadmin/AdminSupport'));
const AdminMonitoring = lazy(() => import('./pages/superadmin/AdminMonitoring'));
const AdminAuditLogs = lazy(() => import('./pages/superadmin/AdminAuditLogs'));
const AdminSettings = lazy(() => import('./pages/superadmin/AdminSettings'));
const AdminCMS = lazy(() => import('./pages/superadmin/AdminCMS'));
const AdminMedia = lazy(() => import('./pages/superadmin/AdminMedia'));
const AdminEmailTemplates = lazy(() => import('./pages/superadmin/AdminEmailTemplates'));
const AdminMobileApp = lazy(() => import('./pages/superadmin/AdminMobileApp'));
const AdminAIConfig = lazy(() => import('./pages/superadmin/AdminAIConfig'));
const AdminDeveloperTools = lazy(() => import('./pages/superadmin/AdminDeveloperTools'));
const AdminLegal = lazy(() => import('./pages/superadmin/AdminLegal'));
const AdminAnnouncements = lazy(() => import('./pages/superadmin/AdminAnnouncements'));

// Kept for backward compatibility with lazy imports elsewhere
import AppLayout from './layouts/AppLayout';

function CatchAll() {
  const { user } = useAuth();
  return <Navigate to={user ? roleHome(user.role) : '/login'} replace />;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

// Role groups, matching EduTrack JHS Project Documentation section 5
const ADMIN_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN'];
const STAFF_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'];
const CLASS_TEACHER_ROLES = ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER'];

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <ToastContainer />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />

            {/* Public Footer Links */}
            <Route path="/changelog" element={<GenericPage />} />
            <Route path="/roadmap" element={<GenericPage />} />
            <Route path="/team" element={<GenericPage />} />
            <Route path="/docs" element={<GenericPage />} />
            <Route path="/contact" element={<GenericPage />} />
            <Route path="/status" element={<GenericPage />} />
            <Route path="/community" element={<GenericPage />} />
            <Route path="/privacy" element={<GenericPage />} />
            <Route path="/terms-of-service" element={<GenericPage />} />
            <Route path="/data" element={<GenericPage />} />

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Dashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Settings /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Terms /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Staff /></ProtectedRoute>} />

              {/* Student profiles: Class Teacher can view/edit their class; only admins admit/delete (enforced in-page too) */}
              <Route path="/students" element={<ProtectedRoute allowedRoles={CLASS_TEACHER_ROLES}><Students /></ProtectedRoute>} />
              <Route path="/students/:id" element={<ProtectedRoute allowedRoles={CLASS_TEACHER_ROLES}><StudentDetail /></ProtectedRoute>} />

              {/* Guardian directory management is an admin function, not the parent's own view */}
              <Route path="/guardians" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Guardians /></ProtectedRoute>} />

              <Route path="/classes" element={<ProtectedRoute allowedRoles={CLASS_TEACHER_ROLES}><Classes /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Subjects /></ProtectedRoute>} />
              <Route path="/enrollments" element={<ProtectedRoute allowedRoles={CLASS_TEACHER_ROLES}><Enrollments /></ProtectedRoute>} />

              {/* Score entry is a teacher function, not a parent-facing one */}
              <Route path="/scores" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Scores /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute allowedRoles={STAFF_ROLES}><Attendance /></ProtectedRoute>} />

              {/* Report approval/generation is admin-only per doc 5.2 */}
              <Route path="/reports" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Reports /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><Analytics /></ProtectedRoute>} />

              <Route path="/notifications" element={<Notifications />} />

              {/* Parent / Student read-only portals */}
              <Route path="/parent" element={<ProtectedRoute allowedRoles={['PARENT']}><ParentPortal /></ProtectedRoute>} />
              <Route path="/student" element={<ProtectedRoute allowedRoles={['STUDENT']}><StudentPortal /></ProtectedRoute>} />

              {/* Super Admin Only */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><SuperAdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/schools" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSchools /></ProtectedRoute>} />
              <Route path="/admin/applications" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminApplications /></ProtectedRoute>} />
              <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSubscriptions /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminUsers /></ProtectedRoute>} />
              <Route path="/admin/roles" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminRoles /></ProtectedRoute>} />
              <Route path="/admin/integrations" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminIntegrations /></ProtectedRoute>} />
              <Route path="/admin/notifications-center" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminNotificationsCenter /></ProtectedRoute>} />
              <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAnalytics /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSettings /></ProtectedRoute>} />
              <Route path="/admin/security" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSecurity /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />
              <Route path="/admin/backups" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminBackup /></ProtectedRoute>} />
              <Route path="/admin/monitoring" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminMonitoring /></ProtectedRoute>} />
              <Route path="/admin/support" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminSupport /></ProtectedRoute>} />
              <Route path="/admin/cms" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminCMS /></ProtectedRoute>} />
              <Route path="/admin/media" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminMedia /></ProtectedRoute>} />
              <Route path="/admin/email-templates" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminEmailTemplates /></ProtectedRoute>} />
              <Route path="/admin/mobile-app" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminMobileApp /></ProtectedRoute>} />
              <Route path="/admin/ai-config" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAIConfig /></ProtectedRoute>} />
              <Route path="/admin/developer-tools" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminDeveloperTools /></ProtectedRoute>} />
              <Route path="/admin/legal" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminLegal /></ProtectedRoute>} />
              <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><AdminAnnouncements /></ProtectedRoute>} />
            </Route>

            <Route path="*" element={<CatchAll />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}