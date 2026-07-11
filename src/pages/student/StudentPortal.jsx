import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyProfile, getMyReportCards, getMyGrades } from '../../api/studentselfApi';
import {
  LayoutDashboard, BarChart2, CheckSquare, FileText, User,
  GraduationCap, CalendarDays, TrendingUp, Download, Eye, Bell,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp,
} from 'lucide-react';

/* ─── Mock data for when API isn't connected yet ─── */
const mockProfile = {
  name: 'Ama Mensah',
  studentNo: 'STU/001',
  dateOfBirth: '2010-03-15',
  gender: 'Female',
  className: 'JHS 1A',
  guardianName: 'Kofi Mensah',
  guardianContact: '+233 24 555 0123',
  photo: null,
};

const mockScores = [
  {
    term: 'Term 1, 2025',
    subjects: [
      { name: 'Mathematics', ca1: 9, ca2: 8, ca3: 9, caTotal: 26, exam: 64, total: 90, grade: 'A1' },
      { name: 'English Language', ca1: 7, ca2: 8, ca3: 7, caTotal: 22, exam: 60, total: 82, grade: 'B2' },
      { name: 'Integrated Science', ca1: 8, ca2: 7, ca3: 8, caTotal: 23, exam: 52, total: 75, grade: 'B3' },
      { name: 'Social Studies', ca1: 9, ca2: 9, ca3: 8, caTotal: 26, exam: 64, total: 90, grade: 'A1' },
      { name: 'ICT', ca1: 10, ca2: 9, ca3: 10, caTotal: 29, exam: 68, total: 97, grade: 'A1' },
    ],
    average: 86.8,
  },
  {
    term: 'Term 2, 2025',
    subjects: [
      { name: 'Mathematics', ca1: 8, ca2: 9, ca3: 8, caTotal: 25, exam: 60, total: 85, grade: 'B2' },
      { name: 'English Language', ca1: 7, ca2: 8, ca3: 8, caTotal: 23, exam: 58, total: 81, grade: 'B2' },
      { name: 'Integrated Science', ca1: 7, ca2: 8, ca3: 7, caTotal: 22, exam: 55, total: 77, grade: 'B3' },
      { name: 'Social Studies', ca1: 9, ca2: 8, ca3: 9, caTotal: 26, exam: 62, total: 88, grade: 'B2' },
      { name: 'ICT', ca1: 10, ca2: 10, ca3: 9, caTotal: 29, exam: 65, total: 94, grade: 'A1' },
    ],
    average: 85.0,
  },
];

const mockAttendance = {
  summary: { present: 48, absent: 3, late: 5, total: 56 },
  records: [
    { date: '2025-06-01', day: 'Mon', status: 'PRESENT' },
    { date: '2025-06-02', day: 'Tue', status: 'PRESENT' },
    { date: '2025-06-03', day: 'Wed', status: 'LATE' },
    { date: '2025-06-04', day: 'Thu', status: 'PRESENT' },
    { date: '2025-06-05', day: 'Fri', status: 'ABSENT' },
    { date: '2025-06-08', day: 'Mon', status: 'PRESENT' },
    { date: '2025-06-09', day: 'Tue', status: 'PRESENT' },
    { date: '2025-06-10', day: 'Wed', status: 'PRESENT' },
    { date: '2025-06-11', day: 'Thu', status: 'LATE' },
    { date: '2025-06-12', day: 'Fri', status: 'PRESENT' },
  ],
};

const mockReports = [
  { id: 1, termName: 'Term 1, 2025', status: 'RELEASED', average: 86.8, position: '2nd / 32', url: '#' },
  { id: 2, termName: 'Term 2, 2025', status: 'RELEASED', average: 85.0, position: '3rd / 32', url: '#' },
];

/* ─── Helper components ─── */
const gradeColor = (grade) => {
  if (['A1'].includes(grade)) return 'success';
  if (['B2', 'B3'].includes(grade)) return 'info';
  if (['C4', 'C5', 'C6'].includes(grade)) return 'warning';
  return 'danger';
};

const statusConfig = {
  PRESENT: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ABSENT: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  LATE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
};

