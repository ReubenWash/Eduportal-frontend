import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import { useToast } from '../../context/ToastContext';
import { getEnrollments, createEnrollment, deleteEnrollment } from '../../api/enrollmentsApi';
import { getClasses } from '../../api/classesApi';
import { getStudents } from '../../api/studentsApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { UserPlus, Trash2, Loader2, Calendar, BookOpen, Users } from 'lucide-react';

export default function Enrollments() {
  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classFilter, setClassFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ studentId: '', classId: '', termId: '' });
  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classFilter) params.classId = classFilter;
      if (termFilter) params.termId = termFilter;
      
      const [d, c, s, t] = await Promise.all([
        getEnrollments(params),
        getClasses(),
        getStudents(),
        getSchoolTerms()
      ]);
      
      setData(Array.isArray(d) ? d : []);
      setClasses(Array.isArray(c) ? c : []);
      setStudents(Array.isArray(s) ? s : []);
      setTerms(Array.isArray(t) ? t : []);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      addToast('Failed to load enrollments', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [classFilter, termFilter]);

  // Filter available students (only active ones not already enrolled in the selected class/term)
  const availableStudents = useMemo(() => {
    if (!form.classId || !form.termId) return students.filter(s => s.status === 'ACTIVE');
    
    const enrolledStudentIds = data
      .filter(e => e.classId === form.classId && e.termId === form.termId)
      .map(e => e.studentId);
    
    return students.filter(s => 
      s.status === 'ACTIVE' && !enrolledStudentIds.includes(s.id)
    );
  }, [students, data, form.classId, form.termId]);

  const filtered = useMemo(() => {
    let result = data;
    if (classFilter) result = result.filter(e => e.classId === classFilter);
    if (termFilter) result = result.filter(e => e.termId === termFilter);
    return result;
  }, [data, classFilter, termFilter]);

  const openEnroll = () => {
    setForm({ studentId: '', classId: '', termId: '' });
    setModalOpen(true);
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.studentId) {
      addToast('Please select a student', 'error');
      return;
    }
    if (!form.classId) {
      addToast('Please select a class', 'error');
      return;
    }
    if (!form.termId) {
      addToast('Please select a term', 'error');
      return;
    }

    setSaving(true);
    try {
      console.log('Enrolling student:', form);
      const payload = {
        studentId: form.studentId,
        classId: form.classId,
        termId: form.termId,
      };
      
      await createEnrollment(payload);
      addToast('Student enrolled successfully', 'success');
      setModalOpen(false);
      setForm({ studentId: '', classId: '', termId: '' });
      await load();
    } catch (error) {
      console.error('Enrollment error:', error);
      console.error('Error response:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Failed to enroll student';
      
      if (errorMsg.includes('already enrolled')) {
        addToast('This student is already enrolled in this class for the selected term.', 'error');
      } else {
        addToast(errorMsg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (row) => {
    if (!window.confirm(`Remove ${row.student?.firstName || 'Student'} from ${row.class?.level || ''} ${row.class?.section || ''}?`)) return;
    
    try {
      await deleteEnrollment(row.id);
      addToast('Enrollment removed successfully', 'success');
      await load();
    } catch (error) {
      console.error('Remove enrollment error:', error);
      addToast('Failed to remove enrollment', 'error');
    }
  };

  const getStudentName = (row) => {
    if (row.studentName) return row.studentName;
    if (row.student?.firstName) return `${row.student.firstName} ${row.student.lastName}`;
    return 'Unknown';
  };

  const getStudentNumber = (row) => {
    if (row.studentNo) return row.studentNo;
    if (row.student?.studentNumber) return row.student.studentNumber;
    return '—';
  };

  const getClassLabel = (row) => {
    if (row.className) return row.className;
    if (row.class?.level && row.class?.section) {
      return `${row.class.level} ${row.class.section}`;
    }
    return '—';
  };

  const getTermLabel = (row) => {
    if (row.termName) return row.termName;
    if (row.term?.termNumber && row.term?.academicYear) {
      return `${row.term.termNumber} - ${row.term.academicYear}`;
    }
    return '—';
  };

  const getTermStatus = (row) => {
    if (row.term?.status) return row.term.status;
    return 'ACTIVE';
  };

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle="Manage student class enrollments"
        action={<Button onClick={openEnroll} icon={UserPlus}>Enroll Student</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4">
          <Select
            className="w-64"
            options={classes.map(c => ({ 
              value: c.id, 
              label: `${c.level} ${c.section}` 
            }))}
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            placeholder="Filter by class..."
          />
          <Select
            className="w-56"
            options={terms.map(t => ({ 
              value: t.id, 
              label: `${t.termNumber} - ${t.academicYear}` 
            }))}
            value={termFilter}
            onChange={e => setTermFilter(e.target.value)}
            placeholder="Filter by term..."
          />
          <div className="flex-1 text-right text-sm text-gray-500">
            {filtered.length} enrollment{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No enrollments found"
          columns={[
            {
              header: 'Student',
              key: 'studentId',
              render: (_, row) => (
                <div>
                  <p className="font-medium text-gray-900">{getStudentName(row)}</p>
                  <p className="text-xs text-gray-500">{getStudentNumber(row)}</p>
                </div>
              ),
            },
            {
              header: 'Class',
              key: 'classId',
              render: (_, row) => (
                <span className="text-gray-600">{getClassLabel(row)}</span>
              ),
            },
            {
              header: 'Term',
              key: 'termId',
              render: (_, row) => (
                <span className="text-gray-600">{getTermLabel(row)}</span>
              ),
            },
            {
              header: 'Status',
              key: 'status',
              render: (_, row) => {
                const status = getTermStatus(row);
                return (
                  <Badge variant={status === 'ACTIVE' ? 'success' : status === 'COMPLETED' ? 'info' : 'default'}>
                    {status || 'ENROLLED'}
                  </Badge>
                );
              },
            },
            {
              header: 'Enrolled On',
              key: 'createdAt',
              render: (v) =>
                v
                  ? new Date(v).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—',
            },
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

      {/* Enroll Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setForm({ studentId: '', classId: '', termId: '' });
        }}
        title="Enroll Student"
        subtitle="Select a student, class, and term to enroll."
      >
        <form onSubmit={handleEnroll} className="space-y-4 pt-2">
          <Select
            label="Student *"
            value={form.studentId}
            onChange={e => setForm({ ...form, studentId: e.target.value })}
            options={availableStudents.map(s => ({ 
              value: s.id, 
              label: `${s.firstName} ${s.lastName} (${s.studentNumber})` 
            }))}
            placeholder="Select a student..."
            required
          />
          
          <Select
            label="Class *"
            value={form.classId}
            onChange={e => setForm({ ...form, classId: e.target.value })}
            options={classes.map(c => ({ 
              value: c.id, 
              label: `${c.level} ${c.section}` 
            }))}
            placeholder="Select a class..."
            required
          />
          
          <Select
            label="Term *"
            value={form.termId}
            onChange={e => setForm({ ...form, termId: e.target.value })}
            options={terms.map(t => ({ 
              value: t.id, 
              label: `${t.termNumber} - ${t.academicYear}` 
            }))}
            placeholder="Select a term..."
            required
          />

          {/* Show warning if student is already enrolled */}
          {form.studentId && form.classId && form.termId && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-700 flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                This student will be enrolled in <strong>{classes.find(c => c.id === form.classId)?.level || ''} {classes.find(c => c.id === form.classId)?.section || ''}</strong> for <strong>{terms.find(t => t.id === form.termId)?.termNumber || ''} - {terms.find(t => t.id === form.termId)?.academicYear || ''}</strong>.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button 
              variant="secondary" 
              onClick={() => {
                setModalOpen(false);
                setForm({ studentId: '', classId: '', termId: '' });
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={saving || !form.studentId || !form.classId || !form.termId}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Enroll
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}