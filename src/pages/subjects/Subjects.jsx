import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { getSubjects, createSubject, updateSubject, deleteSubject } from '../../api/subjectsApi';
import { BookOpen, Plus, Edit2, Trash2 } from 'lucide-react';

export default function Subjects() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', code: '', type: 'CORE' });
  const { addToast } = useToast();

  const load = () => getSubjects().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', code: '', type: 'CORE' }); setModalOpen(true); };
  const openEdit = (row) => { setEditing(row); setForm({ name: row.name, code: row.code, type: row.type }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await updateSubject(editing.id, form);
        addToast('Subject updated successfully', 'success');
      } else {
        await createSubject(form);
        addToast('Subject created successfully', 'success');
      }
      setModalOpen(false);
      setForm({ name: '', code: '', type: 'CORE' });
      load();
    } catch {
      addToast(editing ? 'Failed to update subject' : 'Failed to create subject', 'error');
    }
  };

  const handleDelete = async (row) => {
    try {
      await deleteSubject(row.id);
      addToast('Subject deleted successfully', 'success');
      load();
    } catch { addToast('Failed to delete subject', 'error'); }
  };

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Manage curriculum subjects and course offerings"
        action={<Button onClick={openCreate} icon={Plus}>Add Subject</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          loading={loading}
          data={data}
          emptyMessage="No subjects found"
          columns={[
            {
              header: 'Subject',
              key: 'name',
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                  </div>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              )
            },
            { header: 'Code', key: 'code', render: v => <span className="font-mono text-sm bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-gray-700">{v}</span> },
            { header: 'Type', key: 'type', render: v => <Badge variant={v === 'CORE' ? 'primary' : 'default'} dot>{v}</Badge> },
            { header: 'Teachers', key: 'teachers', render: v => <span className="text-gray-600">{v?.length || 0} assigned</span> },
          ]}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title="Edit Subject"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(row); }}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Delete Subject"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Subject' : 'Add Subject'} subtitle={editing ? `Updating ${editing.name}` : 'Define a new curriculum subject.'}>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Subject Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Mathematics" />
          <Input label="Subject Code" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required placeholder="e.g. MATH01" />
          <Select
            label="Type"
            value={form.type}
            onChange={e => setForm({ ...form, type: e.target.value })}
            options={[{ value: 'CORE', label: 'Core Subject' }, { value: 'ELECTIVE', label: 'Elective Subject' }]}
          />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create Subject'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}