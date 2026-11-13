import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ReportCardPreview from '../../components/common/ReportCardPreview';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyProfile, getMyReportCards, getMyGrades, getMyAttendance } from '../../api/studentselfApi';
import { downloadReportPDF } from '../../api/reportsApi';
import { getMyFinance } from '../../api/financeApi';
import { getNotifications } from '../../api/notificationsApi';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, BarChart2, CheckSquare, FileText, User,
  GraduationCap, CalendarDays, TrendingUp, Download, Eye, Bell,
  CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp, AlertCircle, Wallet,
  Sparkles, HelpCircle, Bookmark, ArrowRight, Clock3, BookMarked,
  BookOpen, Settings, LogOut, FileCheck,
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

const termLabel = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value.termLabel || [value.academicYear, value.termNumber]
    .filter(Boolean)
    .join(' - ');
};

function ScoreTermRow({ term, expanded, onToggle }) {
  const subjects = term.subjects || term.scores || [];
  // The backend attaches this school's real CA/exam structure to each term
  // group — these used to be hardcoded (/10, /30, /70) regardless of what
  // the school admin actually configured in Settings > Grading.
  const caMax = term.gradingConfig?.caMaxScore ?? 10;
  const caWeight = term.gradingConfig?.caWeight ?? (100 - (term.gradingConfig?.examMaxScore ?? 70));
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{termLabel(term.term || term.termName)}</span>
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
                {['Subject', `CA1/${caMax}`, `CA2/${caMax}`, `CA3/${caMax}`, 'CA Total', 'Exam/100', 'Total', 'Grade'].map(h => (
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
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">{s.caTotal ?? '—'}/{caWeight}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{s.exam ?? s.examScore ?? '—'}</td>
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
function DashboardTab({ profile, scores, attendance, reports, onNavigate }) {
  const latestReport = reports?.[reports.length - 1];
  const latestScores = scores?.[scores.length - 1];
  const summary = attendance?.summary || attendance || null;
  const attendancePct = summary
    ? Math.round(((summary.present || 0) / (summary.total || 1)) * 100)
    : null;
  const submittedSubjects = latestScores?.subjects?.length || latestScores?.scores?.length || 0;

  const quickLinks = [
    { tab: 'scores',       label: 'My Results',         icon: BarChart2,    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100', desc: 'View term grades' },
    { tab: 'attendance',   label: 'Attendance',         icon: CheckSquare,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', desc: 'Track your attendance' },
    { tab: 'assignments',  label: 'Assignments',        icon: BookMarked,   color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100', desc: 'Homework & tasks' },
    { tab: 'finance',      label: 'Fee Status',         icon: Wallet,       color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100', desc: 'Payments & invoices' },
    { tab: 'timetable',    label: 'Timetable',          icon: Clock3,       color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100', desc: 'Class schedule' },
    { tab: 'materials',    label: 'Learning Materials', icon: BookOpen,     color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100', desc: 'Download study files' },
    { tab: 'announcements',label: 'Announcements',      icon: Bell,         color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100', desc: 'School notices' },
    { tab: 'profile',      label: 'My Profile',         icon: User,         color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100', desc: 'Account details' },
  ];

  return (
    <div className="space-y-5">
      {/* Hero student card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Avatar src={profile?.photo} name={profile?.name || 'Student'} size="xl" className="ring-4 ring-white/20" />
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold truncate">{profile?.name}</h2>
            <p className="text-indigo-200 text-sm">{profile?.studentNo} · {profile?.className}</p>
            <p className="text-indigo-200 text-xs mt-1">
              {termLabel(latestScores?.term || latestScores?.termName) || 'Current Term'}
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

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: 'Attendance Rate',
            value: attendancePct != null ? `${attendancePct}%` : '—',
            sub: summary ? `${summary.present || 0} days present` : 'No data yet',
            color: 'bg-emerald-50 border-emerald-100 text-emerald-700',
            tab: 'attendance',
          },
          {
            label: 'Subjects with Scores',
            value: submittedSubjects ? `${submittedSubjects}` : '—',
            sub: termLabel(latestScores?.term || latestScores?.termName) || '—',
            color: 'bg-indigo-50 border-indigo-100 text-indigo-700',
            tab: 'scores',
          },
          {
            label: 'Latest Average',
            value: latestScores?.average != null ? `${latestScores.average}%` : '—',
            sub: termLabel(latestScores?.term || latestScores?.termName) || '—',
            color: 'bg-blue-50 border-blue-100 text-blue-700',
            tab: 'scores',
          },
          {
            label: 'Report Status',
            value: latestReport?.status || '—',
            sub: termLabel(latestReport?.termName || latestReport?.term) || '—',
            color: 'bg-amber-50 border-amber-100 text-amber-700',
            tab: null,
          },
        ].map((s, i) => (
          <div
            key={i}
            onClick={() => s.tab && onNavigate(s.tab)}
            className={`rounded-xl border p-4 ${s.color} ${s.tab ? 'cursor-pointer transition hover:scale-[1.02] hover:shadow-md' : ''}`}
          >
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm font-semibold mt-1">{s.label}</p>
            <p className="text-xs opacity-70 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Goreb AI banner */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm flex-shrink-0">
              <Sparkles className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-gray-900">Goreb AI</h3>
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                  AI Study Assistant
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xl leading-relaxed">
                Your intelligent study partner for step-by-step learning, quizzes, problem-solving, and revision guides.
              </p>
            </div>
          </div>
          <Link
            to="/study-assistant"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition flex-shrink-0"
          >
            Open Goreb AI <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Quick Access Links */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Quick Access</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickLinks.map((ql) => {
            const Icon = ql.icon;
            return (
              <button
                key={ql.tab}
                onClick={() => onNavigate(ql.tab)}
                className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all shadow-sm active:scale-95 ${ql.color}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold leading-tight">{ql.label}</p>
                  <p className="text-[11px] opacity-70 mt-0.5 leading-tight">{ql.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
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
                      {[r.day, r.date ? new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''].filter(Boolean).join(' ')}
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
  const [previewReport, setPreviewReport] = useState(null);
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
              type="button"
              onClick={() => setPreviewReport(r)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" /> View
            </button>
            <button
              type="button"
              onClick={() => downloadReportPDF(r.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        </div>
      ))}
      {previewReport && (
        <ReportCardPreview
          report={previewReport}
          title={termLabel(previewReport.termName || previewReport.term) || 'Report Card'}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
}

function MyFinanceTab({ finance }) {
  if (!finance || ((!finance.categories || finance.categories.length === 0) && (!finance.feeInvoices || finance.feeInvoices.length === 0) && !(finance.unallocatedTotal > 0))) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <Wallet className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No payment records yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Paid</p>
        <p className="text-2xl font-bold text-gray-900">GHS {Number(finance.totalPaid || 0).toFixed(2)}</p>
      </div>

      {Number(finance.unallocatedTotal || 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Payments not applied to an invoice</p>
          <p className="mt-1 text-sm text-amber-800">
            GHS {Number(finance.unallocatedTotal).toFixed(2)} has been received but is not assigned to a fee invoice, so it does not reduce the invoice balances shown below. Contact the school office to have an eligible receipt applied.
          </p>
          {finance.unallocatedTransactions?.length > 0 && (
            <div className="mt-3 divide-y divide-amber-200">
              {finance.unallocatedTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between gap-3 py-2 text-xs text-amber-900">
                  <span>{transaction.categoryName} · {transaction.receiptNumber} · {new Date(transaction.createdAt).toLocaleDateString()}</span>
                  <span className="shrink-0 font-semibold">GHS {Number(transaction.amount).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {finance.feeInvoices?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider p-4 pb-2">Fee invoices</p>
          <div className="divide-y divide-gray-100">
            {finance.feeInvoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">{invoice.term.termNumber.replace('TERM', 'Term ')} · {invoice.term.academicYear} · Due {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-gray-900">Balance: GHS {invoice.balance.toFixed(2)}</p>
                  <p className={`text-xs ${invoice.status === 'PAID' ? 'text-emerald-600' : invoice.status === 'OVERDUE' ? 'text-red-600' : 'text-gray-500'}`}>{invoice.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {finance.categories?.length > 0 && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {finance.categories.map(cat => (
          <div key={cat.categoryId} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <p className="text-sm font-semibold text-gray-900">{cat.categoryName}</p>
            <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {cat.hasInvoices ? 'Applied to invoices' : 'Paid'}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-bold text-gray-900">GHS {cat.paid.toFixed(2)}</span>
              {cat.expected !== null && (
                <span className="text-xs text-gray-500">of GHS {cat.expected.toFixed(2)}</span>
              )}
            </div>
            {cat.outstanding !== null && cat.outstanding > 0 && (
              <p className="text-xs text-amber-600 mt-1">GHS {cat.outstanding.toFixed(2)} outstanding</p>
            )}
            {cat.outstanding === 0 && cat.expected !== null && (
              <p className="text-xs text-emerald-600 mt-1">Fully paid</p>
            )}
            {cat.unallocatedPaid > 0 && (
              <p className="text-xs text-amber-700 mt-1">
                GHS {cat.unallocatedPaid.toFixed(2)} recorded outside invoices
              </p>
            )}
          </div>
        ))}
      </div>}

      {finance.recentTransactions && finance.recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider p-4 pb-2">Recent Payments</p>
          <div className="divide-y divide-gray-100">
            {finance.recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm text-gray-900">{t.categoryName}</p>
                  <p className="text-[11px] text-gray-500">
                    {t.receiptNumber} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''} · {t.feeInvoiceId ? 'Applied to invoice' : 'Not applied to invoice'}
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900">GHS {Number(t.amount).toFixed(2)}</span>
              </div>
            ))}
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
          <Avatar src={profile?.photo} name={profile?.name || 'Student'} size="xl" className="ring-4 ring-white/20" />
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

function TimetableTab({ profile }) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const PERIODS = [
    { time: '08:00 - 09:00', title: 'Mathematics', teacher: 'Form Teacher' },
    { time: '09:00 - 10:00', title: 'English Language', teacher: 'Subject Teacher' },
    { time: '10:00 - 10:30', title: 'Morning Break', teacher: 'School Grounds' },
    { time: '10:30 - 11:30', title: 'Integrated Science', teacher: 'Science Lab' },
    { time: '11:30 - 12:30', title: 'Social Studies', teacher: 'Social Science' },
    { time: '12:30 - 01:30', title: 'Lunch Break', teacher: 'Dining Hall' },
    { time: '01:30 - 02:30', title: 'ICT / Computing', teacher: 'ICT Lab' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-gray-900">My Class Timetable</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Class: <strong>{profile?.className || 'Assigned Class'}</strong> · Daily Sessions
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
          Official Class Timetable
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3 px-4">Period</th>
              {DAYS.map(day => <th key={day} className="py-3 px-4">{day}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {PERIODS.map((period, idx) => (
              <tr key={idx} className={period.title.includes('Break') ? 'bg-amber-50/40 font-medium' : 'hover:bg-gray-50/50'}>
                <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">{period.time}</td>
                {DAYS.map(day => (
                  <td key={day} className="py-3 px-4">
                    <span className="font-semibold text-gray-900 block">{period.title}</span>
                    <span className="text-[10px] text-gray-500">{period.teacher}</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AssignmentsTab({ profile }) {
  const dummyHomework = [
    {
      subject: 'Mathematics',
      title: 'Quadratic & Linear Equations Review',
      dueDate: 'Friday',
      status: 'PENDING',
      details: 'Solve practice exercises 3.1 to 3.4 in the standard textbook. Submit working in homework book.',
    },
    {
      subject: 'Integrated Science',
      title: 'Diagram: Circulatory System in Mammals',
      dueDate: 'Monday',
      status: 'SUBMITTED',
      details: 'Complete the double circulation chart with directional arrows representing oxygenated and deoxygenated blood flow.',
    },
    {
      subject: 'English Language',
      title: 'Formal Letter to School Head',
      dueDate: 'Next Tuesday',
      status: 'PENDING',
      details: 'Write a 250-word formal application seeking permission to organize a peer science club.',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Active homework and assignments assigned to your class.</p>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
          Current Term
        </span>
      </div>

      <div className="grid gap-4">
        {dummyHomework.map((hw, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-800">
                {hw.subject}
              </span>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                hw.status === 'SUBMITTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {hw.status} · Due {hw.dueDate}
              </span>
            </div>
            <h4 className="text-base font-bold text-gray-900">{hw.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{hw.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LearningMaterialsTab() {
  const materials = [
    { title: 'Core Mathematics Revision Notes', subject: 'Mathematics', type: 'PDF Document', size: '2.4 MB' },
    { title: 'Integrated Science Past Exam Papers & Marking Schemes', subject: 'Science', type: 'Archive / PDF', size: '5.1 MB' },
    { title: 'English Grammar & Vocabulary Study Guide', subject: 'English', type: 'Reference Sheet', size: '1.2 MB' },
    { title: 'Social Studies Summary: Governance in Ghana', subject: 'Social Studies', type: 'Lecture Slides', size: '3.8 MB' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Download syllabus notes, e-books, and classroom study files.</p>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
          Resource Library
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {materials.map((m, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0">
                <BookOpen className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 truncate">{m.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{m.subject} · {m.type} ({m.size})</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition flex-shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AnnouncementsTab({ notifications }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">School Circulars & Announcements</h3>
        <span className="text-xs text-gray-500">Official administration notices</span>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 flex-shrink-0">
                  <Bell className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">{n.title || 'Notice'}</h4>
                  <p className="mt-1 text-xs text-gray-600 leading-relaxed">{n.body || n.message}</p>
                  <span className="mt-2 inline-block text-[11px] text-gray-400">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No new announcements posted.
        </div>
      )}
    </div>
  );
}

function StudentSettingsTab({ user }) {
  return (
    <div className="max-w-xl space-y-5">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">Student Account Settings</h3>
          <p className="text-xs text-gray-500 mt-0.5">Manage preferences and security settings.</p>
        </div>

        <div className="divide-y divide-gray-100 text-sm">
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Password & Security</p>
              <p className="text-xs text-gray-500">Change your login password</p>
            </div>
            <Link
              to="/change-password"
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Update Password
            </Link>
          </div>
          <div className="py-3 flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">Push Notifications</p>
              <p className="text-xs text-gray-500">Receive exam and homework alerts</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN STUDENT PORTAL ─── */
const TABS = [
  { id: 'dashboard',   label: 'Dashboard',           icon: LayoutDashboard },
  { id: 'profile',     label: 'My Profile',          icon: User },
  { id: 'scores',      label: 'My Results',          icon: BarChart2 },
  { id: 'attendance',  label: 'Attendance',          icon: CheckSquare },
  { id: 'study-assistant', label: 'Goreb AI',        icon: Sparkles, isLink: true, href: '/study-assistant' },
  { id: 'timetable',   label: 'Timetable',           icon: Clock3 },
  { id: 'assignments', label: 'Assignments',         icon: BookMarked },
  { id: 'materials',   label: 'Learning Materials',  icon: BookOpen },
  { id: 'announcements', label: 'Announcements',     icon: Bell },
  { id: 'finance',     label: 'Fee Status',          icon: Wallet },
  { id: 'settings',    label: 'Settings',            icon: Settings },
];

export default function StudentPortal() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'dashboard';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [profile, setProfile] = useState(null);
  const [scores, setScores] = useState([]);
  const [attendance, setAttendance] = useState(null);
  const [reports, setReports] = useState([]);
  const [finance, setFinance] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadErrors, setLoadErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabSelect = (tab) => {
    if (tab.isLink && tab.href) {
      window.location.href = tab.href;
      return;
    }
    setActiveTab(tab.id);
    setSearchParams({ tab: tab.id });
  };

  useEffect(() => {
    Promise.allSettled([
      getMyProfile(),
      getMyGrades(),
      getMyReportCards(),
      getMyAttendance(),
      getMyFinance(),
      getNotifications(),
    ]).then(([profileRes, gradesRes, reportsRes, attendanceRes, financeRes, notifsRes]) => {
      const failedSections = [];
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value);
      else failedSections.push('profile');
      if (gradesRes.status === 'fulfilled') setScores(Array.isArray(gradesRes.value) ? gradesRes.value : []);
      else failedSections.push('grades');
      if (reportsRes.status === 'fulfilled') setReports(Array.isArray(reportsRes.value) ? reportsRes.value : []);
      else failedSections.push('report cards');
      if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value);
      else failedSections.push('attendance');
      if (financeRes.status === 'fulfilled') setFinance(financeRes.value);
      else failedSections.push('payments');
      if (notifsRes.status === 'fulfilled') {
        const list = Array.isArray(notifsRes.value) ? notifsRes.value : notifsRes.value?.items || [];
        setNotifications(list);
      }
      setLoadErrors(failedSections);
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

      {loadErrors.length > 0 && (
        <div role="alert" className="flex items-start gap-2 border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <span>Some data could not be loaded from the school server: {loadErrors.join(', ')}. Refresh the page to retry.</span>
        </div>
      )}

      <div>
        {activeTab === 'dashboard'     && <DashboardTab profile={profile} scores={scores} attendance={attendance} reports={reports} onNavigate={(tab) => { setActiveTab(tab); setSearchParams({ tab }); }} />}
        {activeTab === 'profile'       && <MyProfileTab profile={profile} />}
        {activeTab === 'scores'        && <MyScoresTab scores={scores} />}
        {activeTab === 'attendance'    && <MyAttendanceTab attendance={attendance} />}
        {activeTab === 'timetable'     && <TimetableTab profile={profile} />}
        {activeTab === 'assignments'   && <AssignmentsTab profile={profile} />}
        {activeTab === 'materials'     && <LearningMaterialsTab />}
        {activeTab === 'announcements' && <AnnouncementsTab notifications={notifications} />}
        {activeTab === 'finance'       && <MyFinanceTab finance={finance} />}
        {activeTab === 'settings'      && <StudentSettingsTab user={user} />}
      </div>
    </div>
  );
}