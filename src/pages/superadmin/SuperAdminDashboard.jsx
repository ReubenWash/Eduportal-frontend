import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  School, Users, CheckCircle, XCircle, Clock, TrendingUp,
  Activity, Globe, ShieldCheck, AlertTriangle, ArrowUpRight,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const registrationTrend = [
  { month: 'Jan', schools: 12 }, { month: 'Feb', schools: 19 },
  { month: 'Mar', schools: 25 }, { month: 'Apr', schools: 31 },
  { month: 'May', schools: 28 }, { month: 'Jun', schools: 42 },
];

const recentActivity = [
  { id: 1, type: 'approved',  text: 'Approved Sunshine Academy',      time: '2 min ago',   color: 'emerald' },
  { id: 2, type: 'pending',   text: 'New registration: Hilltop School', time: '14 min ago', color: 'amber'   },
  { id: 3, type: 'rejected',  text: 'Rejected East Bay College',       time: '1 hr ago',    color: 'red'     },
  { id: 4, type: 'user',      text: 'New admin user: admin@riverside.edu', time: '2 hr ago', color: 'indigo' },
  { id: 5, type: 'approved',  text: 'Approved Riverside JHS',          time: '3 hr ago',    color: 'emerald' },
  { id: 6, type: 'pending',   text: 'New registration: Lakewood Academy', time: '5 hr ago', color: 'amber'   },
];

const activityIcon = {
  approved: <CheckCircle className="h-4 w-4 text-emerald-500" />,
  pending:  <Clock className="h-4 w-4 text-amber-500" />,
  rejected: <XCircle className="h-4 w-4 text-red-500" />,
  user:     <Users className="h-4 w-4 text-indigo-500" />,
};

const stats = [
  { label: 'Total Schools',     value: '247',   change: '+12 this month',  icon: School,      color: 'indigo', bg: 'bg-indigo-50',  text: 'text-indigo-600' },
  { label: 'Active Schools',    value: '229',   change: '92.7% of total',   icon: Activity,    color: 'emerald',bg: 'bg-emerald-50', text: 'text-emerald-600'},
  { label: 'Total Students',    value: '94,320',change: '+1,840 this month',icon: Users,       color: 'violet', bg: 'bg-violet-50',  text: 'text-violet-600' },
  { label: 'Total Staff',       value: '3,420', change: '+120 this month', icon: Users,       color: 'sky',    bg: 'bg-sky-50',     text: 'text-sky-600'    },
  { label: 'System Health',     value: '99.98%',change: 'All services active',icon: ShieldCheck,color: 'emerald',bg: 'bg-emerald-50', text: 'text-emerald-600'},
  { label: 'Pending Applications',value: '18',  change: '5 require review',icon: Clock,       color: 'amber',  bg: 'bg-amber-50',   text: 'text-amber-600'  },
];

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Super Admin</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Global control centre — manage all schools, users, and system settings.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`h-5 w-5 ${s.text}`} />
                </div>
                <ArrowUpRight className="h-4 w-4 text-gray-300" />
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm font-medium text-gray-600 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400 mt-1">{s.change}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* School Registrations Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-gray-900">School Registrations</h2>
              <p className="text-xs text-gray-500 mt-0.5">New schools joining the platform per month</p>
            </div>
            <Link to="/admin/schools" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={registrationTrend}>
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8, color: '#F9FAFB', fontSize: 12 }} />
              <Area type="monotone" dataKey="schools" stroke="#4F46E5" strokeWidth={2} fill="url(#grad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">{activityIcon[a.type]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700 leading-tight">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Schools',  to: '/admin/schools',  icon: School,      color: 'bg-indigo-600',  description: 'Approve or reject school registrations' },
          { label: 'Manage Users',    to: '/admin/users',    icon: Users,       color: 'bg-violet-600',  description: 'View and control all platform users' },
          { label: 'Platform Logs',   to: '/admin/logs',     icon: Activity,    color: 'bg-slate-700',   description: 'Review system and audit logs' },
          { label: 'System Settings', to: '/settings',       icon: Globe,       color: 'bg-emerald-600', description: 'Global configuration and branding' },
        ].map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.label} to={a.to} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all group">
              <div className={`h-9 w-9 rounded-lg ${a.color} flex items-center justify-center mb-3`}>
                <Icon className="h-4 w-4 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{a.label}</p>
              <p className="text-[11px] text-gray-400 mt-1 leading-snug">{a.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
