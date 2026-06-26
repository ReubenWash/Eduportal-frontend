import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';
import ToastContainer from './components/ui/Toast';
import { getInitials } from './utils/helpers';

const LandingPage = lazy(() => import('./pages/Landing'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPassword'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmail'));
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

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-64">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
  </div>
);

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

            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN']}><Settings /></ProtectedRoute>} />
              <Route path="/terms" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><Terms /></ProtectedRoute>} />
              <Route path="/staff" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN']}><Staff /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><Students /></ProtectedRoute>} />
              <Route path="/students/:id" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><StudentDetail /></ProtectedRoute>} />
              <Route path="/guardians" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT']}><Guardians /></ProtectedRoute>} />
              <Route path="/classes" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><Classes /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><Subjects /></ProtectedRoute>} />
              <Route path="/enrollments" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT']}><Enrollments /></ProtectedRoute>} />
              <Route path="/scores" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT']}><Scores /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT']}><Attendance /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT']}><Reports /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT']}><Analytics /></ProtectedRoute>} />
              <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

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
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  );
}