import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClasses, createClass } from '../../api/classesApi';
import { getSubjects } from '../../api/subjectsApi';
import { Users, BookOpen, FilePlus2, Search, Edit2, Trash2 } from 'lucide-react';

export default function Classes() {
  const { user } = useAuth();
  // Only School Admin (or Super Admin) can create/edit/delete classes per
  // the Project Documentation — Class Teacher has view access only.
  const canManage = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [data, setData] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState({ name: '', academicYear: new Date().getFullYear().toString(), classTeacherId: '' });
  const { addToast } = useToast();

  const load = () => Promise.all([getClasses(), getSubjects()])
    .then(([c, s]) => { setData(Array.isArray(c) ? c : []); setSubjects(Array.isArray(s) ? s : []); setLoading(false); })
    .catch(err => { console.error('Classes fetch error:', err); setLoading(false); });
  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try { await createClass(form); addToast('Class created successfully', 'success'); setModalOpen(false); load(); } catch { addToast('Failed to create class', 'error'); }
  };

  const filtered = data.filter(c => !keyword || c.name.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Manage class sections, assigned teachers, and subjects"
        action={
          canManage && <Button onClick={() => setModalOpen(true)} icon={FilePlus2}>Create Class</Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search classes..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          {filtered.length} active class{filtered.length !== 1 ? 'es' : ''}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? [1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-44 animate-pulse">
            <div className="h-6 w-24 bg-gray-200 rounded mb-4" />
            <div className="h-4 w-1/2 bg-gray-100 rounded mb-6" />
            <div className="flex gap-4">
              <div className="h-10 w-1/2 bg-gray-50 rounded" />
              <div className="h-10 w-1/2 bg-gray-50 rounded" />
            </div>
          </div>
        )) : filtered.map(cls => (
          <div key={cls.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-all group relative">
            {canManage && (
              <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            )}

            <div className="flex items-start justify-between mb-5 pr-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{cls.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Year {cls.academicYear}</p>
              </div>
              <Badge variant="info" dot>{cls._count?.enrollments || 0} students</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={cls.classTeacher?.name || 'Unassigned'} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{cls.classTeacher?.name || 'No Form Teacher'}</p>
                  <p className="text-[10px] text-gray-500">Form Teacher</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-none">{cls._count?.enrollments || 0}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Enrolled</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-none">{cls._count?.subjects || 0}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">Subjects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="mx-auto h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
            <BookOpen className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No classes found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search{canManage ? ' or create a new class.' : '.'}</p>
        </div>
      )}

      {canManage && (
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create New Class" subtitle="Set up a new class section for the academic year.">
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <Input label="Class Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. JHS1 A" />
            <Input label="Academic Year" type="number" value={form.academicYear} onChange={e => setForm({ ...form, academicYear: e.target.value })} required />
            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Create Class</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}