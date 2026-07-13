import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyProfile, getMyReportCards, getMyGrades } from '../../api/studentselfApi';
import { getReportDownloadUrl } from '../../api/reportsApi';
import {
  LayoutDashboard, BarChart2, CheckSquare, FileText, User,
  GraduationCap, CalendarDays, TrendingUp, Download, Eye, Bell,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ─── Helper components ─── */
const gradeColor = (grade) => {
  if (['A1'].includes(grade)) return 'success';
  if (['B2', 'B3'].includes(grade)) return 'info';
  if (['C4', 'C5', 'C6'].includes(grade)) return 'warning';
  return 'danger';
};

const statusConfig = {
  PRESENT: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ABSENT:  { icon: XCircle,     color: 'text-red-600',     bg: 'bg-red-50 border-red-100' },
  LATE:    { icon: Clock,       color: 'text-amber-600',   bg: 'bg-amber-50 border-amber-100' },
};

function ScoreTermRow({ term, expanded, onToggle }) {
  const subjects = term.subjects || term.scores || [];
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{term.term || term.termName}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Avg: <strong className="text-gray-900">{term.average}%</strong></span>
          {expanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
        </div>
      </button>
      {expanded && (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-white border-b border-gray-100">
                {['Subject', 'CA1/10', 'CA2/10', 'CA3/10', 'CA Total', 'Exam/70', 'Total', 'Grade'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {subjects.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{s.name || s.subjectName}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca1 ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca2 ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca3 ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.caTotal ?? '—'}/30</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.exam ?? '—'}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{s.total ?? '—'}</td>
                  <td className="px-4 py-3"><Badge variant={gradeColor(s.grade)}>{s.grade || '—'}</Badge></td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-indigo-50 border-t border-indigo-100">
                <td colSpan={6} className="px-4 py-3 text-sm font-semibold text-indigo-900">Term Average</td>
                <td className="px-4 py-3 text-sm font-bold text-indigo-900">{term.average}%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── Tab content components ─── */
function DashboardTab({ profile, scores, attendance, reports }) {
  const latestReport = reports?.[reports.length - 1];
  const latestScores = scores?.[scores.length - 1];
  const summary = attendance?.summary || attendance || null;
  const attendancePct = summary
    ? Math.round(((summary.present || 0) / (summary.total || 1)) * 100)
    : null;
  const submittedSubjects = latestScores?.subjects?.length || latestScores?.scores?.length || 0;

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.name || 'Student'} size="xl" className="ring-4 ring-white/20" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile?.name}</h2>
            <p className="text-indigo-200 text-sm">{profile?.studentNo} · {profile?.className}</p>
            <p className="text-indigo-200 text-xs mt-1">
              {latestScores?.term || latestScores?.termName || 'Current Term'}
            </p>
          </div>
          {latestReport && (
            <div className="hidden sm:block text-right">
              <p className="text-indigo-200 text-xs mb-1">Latest Report</p>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-100 border border-emerald-400/30">
                {latestReport.status}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Attendance Rate',
            value: attendancePct != null ? `${attendancePct}%` : '—',
            sub: summary ? `${summary.present || 0} days present` : 'No data yet',
            color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
          },
          {
            label: 'Subjects with Scores',
            value: submittedSubjects ? `${submittedSubjects}` : '—',
            sub: latestScores?.term || latestScores?.termName || '—',
            color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
          },
          {
            label: 'Latest Average',
            value: latestScores?.average != null ? `${latestScores.average}%` : '—',
            sub: latestScores?.term || latestScores?.termName || '—',
            color: 'bg-blue-50 border-blue-100 text-blue-700',
          },
          {
            label: 'Report Status',
            value: latestReport?.status || '—',
            sub: latestReport?.termName || latestReport?.term || '—',
            color: 'bg-amber-50 border-amber-100 text-amber-700',
          },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-semibold mt-1">{s.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function MyScoresTab({ scores }) {
  const [expanded, setExpanded] = useState({ 0: true });
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  if (!scores || scores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <BarChart2 className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No scores available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Your academic scores grouped by term. Only computed grades are shown.</p>
      {scores.map((term, i) => (
        <ScoreTermRow key={i} term={term} expanded={!!expanded[i]} onToggle={() => toggle(i)} />
      ))}
    </div>
  );
}

function MyAttendanceTab({ attendance }) {
  const summary = attendance?.summary || attendance || null;
  const records = attendance?.records || [];
  const pct = summary ? Math.round(((summary.present || 0) / (summary.total || 1)) * 100) : 0;

  if (!summary) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <CheckSquare className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No attendance records available yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: summary.total   || 0, color: 'text-gray-900 bg-gray-50 border-gray-200' },
          { label: 'Present',   value: summary.present  || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Absent',    value: summary.absent   || 0, color: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Late',      value: summary.late     || 0, color: 'text-amber-700 bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Overall Attendance Rate</span>
          <span className="text-sm font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {records.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Attendance Records</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {records.map((r, i) => {
              const cfg = statusConfig[r.status] || statusConfig.PRESENT;
              const Icon = cfg.icon;
              return (
                <div key={i} className={`flex items-center gap-4 px-5 py-3 ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {r.day || ''} {r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                    </p>
                  </div>
                  <span className={`text-xs font-medium ${cfg.color}`}>{r.status}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MyReportsTab({ reports }) {
  const [previewId, setPreviewId] = useState(null);
  const released = (reports || []).filter(r => r.status === 'RELEASED');

  if (released.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No released report cards yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Only RELEASED report cards are visible to you.</p>
      {released.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{r.termName || r.term}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Average: {r.average ?? '—'}%{r.position ? ` · Position: ${r.position}` : ''}
            </p>
          </div>
          <Badge variant="success">{r.status}</Badge>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewId(r.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            <a
              href={r.url || getReportDownloadUrl(r.id)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </div>
        </div>
      ))}
      {previewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setPreviewId(null)}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Report Card Preview</h3>
              <button onClick={() => setPreviewId(null)} className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-light">×</button>
            </div>
            <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600 font-medium">Report Card</p>
              <a
                href={getReportDownloadUrl(previewId)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
              >
                <Download className="h-4 w-4" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyProfileTab({ profile }) {
  const fields = [
    { label: 'Full Name',        value: profile?.name },
    { label: 'Student Number',   value: profile?.studentNo },
    { label: 'Date of Birth',    value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
    { label: 'Gender',           value: profile?.gender },
    { label: 'Class',            value: profile?.className },
    { label: 'Guardian Name',    value: profile?.guardianName },
    { label: 'Guardian Contact', value: profile?.guardianContact },
  ];

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-8 flex items-center gap-4">
          <Avatar name={profile?.name || 'Student'} size="xl" className="ring-4 ring-white/20" />
          <div>
            <h2 className="text-lg font-bold text-white">{profile?.name}</h2>
            <p className="text-indigo-200 text-sm">{profile?.studentNo}</p>
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {fields.map(f => (
            <div key={f.label} className="flex items-center justify-between px-6 py-3.5">
              <span className="text-sm text-gray-500">{f.label}</span>
              <span className="text-sm font-medium text-gray-900">{f.value || '—'}</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400">Profile is managed by your school administrator. Contact them to update any information.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN STUDENT PORTAL ─── */
const TABS = [
  { id: 'dashboard',  label: 'Dashboard',     icon: LayoutDashboard },
  { id: 'scores',     label: 'My Scores',     icon: BarChart2 },
  { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
  { id: 'reports',    label: 'My Reports',    icon: FileText },
  { id: 'profile',    label: 'My Profile',    icon: User },
];

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      getMyProfile(),
      getMyGrades(),
      getMyReportCards(),
    ]).then(([profileRes, gradesRes, reportsRes]) => {
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      if (gradesRes.status === 'fulfilled') setScores(Array.isArray(gradesRes.value) ? gradesRes.value : []);
      if (reportsRes.status === 'fulfilled') setReports(Array.isArray(reportsRes.value) ? reportsRes.value : []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Student Portal" subtitle="Loading your account…" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Student Portal" subtitle="Your personal academic overview" />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-2">
        <div className="flex flex-wrap gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`student-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {activeTab === 'dashboard'  && <DashboardTab profile={profile} scores={scores} attendance={attendance} reports={reports} />}
        {activeTab === 'scores'     && <MyScoresTab scores={scores} />}
        {activeTab === 'attendance' && <MyAttendanceTab attendance={attendance} />}
        {activeTab === 'reports'    && <MyReportsTab reports={reports} />}
        {activeTab === 'profile'    && <MyProfileTab profile={profile} />}
      </div>
    </div>
  );
}