function ScoreTermRow({ term, expanded, onToggle }) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{term.term}</span>
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
              {term.subjects.map((s, i) => (
                <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{s.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca1}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca2}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.ca3}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.caTotal}/30</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.exam}</td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{s.total}</td>
                  <td className="px-4 py-3"><Badge variant={gradeColor(s.grade)}>{s.grade}</Badge></td>
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
function DashboardTab({ profile }) {
  const attendancePct = Math.round((mockAttendance.summary.present / mockAttendance.summary.total) * 100);
  const latestReport = mockReports[mockReports.length - 1];
  const submittedSubjects = mockScores[mockScores.length - 1]?.subjects?.length || 0;
  const totalSubjects = 5;

  return (
    <div className="space-y-5">
      {/* Profile Summary Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.name || 'Student'} size="xl" className="ring-4 ring-white/20" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile?.name}</h2>
            <p className="text-indigo-200 text-sm">{profile?.studentNo} · {profile?.className}</p>
            <p className="text-indigo-200 text-xs mt-1">Current Term: Term 2, 2025</p>
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Attendance Rate', value: `${attendancePct}%`, sub: `${mockAttendance.summary.present} days present`, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
          { label: 'Subjects with Scores', value: `${submittedSubjects}/${totalSubjects}`, sub: 'Term 2, 2025', color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
          { label: 'Latest Average', value: `${mockScores[mockScores.length - 1]?.average}%`, sub: 'Term 2, 2025', color: 'bg-blue-50 border-blue-100 text-blue-700' },
          { label: 'Report Status', value: 'Released', sub: latestReport?.termName, color: 'bg-amber-50 border-amber-100 text-amber-700' },
        ].map((s, i) => (
          <div key={i} className={`rounded-xl border p-4 ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-semibold mt-1">{s.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Score Progress */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Score Entry Progress — Term 2, 2025</h3>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1 bg-gray-100 rounded-full h-3">
            <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${(submittedSubjects / totalSubjects) * 100}%` }} />
          </div>
          <span className="text-sm font-semibold text-gray-700">{submittedSubjects}/{totalSubjects}</span>
        </div>
        <p className="text-xs text-gray-500">Scores entered for {submittedSubjects} of {totalSubjects} subjects</p>
      </div>
    </div>
  );
}

function MyScoresTab() {
  const [expanded, setExpanded] = useState({ 0: true });
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Your academic scores grouped by term. Only computed grades are shown.</p>
      </div>
      {mockScores.map((term, i) => (
        <ScoreTermRow key={i} term={term} expanded={!!expanded[i]} onToggle={() => toggle(i)} />
      ))}
    </div>
  );
}

function MyAttendanceTab() {
  const { summary, records } = mockAttendance;
  const pct = Math.round((summary.present / summary.total) * 100);

  return (
    <div className="space-y-5">
      {/* Summary Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Days', value: summary.total, color: 'text-gray-900 bg-gray-50 border-gray-200' },
          { label: 'Present', value: summary.present, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Absent', value: summary.absent, color: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Late', value: summary.late, color: 'text-amber-700 bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Attendance % bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Overall Attendance Rate</span>
          <span className="text-sm font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Records List */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Attendance Records</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {records.map((r, i) => {
            const cfg = statusConfig[r.status];
            const Icon = cfg.icon;
            return (
              <div key={i} className={`flex items-center gap-4 px-5 py-3 ${cfg.bg}`}>
                <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{r.day}, {new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <span className={`text-xs font-medium ${cfg.color}`}>{r.status}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MyReportsTab() {
  const [previewId, setPreviewId] = useState(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Only RELEASED report cards are visible to you.</p>
      {mockReports.filter(r => r.status === 'RELEASED').map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{r.termName}</p>
            <p className="text-xs text-gray-500 mt-0.5">Average: {r.average}% · Position: {r.position}</p>
          </div>
          <Badge variant="success">{r.status}</Badge>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreviewId(r.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            <a href={r.url} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors">
              <Download className="h-3.5 w-3.5" /> Download
            </a>
          </div>
        </div>
      ))}
      {/* PDF Preview Modal placeholder */}
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
              <p className="text-xs text-gray-400 mt-1">PDF viewer loads here in production</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyProfileTab({ profile }) {
  const fields = [
    { label: 'Full Name', value: profile?.name },
    { label: 'Student Number', value: profile?.studentNo },
    { label: 'Date of Birth', value: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
    { label: 'Gender', value: profile?.gender },
    { label: 'Class', value: profile?.className },
    { label: 'Guardian Name', value: profile?.guardianName },
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
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'scores', label: 'My Scores', icon: BarChart2 },
  { id: 'attendance', label: 'My Attendance', icon: CheckSquare },
  { id: 'reports', label: 'My Reports', icon: FileText },
  { id: 'profile', label: 'My Profile', icon: User },
];

export default function StudentPortal() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then(p => { setProfile(p); setLoadError(false); })
      .catch(err => {
        console.error('Student self-profile fetch error:', err);
        setProfile(mockProfile); // Fallback to mock
        setLoadError(false);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Student Portal" subtitle="Loading your account…" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  const displayProfile = profile || mockProfile;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Portal"
        subtitle="Your personal academic overview"
      />

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 whitespace-nowrap transition-all ${
                  isActive
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <DashboardTab profile={displayProfile} />}
        {activeTab === 'scores' && <MyScoresTab />}
        {activeTab === 'attendance' && <MyAttendanceTab />}
        {activeTab === 'reports' && <MyReportsTab />}
        {activeTab === 'profile' && <MyProfileTab profile={displayProfile} />}
      </div>
    </div>
  );
}