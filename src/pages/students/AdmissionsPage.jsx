import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  ClipboardList, Plus, Search, Filter, CheckCircle, XCircle, Clock,
  UserCheck, Download, Eye, Mail, Phone, Calendar
} from 'lucide-react';

const mockApplications = [
  {
    id: 'ADM-2026-001',
    applicantName: 'Kofi Mensah',
    applyingFor: 'JHS 1',
    guardianName: 'Kwesi Mensah',
    guardianPhone: '+233 24 123 4567',
    submissionDate: '2026-05-10',
    status: 'PENDING',
    previousSchool: 'St. Mary Preparatory',
  },
  {
    id: 'ADM-2026-002',
    applicantName: 'Ama Boateng',
    applyingFor: 'Class 4',
    guardianName: 'Grace Boateng',
    guardianPhone: '+233 20 987 6543',
    submissionDate: '2026-05-12',
    status: 'APPROVED',
    previousSchool: 'Faith Academy',
  },
  {
    id: 'ADM-2026-003',
    applicantName: 'Emmanuel Osei',
    applyingFor: 'SHS 1 - Science',
    guardianName: 'Nana Osei',
    guardianPhone: '+233 55 456 7890',
    submissionDate: '2026-05-14',
    status: 'REVIEWING',
    previousSchool: 'Ridge International',
  },
];

const statusStyles = {
  PENDING: { variant: 'warning', label: 'Pending Review' },
  APPROVED: { variant: 'success', label: 'Admitted' },
  REVIEWING: { variant: 'info', label: 'In Review' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};

export default function AdmissionsPage() {
  const [applications, setApplications] = useState(mockApplications);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const { addToast } = useToast();

  const handleStatusChange = (id, newStatus) => {
    setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
    addToast(`Application ${id} updated to ${newStatus}`, 'success');
  };

  const filtered = applications.filter(app => {
    const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.guardianName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Admissions & Enrollments"
          subtitle="Manage student applications, intake approvals, and enrollment documentation."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> New Application
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Inquiries</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Action</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">12</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Admitted</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">31</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Enrolled This Term</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">29</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by student, ID, or guardian..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Review</option>
            <option value="REVIEWING">In Review</option>
            <option value="APPROVED">Admitted</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">App ID</th>
              <th className="py-3 px-4 text-left">Applicant Name</th>
              <th className="py-3 px-4 text-left">Applying For</th>
              <th className="py-3 px-4 text-left">Guardian & Contact</th>
              <th className="py-3 px-4 text-left">Submission Date</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filtered.map((app) => (
              <tr key={app.id} className="hover:bg-gray-50/70 transition">
                <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">{app.id}</td>
                <td className="py-3 px-4 font-medium text-gray-900">
                  {app.applicantName}
                  <span className="block text-xs text-gray-400 font-normal">{app.previousSchool}</span>
                </td>
                <td className="py-3 px-4 text-gray-700">{app.applyingFor}</td>
                <td className="py-3 px-4">
                  <p className="text-gray-900 font-medium">{app.guardianName}</p>
                  <p className="text-xs text-gray-500">{app.guardianPhone}</p>
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{app.submissionDate}</td>
                <td className="py-3 px-4">
                  <Badge variant={statusStyles[app.status]?.variant || 'default'}>
                    {statusStyles[app.status]?.label || app.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    {app.status !== 'APPROVED' && (
                      <button
                        onClick={() => handleStatusChange(app.id, 'APPROVED')}
                        className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 transition"
                        title="Approve & Admit"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                    {app.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleStatusChange(app.id, 'REJECTED')}
                        className="rounded-lg p-1.5 text-red-600 hover:bg-red-50 transition"
                        title="Reject"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

