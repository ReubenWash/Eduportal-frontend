import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getClasses } from '../../api/classesApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { getSubjects } from '../../api/subjectsApi';
import {
  createAssignment,
  getAssignments,
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
} from '../../api/portalAcademicApi';
import { useToast } from '../../context/ToastContext';
import { BookMarked, Plus, Search, Calendar, Users, CheckCircle, Clock } from 'lucide-react';

const initialForm = { classId: '', termId: '', subjectId: '', title: '', details: '', dueDate: '' };
const errorMessage = (error, fallback) => error.response?.data?.message || error.message || fallback;

export default function TeacherAssignmentsPage({ showHeader = true }) {
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  const [gradeDrafts, setGradeDrafts] = useState({});
  const [gradingId, setGradingId] = useState('');

  const loadAssignments = useCallback(async () => {
    const records = await getAssignments();
    setAssignments(Array.isArray(records) ? records : []);
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getAssignments(), getClasses(), getSchoolTerms(), getSubjects()])
      .then(([taskList, classList, termList, subjectList]) => {
        if (!active) return;
        setAssignments(Array.isArray(taskList) ? taskList : []);
        setClasses(Array.isArray(classList) ? classList : []);
        setTerms(Array.isArray(termList) ? termList : []);
        setSubjects(Array.isArray(subjectList) ? subjectList : []);
        setForm((current) => ({
          ...current,
          classId: current.classId || classList[0]?.id || '',
          termId: current.termId || termList.find((term) => term.status === 'ACTIVE')?.id || termList[0]?.id || '',
        }));
      })
      .catch((error) => {
        if (active) setLoadError(errorMessage(error, 'Could not load assignments.'));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredAssignments = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return assignments;
    return assignments.filter((item) =>
      [item.title, item.className, item.subjectName, item.details]
        .some((value) => String(value || '').toLowerCase().includes(needle))
    );
  }, [assignments, search]);
  const classSubjects = subjects.filter((item) => item.classes?.some((assignedClass) => assignedClass.id === form.classId));

  const totalSubmissions = assignments.reduce((total, item) => total + (item.submissionsCount || 0), 0);
  const completedCount = assignments.filter((item) => item.status === 'COMPLETED').length;
  const activeCount = assignments.filter((item) => item.status === 'ACTIVE').length;

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createAssignment({
        ...form,
        subjectId: form.subjectId || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
      });
      await loadAssignments();
      setShowCreate(false);
      setForm((current) => ({ ...initialForm, classId: current.classId, termId: current.termId }));
      addToast('Assignment created.', 'success');
    } catch (error) {
      addToast(errorMessage(error, 'Could not create assignment.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const openSubmissions = async (assignment) => {
    setSelectedAssignment(assignment);
    setSubmissions([]);
    setSubmissionsLoading(true);
    try {
      const records = await getAssignmentSubmissions(assignment.id);
      setSubmissions(Array.isArray(records) ? records : []);
      setGradeDrafts(Object.fromEntries((records || []).map((submission) => [
        submission.id,
        { score: submission.score ?? '', feedback: submission.feedback ?? '' },
      ])));
    } catch (error) {
      addToast(errorMessage(error, 'Could not load submissions.'), 'error');
    } finally {
      setSubmissionsLoading(false);
    }
  };

  const handleGrade = async (event, submissionId) => {
    event.preventDefault();
    setGradingId(submissionId);
    try {
      const draft = gradeDrafts[submissionId] || {};
      await gradeAssignmentSubmission(submissionId, {
        score: Number(draft.score),
        feedback: draft.feedback,
      });
      await openSubmissions(selectedAssignment);
      await loadAssignments();
      addToast('Submission graded.', 'success');
    } catch (error) {
      addToast(errorMessage(error, 'Could not grade submission.'), 'error');
    } finally {
      setGradingId('');
    }
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageHeader
            title="Assignments & Homework Management"
            subtitle="Assign homework exercises, review student submissions, and grade class tasks."
          />
          <Button variant="primary" className="gap-2" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Create Homework Task
          </Button>
        </div>
      )}
      {!showHeader && <div className="flex justify-end"><Button variant="primary" className="gap-2" onClick={() => setShowCreate(true)}><Plus className="h-4 w-4" /> Create Homework Task</Button></div>}

      {loadError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active Assignments', value: activeCount, color: 'text-gray-900', icon: BookMarked },
          { label: 'Student Submissions', value: totalSubmissions, color: 'text-amber-600', icon: Clock },
          { label: 'Completed Tasks', value: completedCount, color: 'text-emerald-600', icon: CheckCircle },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"><stat.icon className="h-4 w-4" />{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{loading ? '—' : stat.value}</p>
          </div>
        ))}
      </div>

      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input placeholder="Search assignments..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Assignment Title</th>
              <th className="py-3 px-4 text-left">Class & Subject</th>
              <th className="py-3 px-4 text-left">Due Date</th>
              <th className="py-3 px-4 text-center">Submissions</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredAssignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-gray-50/60">
                <td className="py-3 px-4 font-bold text-gray-900">{assignment.title}</td>
                <td className="py-3 px-4 text-gray-700"><span className="font-semibold text-indigo-700">{assignment.className}</span>{assignment.subjectName ? ` · ${assignment.subjectName}` : ''}</td>
                <td className="py-3 px-4 text-gray-500 text-xs">{assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : '—'}</td>
                <td className="py-3 px-4 text-center"><span className="font-semibold">{assignment.submissionsCount ?? 0}</span></td>
                <td className="py-3 px-4"><Badge variant={assignment.status === 'COMPLETED' ? 'success' : 'warning'}>{assignment.status}</Badge></td>
                <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm" className="text-indigo-600" onClick={() => openSubmissions(assignment)}><Users className="mr-1 h-4 w-4" /> Review</Button></td>
              </tr>
            ))}
            {!loading && filteredAssignments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No assignments match this search.</td></tr>
            )}
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading assignments…</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create homework task" subtitle="The task will be visible to students enrolled in the selected class." size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Class
              <select required value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                <option value="">Select class</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Term
              <select required value={form.termId} onChange={(event) => setForm({ ...form, termId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                <option value="">Select term</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.academicYear} · {item.termNumber}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Subject (optional)
              <select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                <option value="">General assignment</option>{classSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Due date
              <Input required type="datetime-local" value={form.dueDate} onChange={(event) => setForm({ ...form, dueDate: event.target.value })} className="mt-1" />
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">Title
            <Input required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Instructions
            <textarea maxLength={10000} rows={4} value={form.details} onChange={(event) => setForm({ ...form, details: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm" />
          </label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" loading={saving}>Create assignment</Button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(selectedAssignment)} onClose={() => setSelectedAssignment(null)} title="Assignment submissions" subtitle={selectedAssignment?.title} size="lg">
        {submissionsLoading ? <p className="text-sm text-gray-500">Loading submissions…</p> : submissions.length === 0 ? <p className="text-sm text-gray-500">No students have submitted work yet.</p> : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <form key={submission.id} onSubmit={(event) => handleGrade(event, submission.id)} className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{submission.student?.firstName} {submission.student?.lastName}</p>
                  <Badge variant={submission.status === 'GRADED' ? 'success' : 'warning'}>{submission.status}</Badge>
                </div>
                {submission.answerUrl && <a className="mb-3 inline-block text-sm text-indigo-600 underline" href={submission.answerUrl} target="_blank" rel="noreferrer">Open submitted work</a>}
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr_auto]">
                  <Input required type="number" min="0" max="100" step="0.1" aria-label="Score" placeholder="Score / 100" value={gradeDrafts[submission.id]?.score ?? ''} onChange={(event) => setGradeDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], score: event.target.value } }))} />
                  <Input aria-label="Feedback" placeholder="Feedback (optional)" value={gradeDrafts[submission.id]?.feedback ?? ''} onChange={(event) => setGradeDrafts((current) => ({ ...current, [submission.id]: { ...current[submission.id], feedback: event.target.value } }))} />
                  <Button type="submit" size="sm" loading={gradingId === submission.id}>Save grade</Button>
                </div>
              </form>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
