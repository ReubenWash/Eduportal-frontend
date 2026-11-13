import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import ReportCardPreview from '../../components/common/ReportCardPreview';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyChildren, getChildReportCards, getChildGrades, getChildAttendance } from '../../api/parentApi';
import { getChildFinance } from '../../api/financeApi';
import { downloadReportPDF } from '../../api/reportsApi';
import { getNotifications } from '../../api/notificationsApi';
import { useAuth } from '../../context/AuthContext';
import {
  Users, BarChart2, CheckSquare, FileText, User, Bell,
  Mail, Download, Eye, CheckCircle2, XCircle, Clock,
  ChevronDown, ChevronUp, CalendarDays, Wallet,
  Clock3, BookMarked, Award, MessageSquare, LogOut,
  Sparkles, AlertCircle, Phone, ArrowRight,
} from 'lucide-react';

/* ─── Helpers ─── */
const gradeColor = (grade) => {
  if (['A1'].includes(grade)) return 'success';
  if (['B2', 'B3'].includes(grade)) return 'info';
  if (['C4', 'C5', 'C6'].includes(grade)) return 'warning';
  return 'danger';
};

const formatTermLabel = (value) => {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  return value.termLabel || [value.academicYear, value.termNumber].filter(Boolean).join(' - ');
};

const statusConfig = {
  PRESENT: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
  ABSENT: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-100' },
  LATE: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
};

