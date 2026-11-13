import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { ShieldAlert, Plus, Search, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const mockIncidents = [
  {
    id: 'DISC-001',
    studentName: 'Samuel Mensah',
    className: 'JHS 2',
    date: '2026-05-12',
    infraction: 'Late arrival to morning assembly repeatedly',
    reportedBy: 'Mr. David Mensah (Form Master)',
    actionTaken: 'Verbal warning and detention task during prep',
    status: 'RESOLVED',
  },
  {
    id: 'DISC-002',
    studentName: 'Michael Frimpong',
    className: 'JHS 3',
    date: '2026-05-14',
    infraction: 'Engaging in unauthorized classroom altercation',
    reportedBy: 'Mrs. Janet Arthur',
    actionTaken: 'Parent summoned & 1-day community service in school garden',
    status: 'ACTIVE_SANCTION',
  },
];

export default function DisciplinePage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Student Discipline & Conduct"
          subtitle="Record infractions, log behavioral notes, communicate with parents, and track disciplinary actions."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Log Conduct Incident
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Recorded This Term</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">14</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Active Sanctions</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">3</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Resolved / Restored</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">11</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Incident ID</th>
              <th className="py-3 px-4 text-left">Student & Class</th>
              <th className="py-3 px-4 text-left">Infraction Summary</th>
              <th className="py-3 px-4 text-left">Reported By</th>
              <th className="py-3 px-4 text-left">Action Taken</th>
              <th className="py-3 px-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockIncidents.map((inc) => (
              <tr key={inc.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-mono text-xs font-bold text-indigo-600">{inc.id}</td>
                <td className="py-3 px-4 font-semibold text-gray-900">
                  {inc.studentName}
                  <span className="block text-xs text-gray-400 font-normal">{inc.className}</span>
                </td>
                <td className="py-3 px-4 text-gray-700 max-w-xs">{inc.infraction}</td>
                <td className="py-3 px-4 text-xs text-gray-600">{inc.reportedBy}</td>
                <td className="py-3 px-4 text-xs text-gray-700">{inc.actionTaken}</td>
                <td className="py-3 px-4">
                  <Badge variant={inc.status === 'RESOLVED' ? 'success' : 'warning'}>
                    {inc.status.replace('_', ' ')}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

