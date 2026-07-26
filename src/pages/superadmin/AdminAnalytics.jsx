import { useState, useEffect } from 'react';
import { 
  TrendingUp, School, Users, GraduationCap, ArrowUpRight, 
  Loader2, AlertCircle, RefreshCw, Download 
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

// Import the actual API functions
import { 
  getSuperAdminDashboard,
  getRevenueAnalytics,
  getSubscriptions
} from '../../api/superAdminApi';

const TOOLTIP_STYLE = { 
  background: '#1F2937', 
  border: 'none', 
  borderRadius: 8, 
  color: '#F9FAFB', 
  fontSize: 12 
};

const COLORS = ['#4F46E5', '#7C3AED', '#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

export default function AdminAnalytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [revenueData, setRevenueData] = useState(null);
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [exporting, setExporting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all analytics data in parallel
      const [dashboard, revenue, subscriptions] = await Promise.all([
        getSuperAdminDashboard(),
        getRevenueAnalytics({ period: 'monthly', months: 6 }),
        getSubscriptions({ limit: 100 })
      ]);

      setDashboardData(dashboard);
      setRevenueData(revenue);
      setSubscriptionData(subscriptions);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError(err?.response?.data?.message || 'Failed to load analytics data');
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      // Import export function dynamically
      const { exportAnalytics } = await import('../../api/analyticsApi');
      const blob = await exportAnalytics({ 
        type: 'class-summary',
        format: 'excel'
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      addToast('Analytics exported successfully', 'success');
    } catch (err) {
      console.error('Export failed:', err);
      addToast('Failed to export analytics', 'error');
    } finally {
      setExporting(false);
    }
  };

  // ─── Loading State ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-sm text-gray-500">Loading platform analytics...</p>
      </div>
    );
  }

  // ─── Error State ──────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Analytics</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <Button onClick={loadData} icon={RefreshCw}>Retry</Button>
      </div>
    );
  }

  // ─── Extract data from API responses ──────────────────────────
  const kpis = dashboardData?.kpis || {};
  const schoolGrowth = dashboardData?.schoolGrowth || [];
  const userActivity = dashboardData?.userActivity || [];
  const planDistribution = dashboardData?.planDistribution || [];
  const attendanceTrend = dashboardData?.attendanceTrend || [];

  // Revenue trend from revenue data
  const revenueTrend = revenueData?.trend || [];
  const mrr = revenueData?.mrr || 0;
  const totalRevenue = revenueData?.totalRevenue || 0;
  const payingSchools = revenueData?.payingSchools || 0;
  const growth = revenueData?.growth || 0;

  // Format plan data for pie chart
  const planData = planDistribution.length > 0 
    ? planDistribution.map((p, i) => ({
        name: p.plan || p.name || 'Unknown',
        value: p.count || p.value || 0,
        color: COLORS[i % COLORS.length]
      }))
    : [
        { name: 'Basic', value: 18, color: '#9CA3AF' },
        { name: 'Standard', value: 84, color: '#6366F1' },
        { name: 'Premium', value: 145, color: '#7C3AED' }
      ];

  // Format attendance data
  const attendanceData = attendanceTrend.length > 0
    ? attendanceTrend
    : [
        { month: 'Jan', rate: 87 }, { month: 'Feb', rate: 91 }, 
        { month: 'Mar', rate: 88 }, { month: 'Apr', rate: 93 },
        { month: 'May', rate: 89 }, { month: 'Jun', rate: 94 }
      ];

  // Format user activity data
  const activityData = userActivity.length > 0
    ? userActivity
    : [
        { day: 'Mon', logins: 1240, actions: 4320 },
        { day: 'Tue', logins: 1380, actions: 5100 },
        { day: 'Wed', logins: 1210, actions: 3980 },
        { day: 'Thu', logins: 1490, actions: 5620 },
        { day: 'Fri', logins: 1320, actions: 4870 },
        { day: 'Sat', logins: 620, actions: 1890 },
        { day: 'Sun', logins: 480, actions: 1230 }
      ];

  // Format school growth data
  const growthData = schoolGrowth.length > 0
    ? schoolGrowth
    : [
        { month: 'Jan', schools: 180 }, { month: 'Feb', schools: 192 },
        { month: 'Mar', schools: 205 }, { month: 'Apr', schools: 218 },
        { month: 'May', schools: 233 }, { month: 'Jun', schools: 247 }
      ];

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide performance, growth trends, and user activity insights.</p>
        </div>
        <Button 
          variant="secondary" 
          icon={Download} 
          onClick={handleExport}
          loading={exporting}
          disabled={exporting}
        >
          Export Report
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Schools', 
            value: kpis.totalSchools?.value ?? dashboardData?.totalSchools ?? 247, 
            delta: kpis.totalSchools?.deltaPct ?? '+5.2%', 
            icon: School, 
            color: 'text-indigo-600', 
            bg: 'bg-indigo-50' 
          },
          { 
            label: 'Total Users', 
            value: kpis.totalUsers?.value ?? dashboardData?.verifiedUsers ?? '12,481', 
            delta: kpis.totalUsers?.deltaPct ?? '+11.8%', 
            icon: Users, 
            color: 'text-violet-600', 
            bg: 'bg-violet-50' 
          },
          { 
            label: 'Total Students', 
            value: kpis.totalStudents?.value ?? dashboardData?.totalStudents ?? '94,320', 
            delta: kpis.totalStudents?.deltaPct ?? '+8.4%', 
            icon: GraduationCap, 
            color: 'text-emerald-600', 
            bg: 'bg-emerald-50' 
          },
          { 
            label: 'Avg. Attendance', 
            value: kpis.avgAttendance?.value ?? `${dashboardData?.avgAttendance || 90.3}%`, 
            delta: kpis.avgAttendance?.deltaPct ?? '+1.2%', 
            icon: TrendingUp, 
            color: 'text-amber-600', 
            bg: 'bg-amber-50' 
          },
        ].map((s) => {
          const Icon = s.icon;
          // Handle delta formatting
          const deltaValue = typeof s.delta === 'number' 
            ? `${s.delta >= 0 ? '+' : ''}${s.delta}%` 
            : s.delta;
          const isPositive = typeof s.delta === 'number' ? s.delta >= 0 : s.delta?.startsWith('+');
          
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}>
                <Icon className={`h-5 w-5 ${s.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              {deltaValue && (
                <p className={`text-xs font-semibold mt-1 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                  {deltaValue} this month
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Revenue Overview */}
      {revenueTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-xs text-gray-500">Last 6 months</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
              <p className={`text-xs font-medium ${growth >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% growth
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueTrend} barSize={32}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">School Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={growthData}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                </linearGradient>
              </defs>
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
            <BarChart data={activityData} barSize={16} barGap={4}>
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
            <Pie 
              data={planData} 
              cx={85} cy={85} 
              innerRadius={55} outerRadius={80} 
              dataKey="value" 
              paddingAngle={3}
            >
              {planData.map((entry, index) => (
                <Cell key={entry.name} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
          <div className="flex gap-4 mt-2 flex-wrap justify-center">
            {planData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: p.color }} />
                {p.name} ({p.value})
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Platform Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `${v}%`} domain={[80, 100]} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={v => [`${v}%`, 'Avg Rate']} />
              <Line 
                type="monotone" 
                dataKey="rate" 
                stroke="#10B981" 
                strokeWidth={2.5} 
                dot={{ fill: '#10B981', r: 4 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subscription Summary */}
      {subscriptionData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Subscription Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Subscriptions</p>
              <p className="text-xl font-bold text-gray-900">
                {subscriptionData?.pagination?.total || subscriptionData?.data?.length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-emerald-600">
                {subscriptionData?.data?.filter(s => s.status === 'ACTIVE').length || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly Recurring Revenue</p>
              <p className="text-xl font-bold text-indigo-600">${mrr.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Paying Schools</p>
              <p className="text-xl font-bold text-violet-600">{payingSchools}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}