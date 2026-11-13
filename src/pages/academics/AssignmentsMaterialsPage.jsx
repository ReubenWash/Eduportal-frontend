import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import TeacherAssignmentsPage from '../teacher/TeacherAssignmentsPage';
import { Download } from 'lucide-react';

const materials = [
  { name: 'National Teaching Council (NTC) Standard Curriculum', size: '4.2 MB', ext: 'PDF' },
  { name: 'Core Mathematics Teachers Guide & Exercises', size: '6.8 MB', ext: 'PDF' },
  { name: 'Integrated Science Lab Manual & Experiments', size: '8.1 MB', ext: 'PDF' },
  { name: 'Social Studies Senior High Scheme of Work', size: '3.5 MB', ext: 'DOCX' },
];

export default function AssignmentsMaterialsPage() {
  const [tab, setTab] = useState('assignments');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments & Curriculum Materials"
        subtitle="Manage assignments and curriculum resources for your classes."
      />

      <div className="flex gap-6 border-b border-gray-200">
        <button
          onClick={() => setTab('assignments')}
          className={`border-b-2 pb-3 text-sm font-semibold transition ${
            tab === 'assignments' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Assignments & Homework
        </button>
        <button
          onClick={() => setTab('materials')}
          className={`border-b-2 pb-3 text-sm font-semibold transition ${
            tab === 'materials' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          Learning Materials & Syllabi
        </button>
      </div>

      {tab === 'assignments' ? (
        <TeacherAssignmentsPage showHeader={false} />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {materials.map((material) => (
            <div key={material.name} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-600">
                  {material.ext}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{material.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{material.size}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="gap-1.5" disabled>
                <Download className="h-3.5 w-3.5" /> Unavailable
              </Button>
            </div>
          ))}
          <p className="md:col-span-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Curriculum materials are not connected to a document service yet.
          </p>
        </div>
      )}
    </div>
  );
}
