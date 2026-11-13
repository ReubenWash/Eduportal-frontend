import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { getClasses } from '../../api/classesApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { getStudents } from '../../api/studentsApi';
import { createConductIncident, getConductIncidents, updateConductIncident } from '../../api/portalAcademicApi';
import { useToast } from '../../context/ToastContext';
import { AlertTriangle, CheckCircle, Plus, Search } from 'lucide-react';

const TYPES = ['ACHIEVEMENT', 'CONDUCT', 'DISCIPLINARY'];
const initialForm = { studentId: '', classId: '', termId: '', type: 'CONDUCT', title: '', note: '' };
const errorMessage = (error) => error.response?.data?.message || error.message || 'The conduct request failed.';

export default function DisciplinePage() {
  const { addToast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [actionDrafts, setActionDrafts] = useState({});
  const [updatingId, setUpdatingId] = useState('');

  const loadIncidents = useCallback(async () => {
    const data = await getConductIncidents();
    setIncidents(Array.isArray(data) ? data : []);
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getConductIncidents(), getStudents(), getClasses(), getSchoolTerms()])
      .then(([incidentList, studentList, classList, termList]) => {
        if (!active) return;
        setIncidents(Array.isArray(incidentList) ? incidentList : []);
        setStudents(Array.isArray(studentList) ? studentList : []);
        setClasses(Array.isArray(classList) ? classList : []);
        setTerms(Array.isArray(termList) ? termList : []);
      })
      .catch((requestError) => { if (active) setError(errorMessage(requestError)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filteredIncidents = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return incidents;
    return incidents.filter((incident) => [
      incident.student?.firstName,
      incident.student?.lastName,
      incident.student?.studentNumber,
      incident.class?.level,
      incident.class?.section,
      incident.title,
      incident.note,
      incident.type,
    ].some((value) => String(value || '').toLowerCase().includes(needle)));
  }, [incidents, search]);

  const resolvedCount = incidents.filter((incident) => incident.resolvedAt).length;
  const activeCount = incidents.length - resolvedCount;
  const availableStudents = students.filter((student) => !form.classId || student.classId === form.classId);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createConductIncident({
        ...form,
        classId: form.classId || undefined,
        termId: form.termId || undefined,
      });
      await loadIncidents();
      setModalOpen(false);
      setForm(initialForm);
      addToast('Conduct record created.', 'success');
    } catch (requestError) {
      addToast(errorMessage(requestError), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (incident, resolved) => {
    setUpdatingId(incident.id);
    try {
      await updateConductIncident(incident.id, {
        actionTaken: actionDrafts[incident.id] ?? incident.actionTaken ?? '',
        resolved,
      });
      await loadIncidents();
      addToast(resolved ? 'Conduct record resolved.' : 'Conduct record updated.', 'success');
    } catch (requestError) {
      addToast(errorMessage(requestError), 'error');
    } finally {
      setUpdatingId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Student Discipline & Conduct" subtitle="Record achievements and conduct incidents, and track follow-up actions." />
        <Button variant="primary" className="gap-2" onClick={() => setModalOpen(true)}><Plus className="h-4 w-4" /> Log Conduct Incident</Button>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Recorded', value: incidents.length, color: 'text-gray-900', icon: AlertTriangle },
          { label: 'Active Follow-up', value: activeCount, color: 'text-amber-600', icon: AlertTriangle },
          { label: 'Resolved', value: resolvedCount, color: 'text-emerald-600', icon: CheckCircle },
        ].map((stat) => <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500"><stat.icon className="h-4 w-4" />{stat.label}</p>
          <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{loading ? '—' : stat.value}</p>
        </div>)}
      </div>

      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search students or conduct records..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Student & Class</th>
              <th className="px-4 py-3 text-left">Type & Summary</th>
              <th className="px-4 py-3 text-left">Reported By</th>
              <th className="px-4 py-3 text-left">Action Taken</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {filteredIncidents.map((incident) => (
              <tr key={incident.id} className="align-top hover:bg-gray-50/60">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  {incident.student?.firstName} {incident.student?.lastName}
                  <span className="block text-xs font-normal text-gray-400">
                    {[incident.class?.level, incident.class?.section].filter(Boolean).join(' ') || incident.student?.studentNumber}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">
                  <Badge variant={incident.type === 'ACHIEVEMENT' ? 'success' : incident.type === 'DISCIPLINARY' ? 'danger' : 'warning'}>{incident.type}</Badge>
                  <p className="mt-1 font-medium">{incident.title}</p>
                  {incident.note && <p className="mt-1 max-w-xs text-xs text-gray-500">{incident.note}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-gray-600">{[incident.reporter?.firstName, incident.reporter?.lastName].filter(Boolean).join(' ') || 'School administration'}</td>
                <td className="min-w-64 px-4 py-3">
                  <Input
                    aria-label={`Action taken for ${incident.title}`}
                    placeholder="Record follow-up action"
                    value={actionDrafts[incident.id] ?? incident.actionTaken ?? ''}
                    onChange={(event) => setActionDrafts((current) => ({ ...current, [incident.id]: event.target.value }))}
                    disabled={Boolean(incident.resolvedAt)}
                  />
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{incident.occurredAt ? new Date(incident.occurredAt).toLocaleDateString() : '—'}</td>
                <td className="px-4 py-3">
                  {incident.resolvedAt ? <Badge variant="success">RESOLVED</Badge> : (
                    <div className="space-y-2">
                      <Badge variant="warning">OPEN</Badge>
                      <Button size="sm" variant="secondary" loading={updatingId === incident.id} onClick={() => handleUpdate(incident, true)}>Resolve</Button>
                    </div>
                  )}
                  {!incident.resolvedAt && (actionDrafts[incident.id] ?? incident.actionTaken) && (
                    <button type="button" className="mt-2 block text-xs font-medium text-indigo-600 hover:underline" onClick={() => handleUpdate(incident, false)}>Save action</button>
                  )}
                </td>
              </tr>
            ))}
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading conduct records…</td></tr>}
            {!loading && filteredIncidents.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No conduct records match this search.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Log conduct record" subtitle="Record an achievement, conduct note, or disciplinary incident." size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Student
            <select required value={form.studentId} onChange={(event) => setForm({ ...form, studentId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
              <option value="">Select student</option>
              {availableStudents.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.className || student.studentNo}</option>)}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-gray-700">Record type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                {TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Class
              <select required value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value, studentId: '' })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                <option value="">Select class (required for teachers)</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-gray-700">Term (optional)
              <select value={form.termId} onChange={(event) => setForm({ ...form, termId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
                <option value="">No term specified</option>{terms.map((item) => <option key={item.id} value={item.id}>{item.academicYear} · {item.termNumber}</option>)}
              </select>
            </label>
          </div>
          <label className="block text-sm font-medium text-gray-700">Summary
            <Input required maxLength={200} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1" />
          </label>
          <label className="block text-sm font-medium text-gray-700">Details (optional)
            <textarea maxLength={5000} rows={4} value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-3 text-sm" />
          </label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={saving}>Save record</Button></div>
        </form>
      </Modal>
    </div>
  );
}
