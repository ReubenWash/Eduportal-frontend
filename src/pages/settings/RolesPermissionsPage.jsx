import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { ShieldCheck, Lock, CheckCircle2, XCircle, AlertCircle, Users } from 'lucide-react';

const rolesMatrix = [
  {
    role: 'School Administrator',
    key: 'SCHOOL_ADMIN',
    usersCount: 2,
    badge: 'primary',
    desc: 'Full administrative access across staff, students, finances, academics, and settings.',
    permissions: [
      'Manage school profiles & terms',
      'Manage staff & teacher assignments',
      'Admit and enroll students',
      'Full fee and financial ledger oversight',
      'Generate & publish report cards',
      'Configure system & grading rules',
    ],
  },
  {
    role: 'Class Teacher',
    key: 'CLASS_TEACHER',
    usersCount: 14,
    badge: 'info',
    desc: 'Manage assigned class roster, daily attendance, continuous assessment, remarks, and student profiles.',
    permissions: [
      'View & edit assigned class students',
      'Take morning & afternoon attendance',
      'Enter and submit class subject scores',
      'Write terminal remarks & conduct evaluations',
      'Access Goreb AI study and lesson companion',
    ],
  },
  {
    role: 'Subject Teacher',
    key: 'SUBJECT_TEACHER',
    usersCount: 18,
    badge: 'warning',
    desc: 'Input test and examination marks for specific assigned subjects across multiple classes.',
    permissions: [
      'Enter scores for assigned subjects',
      'View enrolled subject students',
      'Upload course materials & syllabus guides',
      'Access Goreb AI assistant',
    ],
  },
  {
    role: 'Accountant',
    key: 'ACCOUNTANT',
    usersCount: 2,
    badge: 'success',
    desc: 'Manage fee collections, receipt issuance, daybook journals, expenses, and payroll disbursements.',
    permissions: [
      'Record student fee payments & receipts',
      'Issue and adjust fee invoices',
      'Manage school expense vouchers',
      'Process monthly payroll',
      'Export financial audits',
    ],
  },
  {
    role: 'Parent / Guardian',
    key: 'PARENT',
    usersCount: 280,
    badge: 'default',
    desc: 'View wards academic performance, terminal report cards, fee statements, and teacher communications.',
    permissions: [
      'View enrolled children profiles',
      'Inspect term grades & attendance rates',
      'Review fee invoices & pay online',
      'Receive school broadcasts & circulars',
    ],
  },
  {
    role: 'Student',
    key: 'STUDENT',
    usersCount: 420,
    badge: 'default',
    desc: 'Self-service dashboard for results, timetables, homework assignments, and Goreb AI study companion.',
    permissions: [
      'View individual grades and attendance history',
      'Access Goreb AI interactive tutor & quizzes',
      'Download syllabus materials & assignments',
      'Check class timetables and fee records',
    ],
  },
];

export default function RolesPermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="User Roles & Access Permissions"
          subtitle="View active school user roles, security boundaries, and role-based capability matrices."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rolesMatrix.map((r) => (
          <div key={r.key} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900">{r.role}</h3>
                  <Badge variant={r.badge}>{r.key}</Badge>
                </div>
                <p className="mt-1 text-xs text-gray-500 leading-relaxed">{r.desc}</p>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200 flex-shrink-0">
                <Users className="h-3.5 w-3.5" /> {r.usersCount} users
              </span>
            </div>

            <div className="border-t border-gray-100 pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Granted Capabilities</p>
              <ul className="space-y-1.5">
                {r.permissions.map((perm, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

