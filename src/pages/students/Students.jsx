import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import FileUpload from '../../components/common/FileUpload';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/studentsApi';
import { getClasses } from '../../api/classesApi';
import { Search, UserPlus, FileDown, Eye, Edit2, Trash2 } from 'lucide-react';

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Per the Project Documentation, Class Teacher can view and update
  // student profiles in their class, but only School/Super Admin can
  // admit new students or delete existing ones.
  const canAdmitOrDelete = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const canEdit = canAdmitOrDelete || user?.role === 'CLASS_TEACHER';

  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState({ name: '', studentNo: '', classId: '', gender: 'MALE', dob: '', status: 'ACTIVE' });
  const [preview, setPreview] = useState('');
  const [photo, setPhoto] = useState(null);
  const { addToast } = useToast();

  const load = () => getStudents().then(d => { setData(Array.isArray(d) ? d : []); setLoading(false); }).catch(err => { setLoading(false); });
  useEffect(() => { load(); }, []);
  useEffect(() => { getClasses().then(d => setClasses(Array.isArray(d) ? d : [])).catch(err => console.error('Classes fetch error:', err)); }, []);

  const filtered = useMemo(() => {
    return data.filter(s => {
      const nameMatch = !keyword ||
        (s.name || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (s.studentNo || '').toLowerCase().includes(keyword.toLowerCase());
      const classMatch = !classFilter || s.classId === classFilter;
      return nameMatch && classMatch;
    });
  }, [data, keyword, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', studentNo: '', classId: '', gender: 'MALE', dob: '', status: 'ACTIVE' });
    setPhoto(null);
    setPreview('');
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name, studentNo: row.studentNo, classId: row.classId, gender: row.gender, dob: row.dob || '', status: row.status });
    setPhoto(null);
    setPreview(row.photo || '');
    setDrawerOpen(true);
  };

  const handleFile = (file) => { setPhoto(file); setPreview(URL.createObjectURL(file)); };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateStudent(editing.id, form);
      else await createStudent(form);
      addToast(editing ? 'Student updated successfully' : 'Student admitted successfully', 'success');
      setDrawerOpen(false);
      load();
    } catch { addToast('Failed to save student', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteDialog.id);
      addToast('Student removed from system', 'success');
      setDeleteDialog(null);
      load();
    } catch { addToast('Failed to delete student', 'error'); }
  };

  const statusVariant = { ACTIVE: 'success', INACTIVE: 'default', WITHDRAWN: 'danger' };

  const columns = [
    {
      header: 'Student',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photo} name={row.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{row.name}</p>
            <p className="text-[11px] text-gray-500">{row.studentNo}</p>
          </div>
        </div>
      )
    },
    { header: 'Class', key: 'className', render: v => <span className="text-gray-600">{v}</span> },
    { header: 'Gender', key: 'gender', render: v => <span className="text-gray-600 capitalize">{v?.toLowerCase()}</span> },
    { header: 'Status', key: 'status', render: v => <Badge variant={statusVariant[v] || 'default'} dot>{v}</Badge> },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage student records, enrollments, and profiles"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={FileDown} className="hidden sm:flex">Export</Button>
            {canAdmitOrDelete && <Button onClick={openCreate} icon={UserPlus}>Admit Student</Button>}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            className="w-full sm:w-48"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            placeholder="All Classes"
          />
          <div className="sm:ml-auto text-sm text-gray-500 font-medium">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Data Table */}
        <Table
          loading={loading}
          data={filtered}
          columns={columns}
          onRowClick={(row) => navigate(`/students/${row.id}`)}
          emptyMessage="No students found"
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/students/${row.id}`); }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="View Profile"
              >
                <Eye className="h-4 w-4" />
              </button>
              {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Edit Student"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {canAdmitOrDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteDialog(row); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* SlideOver Form */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit Student Details' : 'Admit New Student'}
        subtitle={editing ? `Updating record for ${editing.name}` : 'Enter the details of the new student below.'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <FileUpload label="Passport Photo" onFileSelect={handleFile} preview={preview} accept="image/*" />

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Ama Mensah" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Student Number" value={form.studentNo} onChange={e => setForm({ ...form, studentNo: e.target.value })} required placeholder="STU/001" />
              <Select label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} options={[{value: 'MALE', label: 'Male'}, {value: 'FEMALE', label: 'Female'}]} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Class" value={form.classId} onChange={e => setForm({ ...form, classId: e.target.value })} options={classes.map(c => ({ value: c.id, label: c.name }))} required placeholder="Select class..." />
              <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} required />
            </div>
            {editing && canAdmitOrDelete && (
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                options={[{value: 'ACTIVE', label: 'Active'}, {value: 'INACTIVE', label: 'Inactive'}, {value: 'WITHDRAWN', label: 'Withdrawn'}]}
              />
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Admit Student'}</Button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        title="Remove Student"
        message={`Are you sure you want to completely remove ${deleteDialog?.name} from the system? This action cannot be undone.`}
        confirmText="Remove Student"
        isDanger={true}
      />
    </div>
  );
}