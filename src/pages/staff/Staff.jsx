import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { getStaff, createStaff, updateStaff, deleteStaff, assignSubjects } from '../../api/staffApi';
import { getSubjects } from '../../api/subjectsApi';
import { formatDate } from '../../utils/helpers';
import { Search, UserPlus, FileDown, BookOpen, Edit2, Trash2 } from 'lucide-react';

export default function Staff() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [subjectsModal, setSubjectsModal] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubj, setSelectedSubj] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', role: 'SUBJECT_TEACHER', phone: '' });
  const { addToast } = useToast();

  // Map backend shape { firstName, lastName, user: { email, role } } → flat display shape
  const mapStaff = (s) => ({
    ...s,
    name: `${s.firstName || ''} ${s.lastName || ''}`.trim(),
    email: s.user?.email || s.email || '',
    role:  s.user?.role  || s.role  || '',
  });

  const load = () => getStaff().then(d => {
    setData(Array.isArray(d) ? d.map(mapStaff) : []);
    setLoading(false);
  }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return data.filter(s => {
      if (keyword && !s.name.toLowerCase().includes(keyword.toLowerCase()) && !s.email.toLowerCase().includes(keyword.toLowerCase())) return false;
      if (roleFilter && s.role !== roleFilter) return false;
      return true;
    });
  }, [data, keyword, roleFilter]);

  const openCreate = () => { setEditing(null); setForm({ firstName: '', lastName: '', email: '', role: 'SUBJECT_TEACHER', phone: '' }); setDrawerOpen(true); };
  const openEdit = (s) => { setEditing(s); setForm({ firstName: s.firstName || '', lastName: s.lastName || '', email: s.email, role: s.role, phone: s.phone || '' }); setDrawerOpen(true); };
  const openSubjects = async (s) => {
    const subs = await getSubjects();
    setSubjects(subs);
    setSelectedSubj(s.subjects || []);
    setSubjectsModal(s);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        email:     form.email.trim(),
        role:      form.role,
        phone:     form.phone || undefined,
      };
      if (editing) await updateStaff(editing.id, payload);
      else await createStaff(payload);
      addToast(editing ? 'Staff member updated' : `Staff added! A welcome email with login details has been sent to ${form.email}`, 'success');
      setDrawerOpen(false);
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to save staff details';
      addToast(msg, 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStaff(deleteDialog.id);
      addToast('Staff member removed', 'success');
      setDeleteDialog(null);
      load();
    } catch { addToast('Failed to delete staff member', 'error'); }
  };

  const handleAssign = async () => {
    try {
      await assignSubjects(subjectsModal.id, { subjectIds: selectedSubj });
      addToast('Subjects assigned successfully', 'success');
      setSubjectsModal(null);
      load();
    } catch { addToast('Failed to assign subjects', 'error'); }
  };

  const roleVariant = { SCHOOL_ADMIN: 'primary', CLASS_TEACHER: 'info', SUBJECT_TEACHER: 'default' };
  const roleLabels = { SCHOOL_ADMIN: 'School Admin', CLASS_TEACHER: 'Class Teacher', SUBJECT_TEACHER: 'Subject Teacher' };

  return (
    <div>
      <PageHeader
        title="Staff Directory"
        subtitle="Manage teaching and administrative staff accounts"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={FileDown} className="hidden sm:flex">Export</Button>
            <Button onClick={openCreate} icon={UserPlus}>Add Staff</Button>
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
              placeholder="Search by name or email..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            className="w-full sm:w-48"
            options={[
              { value: 'SCHOOL_ADMIN', label: 'School Admin' },
              { value: 'CLASS_TEACHER', label: 'Class Teacher' },
              { value: 'SUBJECT_TEACHER', label: 'Subject Teacher' }
            ]}
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            placeholder="All Roles"
          />
          <div className="sm:ml-auto text-sm text-gray-500 font-medium">
            {filtered.length} staff member{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Data Table */}
        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No staff members found"
          columns={[
            {
              header: 'Staff Member',
              key: 'name',
              render: (_, row) => (
                <div className="flex items-center gap-3">
                  <Avatar name={row.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{row.name}</p>
                    <p className="text-[11px] text-gray-500">{row.email}</p>
                  </div>
                </div>
              )
            },
            { header: 'Role', key: 'role', render: v => <Badge variant={roleVariant[v] || 'default'}>{roleLabels[v] || v}</Badge> },
            { header: 'Phone', key: 'phone', render: v => <span className="text-gray-600">{v || '—'}</span> },
            { header: 'Subjects', key: 'subjects', render: v => <span className="text-gray-600">{v?.length || 0} assigned</span> },
            { header: 'Joined', key: 'createdAt', render: v => <span className="text-gray-600">{formatDate(v)}</span> },
          ]}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              {row.role === 'SUBJECT_TEACHER' && (
                <button
                  onClick={() => openSubjects(row)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                  title="Assign Subjects"
                >
                  <BookOpen className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title="Edit Staff"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDeleteDialog(row)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Staff"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </div>

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit Staff Member' : 'Add Staff Member'}
        subtitle={editing ? `Updating details for ${editing.name}` : 'Enter the details of the new staff member below.'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="First Name" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} required placeholder="Jane" />
            <Input label="Last Name" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} required placeholder="Doe" />
          </div>
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required placeholder="jane@school.edu.gh" disabled={!!editing} />
          {!editing && <p className="text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">📧 A welcome email with a temporary password will be sent to this address.</p>}
          <Input label="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="e.g. +233 24 000 0000" />
          <Select
            label="System Role"
            value={form.role}
            onChange={e => setForm({...form, role: e.target.value})}
            options={[
              {value: 'SUBJECT_TEACHER', label: 'Subject Teacher'},
              {value: 'CLASS_TEACHER', label: 'Class Teacher'},
              {value: 'SCHOOL_ADMIN', label: 'School Admin'}
            ]}
          />
          <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create Staff'}</Button>
          </div>
        </form>
      </SlideOver>

      <Modal isOpen={!!subjectsModal} onClose={() => setSubjectsModal(null)} title="Assign Subjects" subtitle={`For ${subjectsModal?.name}`}>
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
            {subjects.length === 0 ? (
              <p className="text-sm text-gray-500 col-span-2">No subjects available to assign.</p>
            ) : (
              subjects.map(s => {
                const isSelected = selectedSubj.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={e => setSelectedSubj(e.target.checked ? [...selectedSubj, s.id] : selectedSubj.filter(x => x !== s.id))}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-indigo-900' : 'text-gray-900'}`}>{s.name}</p>
                      <p className={`text-[11px] ${isSelected ? 'text-indigo-600' : 'text-gray-500'}`}>{s.code}</p>
                    </div>
                  </label>
                );
              })
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setSubjectsModal(null)}>Cancel</Button>
            <Button onClick={handleAssign}>Save Assignments</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        title="Remove Staff"
        message={`Are you sure you want to remove ${deleteDialog?.name} from the staff directory? Their access will be revoked immediately.`}
        confirmText="Remove Staff"
        isDanger={true}
      />
    </div>
  );
}