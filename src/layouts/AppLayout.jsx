import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
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
  MessageSquareText,
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
  Home,
  ClipboardCheck,
  Monitor,
  Image,
  Mail,
  Smartphone,
  Cpu,
  Code,
  Scale,
  Paperclip,
  Wallet,
  TrendingUp,
  Receipt,      // ← Phase 1
  ScrollText,   // ← Phase 1
  Sparkles,
  BookMarked,
  Award,
  Clock3,
  Bus,
  DollarSign,
  MessageSquare,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { disablePushNotifications } from '../firebase/messaging';
import Avatar from '../components/ui/Avatar';

const superAdminNav = [
  {
    label: 'Overview',
    items: [
      { path: '/admin',         icon: LayoutDashboard, label: 'Dashboard',       roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Schools',
    items: [
      { path: '/admin/schools',      icon: Building2,  label: 'Schools',             roles: ['SUPER_ADMIN'] },
      { path: '/admin/applications', icon: FileText,   label: 'Applications',        roles: ['SUPER_ADMIN'] },
      { path: '/admin/billing',      icon: CreditCard, label: 'Payments',            roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Users',
    items: [
      { path: '/admin/users',        icon: Users,      label: 'User Management',     roles: ['SUPER_ADMIN'] },
      { path: '/admin/roles',        icon: ShieldAlert,label: 'Roles & Permissions', roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Notifications',
    items: [
      { path: '/admin/notifications-center', icon: Bell, label: 'Announcements',    roles: ['SUPER_ADMIN'] },
      { path: '/notifications', icon: Bell, label: 'My Notifications', roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { path: '/admin/analytics',    icon: BarChart2,  label: 'Platform Analytics', roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Platform CMS',
    items: [
      { path: '/admin/cms',          icon: Monitor,    label: 'Website CMS',        roles: ['SUPER_ADMIN'] },
      { path: '/admin/media',        icon: Image,      label: 'File & Media',       roles: ['SUPER_ADMIN'] },
      { path: '/admin/legal',        icon: Scale,      label: 'Legal & Compliance', roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Configurations',
    items: [
      { path: '/admin/integrations', icon: Key,        label: 'Integrations',       roles: ['SUPER_ADMIN'] },
      { path: '/admin/email-templates', icon: Mail,    label: 'Email Templates',    roles: ['SUPER_ADMIN'] },
      { path: '/admin/mobile-app',   icon: Smartphone, label: 'Mobile App',         roles: ['SUPER_ADMIN'] },
      { path: '/admin/ai-config',    icon: Cpu,        label: 'AI Configuration',   roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'System',
    items: [
      { path: '/admin/settings',     icon: Settings,   label: 'System Settings',    roles: ['SUPER_ADMIN'] },
      { path: '/admin/security',     icon: ShieldCheck,label: 'Security Center',    roles: ['SUPER_ADMIN'] },
      { path: '/admin/audit-logs',   icon: FileText,   label: 'Audit Logs',         roles: ['SUPER_ADMIN'] },
      { path: '/admin/backups',      icon: Database,   label: 'Backup & Restore',   roles: ['SUPER_ADMIN'] },
      { path: '/admin/monitoring',   icon: Activity,   label: 'Monitoring & Health',roles: ['SUPER_ADMIN'] },
      { path: '/admin/developer-tools', icon: Code,    label: 'Developer Tools',    roles: ['SUPER_ADMIN'] },
    ],
  },
  {
    label: 'Support',
    items: [
      { path: '/admin/support',      icon: LifeBuoy,   label: 'Support Center',     roles: ['SUPER_ADMIN'] },
    ],
  },
];

// School Management – Administrator Portal Navigation
const schoolAdminNav = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    label: 'SCHOOL MANAGEMENT',
    items: [
      { path: '/students',           icon: GraduationCap, label: 'Students',            roles: ['SCHOOL_ADMIN'] },
      { path: '/staff?role=teacher', icon: Users,         label: 'Teachers',            roles: ['SCHOOL_ADMIN'] },
      { path: '/guardians',          icon: UserCheck,     label: 'Parents & Guardians', roles: ['SCHOOL_ADMIN'] },
      { path: '/admissions',         icon: ClipboardList, label: 'Admissions',          roles: ['SCHOOL_ADMIN'] },
      { path: '/staff',              icon: Users,         label: 'Staff Management',    roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    label: 'ACADEMICS',
    items: [
      { path: '/classes',               icon: BookOpen,     label: 'Classes & Sections',      roles: ['SCHOOL_ADMIN'] },
      { path: '/subjects',              icon: Library,      label: 'Subjects',                roles: ['SCHOOL_ADMIN'] },
      { path: '/terms',                 icon: CalendarDays, label: 'Academic Years & Terms',  roles: ['SCHOOL_ADMIN'] },
      { path: '/scores',                icon: BarChart2,    label: 'Examinations & Results',  roles: ['SCHOOL_ADMIN'] },
      { path: '/academics/timetable',   icon: Clock3,       label: 'Timetable',               roles: ['SCHOOL_ADMIN'] },
      { path: '/attendance',            icon: CheckSquare,  label: 'Attendance',              roles: ['SCHOOL_ADMIN'] },
      { path: '/academics/assignments', icon: BookMarked,   label: 'Assignments & Materials', roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { path: '/finance/fees',     icon: FileText,   label: 'School Fees',                  roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'] },
      { path: '/finance',          icon: Wallet,     label: 'Payments & Receipts',          roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'] },
      { path: '/finance/expenses', icon: Receipt,    label: 'Expenses & Financial Reports', roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'] },
      { path: '/finance/payroll',  icon: DollarSign, label: 'Payroll',                      roles: ['SCHOOL_ADMIN', 'ACCOUNTANT'] },
    ],
  },
  {
    label: 'SCHOOL OPERATIONS',
    items: [
      { path: '/operations/library',    icon: Library,     label: 'Library',       roles: ['SCHOOL_ADMIN'] },
      { path: '/operations/transport',  icon: Bus,         label: 'Transport',     roles: ['SCHOOL_ADMIN'] },
      { path: '/operations/discipline', icon: ShieldAlert, label: 'Discipline',    roles: ['SCHOOL_ADMIN'] },
      { path: '/notifications',         icon: Bell,        label: 'Announcements', roles: ['SCHOOL_ADMIN'] },
      { path: '/operations/messages',   icon: Mail,        label: 'Messages',      roles: ['SCHOOL_ADMIN'] },
    ],
  },
  {
    label: 'REPORTS & SETTINGS',
    items: [
      { path: '/reports',         icon: BarChart2,   label: 'Reports & Analytics',      roles: ['SCHOOL_ADMIN'] },
      { path: '/settings/roles',  icon: ShieldCheck, label: 'User Roles & Permissions', roles: ['SCHOOL_ADMIN'] },
      { path: '/settings',        icon: Settings,    label: 'System Settings',          roles: ['SCHOOL_ADMIN'] },
      { path: '/activity-logs',   icon: FileText,    label: 'Audit Logs',               roles: ['SCHOOL_ADMIN'] },
      { path: '/settings/backup', icon: Database,    label: 'School Data Export',       roles: ['SCHOOL_ADMIN'] },
    ],
  },
];

// Dedicated Teacher Portal Navigation
const teacherNav = [
  {
    label: 'Teacher Portal',
    items: [
      { path: '/dashboard',           icon: LayoutDashboard, label: 'Dashboard',              roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/study-assistant',     icon: Sparkles,        label: 'Goreb AI',               roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/classes',             icon: BookOpen,        label: 'My Classes',             roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/students',            icon: GraduationCap,   label: 'Students',               roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/attendance',          icon: CheckSquare,     label: 'Attendance Management',  roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/scores',              icon: BarChart2,       label: 'Results & Examinations', roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/teacher/assignments', icon: BookMarked,      label: 'Assignments & Homework', roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/teacher/materials',   icon: Library,         label: 'Learning Materials',     roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/teacher/timetable',   icon: Clock3,          label: 'My Timetable',           roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/teacher/messages',    icon: MessageSquare,   label: 'Messages',               roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/analytics',           icon: TrendingUp,      label: 'Reports & Analytics',    roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/notifications',       icon: Bell,            label: 'Announcements',          roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/teacher/profile',     icon: User,            label: 'My Profile',             roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '/settings',            icon: Settings,        label: 'Settings',               roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
      { path: '__logout__',           icon: LogOut,          label: 'Logout',                 roles: ['CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    ],
  },
];

// Dedicated Accountant Navigation
const accountantNav = [
  {
    label: 'Overview',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['ACCOUNTANT'] },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { path: '/finance/fees',     icon: FileText,   label: 'School Fees',                  roles: ['ACCOUNTANT'] },
      { path: '/finance',          icon: Wallet,     label: 'Payments & Receipts',          roles: ['ACCOUNTANT'] },
      { path: '/finance/expenses', icon: Receipt,    label: 'Expenses & Financial Reports', roles: ['ACCOUNTANT'] },
      { path: '/finance/payroll',  icon: DollarSign, label: 'Payroll',                      roles: ['ACCOUNTANT'] },
    ],
  },
  {
    label: 'Alerts',
    items: [
      { path: '/notifications', icon: Bell, label: 'Announcements', roles: ['ACCOUNTANT'] },
    ],
  },
];

// Parent — Family Portal Navigation
const parentNav = [
  {
    label: 'My Children',
    items: [
      { path: '/parent?tab=children', icon: Users, label: 'My Children', roles: ['PARENT'] },
    ],
  },
  {
    label: 'Academics & Attendance',
    items: [
      { path: '/parent?tab=scores', icon: BarChart2, label: 'Academic Results', roles: ['PARENT'] },
      { path: '/parent?tab=attendance', icon: CheckSquare, label: 'Attendance', roles: ['PARENT'] },
      { path: '/parent?tab=timetable', icon: Clock3, label: 'Timetable', roles: ['PARENT'] },
      { path: '/parent?tab=assignments', icon: BookMarked, label: 'Assignments & Homework', roles: ['PARENT'] },
      { path: '/parent?tab=reports', icon: FileText, label: 'Reports', roles: ['PARENT'] },
    ],
  },
  {
    label: 'Finance & Payments',
    items: [
      { path: '/parent?tab=finance', icon: Wallet, label: 'School Fees & Payments', roles: ['PARENT'] },
    ],
  },
  {
    label: 'Communication & Wellbeing',
    items: [
      { path: '/parent?tab=announcements', icon: Bell, label: 'Announcements', roles: ['PARENT'] },
      { path: '/parent?tab=messages', icon: Mail, label: 'Messages & Communication', roles: ['PARENT'] },
      { path: '/parent?tab=behaviour', icon: Award, label: 'Behaviour & Achievements', roles: ['PARENT'] },
    ],
  },
  {
    label: 'Account',
    items: [
      { path: '/parent?tab=profile', icon: ClipboardCheck, label: 'My Profile', roles: ['PARENT'] },
      { path: '__logout__', icon: LogOut, label: 'Logout', roles: ['PARENT'] },
    ],
  },
];

// Student Portal Navigation
const studentNav = [
  {
    label: 'Student Portal',
    items: [
      { path: '/student?tab=dashboard',     icon: LayoutDashboard, label: 'Dashboard',           roles: ['STUDENT'] },
      { path: '/student?tab=profile',       icon: User,            label: 'My Profile',          roles: ['STUDENT'] },
      { path: '/student?tab=scores',        icon: BarChart2,       label: 'My Results',          roles: ['STUDENT'] },
      { path: '/student?tab=attendance',    icon: CheckSquare,     label: 'Attendance',          roles: ['STUDENT'] },
      { path: '/study-assistant',           icon: Sparkles,        label: 'Goreb AI',            roles: ['STUDENT'] },
      { path: '/student?tab=timetable',     icon: Clock3,          label: 'Timetable',           roles: ['STUDENT'] },
      { path: '/student?tab=assignments',   icon: BookMarked,      label: 'Assignments',         roles: ['STUDENT'] },
      { path: '/student?tab=materials',     icon: BookOpen,        label: 'Learning Materials',  roles: ['STUDENT'] },
      { path: '/student?tab=announcements', icon: Bell,            label: 'Announcements',       roles: ['STUDENT'] },
      { path: '/student?tab=finance',       icon: Wallet,          label: 'Fee Status',          roles: ['STUDENT'] },
      { path: '/student?tab=settings',      icon: Settings,        label: 'Settings',            roles: ['STUDENT'] },
      { path: '__logout__',                 icon: LogOut,          label: 'Logout',              roles: ['STUDENT'] },
    ],
  },
];

const roleLabels = {
  SUPER_ADMIN: 'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  CLASS_TEACHER: 'Class Teacher',
  SUBJECT_TEACHER: 'Subject Teacher',
  ACCOUNTANT: 'Accountant',   // ← added: was missing, accountants saw raw 'ACCOUNTANT'
  PARENT: 'Parent',
  STUDENT: 'Student',
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();

  const userRole = user?.role;

  const baseNav =
    userRole === 'SUPER_ADMIN' ? superAdminNav :
    userRole === 'PARENT' ? parentNav :
    userRole === 'STUDENT' ? studentNav :
    (userRole === 'CLASS_TEACHER' || userRole === 'SUBJECT_TEACHER') ? teacherNav :
    userRole === 'ACCOUNTANT' ? accountantNav :
    schoolAdminNav;

  const filteredNav = baseNav
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((group) => group.items.length > 0);

  const handleLogout = async () => {
    try {
      await disablePushNotifications(undefined, { forgetPreference: false });
    } catch (error) {
      console.warn('Unable to unregister this device from push notifications:', error.message);
    } finally {
      logout();
      navigate('/login');
    }
  };

  const roleLabel = roleLabels[userRole] || userRole?.replace(/_/g, ' ') || 'User';

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
          fixed inset-y-0 left-0 z-50 w-60 flex flex-col safe-pt
          transform transition-transform duration-200 ease-in-out
          ${userRole === 'SUPER_ADMIN' ? 'bg-slate-950' : 'bg-gray-900'}
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 h-16 px-5 border-b border-white/5 flex-shrink-0">
          {userRole !== 'SUPER_ADMIN' && user?.schoolLogoUrl ? (
            <img src={user.schoolLogoUrl} alt="" className="h-8 w-8 rounded-lg object-cover bg-white flex-shrink-0" />
          ) : (
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0 ${userRole === 'SUPER_ADMIN' ? 'bg-indigo-500 shadow-indigo-500/40' : 'bg-indigo-600 shadow-indigo-500/30'}`}>
              {userRole === 'SUPER_ADMIN' ? <ShieldCheck className="h-4 w-4 text-white" /> : <GraduationCap className="h-4 w-4 text-white" />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="block truncate text-white font-bold text-[15px] tracking-tight" title={user?.schoolName || 'Goreb'}>
              {userRole !== 'SUPER_ADMIN' && user?.schoolName ? user.schoolName : 'Goreb'}
            </span>
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
                {group.items.map((item) => {
                  if (item.path === '__logout__') {
                    return (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setSidebarOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/10 transition-all duration-150 text-left"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        {item.label}
                      </button>
                    );
                  }

                  const itemHasQuery = item.path.includes('?');
                  let isCustomActive = false;
                  if (itemHasQuery) {
                    const [itemPath, itemQuery] = item.path.split('?');
                    const currentQuery = location.search ? location.search.slice(1) : (
                      itemPath === '/parent' ? 'tab=children' :
                      itemPath === '/student' ? 'tab=dashboard' : ''
                    );
                    isCustomActive = location.pathname === itemPath && currentQuery === itemQuery;
                  } else if (item.path === '/parent') {
                    isCustomActive = location.pathname === '/parent' && (!location.search || location.search === '?tab=children');
                  } else if (item.path === '/student') {
                    isCustomActive = location.pathname === '/student' && (!location.search || location.search === '?tab=dashboard');
                  } else if (item.path === '/staff') {
                    isCustomActive = location.pathname === '/staff' && !location.search;
                  }

                  return (
                    <NavLink
                      key={item.path + item.label}
                      to={item.path}
                      end={item.path === '/finance' || item.path === '/staff'}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) => {
                        const activeState = (itemHasQuery || item.path === '/parent' || item.path === '/student' || item.path === '/staff')
                          ? isCustomActive
                          : isActive;
                        return `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                          activeState
                            ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`;
                      }}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {item.label}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom user area */}
        <div className="flex-shrink-0 p-3 border-t border-white/5 safe-pb">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group">
            <Avatar name={user?.name || 'User'} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
              {userRole === 'SUPER_ADMIN' ? (
                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-500/30 text-indigo-300 uppercase tracking-wider">
                  <ShieldCheck className="h-2.5 w-2.5" /> Super Admin
                </span>
              ) : (
                <p className="text-[11px] text-gray-500 truncate">{roleLabel}</p>
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
        <header className="min-h-[4.5rem] py-3 safe-pt bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 gap-4 sticky top-0 z-30 flex-shrink-0">
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
            {/* Notifications with unread count */}
            <Link
              to="/notifications"
              className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/30">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>

            {/* Profile dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Avatar name={user?.name || 'User'} size="sm" />
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900 leading-none">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5 leading-none">{roleLabel}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg shadow-black/10 border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{user?.email || ''}</p>
                    </div>
                    <div className="py-1">
                      {userRole === 'SCHOOL_ADMIN' && (
                        <Link
                          to="/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Settings
                        </Link>
                      )}
                      {userRole === 'SUPER_ADMIN' && (
                        <Link
                          to="/admin/settings"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Settings className="h-4 w-4 text-gray-400" />
                          Admin Settings
                        </Link>
                      )}
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