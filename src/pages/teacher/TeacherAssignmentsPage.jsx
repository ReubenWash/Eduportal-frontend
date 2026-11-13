import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { BookMarked, Plus, Search, Calendar, Users, CheckCircle, Clock } from 'lucide-react';

const mockTeacherTasks = [
  {
    id: 'TSK-101',
    title: 'Algebraic Expressions Practice Set 4',
    class: 'JHS 2 A',
    subject: 'Mathematics',
    dueDate: '2026-05-18',
    assignedCount: 38,
    submittedCount: 31,
    status: 'ACTIVE',
  },
  {
    id: 'TSK-102',
    title: 'Quadratic Graphs & Linear Intersections',
    class: 'JHS 3 B',
    subject: 'Mathematics',
    dueDate: '2026-05-22',
    assignedCount: 42,
    submittedCount: 19,
    status: 'ACTIVE',
  },
  {
    id: 'TSK-103',
    title: 'Vectors and Bearings Revision Quiz',
    class: 'JHS 3 A',
    subject: 'Mathematics',
    dueDate: '2026-05-10',
    assignedCount: 40,
    submittedCount: 40,
    status: 'GRADED',
  },
];

export default function TeacherAssignmentsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Assignments & Homework Management"
          subtitle="Assign homework exercises, review student submissions, and grade class tasks."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Create Homework Task
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Assignments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">4</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Submissions Awaiting Grading</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">26</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed Tasks</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">18</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Assignment Title</th>
              <th className="py-3 px-4 text-left">Class & Subject</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-center">Submissions</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockTeacherTasks.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-bold text-gray-900">{t.title}</td>
                <td className="py-3 px-4 text-gray-700">
                  <span className="font-semibold text-indigo-700">{t.class}</span> · {t.subject}
                </td>
                <td className="py-3 px-4 text-gray-500 text-xs">{t.dueDate}</td>
                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-gray-900">{t.submittedCount}</span>
                  <span className="text-xs text-gray-400">/{t.assignedCount}</span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={t.status === 'GRADED' ? 'success' : 'warning'}>
                    {t.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    Grade Work
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

