import { TrendingUp, School, Users, GraduationCap, ArrowUpRight } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';

const schoolGrowth = [
  { month: 'Jan', schools: 180 }, { month: 'Feb', schools: 192 }, { month: 'Mar', schools: 205 },
  { month: 'Apr', schools: 218 }, { month: 'May', months: 233 }, { month: 'Jun', schools: 247 },
];
const userActivity = [
  { day: 'Mon', logins: 1240, actions: 4320 }, { day: 'Tue', logins: 1380, actions: 5100 },
  { day: 'Wed', logins: 1210, actions: 3980 }, { day: 'Thu', logins: 1490, actions: 5620 },
  { day: 'Fri', logins: 1320, actions: 4870 }, { day: 'Sat', logins: 620, actions: 1890 },
  { day: 'Sun', logins: 480, actions: 1230 },
];
const planDist = [
  { name: 'Basic', value: 18, color: '#9CA3AF' },
  { name: 'Standard', value: 84, color: '#6366F1' },
  { name: 'Premium', value: 145, color: '#7C3AED' },
];
const attendance = [
  { month: 'Jan', rate: 87 }, { month: 'Feb', rate: 91 }, { month: 'Mar', rate: 88 },
  { month: 'Apr', rate: 93 }, { month: 'May', rate: 89 }, { month: 'Jun', rate: 94 },
];

const TOOLTIP_STYLE = { background: '#1F2937', border: 'none', borderRadius: 8, color: '#F9FAFB', fontSize: 12 };

export default function AdminAnalytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Platform-wide performance, growth trends, and user activity insights.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Schools',    value: '247',    delta: '+5.2%',  icon: School,       color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Total Users',      value: '12,481', delta: '+11.8%', icon: Users,        color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Students',   value: '94,320', delta: '+8.4%',  icon: GraduationCap,color: 'text-emerald-600',bg: 'bg-emerald-50' },
          { label: 'Avg. Attendance',  value: '90.3%',  delta: '+1.2%',  icon: TrendingUp,   color: 'text-amber-600',  bg: 'bg-amber-50'  },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">{s.delta} this month</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">School Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={schoolGrowth}>
              <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient></defs>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Area type="monotone" dataKey="schools" stroke="#4F46E5" strokeWidth={2} fill="url(#sg)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Daily User Activity (This Week)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userActivity} barSize={16} barGap={4}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="logins" name="Logins" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actions" name="Actions" fill="#7C3AED" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 self-start">Plan Distribution</h2>
          <PieChart width={180} height={180}>
            <Pie data={planDist} cx={85} cy={85} innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={3}>
              {planDist.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
          <div className="flex gap-4 mt-2">
            {planDist.map(p => <div key={p.name} className="flex items-center gap-1.5 text-xs text-gray-500"><span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: p.color }} />{p.name}</div>)}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Platform Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${v}%`} domain={[80, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Avg Rate']} />
              <Line type="monotone" dataKey="rate" stroke="#10B981" strokeWidth={2.5} dot={{ fill: '#10B981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
