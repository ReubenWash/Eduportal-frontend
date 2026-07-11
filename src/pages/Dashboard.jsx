import { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../api/schoolApi';
import {
  Users, GraduationCap, BookOpen, CalendarDays,
  ArrowRight, UserPlus, BookPlus, FileBarChart, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Activity, BarChart2,
  ClipboardList, CheckSquare, MessageSquare, PenLine,
} from 'lucide-react';
import { Link } from 'react-router-dom';

/* ─────────────────────────────────────────
   SCHOOL ADMIN DASHBOARD
───────────────────────────────────────── */
const adminQuickLinks = [
  { label: 'Admit Student', icon: UserPlus, href: '/students', color: 'indigo' },
  { label: 'Create Class', icon: BookPlus, href: '/classes', color: 'blue' },
  { label: 'Generate Report', icon: FileBarChart, href: '/reports', color: 'emerald' },
  { label: 'View Analytics', icon: TrendingUp, href: '/analytics', color: 'amber' },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
};

function SchoolAdminDashboard({ stats, loading, loadError }) {
  const termLabel = stats.activeTerm
    ? `${stats.activeTerm.academicYear} · Term ${stats.activeTerm.termNumber}`
    : 'No Active Term';
  const termEndDate = stats.activeTerm?.endDate
    ? new Date(stats.activeTerm.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const statsCards = [
    { title: 'Total Students', value: stats.totalStudents != null ? new Intl.NumberFormat().format(stats.totalStudents) : '—', icon: GraduationCap, color: 'indigo' },
    { title: 'Total Staff', value: stats.totalStaff != null ? new Intl.NumberFormat().format(stats.totalStaff) : '—', icon: Users, color: 'blue' },
    { title: 'Active Classes', value: stats.totalClasses != null ? new Intl.NumberFormat().format(stats.totalClasses) : '—', icon: BookOpen, color: 'amber' },
    { title: 'Pass Rate', value: stats.passRate != null ? `${stats.passRate}%` : '—', icon: TrendingUp, color: 'green' },
  ];

  return (
    <div>
      {loadError && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-5">
          Couldn't load dashboard stats from the server. Check the console for details.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {loading
          ? Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 h-28 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-lg mb-4" />
                <div className="h-5 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
              </div>
            ))
          : statsCards.map((s, i) => (
              <StatCard key={i} icon={s.icon} title={s.title} value={s.value} color={s.color} />
            ))
        }
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Status Overview */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Score Submission Status</h3>
            </div>
            <Link to="/scores" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {[
              { teacher: 'Mr. Kofi Adu', subject: 'Mathematics', class: 'JHS1A', done: true },
              { teacher: 'Mrs. Abena Mensah', subject: 'English Language', class: 'JHS1A', done: true },
              { teacher: 'Mr. Kwame Boateng', subject: 'Integrated Science', class: 'JHS2A', done: false },
              { teacher: 'Mrs. Akua Osei', subject: 'Social Studies', class: 'JHS2A', done: false },
              { teacher: 'Mr. Yaw Darko', subject: 'ICT', class: 'JHS3A', done: true },
            ].map((row, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-3.5">
                <div className={`h-2 w-2 rounded-full flex-shrink-0 ${row.done ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{row.teacher}</p>
                  <p className="text-xs text-gray-500">{row.subject} — {row.class}</p>
                </div>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${row.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                  {row.done ? <><CheckCircle2 className="h-3 w-3" /> Submitted</> : <><Clock className="h-3 w-3" /> Pending</>}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Current Term card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 py-4">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Current Term</p>
              <p className="text-white font-semibold text-lg leading-tight">
                {loading ? 'Loading...' : termLabel}
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {stats.activeTerm ? 'ACTIVE' : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">End Date</span>
                <span className="text-xs font-medium text-gray-900">{termEndDate}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-1">
              {adminQuickLinks.map((link) => {
                const c = colorMap[link.color] || colorMap.indigo;
                return (
                  <Link
                    key={link.label}
                    to={link.href}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all group"
                  >
                    <div className={`h-7 w-7 rounded-md ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <link.icon className={`h-3.5 w-3.5 ${c.text}`} />
                    </div>
                    <span className="font-medium">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CLASS TEACHER DASHBOARD
───────────────────────────────────────── */
const mockClassStudents = [
  { id: '1', name: 'Ama Mensah', studentNo: 'STU/001', presentToday: true },
  { id: '2', name: 'Kofi Boateng', studentNo: 'STU/002', presentToday: false },
  { id: '3', name: 'Akua Sarpong', studentNo: 'STU/003', presentToday: true },
  { id: '4', name: 'Kwame Asante', studentNo: 'STU/004', presentToday: true },
  { id: '5', name: 'Abena Osei', studentNo: 'STU/005', presentToday: false },
  { id: '6', name: 'Yaw Darkoh', studentNo: 'STU/006', presentToday: true },
];

function ClassTeacherDashboard({ user }) {
  const present = mockClassStudents.filter(s => s.presentToday).length;
  const total = mockClassStudents.length;
  const attendancePct = Math.round((present / total) * 100);

  const statCards = [
    { title: 'My Class Students', value: String(total), icon: GraduationCap, color: 'indigo' },
    { title: "Today's Attendance", value: `${attendancePct}%`, icon: CheckSquare, color: 'green' },
    { title: 'Pending Remarks', value: '3', icon: PenLine, color: 'amber' },
    { title: 'Current Term', value: 'Term 1', icon: CalendarDays, color: 'blue' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {statCards.map((s, i) => <StatCard key={i} icon={s.icon} title={s.title} value={s.value} color={s.color} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Quick Status */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Today's Attendance — JHS1A</h3>
            </div>
            <Link to="/attendance" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Mark Attendance <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all"
                  style={{ width: `${attendancePct}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-gray-900">{present}/{total}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {mockClassStudents.map(s => (
                <div key={s.id} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm ${s.presentToday ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-700'}`}>
                  {s.presentToday
                    ? <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                    : <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />}
                  <span className="font-medium truncate">{s.name}</span>
                  <span className="ml-auto text-xs opacity-60">{s.studentNo}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* My Class Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 py-4">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">My Assigned Class</p>
              <p className="text-white font-bold text-2xl">JHS 1A</p>
              <p className="text-indigo-200 text-xs mt-1">Form Teacher</p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Students</span>
                <span className="text-xs font-medium text-gray-900">{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Current Term</span>
                <span className="text-xs font-medium text-gray-900">Term 1, 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Missing Today</span>
                <span className="text-xs font-medium text-red-600">{total - present} absent</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-1">
              {[
                { label: 'Mark Attendance', icon: CheckSquare, href: '/attendance', color: 'indigo' },
                { label: 'My Class Roster', icon: GraduationCap, href: '/students', color: 'blue' },
                { label: 'Add Remarks', icon: MessageSquare, href: '/students', color: 'emerald' },
                { label: 'View Scores', icon: BarChart2, href: '/scores', color: 'amber' },
              ].map((link) => {
                const c = colorMap[link.color] || colorMap.indigo;
                return (
                  <Link key={link.label} to={link.href}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all group">
                    <div className={`h-7 w-7 rounded-md ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <link.icon className={`h-3.5 w-3.5 ${c.text}`} />
                    </div>
                    <span className="font-medium">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   SUBJECT TEACHER DASHBOARD
───────────────────────────────────────── */
const myAssignments = [
  { class: 'JHS1A', subject: 'Mathematics', submitted: true, date: '12 Jun 2025', students: 28 },
  { class: 'JHS2A', subject: 'Mathematics', submitted: false, date: null, students: 30 },
  { class: 'JHS1B', subject: 'Mathematics', submitted: true, date: '13 Jun 2025', students: 25 },
  { class: 'JHS3A', subject: 'Elective Math', submitted: false, date: null, students: 22 },
];

function SubjectTeacherDashboard({ user }) {
  const submitted = myAssignments.filter(a => a.submitted).length;
  const pending = myAssignments.filter(a => !a.submitted).length;

  const statCards = [
    { title: 'My Subjects', value: '1', icon: BookOpen, color: 'indigo' },
    { title: 'My Classes', value: String(myAssignments.length), icon: Users, color: 'blue' },
    { title: 'Scores Submitted', value: String(submitted), icon: CheckCircle2, color: 'green' },
    { title: 'Scores Pending', value: String(pending), icon: Clock, color: 'amber' },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-7">
        {statCards.map((s, i) => <StatCard key={i} icon={s.icon} title={s.title} value={s.value} color={s.color} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Submission Checklist */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Score Submission Checklist</h3>
            </div>
            <Link to="/scores" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              Enter Scores <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {myAssignments.map((a, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${a.submitted ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                  {a.submitted
                    ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    : <Clock className="h-4 w-4 text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{a.class} — {a.subject}</p>
                  <p className="text-xs text-gray-500">{a.students} students enrolled</p>
                </div>
                <div className="text-right">
                  {a.submitted
                    ? <><p className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Submitted</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{a.date}</p></>
                    : <Link to="/scores" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                        Enter Scores
                      </Link>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Progress card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 py-4">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Progress</p>
              <p className="text-white font-bold text-3xl">{submitted}/{myAssignments.length}</p>
              <p className="text-indigo-200 text-xs mt-1">Classes with scores submitted</p>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all"
                    style={{ width: `${(submitted / myAssignments.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-700">
                  {Math.round((submitted / myAssignments.length) * 100)}%
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {pending > 0
                  ? `${pending} class${pending > 1 ? 'es' : ''} still pending submission`
                  : 'All scores submitted — great work!'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-1">
              {[
                { label: 'Enter Scores', icon: BarChart2, href: '/scores', color: 'indigo' },
                { label: 'My Subjects', icon: BookOpen, href: '/subjects', color: 'blue' },
                { label: 'Notifications', icon: AlertCircle, href: '/notifications', color: 'amber' },
              ].map((link) => {
                const c = colorMap[link.color] || colorMap.indigo;
                return (
                  <Link key={link.label} to={link.href}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all group">
                    <div className={`h-7 w-7 rounded-md ${c.bg} flex items-center justify-center flex-shrink-0`}>
                      <link.icon className={`h-3.5 w-3.5 ${c.text}`} />
                    </div>
                    <span className="font-medium">{link.label}</span>
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MAIN DASHBOARD (route: /dashboard)
───────────────────────────────────────── */
export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    getDashboardStats()
      .then((data) => { setStats(data || {}); setLoadError(false); })
      .catch((err) => { setLoadError(true); })
      .finally(() => setLoading(false));
  }, []);

  const role = user?.role;
  const greeting = `Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`;

  const subtitleMap = {
    SCHOOL_ADMIN: "Here's your school command centre.",
    CLASS_TEACHER: "Here's your class overview for today.",
    SUBJECT_TEACHER: "Here's your score submission progress.",
  };

  return (
    <div>
      <PageHeader
        title={greeting}
        subtitle={subtitleMap[role] || "Here's what's happening today."}
      />

      {role === 'SCHOOL_ADMIN' && <SchoolAdminDashboard stats={stats} loading={loading} loadError={loadError} />}
      {role === 'CLASS_TEACHER' && <ClassTeacherDashboard user={user} />}
      {role === 'SUBJECT_TEACHER' && <SubjectTeacherDashboard user={user} />}
    </div>
  );
}