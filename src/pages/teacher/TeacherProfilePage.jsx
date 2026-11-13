import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, BookOpen, GraduationCap, Calendar, ShieldCheck, Key } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TeacherProfilePage() {
  const { user } = useAuth();

  const details = [
    { label: 'Full Name', value: user?.name || 'Staff Teacher' },
    { label: 'Email Address', value: user?.email || 'teacher@school.edu.gh' },
    { label: 'Role Designation', value: user?.role === 'CLASS_TEACHER' ? 'Class Teacher' : 'Subject Teacher' },
    { label: 'Assigned Department', value: 'Mathematics & Science Directorate' },
    { label: 'Assigned Form Class', value: 'JHS 2 A' },
    { label: 'Subjects Taught', value: 'Core Mathematics, Further Mathematics' },
    { label: 'Staff ID', value: 'TCH-2024-019' },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="My Educator Profile"
        subtitle="Manage your credentials, teaching assignments, and contact preferences."
      />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-700 to-indigo-900 p-6 flex flex-col sm:flex-row items-center gap-5 text-white">
          <Avatar name={user?.name || 'Teacher'} size="xl" className="ring-4 ring-white/20" />
          <div className="text-center sm:text-left">
            <h2 className="text-xl font-bold">{user?.name || 'Staff Teacher'}</h2>
            <p className="text-indigo-200 text-sm mt-0.5">{user?.role === 'CLASS_TEACHER' ? 'Class Form Teacher' : 'Subject Teacher'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-semibold backdrop-blur-xs">
                Active Staff
              </span>
              <span className="rounded-full bg-indigo-500/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-100">
                {user?.schoolName || 'School Campus'}
              </span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100 p-6">
          {details.map((d) => (
            <div key={d.label} className="py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{d.label}</span>
              <span className="text-sm font-medium text-gray-900">{d.value}</span>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-gray-500">Need to update your assigned subjects or department? Contact the administrator.</p>
          <Link
            to="/change-password"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            <Key className="h-3.5 w-3.5" /> Change Password
          </Link>
        </div>
      </div>
    </div>
  );
}

