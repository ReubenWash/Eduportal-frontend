import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { getGuardians, createGuardian, linkStudent } from '../../api/guardiansApi';
import { getStudents } from '../../api/studentsApi';
import { UserPlus, Link as LinkIcon, Search, X } from 'lucide-react';

export default function Guardians() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [linkModal, setLinkModal] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [keyword, setKeyword] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' });
  const { addToast } = useToast();

  const load = () => getGuardians().then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = data.filter(g => !keyword || g.name?.toLowerCase().includes(keyword.toLowerCase()) || g.email?.toLowerCase().includes(keyword.toLowerCase()));

  const openCreate = () => { setForm({ name: '', email: '', phone: '', address: '' }); setDrawerOpen(true); };
  const handleSave = async (e) => {
    e.preventDefault();
    try { await createGuardian(form); addToast('Guardian added successfully', 'success'); setDrawerOpen(false); load(); } catch { addToast('Failed to add guardian', 'error'); }
  };

  const openLinkModal = async (guardian) => {
    setLinkModal(guardian);
    setSelectedStudent('');
    try {
      const stu = await getStudents();
      setStudents(stu.filter(s => s.status === 'ACTIVE'));
    } catch { setStudents([]); }
  };

  const handleLinkStudent = async () => {
    if (!selectedStudent) return;
    try {
      await linkStudent(linkModal.id, { studentId: selectedStudent });
      addToast('Student linked successfully', 'success');
      setLinkModal(null);
      load();
    } catch { addToast('Failed to link student', 'error'); }
  };

  return (
    <div>
      <PageHeader
        title="Guardians"
        subtitle="Manage parent and guardian contact information"
        action={<Button onClick={openCreate} icon={UserPlus}>Add Guardian</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search guardians..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
        </div>

        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No guardians found"
          columns={[
            {
              header: 'Guardian',
              key: 'name',
              render: (v, row) => (
                <div className="flex items-center gap-3">
                  <Avatar name={v} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{v}</p>
                    <p className="text-[11px] text-gray-500">{row.email}</p>
                  </div>
                </div>
              )
            },
            { header: 'Phone', key: 'phone', render: v => <span className="text-gray-600">{v || '—'}</span> },
            { header: 'Linked Students', key: 'students', render: v => <span className="text-gray-600">{v?.length || 0} student{(v?.length || 0) !== 1 ? 's' : ''}</span> },
          ]}
          rowActions={(row) => (
            <button
              onClick={() => openLinkModal(row)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors"
            >
              <LinkIcon className="h-3.5 w-3.5" /> Link Student
            </button>
          )}
        />
      </div>

      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Guardian"
        subtitle="Enter the contact details of the parent or guardian."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Kwame Asante" />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="guardian@email.com" />
          <Input label="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required placeholder="+233 24 000 0000" />
          <Input label="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Home address (optional)" />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit">Add Guardian</Button>
          </div>
        </form>
      </SlideOver>

      <Modal isOpen={!!linkModal} onClose={() => setLinkModal(null)} title="Link Student" subtitle={`Link a student to ${linkModal?.name}`}>
        <div className="space-y-4 pt-2">
          <Select
            label="Select Student"
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            options={students.map(s => ({ value: s.id, label: `${s.name} (${s.studentNo})` }))}
            placeholder="Choose a student..."
          />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setLinkModal(null)}>Cancel</Button>
            <Button onClick={handleLinkStudent} disabled={!selectedStudent}>Link Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}