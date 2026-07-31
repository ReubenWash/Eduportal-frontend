import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getClasses, createClass, updateClass, deleteClass } from '../../api/classesApi';
import { getStaff } from '../../api/staffApi';
import { Users, BookOpen, FilePlus2, Search, Edit2, Trash2, Loader2, Calendar, UserCheck } from 'lucide-react';

const JHS_LEVELS = ['JHS1', 'JHS2', 'JHS3'];
const SECTIONS = ['A', 'B', 'C', 'D', 'E'];

export default function Classes() {
  const { user } = useAuth();
  const canManage = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [staff, setStaff] = useState([]);
  const [saving, setSaving] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { addToast } = useToast();

  // Generate academic year options
  const getAcademicYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = -5; i <= 5; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      years.push(`${startYear}/${endYear}`);
    }
    return years;
  };

  const [form, setForm] = useState({
    level: '',
    section: '',
    academicYear: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
    classTeacherId: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const [classesRes, staffRes] = await Promise.all([
        getClasses(),
        getStaff()
      ]);
      setData(Array.isArray(classesRes) ? classesRes : []);
      setStaff(Array.isArray(staffRes) ? staffRes : []);
    } catch (err) {
      console.error('Error loading data:', err);
      addToast('Failed to load classes', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    const year = new Date().getFullYear();
    setForm({
      level: '',
      section: '',
      academicYear: `${year}/${year + 1}`,
      classTeacherId: ''
    });
    setModalOpen(true);
  };

  const openEdit = (cls) => {
    setEditing(cls);
    setForm({
      level: cls.level || '',
      section: cls.section || '',
      academicYear: cls.academicYear || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
      classTeacherId: cls.classTeacherId || ''
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validate
    if (!form.level) {
      addToast('Please select a level (JHS1, JHS2, or JHS3)', 'error');
      return;
    }
    if (!form.section) {
      addToast('Please select a section', 'error');
      return;
    }
    if (!form.academicYear) {
      addToast('Please select an academic year', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        level: form.level,
        section: form.section,
        academicYear: form.academicYear,
        classTeacherId: form.classTeacherId || null
      };

      if (editing) {
        await updateClass(editing.id, payload);
        addToast('Class updated successfully', 'success');
      } else {
        await createClass(payload);
        addToast('Class created successfully', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      console.error('Save error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to save class';
      addToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog) return;
    
    setDeleteLoading(true);
    try {
      await deleteClass(deleteDialog.id);
      addToast(`Class "${deleteDialog.name}" deleted successfully`, 'success');
      setDeleteDialog(null);
      load();
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Failed to delete class', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getTeacherName = (teacherId) => {
    if (!teacherId) return 'No Form Teacher';
    const teacher = staff.find(s => s.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  };

  const filtered = data.filter(c => 
    !keyword || 
    (c.level + ' ' + c.section).toLowerCase().includes(keyword.toLowerCase()) ||
    (c.academicYear || '').toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Manage class sections, assigned teachers, and subjects"
        action={
          canManage && <Button onClick={openCreate} icon={FilePlus2}>Create Class</Button>
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
                <button
                  onClick={() => openEdit(cls)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="Edit Class"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setDeleteDialog(cls)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Class"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <div className="flex items-start justify-between mb-5 pr-12">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                  {cls.level} {cls.section}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {cls.academicYear}
                </p>
              </div>
              <Badge variant="info" dot>{cls._count?.enrollments || 0} students</Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar name={getTeacherName(cls.classTeacherId)} size="xs" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{getTeacherName(cls.classTeacherId)}</p>
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
          {canManage && (
            <Button onClick={openCreate} className="mt-4">Create Class</Button>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      {canManage && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit Class' : 'Create New Class'}
          subtitle={editing ? `Editing "${editing.level} ${editing.section}"` : 'Set up a new class section for the academic year.'}
        >
          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
              <select
                required
                value={form.level}
                onChange={e => setForm({ ...form, level: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              >
                <option value="">Select Level</option>
                {JHS_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <select
                required
                value={form.section}
                onChange={e => setForm({ ...form, section: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              >
                <option value="">Select Section</option>
                {SECTIONS.map(section => (
                  <option key={section} value={section}>Section {section}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <select
                required
                value={form.academicYear}
                onChange={e => setForm({ ...form, academicYear: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              >
                <option value="">Select Academic Year</option>
                {getAcademicYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
              <select
                value={form.classTeacherId}
                onChange={e => setForm({ ...form, classTeacherId: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none"
              >
                <option value="">No Form Teacher</option>
                {staff.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? 'Save Changes' : 'Create Class'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        title="Delete Class"
        message={`Are you sure you want to delete "${deleteDialog?.level} ${deleteDialog?.section}"? This action cannot be undone and will remove all associated data.`}
        confirmText="Delete Class"
        isDanger={true}
        loading={deleteLoading}
      />
    </div>
  );
}