import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Library, Plus, Search, Upload, Download, FileText, BookOpen } from 'lucide-react';

const mockTeacherFiles = [
  {
    id: 'MAT-01',
    title: 'BECE Mathematics Past Questions & Step-by-Step Solutions (2018-2024)',
    subject: 'Mathematics',
    targetClass: 'JHS 3',
    fileSize: '4.8 MB',
    uploadDate: 'May 8, 2026',
    downloads: 74,
  },
  {
    id: 'MAT-02',
    title: 'Geometry & Construction Class Slide Deck',
    subject: 'Mathematics',
    targetClass: 'JHS 2',
    fileSize: '2.1 MB',
    uploadDate: 'May 11, 2026',
    downloads: 36,
  },
  {
    id: 'MAT-03',
    title: 'Weekly Formative Quiz Solution Key #2',
    subject: 'Mathematics',
    targetClass: 'JHS 1',
    fileSize: '950 KB',
    uploadDate: 'May 13, 2026',
    downloads: 41,
  },
];

export default function TeacherMaterialsPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Teaching & Learning Materials"
          subtitle="Upload study files, class presentations, and past questions accessible to your students."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Upload className="h-4 w-4" /> Upload Material
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockTeacherFiles.map((f) => (
          <div key={f.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {f.targetClass} · {f.subject}
              </span>
              <span className="text-[11px] text-gray-400">{f.fileSize}</span>
            </div>
            <h4 className="text-sm font-bold text-gray-900 leading-snug">{f.title}</h4>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span>{f.downloads} student downloads</span>
              <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

