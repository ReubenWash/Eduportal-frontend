import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, GraduationCap, Search } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { getStudents } from '../../api/studentsApi';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

const statusVariant = (status) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'WITHDRAWN') return 'danger';
  return 'default';
};

export default function AdmissionsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    getStudents({ page: 1, limit: 100 })
      .then((result) => {
        if (active) setStudents([...result].sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate)));
      })
      .catch((error) => {
        if (active) {
          const message = error.response?.data?.message || 'Failed to load student admissions.';
          setLoadError(message);
          addToast(message, 'error');
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [addToast]);

  const filteredStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.name, student.studentNo, student.className, student.guardians?.[0]?.guardian?.firstName]
        .some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [students, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Student Admissions"
          subtitle="Review student records admitted to this school. New admissions are saved through student management."
        />
        <Link to="/students">
          <Button variant="primary" className="gap-2">
            <GraduationCap className="h-4 w-4" /> Admit Student
          </Button>
        </Link>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search admitted students..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Student</th>
              <th className="px-4 py-3 text-left">Student ID</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Admission Date</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Record</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={6}>Loading admissions...</td></tr>
            ) : loadError ? (
              <tr><td className="px-4 py-10 text-center text-red-600" colSpan={6}>{loadError}</td></tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-gray-500" colSpan={6}>
                  <CalendarDays className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  {students.length ? 'No students match your search.' : 'No admitted students have been recorded yet.'}
                </td>
              </tr>
            ) : filteredStudents.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{student.studentNo}</td>
                <td className="px-4 py-3 text-gray-600">{student.className || 'Not assigned'}</td>
                <td className="px-4 py-3 text-gray-600">{formatDate(student.admissionDate)}</td>
                <td className="px-4 py-3">
                  <Badge variant={statusVariant(student.status)}>{student.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link className="text-sm font-semibold text-indigo-600 hover:text-indigo-700" to={`/students/${student.id}`}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && students.length === 100 && (
          <p className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            Showing the latest 100 student records. Use Student Management for the full searchable directory.
          </p>
        )}
      </div>
    </div>
  );
}
