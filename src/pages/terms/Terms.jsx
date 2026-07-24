import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { getSchoolTerms, createTerm, updateTerm } from '../../api/schoolApi';
import { formatDate } from '../../utils/helpers';
import { CalendarPlus, Edit2 } from 'lucide-react';

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '', status: 'UPCOMING' });
  const { addToast } = useToast();

  const load = () => getSchoolTerms().then(d => { setTerms(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', startDate: '', endDate: '', status: 'UPCOMING' }); setModalOpen(true); };
  const openEdit = (t) => { setEditing(t); setForm({ name: t.name, startDate: t.startDate?.split('T')[0] || '', endDate: t.endDate?.split('T')[0] || '', status: t.status }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await updateTerm(editing.id, form);
      else await createTerm(form);
      addToast(editing ? 'Academic term updated' : 'New academic term created', 'success');
      setModalOpen(false);
      load();
    } catch { addToast('Failed to save term details', 'error'); }
  };

  const statusVariant = { UPCOMING: 'info', ACTIVE: 'success', COMPLETED: 'default' };

  return (
    <div>
      <PageHeader
        title="Academic Terms"
        subtitle="Manage school terms, holidays, and academic sessions"
        action={<Button onClick={openCreate} icon={CalendarPlus}>New Term</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          loading={loading}
          data={terms}
          emptyMessage="No academic terms found"
          columns={[
            { header: 'Term Name', key: 'name', render: v => <span className="font-semibold text-gray-900">{v}</span> },
            { header: 'Start Date', key: 'startDate', render: v => <span className="text-gray-600">{formatDate(v)}</span> },
            { header: 'End Date', key: 'endDate', render: v => <span className="text-gray-600">{formatDate(v)}</span> },
            { header: 'Status', key: 'status', render: v => <Badge variant={statusVariant[v] || 'default'} dot>{v}</Badge> },
          ]}
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => openEdit(row)}
                className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                title="Edit Term"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </div>
          )}
        />
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Academic Term' : 'Create Academic Term'}
        subtitle={editing ? `Updating settings for ${editing.name}` : 'Define the dates for the new academic session.'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Input label="Term Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="e.g. First Term 2025/2026" />
          
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
          </div>

          {editing && (
            <Select
              label="Status"
              value={form.status}
              onChange={e => setForm({...form, status: e.target.value})}
              options={[
                { value: 'UPCOMING', label: 'Upcoming' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'COMPLETED', label: 'Completed' }
              ]}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Save Changes' : 'Create Term'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}