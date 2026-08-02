import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, GraduationCap, BarChart2, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import {
  getPerformanceAnalytics,
  getSubjectAnalytics,
  getTopStudents,
  getAnalyticsTrends,
  getGenderAnalytics
} from '../../api/analyticsApi';
import { getSchoolTerms } from '../../api/schoolApi';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2.5">
        <p className="text-xs font-semibold text-gray-700 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-bold" style={{ color: p.color || p.stroke }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function ChartCard({ title, subtitle, icon: Icon, children, loading }) {
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
      {loading ? (
        <div className="flex items-center justify-center h-[220px]">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export default function Analytics() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for analytics data
  const [performance, setPerformance] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [topStudents, setTopStudents] = useState([]);
  const [trends, setTrends] = useState([]);
  const [genderData, setGenderData] = useState(null);
  const [terms, setTerms] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('');

  // Loading states for individual charts
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingTopStudents, setLoadingTopStudents] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [loadingGender, setLoadingGender] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load terms first
      const termsData = await getSchoolTerms();
      const termsList = Array.isArray(termsData) ? termsData : [];
      setTerms(termsList);
      
      // Find active term or use the first one
      const activeTerm = termsList.find(t => t.status === 'ACTIVE');
      const defaultTerm = activeTerm?.id || (termsList.length > 0 ? termsList[0].id : '');
      setSelectedTerm(defaultTerm);

      // Load all analytics data in parallel
      await Promise.all([
        loadPerformance(defaultTerm),
        loadSubjects(defaultTerm),
        loadTopStudents(defaultTerm),
        loadTrends(defaultTerm),
        loadGender(defaultTerm)
      ]);
      
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setError('Failed to load analytics data. Please try again.');
      addToast('Failed to load analytics data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPerformance = async (termId) => {
    setLoadingPerformance(true);
    try {
      const data = await getPerformanceAnalytics({ termId });
      setPerformance(data);
    } catch (err) {
      console.error('Failed to load performance:', err);
      setPerformance(null);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const loadSubjects = async (termId) => {
    setLoadingSubjects(true);
    try {
      const data = await getSubjectAnalytics({ termId });
      setSubjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const loadTopStudents = async (termId) => {
    setLoadingTopStudents(true);
    try {
      const data = await getTopStudents({ termId, limit: 10 });
      setTopStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load top students:', err);
      setTopStudents([]);
    } finally {
      setLoadingTopStudents(false);
    }
  };

  const loadTrends = async (termId) => {
    setLoadingTrends(true);
    try {
      const data = await getAnalyticsTrends({ termId });
      setTrends(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load trends:', err);
      setTrends([]);
    } finally {
      setLoadingTrends(false);
    }
  };

  const loadGender = async (termId) => {
    setLoadingGender(true);
    try {
      const data = await getGenderAnalytics({ termId });
      setGenderData(data);
    } catch (err) {
      console.error('Failed to load gender data:', err);
      setGenderData(null);
    } finally {
      setLoadingGender(false);
    }
  };

  const handleTermChange = async (termId) => {
    setSelectedTerm(termId);
    await Promise.all([
      loadPerformance(termId),
      loadSubjects(termId),
      loadTopStudents(termId),
      loadTrends(termId),
      loadGender(termId)
    ]);
  };

  // Format data for charts
  const formatGradeDistribution = () => {
    if (!performance?.gradeDistribution) return [];
    return Object.entries(performance.gradeDistribution).map(([grade, count]) => ({
      grade,
      count
    }));
  };

  const formatGenderData = () => {
    if (!genderData) return [];
    return [
      { name: 'Male', value: genderData.male?.count || 0, color: '#4F46E5' },
      { name: 'Female', value: genderData.female?.count || 0, color: '#10B981' }
    ];
  };

  const formatSubjectData = () => {
    if (!subjects || subjects.length === 0) return [];
    return subjects.map(s => ({
      name: s.subject?.name || 'Unknown',
      average: s.average || 0,
      passRate: s.passRate || 0
    }));
  };

  const formatTrendData = () => {
    if (!trends || trends.length === 0) return [];
    return trends.map(t => ({
      term: t.term?.termNumber?.replace('TERM', 'Term ') || '',
      average: t.averageScore || 0,
      passRate: t.passRate || 0
    }));
  };

  const gradeDistribution = formatGradeDistribution();
  const genderChartData = formatGenderData();
  const subjectChartData = formatSubjectData();
  const trendChartData = formatTrendData();

  // Summary stats
  const totalStudents = performance?.totalStudents || 0;
  const passRate = performance?.passRate || 0;
  const avgScore = performance?.averageScore || 0;

  if (loading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="School performance and insights" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="School performance and insights" />
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={loadData}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader 
        title="Analytics" 
        subtitle="Key metrics and performance indicators for your school."
        action={
          terms.length > 0 && (
            <select
              value={selectedTerm}
              onChange={(e) => handleTermChange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {terms.map((term) => (
                <option key={term.id} value={term.id}>
                  {term.academicYear} - {term.termNumber?.replace('TERM', 'Term ')}
                </option>
              ))}
            </select>
          )
        }
      />

      {/* Summary stat pills */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { 
            label: 'Total Enrollment', 
            value: totalStudents.toLocaleString(), 
            change: `${passRate}% pass rate`,
            up: passRate >= 50 
          },
          { 
            label: 'Avg. Score', 
            value: `${avgScore}%`, 
            change: 'Class average',
            up: true 
          },
          { 
            label: 'Pass Rate', 
            value: `${passRate}%`, 
            change: passRate >= 50 ? 'Above average' : 'Below average',
            up: passRate >= 50 
          },
          { 
            label: 'Subjects Analyzed', 
            value: subjects.length.toString(), 
            change: 'With scores',
            up: true 
          },
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
        {/* Grade Distribution */}
        <ChartCard 
          title="Grade Distribution" 
          subtitle="Number of students per grade" 
          icon={BarChart2}
          loading={loadingPerformance}
        >
          {gradeDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeDistribution} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="grade" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Students" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              No grade data available
            </div>
          )}
        </ChartCard>

        {/* Subject Performance */}
        <ChartCard 
          title="Subject Performance" 
          subtitle="Average scores by subject" 
          icon={TrendingUp}
          loading={loadingSubjects}
        >
          {subjectChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={subjectChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="average" name="Average Score" fill="#8B5CF6" radius={[0, 4, 4, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              No subject data available
            </div>
          )}
        </ChartCard>

        {/* Performance Trends */}
        <ChartCard 
          title="Performance Trends" 
          subtitle="Average score and pass rate over terms" 
          icon={TrendingUp}
          loading={loadingTrends}
        >
          {trendChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="term" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="average" name="Avg Score" stroke="#4F46E5" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="passRate" name="Pass Rate %" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              No trend data available
            </div>
          )}
        </ChartCard>

        {/* Gender Breakdown */}
        <ChartCard 
          title="Gender Breakdown" 
          subtitle="Male vs female student distribution" 
          icon={GraduationCap}
          loading={loadingGender}
        >
          {genderChartData.length > 0 && genderChartData.some(g => g.value > 0) ? (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="60%" height={220}>
                <PieChart>
                  <Pie 
                    data={genderChartData} 
                    cx="50%" 
                    cy="50%" 
                    innerRadius={55} 
                    outerRadius={85} 
                    paddingAngle={3} 
                    dataKey="value"
                  >
                    {genderChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color || COLORS[index % COLORS.length]} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-5">
                {genderChartData.map((entry) => {
                  const total = genderChartData.reduce((s, g) => s + g.value, 0);
                  const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                  return (
                    <div key={entry.name}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 pl-4">{entry.value.toLocaleString()}</p>
                      <p className="text-xs text-gray-500 pl-4">
                        {percentage}% of total
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400 text-sm">
              No gender data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Top Students Section */}
      {topStudents.length > 0 && (
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Students</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Class</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Aggregate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topStudents.map((student, index) => (
                  <tr key={student.student?.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-bold text-gray-900">#{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {student.student?.firstName} {student.student?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {student.class ? `${student.class.level} ${student.class.section}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                      {student.aggregate || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}