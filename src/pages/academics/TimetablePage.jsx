import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { getClasses } from '../../api/classesApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { getSubjects } from '../../api/subjectsApi';
import { getStaff } from '../../api/staffApi';
import { getClassTimetable, saveTimetableSlot } from '../../api/portalAcademicApi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Calendar, Plus } from 'lucide-react';

const DAYS = [
  ['MONDAY', 'Monday'],
  ['TUESDAY', 'Tuesday'],
  ['WEDNESDAY', 'Wednesday'],
  ['THURSDAY', 'Thursday'],
  ['FRIDAY', 'Friday'],
];
const emptyForm = { weekday: 'MONDAY', startTime: '08:00', endTime: '09:00', subjectId: '', teacherId: '', room: '' };
const errorMessage = (error) => error.response?.data?.message || error.message || 'The timetable request failed.';

export default function TimetablePage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'SCHOOL_ADMIN';
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState('');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadTimetable = useCallback(async (selectedClassId, selectedTermId) => {
    if (!selectedClassId) {
      setTimetable(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      setTimetable(await getClassTimetable(selectedClassId, selectedTermId ? { termId: selectedTermId } : {}));
    } catch (requestError) {
      setError(errorMessage(requestError));
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getClasses(), getSchoolTerms(), getSubjects(), isAdmin ? getStaff() : Promise.resolve([])])
      .then(([classList, termList, subjectList, staffList]) => {
        if (!active) return;
        const availableClasses = Array.isArray(classList) ? classList : [];
        const availableTerms = Array.isArray(termList) ? termList : [];
        setClasses(availableClasses);
        setTerms(availableTerms);
        setSubjects(Array.isArray(subjectList) ? subjectList : []);
        setStaff(Array.isArray(staffList) ? staffList : []);
        const currentClassId = availableClasses[0]?.id || '';
        const activeTermId = availableTerms.find((item) => item.status === 'ACTIVE')?.id || availableTerms[0]?.id || '';
        setClassId(currentClassId);
        setTermId(activeTermId);
        if (currentClassId) loadTimetable(currentClassId, activeTermId);
        else setLoading(false);
      })
      .catch((requestError) => {
        if (active) {
          setError(errorMessage(requestError));
          setLoading(false);
        }
      });
    return () => { active = false; };
  }, [isAdmin, loadTimetable]);

  const periods = useMemo(() => [...new Set((timetable?.schedule || [])
    .flatMap((day) => day.periods || [])
    .map((period) => period.time))], [timetable]);
  const currentTerm = terms.find((item) => item.id === termId);
  const classSubjects = subjects.filter((item) => item.classes?.some((assignedClass) => assignedClass.id === classId));

  const handleSelection = (nextClassId, nextTermId) => {
    setClassId(nextClassId);
    setTermId(nextTermId);
    loadTimetable(nextClassId, nextTermId);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveTimetableSlot({
        ...form,
        classId,
        termId,
        subjectId: form.subjectId || undefined,
        teacherId: form.teacherId || undefined,
        room: form.room.trim() || undefined,
      });
      await loadTimetable(classId, termId);
      setModalOpen(false);
      setForm(emptyForm);
      addToast('Timetable slot saved.', 'success');
    } catch (requestError) {
      addToast(errorMessage(requestError), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Master Timetable" subtitle="View and configure class periods, subjects, and room allocations." />
        {isAdmin && (
          <Button variant="primary" className="gap-2" disabled={!classId || !termId} onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" /> Add Timetable Slot
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold uppercase text-gray-500">Select class
            <select value={classId} onChange={(event) => handleSelection(event.target.value, termId)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-800">
              <option value="">Select a class</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold uppercase text-gray-500">Academic term
            <select value={termId} onChange={(event) => handleSelection(classId, event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium normal-case text-gray-800">
              <option value="">Select a term</option>
              {terms.map((item) => <option key={item.id} value={item.id}>{item.academicYear} · {item.termNumber}</option>)}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-2">
          {currentTerm && <Badge variant={currentTerm.status === 'ACTIVE' ? 'info' : 'default'}>{currentTerm.status === 'ACTIVE' ? 'Active term' : 'Term schedule'}</Badge>}
          {currentTerm && <span className="text-xs text-gray-500">{currentTerm.academicYear} · {currentTerm.termNumber}</span>}
        </div>
      </div>

      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="w-40 px-4 py-3 text-left">Period / Time</th>
              {DAYS.map(([, day]) => <th key={day} className="px-4 py-3 text-left">{day}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {periods.map((time) => (
              <tr key={time} className="hover:bg-gray-50/60">
                <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">{time}</td>
                {DAYS.map(([, day]) => {
                  const period = timetable?.schedule?.find((entry) => entry.day.toLowerCase() === day.toLowerCase())
                    ?.periods?.find((entry) => entry.time === time);
                  return <td key={day} className="px-4 py-3">
                    {period ? (
                      <>
                        <span className="block font-semibold text-gray-900">{period.subject}</span>
                        <span className="text-gray-500">{[period.teacher, period.room].filter(Boolean).join(' · ')}</span>
                      </>
                    ) : <span className="text-gray-300">—</span>}
                  </td>;
                })}
              </tr>
            ))}
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading timetable…</td></tr>}
            {!loading && !error && periods.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No timetable slots have been added for this class and term.</td></tr>}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add timetable slot" subtitle={`${timetable?.className || 'Selected class'} · ${currentTerm?.termNumber || ''}`} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Weekday
            <select required value={form.weekday} onChange={(event) => setForm({ ...form, weekday: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
              {DAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">Subject (optional)
            <select value={form.subjectId} onChange={(event) => setForm({ ...form, subjectId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
              <option value="">Unassigned lesson</option>
              {classSubjects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">Teacher (optional)
            <select value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 p-2.5">
              <option value="">Unassigned</option>
              {staff.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm font-medium text-gray-700">Start time<Input required type="time" value={form.startTime} onChange={(event) => setForm({ ...form, startTime: event.target.value })} className="mt-1" /></label>
            <label className="text-sm font-medium text-gray-700">End time<Input required type="time" value={form.endTime} onChange={(event) => setForm({ ...form, endTime: event.target.value })} className="mt-1" /></label>
          </div>
          <label className="block text-sm font-medium text-gray-700">Room (optional)<Input maxLength={100} value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} className="mt-1" /></label>
          <div className="flex justify-end gap-2"><Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button type="submit" loading={saving}><Calendar className="mr-1 h-4 w-4" />Save slot</Button></div>
        </form>
      </Modal>
    </div>
  );
}
