import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { BookMarked, Plus, Search, FileText, Download, BookOpen, Clock, CheckCircle } from 'lucide-react';

const mockAssignments = [
  {
    id: 'ASG-001',
    title: 'Algebraic Expressions & Factorization',
    className: 'JHS 2',
    subject: 'Mathematics',
    teacher: 'Mr. David Mensah',
    dueDate: '2026-05-18',
    submissions: '32/38',
    status: 'ACTIVE',
  },
  {
    id: 'ASG-002',
    title: 'Photosynthesis & Plant Respiration Lab',
    className: 'JHS 1',
    subject: 'Integrated Science',
    teacher: 'Mrs. Janet Arthur',
    dueDate: '2026-05-20',
    submissions: '40/40',
    status: 'COMPLETED',
  },
  {
    id: 'ASG-003',
    title: 'Essay: The Impact of Climate Change',
    className: 'JHS 3',
    subject: 'English Language',
    teacher: 'Ms. Faustina Addo',
    dueDate: '2026-05-22',
    submissions: '18/35',
    status: 'ACTIVE',
  },
];

export default function AssignmentsMaterialsPage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('assignments');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Assignments & Curriculum Materials"
          subtitle="Curriculum assignment oversight, course notes repository, and student submission tracking."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> New Curriculum Task
          </Button>
        </div>
      </div>

      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setTab('assignments')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            tab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Assignments & Homework
        </button>
        <button
          onClick={() => setTab('materials')}
          className={`pb-3 text-sm font-semibold transition border-b-2 ${
            tab === 'materials' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Learning Materials & Syllabi
        </button>
      </div>

      {tab === 'assignments' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search assignments or subjects..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 text-xs sm:text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <tr>
                  <th className="py-3 px-4 text-left">Title</th>
                  <th className="py-3 px-4 text-left">Class & Subject</th>
                  <th className="py-3 px-4 text-left">Teacher</th>
                  <th className="py-3 px-4 text-left">Due Date</th>
                  <th className="py-3 px-4 text-left">Submissions</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {mockAssignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50/60 transition">
                    <td className="py-3 px-4 font-bold text-gray-900">{a.title}</td>
                    <td className="py-3 px-4 text-gray-700">
                      <span className="font-semibold">{a.subject}</span> · {a.className}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-xs">{a.teacher}</td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{a.dueDate}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-600">{a.submissions}</td>
                    <td className="py-3 px-4">
                      <Badge variant={a.status === 'COMPLETED' ? 'success' : 'info'}>
                        {a.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'National Teaching Council (NTC) Standard Curriculum', size: '4.2 MB', ext: 'PDF' },
            { name: 'Core Mathematics Teachers Guide & Exercises', size: '6.8 MB', ext: 'PDF' },
            { name: 'Integrated Science Lab Manual & Experiments', size: '8.1 MB', ext: 'PDF' },
            { name: 'Social Studies Senior High Scheme of Work', size: '3.5 MB', ext: 'DOCX' },
          ].map((mat, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 font-bold text-xs">
                  {mat.ext}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{mat.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mat.size}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

