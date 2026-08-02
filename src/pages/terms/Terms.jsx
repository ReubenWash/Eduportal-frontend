import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getTerms, createTerm, updateTerm } from '../../api/schoolApi';
import { formatDate } from '../../utils/helpers';
import { CalendarPlus, Edit2, Loader2, Eye } from 'lucide-react';

const TERM_NUMBERS = ['TERM1', 'TERM2', 'TERM3'];
const TERM_STATUSES = ['UPCOMING', 'ACTIVE', 'COMPLETED'];

const TERM_LABELS = {
  TERM1: 'First Term',
  TERM2: 'Second Term',
  TERM3: 'Third Term'
};

const statusVariant = { 
  UPCOMING: 'info', 
  ACTIVE: 'success', 
  COMPLETED: 'default' 
};

export default function Terms() {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    academicYear: '', 
    termNumber: 'TERM1', 
    startDate: '', 
    endDate: '', 
    status: 'UPCOMING' 
  });
  const { addToast } = useToast();
  const { user } = useAuth();
  
  // ✅ Check if user can manage terms (School Admin or Super Admin)
  const canManageTerms = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  
  // ✅ Check if user is a teacher (read-only)
  const isTeacher = user?.role === 'CLASS_TEACHER' || user?.role === 'SUBJECT_TEACHER';

  const load = async () => {
    setLoading(true);
    try {
      const data = await getTerms();
      setTerms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading terms:', error);
      addToast('Failed to load terms', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    const year = new Date().getFullYear();
    setForm({ 
      academicYear: `${year}/${year + 1}`,
      termNumber: 'TERM1', 
      startDate: '', 
      endDate: '', 
      status: 'UPCOMING' 
    });
    setModalOpen(true);
  };

  const openEdit = (t) => {
    setEditing(t);
    setForm({ 
      academicYear: t.academicYear || '',
      termNumber: t.termNumber || 'TERM1',
      startDate: t.startDate ? new Date(t.startDate).toISOString().split('T')[0] : '',
      endDate: t.endDate ? new Date(t.endDate).toISOString().split('T')[0] : '',
      status: t.status || 'UPCOMING'
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate dates
    if (!form.startDate || !form.endDate) {
      addToast('Please select both start and end dates', 'error');
      return;
    }

    const startDate = new Date(form.startDate);
    const endDate = new Date(form.endDate);

    if (endDate <= startDate) {
      addToast('End date must be after start date', 'error');
      return;
    }

    setSaving(true);

    try {
      const payload = {
        academicYear: form.academicYear,
        termNumber: form.termNumber,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: form.status
      };

      console.log('Sending payload:', payload);

      if (editing) {
        await updateTerm(editing.id, payload);
        addToast('Academic term updated successfully!', 'success');
      } else {
        await createTerm(payload);
        addToast('New academic term created successfully!', 'success');
      }
      
      setModalOpen(false);
      await load();
    } catch (error) {
      console.error('Error saving term:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to save term';
      addToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const getTermLabel = (termNumber) => {
    return TERM_LABELS[termNumber] || termNumber;
  };

  const getStatusBadge = (status) => {
    const variant = statusVariant[status] || 'default';
    return <Badge variant={variant} dot>{status}</Badge>;
  };

  const formatDateDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Generate academic year options
  const getAcademicYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = -5; i <= 5; i++) {
      const startYear = currentYear + i;
      const endYear = startYear + 1;
      options.push(`${startYear}/${endYear}`);
    }
    return options;
  };

  return (
    <div>
      <PageHeader
        title="Academic Terms"
        subtitle={canManageTerms ? 'Manage school terms, holidays, and academic sessions' : 'View academic terms'}
        action={
          // ✅ Only show New Term button if user has permission
          canManageTerms ? (
            <Button onClick={openCreate} icon={CalendarPlus}>New Term</Button>
          ) : null
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          loading={loading}
          data={terms}
          emptyMessage="No academic terms found"
          columns={[
            { 
              header: 'Term', 
              key: 'termNumber', 
              render: (v, row) => (
                <div>
                  <span className="font-semibold text-gray-900">{getTermLabel(v)}</span>
                  <span className="block text-xs text-gray-500">{row.academicYear}</span>
                </div>
              ) 
            },
            { 
              header: 'Start Date', 
              key: 'startDate', 
              render: (v) => <span className="text-gray-600">{formatDateDisplay(v)}</span> 
            },
            { 
              header: 'End Date', 
              key: 'endDate', 
              render: (v) => <span className="text-gray-600">{formatDateDisplay(v)}</span> 
            },
            { 
              header: 'Status', 
              key: 'status', 
              render: (v) => getStatusBadge(v) 
            },
          ]}
          rowActions={(row) => (
            // ✅ Only show Edit button if user has permission
            canManageTerms ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEdit(row)}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Edit Term"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              // ✅ For teachers, show read-only indicator
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" /> View only
              </span>
            )
          )}
        />
      </div>

      {/* ✅ Only show Modal if user has permission */}
      {canManageTerms && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editing ? 'Edit Academic Term' : 'Create Academic Term'}
          subtitle={editing ? `Updating ${getTermLabel(editing.termNumber)} ${editing.academicYear}` : 'Define the dates for the new academic session.'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <Select
              label="Academic Year"
              value={form.academicYear}
              onChange={e => setForm({...form, academicYear: e.target.value})}
              options={getAcademicYearOptions().map(year => ({ value: year, label: year }))}
              required
            />

            <Select
              label="Term"
              value={form.termNumber}
              onChange={e => setForm({...form, termNumber: e.target.value})}
              options={TERM_NUMBERS.map(t => ({ value: t, label: TERM_LABELS[t] }))}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Start Date" 
                type="date" 
                value={form.startDate} 
                onChange={e => setForm({...form, startDate: e.target.value})} 
                required 
              />
              <Input 
                label="End Date" 
                type="date" 
                value={form.endDate} 
                onChange={e => setForm({...form, endDate: e.target.value})} 
                required 
              />
            </div>

            {editing && (
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm({...form, status: e.target.value})}
                options={TERM_STATUSES.map(s => ({ value: s, label: s }))}
                required
              />
            )}

            {editing && (
              <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                <p>Changing status to <strong>ACTIVE</strong> will automatically deactivate other terms.</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
              <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Create Term')}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}