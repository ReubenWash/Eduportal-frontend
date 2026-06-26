import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  ClipboardList,
  CalendarDays,
  Users,
  GraduationCap,
  UserCheck,
  BarChart2,
  CheckSquare,
  FileText,
  TrendingUp,
  Bell,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Search,
  ShieldCheck,
  Building2,
  Activity,
  ShieldAlert,
  Key,
  CreditCard,
  Database,
  LifeBuoy,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';

const superAdminNav = [
  {
    label: 'Overview',
    items: [
      { path: '/admin',         icon: LayoutDashboard, label: 'Dashboard',       roles: ['SUPER_ADMIN'] },
      { path: '/admin/schools', icon: Building2,       label: 'Schools',         roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Schools',
    items: [
      { path: '/admin/schools',      icon: Building2,  label: 'Schools',             roles: ['SUPER_ADMIN'] },
      { path: '/admin/applications', icon: FileText,   label: 'School Applications',  roles: ['SUPER_ADMIN'] },
      { path: '/admin/subscriptions',icon: CreditCard, label: 'Subscriptions',        roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Users',
    items: [
      { path: '/admin/users',        icon: Users,      label: 'User Management',     roles: ['SUPER_ADMIN'] },
      { path: '/admin/roles',        icon: ShieldAlert,label: 'Roles & Permissions',  roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { path: '/admin/integrations', icon: Key,        label: 'API Keys',            roles: ['SUPER_ADMIN'] },
      { path: '/admin/integrations', icon: CreditCard, label: 'Payment Gateways',     roles: ['SUPER_ADMIN'] },
      { path: '/admin/notifications-center', icon: Bell,label: 'Notifications',       roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/admin/analytics',    icon: FileText,   label: 'Reports',             roles: ['SUPER_ADMIN'] },
      { path: '/admin/subscriptions',icon: TrendingUp, label: 'Revenue Analytics',   roles: ['SUPER_ADMIN'] },
      { path: '/admin/analytics',    icon: BarChart2,  label: 'Platform Analytics',  roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings',     icon: Settings,   label: 'Settings',            roles: ['SUPER_ADMIN'] },
      { path: '/admin/security',     icon: ShieldCheck,label: 'Security',            roles: ['SUPER_ADMIN'] },
      { path: '/admin/audit-logs',   icon: FileText,   label: 'Audit Logs',          roles: ['SUPER_ADMIN'] },
      { path: '/admin/backups',      icon: Database,   label: 'Backups',             roles: ['SUPER_ADMIN'] },
      { path: '/admin/monitoring',   icon: Activity,   label: 'Monitoring',          roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Support',
    items: [
      { path: '/admin/support',      icon: LifeBuoy,   label: 'Help Desk',           roles: ['SUPER_ADMIN'] },
      { path: '/admin/support',      icon: LifeBuoy,   label: 'Feedback',            roles: ['SUPER_ADMIN'] },
      { path: '/admin/support',      icon: Bell,       label: 'Announcements',       roles: ['SUPER_ADMIN'] },
    ],
  },
];

const navGroups = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    ],
  },
  {
    label: 'Academic',
    items: [
      { path: '/classes', icon: BookOpen, label: 'Classes', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT'] },
      { path: '/subjects', icon: Library, label: 'Subjects', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT'] },
      { path: '/enrollments', icon: ClipboardList, label: 'Enrollments', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT'] },
      { path: '/terms', icon: CalendarDays, label: 'Terms', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT'] },
    ],
  },
  {
    label: 'People',
    items: [
      { path: '/staff', icon: Users, label: 'Staff', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
      { path: '/students', icon: GraduationCap, label: 'Students', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'PARENT'] },
      { path: '/guardians', icon: UserCheck, label: 'Guardians', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'] },
    ],
  },
  {
    label: 'Assessment',
    items: [
      { path: '/scores', icon: BarChart2, label: 'Scores', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT'] },
      { path: '/attendance', icon: CheckSquare, label: 'Attendance', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT'] },
      { path: '/reports', icon: FileText, label: 'Reports', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'] },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/analytics', icon: TrendingUp, label: 'Analytics', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PARENT'] },
      { path: '/notifications', icon: Bell, label: 'Notifications', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER', 'PARENT', 'STUDENT'] },
      { path: '/settings', icon: Settings, label: 'School Settings', roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN'] },
    ],
  },
];

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userRole = user?.role || 'SCHOOL_ADMIN';

  const filteredNav = userRole === 'SUPER_ADMIN'
    ? superAdminNav
    : navGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.roles.includes(userRole)),
        }))
        .filter((group) => group.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col
          transform transition-transform duration-200 ease-in-out
          ${userRole === 'SUPER_ADMIN' ? 'bg-slate-950' : 'bg-gray-900'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-5 border-b border-white/5 flex-shrink-0">
          <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-lg ${userRole === 'SUPER_ADMIN' ? 'bg-indigo-500 shadow-indigo-500/40' : 'bg-indigo-600 shadow-indigo-500/30'}`}>
            {userRole === 'SUPER_ADMIN' ? <ShieldCheck className="h-4 w-4 text-white" /> : <GraduationCap className="h-4 w-4 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white font-bold text-[15px] tracking-tight">EduPortal</span>
            {userRole === 'SUPER_ADMIN' && (
              <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase leading-none mt-0.5">Admin Panel</p>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-gray-500 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-700">
          {filteredNav.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 pb-1.5 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="flex-shrink-0 p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'Admin User'}</p>
              {userRole === 'SUPER_ADMIN' ? (
                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-300 uppercase tracking-wider">
                  <ShieldCheck className="h-2.5 w-2.5" /> Super Admin
                </span>
              ) : (
                <p className="text-[11px] text-gray-500 truncate">{user?.role?.replace(/_/g, ' ') || 'School Admin'}</p>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-400 transition-colors"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-30 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-xs hidden md:flex items-center">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-none">{user?.role?.replace(/_/g, ' ') || 'School Admin'}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'Admin User'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email || 'admin@school.com'}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="h-4 w-4 text-gray-400" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}