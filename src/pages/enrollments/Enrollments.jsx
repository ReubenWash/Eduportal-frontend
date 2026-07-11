import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { getEnrollments, createEnrollment, deleteEnrollment } from '../../api/enrollmentsApi';
import { getClasses } from '../../api/classesApi';
import { getStudents } from '../../api/studentsApi';
import { UserPlus, Trash2 } from 'lucide-react';

export default function Enrollments() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', classId: '' });
  const { addToast } = useToast();

  const load = () => Promise.all([getEnrollments(), getClasses(), getStudents()])
    .then(([d, c, s]) => {
      setData(Array.isArray(d) ? d : []);
      setClasses(Array.isArray(c) ? c : []);
      setStudents(Array.isArray(s) ? s : []);
      setLoading(false);
    })
    .catch(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = classFilter ? data.filter(e => e.classId === classFilter || e.class?.id === classFilter) : data;

  const openEnroll = () => {
    setForm({ studentId: '', classId: '' });
    setModalOpen(true);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.classId) { addToast('Please select both student and class', 'error'); return; }
    try {
      await createEnrollment(form);
      addToast('Student enrolled successfully', 'success');
      setModalOpen(false);
      load();
    } catch { addToast('Failed to enroll student', 'error'); }
  };

  const handleRemove = async (row) => {
    try {
      await deleteEnrollment(row.id);
      addToast('Enrollment removed', 'success');
      load();
    } catch { addToast('Failed to remove enrollment', 'error'); }
  };

  return (
    <div>
      <PageHeader title="Enrollments" subtitle="Student class enrollments" action={<Button onClick={openEnroll} icon={UserPlus}>Enroll Student</Button>} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <Select className="w-64" options={classes.map(c => ({ value: c.id, label: c.name }))} value={classFilter} onChange={e => setClassFilter(e.target.value)} placeholder="Filter by class..." />
        </div>
        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No enrollments found"
          columns={[
            { header: 'Student', key: 'studentName', render: (v, row) => <span className="font-medium text-gray-900">{v || row.student?.name || '—'}</span> },
            { header: 'Class', key: 'className', render: (v, row) => <span className="text-gray-600">{typeof v === 'string' ? v : row.class?.name || '—'}</span> },
            { header: 'Term', key: 'termName', render: (v, row) => <span className="text-gray-600">{typeof v === 'string' ? v : row.term?.name || '—'}</span> },
            { header: 'Status', key: 'status', render: v => <Badge variant={v === 'ACTIVE' ? 'success' : 'default'}>{v}</Badge> },
            { header: 'Enrolled', key: 'enrollmentDate', render: v => v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
          ]}
          rowActions={(row) => (
            <button
              onClick={() => handleRemove(row)}
              className="flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-500 hover:bg-red-50 px-2 py-1.5 rounded-md transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Enroll Student" subtitle="Select a student and class to enroll.">
        <form onSubmit={handleEnroll} className="space-y-4 pt-2">
          <Select
            label="Student"
            value={form.studentId}
            onChange={e => setForm({ ...form, studentId: e.target.value })}
            options={students.filter(s => s.status === 'ACTIVE').map(s => ({ value: s.id, label: `${s.name} (${s.studentNo})` }))}
            placeholder="Select a student..."
          />
          <Select
            label="Class"
            value={form.classId}
            onChange={e => setForm({ ...form, classId: e.target.value })}
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select a class..."
          />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Enroll</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}