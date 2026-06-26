import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, GraduationCap, BarChart2 } from 'lucide-react';

const enrollmentData = [
  { month: 'Jan', students: 980 }, { month: 'Feb', students: 1020 }, { month: 'Mar', students: 1050 },
  { month: 'Apr', students: 1080 }, { month: 'May', students: 1100 }, { month: 'Jun', students: 1145 },
  { month: 'Jul', students: 1160 }, { month: 'Aug', students: 1195 }, { month: 'Sep', students: 1230 },
  { month: 'Oct', students: 1234 },
];

const attendanceData = [
  { week: 'Wk 1', rate: 94 }, { week: 'Wk 2', rate: 92 }, { week: 'Wk 3', rate: 88 },
  { week: 'Wk 4', rate: 91 }, { week: 'Wk 5', rate: 95 }, { week: 'Wk 6', rate: 89 },
  { week: 'Wk 7', rate: 93 }, { week: 'Wk 8', rate: 96 },
];

const scoreData = [
  { grade: 'A1', count: 142 }, { grade: 'B2', count: 198 }, { grade: 'B3', count: 221 },
  { grade: 'C4', count: 189 }, { grade: 'C5', count: 134 }, { grade: 'C6', count: 98 },
  { grade: 'D7', count: 67 }, { grade: 'E8', count: 28 }, { grade: 'F9', count: 12 },
];

const genderData = [
  { name: 'Male', value: 648, color: '#4F46E5' },
  { name: 'Female', value: 586, color: '#10B981' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5">
        <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-indigo-50 rounded-lg">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="School performance and insights" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-72 animate-pulse">
              <div className="h-5 w-40 bg-gray-200 rounded mb-4" />
              <div className="h-full bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Analytics" subtitle="Key metrics and performance indicators for your school." />

      {/* Summary stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Enrollment', value: '1,234', change: '+3.2%', up: true },
          { label: 'Avg. Attendance', value: '92.4%', change: '+1.1%', up: true },
          { label: 'Pass Rate', value: '87.3%', change: '-0.5%', up: false },
          { label: 'Active Staff', value: '45', change: 'No change', up: null },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className={`text-xs font-medium mt-1 ${s.up === true ? 'text-emerald-600' : s.up === false ? 'text-red-500' : 'text-gray-400'}`}>
              {s.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <ChartCard title="Enrollment Trends" subtitle="Student count over the current academic year" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={enrollmentData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="students" name="Students" stroke="#4F46E5" strokeWidth={2.5} dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Attendance Rate */}
        <ChartCard title="Attendance Rate" subtitle="Weekly attendance percentage" icon={Users}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={attendanceData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="attendanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" name="Rate (%)" stroke="#4F46E5" strokeWidth={2.5} fill="url(#attendanceGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Score Distribution */}
        <ChartCard title="Score Distribution" subtitle="Number of students per grade band" icon={BarChart2}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Students" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gender Breakdown */}
        <ChartCard title="Gender Breakdown" subtitle="Male vs female student distribution" icon={GraduationCap}>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="60%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {genderData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-5">
              {genderData.map((entry) => (
                <div key={entry.name}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 pl-4">{entry.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 pl-4">
                    {Math.round((entry.value / genderData.reduce((s, g) => s + g.value, 0)) * 100)}% of total
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}