function ScoreTermRow({ term, expanded, onToggle }) {
  const termLabel = formatTermLabel(term?.term) || term?.termName || term?.label || 'Term';
  const subjects = term?.subjects || term?.scores || [];
  const caMax = term?.gradingConfig?.caMaxScore ?? 10;
  const caWeight = term?.gradingConfig?.caWeight ?? (100 - (term?.gradingConfig?.examMaxScore ?? 70));

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <CalendarDays className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-900">{termLabel}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-500">Avg: <strong className="text-gray-900">{term.average ?? 0}%</strong></span>
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
                <td className="px-4 py-3 text-sm font-bold text-indigo-900">{term.average ?? 0}%</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── 1. My Children Tab ─── */
function MyChildrenTab({ children, selectedChild, onSelectChild, onNavigate }) {
  const quickLinks = [
    { tab: 'scores',       label: 'Academic Results',       icon: BarChart2,    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',   desc: 'View term grades' },
    { tab: 'attendance',   label: 'Attendance',             icon: CheckSquare,  color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100', desc: 'Track school attendance' },
    { tab: 'finance',      label: 'School Fees & Payments', icon: Wallet,       color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',   desc: 'Invoices & payments' },
    { tab: 'assignments',  label: 'Assignments & Homework', icon: BookMarked,   color: 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100',       desc: 'Current homework' },
    { tab: 'timetable',    label: 'Timetable',              icon: Clock3,       color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',           desc: 'Class schedule' },
    { tab: 'announcements',label: 'Announcements',          icon: Bell,         color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',   desc: 'School notices' },
    { tab: 'behaviour',    label: 'Behaviour & Achievements', icon: Award,      color: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',           desc: 'Conduct records' },
    { tab: 'reports',      label: 'Reports',                icon: FileText,     color: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',           desc: 'Term report cards' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Select a child to view their details across all sections of your parent portal.</p>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
          {children.length} {children.length === 1 ? 'Child' : 'Children'} Linked
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {children.map((child) => {
          const isSelected = selectedChild === child.id;
          return (
            <div
              key={child.id}
              onClick={() => onSelectChild(child.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition-all shadow-sm ${
                isSelected
                  ? 'border-indigo-600 bg-white ring-2 ring-indigo-500/20 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4">
                <Avatar src={child?.photoUrl} name={child.name} size="lg" className="ring-2 ring-indigo-50" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-gray-900 truncate">{child.name}</h3>
                    {isSelected && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">{child.className || 'Class not set'}</p>
                  <p className="text-xs text-gray-500 mt-1">ID: {child.studentNo || child.id?.slice(0, 8)}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                  <span className="block text-gray-400 text-[10px] uppercase font-semibold">Gender</span>
                  <span className="font-semibold text-gray-800">{child.gender || '—'}</span>
                </div>
                <div className="rounded-lg bg-gray-50 p-2 text-gray-600">
                  <span className="block text-gray-400 text-[10px] uppercase font-semibold">Status</span>
                  <span className="font-semibold text-emerald-600">Enrolled</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs">
                <span className={`font-semibold ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {isSelected ? 'Currently Viewing' : 'Tap to View Ward'}
                </span>
                <ArrowRight className={`h-4 w-4 ${isSelected ? 'text-indigo-600' : 'text-gray-400'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
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
                <span className="text-xs font-bold leading-tight">{ql.label}</span>
                <span className="text-[11px] opacity-70">{ql.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Academic Results Tab ─── */
function AcademicResultsTab({ scores }) {
  const [expanded, setExpanded] = useState({ 0: true });
  const toggle = (i) => setExpanded(prev => ({ ...prev, [i]: !prev[i] }));

  if (!scores || scores.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-sm text-gray-400">
        No computed academic results available yet for this child.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
        <p className="text-sm font-semibold text-indigo-900">Official Continuous Assessment & Exam Scores</p>
        <p className="text-xs text-indigo-700 mt-0.5">
          Academic scores are read-only and updated as subject teachers compile and finalize grades for each term.
        </p>
      </div>
      {scores.map((term, i) => (
        <ScoreTermRow key={i} term={term} expanded={!!expanded[i]} onToggle={() => toggle(i)} />
      ))}
    </div>
  );
}

/* ─── 3. Attendance Tab ─── */
function AttendanceTab({ attendance }) {
  if (!attendance) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-sm text-gray-400">
        No attendance data available yet.
      </div>
    );
  }

  const { summary, records } = attendance;
  const pct = Math.round((summary.present / (summary.total || 1)) * 100);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total School Days', value: summary.total || 0, color: 'text-gray-900 bg-gray-50 border-gray-200' },
          { label: 'Days Present', value: summary.present || 0, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'Days Absent', value: summary.absent || 0, color: 'text-red-700 bg-red-50 border-red-100' },
          { label: 'Days Late', value: summary.late || 0, color: 'text-amber-700 bg-amber-50 border-amber-100' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 text-center ${s.color}`}>
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-900">Attendance Rate</span>
          <span className="text-sm font-bold text-indigo-600">{pct}%</span>
        </div>
        <div className="bg-gray-100 rounded-full h-3">
          <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Attendance Log</h3>
        </div>
        <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {records && records.length > 0 ? (
            records.map((r, i) => {
              const cfg = statusConfig[r.status] || statusConfig.PRESENT;
              const Icon = cfg.icon;
              return (
                <div key={i} className={`flex items-center gap-4 px-5 py-3 ${cfg.bg}`}>
                  <Icon className={`h-4 w-4 flex-shrink-0 ${cfg.color}`} />
                  <p className="text-sm text-gray-900">
                    {r.day ? `${r.day}, ` : ''}{new Date(r.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  <span className={`ml-auto text-xs font-semibold ${cfg.color}`}>{r.status}</span>
                </div>
              );
            })
          ) : (
            <p className="p-6 text-center text-xs text-gray-500">No individual date records recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── 4. School Fees & Payments Tab ─── */
function FinanceTab({ finance }) {
  if (!finance || ((!finance.categories || finance.categories.length === 0) && (!finance.feeInvoices || finance.feeInvoices.length === 0) && !(finance.unallocatedTotal > 0))) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
        <Wallet className="h-10 w-10 text-gray-200 mx-auto mb-3" />
        <p className="text-sm text-gray-500">No fee or payment records found for this student.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total Amount Paid</p>
          <p className="text-2xl font-bold text-gray-900">GHS {Number(finance.totalPaid || 0).toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-800">
          Receipts are issued automatically upon fee verification.
        </div>
      </div>

      {Number(finance.unallocatedTotal || 0) > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-semibold text-amber-900">Payments not applied to an invoice</p>
          <p className="mt-1 text-sm text-amber-800">
            GHS {Number(finance.unallocatedTotal).toFixed(2)} has been recorded at the office but is awaiting allocation to a specific invoice.
          </p>
        </div>
      )}

      {finance.feeInvoices?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Fee Invoices</h3>
            <span className="text-xs text-gray-500">{finance.feeInvoices.length} Invoices</span>
          </div>
          <div className="divide-y divide-gray-100">
            {finance.feeInvoices.map((invoice) => (
              <div key={invoice.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{invoice.invoiceNumber}</p>
                  <p className="text-xs text-gray-500">
                    {invoice.term?.termNumber ? invoice.term.termNumber.replace('TERM', 'Term ') : 'Term'} · {invoice.term?.academicYear} · Due: {new Date(invoice.dueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm sm:text-right">
                  <p className="font-semibold text-gray-900">Balance: GHS {invoice.balance.toFixed(2)}</p>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mt-1 ${
                    invoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {invoice.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {finance.recentTransactions && finance.recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recent Payment Receipts</h3>
          </div>
          <div className="divide-y divide-gray-100">
            {finance.recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.categoryName || 'School Fees'}</p>
                  <p className="text-[11px] text-gray-500">
                    Receipt #{t.receiptNumber} · {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ''}
                  </p>
                </div>
                <span className="text-sm font-bold text-gray-900">GHS {Number(t.amount).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── 5. Timetable Tab ─── */
function TimetableTab({ child }) {
  const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const PERIODS = [
    { time: '08:00 - 09:00', title: 'Mathematics', teacher: 'Class Teacher' },
    { time: '09:00 - 10:00', title: 'English Language', teacher: 'Subject Teacher' },
    { time: '10:00 - 10:30', title: 'Break / Snack', teacher: 'Supervised' },
    { time: '10:30 - 11:30', title: 'Integrated Science', teacher: 'Science Department' },
    { time: '11:30 - 12:30', title: 'Social Studies', teacher: 'Social Sciences' },
    { time: '12:30 - 01:30', title: 'Lunch Break', teacher: 'Dining Hall' },
    { time: '01:30 - 02:30', title: 'ICT / Computing', teacher: 'ICT Lab' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white rounded-xl border border-gray-200 p-5">
        <div>
          <h3 className="text-base font-bold text-gray-900">Class Weekly Schedule</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Class: <strong>{child?.className || 'Assigned Class'}</strong> · Regular School Hours: 08:00 AM - 02:30 PM
          </p>
        </div>
        <span className="self-start sm:self-auto rounded-full bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-700">
          Term Schedule Active
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase">
              <th className="py-3 px-4">Time</th>
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

/* ─── 6. Assignments & Homework Tab ─── */
function AssignmentsTab({ child }) {
  const dummyHomework = [
    {
      subject: 'Mathematics',
      title: 'Linear Equations & Word Problems',
      dueDate: 'Friday',
      status: 'PENDING',
      details: 'Complete exercise 4.2 in the workbook, questions 1 through 10. Show all calculation steps.',
    },
    {
      subject: 'Integrated Science',
      title: 'Plant Photosynthesis Diagram',
      dueDate: 'Monday',
      status: 'SUBMITTED',
      details: 'Draw, color, and label the internal structure of a leaf chloroplast in your science notebook.',
    },
    {
      subject: 'English Language',
      title: 'Persuasive Essay Outline',
      dueDate: 'Next Tuesday',
      status: 'PENDING',
      details: 'Draft an outline on: "Why Technology in Schools Improves Student Learning".',
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">Track homework and class assignments assigned to {child?.name || 'your child'}.</p>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
          Active Term Tasks
        </span>
      </div>

      <div className="grid gap-4">
        {dummyHomework.map((hw, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-800">
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

/* ─── 7. Announcements Tab ─── */
function AnnouncementsTab({ notifications }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">School Announcements & Notices</h3>
        <span className="text-xs text-gray-500">Official circulars from administration</span>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {notifications.map((n) => (
            <div key={n.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{n.title || 'School Circular'}</h4>
                    <p className="mt-1 text-xs text-gray-600 leading-relaxed">{n.body || n.message}</p>
                    <span className="mt-2 inline-block text-[11px] text-gray-400">
                      {n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recently published'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-400">
          No new announcements posted this week.
        </div>
      )}
    </div>
  );
}

/* ─── 8. Messages & Communication Tab ─── */
function MessagesTab({ child }) {
  return (
    <div className="space-y-5 max-w-2xl">
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Direct Teacher Contact</h3>
            <p className="text-xs text-gray-500">Send inquiries or messages directly to the class form teacher.</p>
          </div>
        </div>

        <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-2">
          <p className="text-xs font-semibold text-indigo-900">Assigned Form Teacher:</p>
          <p className="text-sm font-bold text-gray-900">{child?.className || 'Assigned Class'} Form Teacher</p>
          {child?.classTeacherEmail ? (
            <a
              href={`mailto:${child.classTeacherEmail}?subject=Inquiry regarding ${child.name}`}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-700 transition"
            >
              <Mail className="h-3.5 w-3.5" /> Email Form Teacher ({child.classTeacherEmail})
            </a>
          ) : (
            <p className="text-xs text-gray-600">
              You can contact the main school administration line for urgent teacher consultation.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 p-4 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">School Office Directory</h4>
          <p className="text-xs text-gray-600">Operating hours: Monday to Friday (07:30 AM - 04:30 PM)</p>
          <div className="flex items-center gap-3 pt-2 text-xs text-gray-800">
            <Phone className="h-4 w-4 text-indigo-600" />
            <span>School Desk: 0504686941 / Admin Office</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 9. Behaviour & Achievements Tab ─── */
function BehaviourTab({ child }) {
  const dummyAchievements = [
    { type: 'ACHIEVEMENT', title: 'Punctuality & Neatness Commendation', date: 'This Term', note: 'Recognized for 100% on-time morning arrival and exemplary school uniform turnout.' },
    { type: 'CONDUCT', title: 'Class Participation & Collaboration', date: 'Recent', note: 'Actively assists group peers during practical science sessions.' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Teacher Remarks & Conduct Log</h3>
        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          Good Standing
        </span>
      </div>

      <div className="grid gap-4">
        {dummyAchievements.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                <Award className="h-3.5 w-3.5 text-amber-600" />
                {item.type}
              </span>
              <span className="text-xs text-gray-400">{item.date}</span>
            </div>
            <h4 className="text-base font-bold text-gray-900">{item.title}</h4>
            <p className="text-xs text-gray-600 leading-relaxed">{item.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 10. Reports Tab ─── */
function ReportsTab({ reports }) {
  const [previewReport, setPreviewReport] = useState(null);
  const released = (reports || []).filter(r => r.status === 'RELEASED');

  if (released.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-sm text-gray-400">
        No released report cards yet for this student.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Only RELEASED official terminal report cards can be downloaded or previewed.</p>
      {released.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
            <FileText className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{r.termName || r.term}</p>
            <p className="text-xs text-gray-500 mt-0.5">Average: {r.average}% · Position: {r.position || '—'}</p>
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
          title={formatTermLabel(previewReport.termName || previewReport.term) || 'Report Card'}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </div>
  );
}

/* ─── 11. My Profile Tab ─── */
function MyProfileTab({ user, guardian }) {
  const fields = [
    { label: 'Full Name', value: user?.name || guardian?.guardianName || guardian?.name },
    { label: 'Phone', value: user?.phone || guardian?.guardianPhone || guardian?.phone },
    { label: 'Email', value: user?.email || guardian?.guardianEmail || guardian?.email },
    { label: 'Role', value: 'Parent / Guardian' },
  ];

  return (
    <div className="max-w-xl">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 px-6 py-8 flex items-center gap-4">
          <Avatar name={user?.name || guardian?.name || 'Guardian'} size="xl" className="ring-4 ring-white/20" />
          <div>
            <h2 className="text-lg font-bold text-white">{user?.name || guardian?.name || 'Guardian'}</h2>
            <p className="text-indigo-200 text-sm">Parent / Guardian Portal Account</p>
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
          <p className="text-xs text-gray-400">Profile data is managed by your school admin.</p>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN TABS CONFIGURATION ─── */
const TABS = [
  { id: 'children',      label: 'My Children',               icon: Users },
  { id: 'scores',        label: 'Academic Results',          icon: BarChart2 },
  { id: 'attendance',    label: 'Attendance',                icon: CheckSquare },
  { id: 'finance',       label: 'School Fees & Payments',    icon: Wallet },
  { id: 'timetable',     label: 'Timetable',                 icon: Clock3 },
  { id: 'assignments',   label: 'Assignments & Homework',    icon: BookMarked },
  { id: 'announcements', label: 'Announcements',             icon: Bell },
  { id: 'messages',      label: 'Messages & Communication',  icon: Mail },
  { id: 'behaviour',     label: 'Behaviour & Achievements',  icon: Award },
  { id: 'reports',       label: 'Reports',                   icon: FileText },
  { id: 'profile',       label: 'My Profile',                icon: User },
];

export default function ParentPortal() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTabParam = searchParams.get('tab') || 'children';

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);
  const [activeTab, setActiveTab] = useState(currentTabParam);
  const [notifications, setNotifications] = useState([]);

  // Sync tab with URL search parameter
  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab'));
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  useEffect(() => {
    getMyChildren()
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].id);
      })
      .catch(() => {
        setChildren([]);
      })
      .finally(() => setLoading(false));

    getNotifications()
      .then(res => {
        const list = Array.isArray(res) ? res : res?.items || [];
        setNotifications(list);
      })
      .catch(() => {});
  }, []);

  const activeChild = children.find(c => c.id === selectedChild);

  // Per-child data state
  const [childData, setChildData] = useState({ scores: [], attendance: null, reports: [], finance: null });
  const [childLoading, setChildLoading] = useState(false);

  useEffect(() => {
    if (!selectedChild) return;
    setChildLoading(true);
    Promise.allSettled([
      getChildGrades(selectedChild),
      getChildAttendance(selectedChild),
      getChildReportCards(selectedChild),
      getChildFinance(selectedChild),
    ]).then(([gradesRes, attendanceRes, reportsRes, financeRes]) => {
      setChildData({
        scores: gradesRes.status === 'fulfilled' && Array.isArray(gradesRes.value) ? gradesRes.value : [],
        attendance: attendanceRes.status === 'fulfilled' ? attendanceRes.value : null,
        reports: reportsRes.status === 'fulfilled' && Array.isArray(reportsRes.value) ? reportsRes.value : [],
        finance: financeRes.status === 'fulfilled' ? financeRes.value : null,
      });
    }).finally(() => setChildLoading(false));
  }, [selectedChild]);

  const { scores, attendance, reports, finance } = childData;

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Parent Portal" subtitle="Loading your family portal…" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div>
        <PageHeader title="Parent Portal" subtitle="Your family overview" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center space-y-4">
          <p className="text-sm text-gray-500">No students are currently linked to your guardian phone number or email.</p>
          <p className="text-xs text-gray-400">Please contact your school administrator to link your child's student record.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Parent Portal" subtitle="Monitor your child's academic performance, fees, attendance, and wellbeing" />

      {/* Child Switcher Pill */}
      {children.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Child</p>
            {activeChild && (
              <span className="text-xs text-indigo-600 font-semibold">{activeChild.name} ({activeChild.className || 'Class'})</span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                  selectedChild === c.id
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                <Avatar src={c?.photoUrl} name={c.name} size="xs" />
                <div className="text-left">
                  <p className="leading-none font-semibold">{c.name}</p>
                  <p className={`text-[10px] mt-0.5 leading-none ${selectedChild === c.id ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {c.className || 'Class'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Content Display */}
      {childLoading && activeTab !== 'children' && activeTab !== 'profile' && activeTab !== 'announcements' ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">
          Loading student details…
        </div>
      ) : (
        <div>
          {activeTab === 'children'      && <MyChildrenTab children={children} selectedChild={selectedChild} onSelectChild={setSelectedChild} onNavigate={handleTabChange} />}
          {activeTab === 'scores'        && <AcademicResultsTab scores={scores} />}
          {activeTab === 'attendance'    && <AttendanceTab attendance={attendance} />}
          {activeTab === 'finance'       && <FinanceTab finance={finance} />}
          {activeTab === 'timetable'     && <TimetableTab child={activeChild} />}
          {activeTab === 'assignments'   && <AssignmentsTab child={activeChild} />}
          {activeTab === 'announcements' && <AnnouncementsTab notifications={notifications} />}
          {activeTab === 'messages'      && <MessagesTab child={activeChild} />}
          {activeTab === 'behaviour'     && <BehaviourTab child={activeChild} />}
          {activeTab === 'reports'       && <ReportsTab reports={reports} />}
          {activeTab === 'profile'       && <MyProfileTab user={user} guardian={activeChild} />}
        </div>
      )}
    </div>
  );
}
