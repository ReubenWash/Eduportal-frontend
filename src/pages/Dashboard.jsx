import { useState, useEffect } from 'react';
import StatCard from '../components/common/StatCard';
import PageHeader from '../components/common/PageHeader';
import { useAuth } from '../context/AuthContext';
import {
  Users, GraduationCap, BookOpen, CalendarDays,
  ArrowRight, UserPlus, BookPlus, FileBarChart, TrendingUp,
  Clock, CheckCircle2, AlertCircle, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

const recentActivity = [
  { id: 1, type: 'enrollment', icon: GraduationCap, color: 'indigo', title: 'New student enrolled', desc: 'John Doe was admitted to JHS1 A', time: '2 hours ago' },
  { id: 2, type: 'score', icon: CheckCircle2, color: 'green', title: 'Scores submitted', desc: 'Mathematics scores for JHS2 B by Mr. Adu', time: '4 hours ago' },
  { id: 3, type: 'alert', icon: AlertCircle, color: 'amber', title: 'Low attendance alert', desc: 'JHS3 A attendance dropped below 75%', time: '6 hours ago' },
  { id: 4, type: 'report', icon: FileBarChart, color: 'blue', title: 'Reports generated', desc: 'Term 1 reports for SS2 A ready for review', time: 'Yesterday' },
  { id: 5, type: 'enrollment', icon: GraduationCap, color: 'indigo', title: 'New student enrolled', desc: 'Mary Asante was admitted to JHS1 B', time: 'Yesterday' },
];

const quickLinks = [
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [stats, setStats] = useState({});

  useEffect(() => {
    setTimeout(() => {
      setStats({ students: 1234, staff: 45, classes: 28, term: { name: 'Term 1, 2025', status: 'ACTIVE', endDate: '15 Dec 2025' } });
      setLoading(false);
    }, 800);
  }, []);

  const statsCards = [
    { title: 'Total Students', value: stats.students ? new Intl.NumberFormat().format(stats.students) : '—', icon: GraduationCap, trend: 3.2, trendLabel: 'vs last term', color: 'indigo' },
    { title: 'Total Staff', value: stats.staff ? new Intl.NumberFormat().format(stats.staff) : '—', icon: Users, trend: 1.1, trendLabel: 'vs last month', color: 'blue' },
    { title: 'Active Classes', value: stats.classes ? new Intl.NumberFormat().format(stats.classes) : '—', icon: BookOpen, trend: 0, trendLabel: 'no change', color: 'amber' },
    { title: 'Current Term', value: loading ? '—' : (stats.term?.name || 'No Active Term'), icon: CalendarDays, color: 'green' },
  ];

  return (
    <div>
      <PageHeader
        title={`Good morning${user?.name ? `, ${user.name.split(' ')[0]}` : ''}!`}
        subtitle="Here's what's happening at your school today."
      />

      {/* Stats Grid */}
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
              <StatCard key={i} icon={s.icon} title={s.title} value={s.value} trend={s.trend} trendLabel={s.trendLabel} color={s.color} />
            ))
        }
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <Link to="/notifications" className="text-xs font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-gray-50">
            {recentActivity.map((item) => {
              const c = colorMap[item.color] || colorMap.indigo;
              return (
                <div key={item.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  <div className={`flex-shrink-0 mt-0.5 h-8 w-8 rounded-full ${c.bg} flex items-center justify-center`}>
                    <item.icon className={`h-4 w-4 ${c.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{item.desc}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Clock className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-400 whitespace-nowrap">{item.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Current Term card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-5 py-4">
              <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider mb-1">Current Term</p>
              <p className="text-white font-semibold text-lg leading-tight">
                {loading ? 'Loading...' : (stats.term?.name || 'No Active Term')}
              </p>
            </div>
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  {stats.term?.status || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">End Date</span>
                <span className="text-xs font-medium text-gray-900">{stats.term?.endDate || '—'}</span>
              </div>
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-500">Progress</span>
                  <span className="text-xs font-medium text-gray-700">65%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[65%] transition-all duration-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h4>
            <div className="space-y-1">
              {quickLinks.map((link) => {
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