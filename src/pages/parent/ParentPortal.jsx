import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyChildren, getChildReportCards, getChildGrades, getChildAttendance } from '../../api/parentApi';
import { FileText, BarChart2, CheckSquare, Mail, Download } from 'lucide-react';

export default function ParentPortal() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({ reportCards: [], grades: [], attendance: null });
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    getMyChildren()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setChildren(list);
        if (list.length > 0) setSelectedChild(list[0].id);
        setLoadError(false);
      })
      .catch((err) => {
        console.error('Guardian children fetch error:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedChild) return;
    setDetailLoading(true);
    Promise.all([
      getChildReportCards(selectedChild).catch(() => []),
      getChildGrades(selectedChild).catch(() => []),
      getChildAttendance(selectedChild).catch(() => null),
    ])
      .then(([reportCards, grades, attendance]) => {
        setChildData({
          reportCards: Array.isArray(reportCards) ? reportCards : [],
          grades: Array.isArray(grades) ? grades : [],
          attendance,
        });
      })
      .finally(() => setDetailLoading(false));
  }, [selectedChild]);

  const activeChild = children.find(c => c.id === selectedChild);

  if (loading) {
    return (
      <div>
        <PageHeader title="Parent Portal" subtitle="Loading your account…" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">
          Loading…
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <PageHeader title="Parent Portal" subtitle="Your ward's academic overview" />
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Couldn't load your linked children from the server. Check the console for details.
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div>
        <PageHeader title="Parent Portal" subtitle="Your ward's academic overview" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center">
          <p className="text-sm text-gray-500">No students are linked to your account yet. Contact your school administrator to have your ward linked.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Parent Portal" subtitle="View your ward's report cards, grades, and attendance." />

      {/* Child selector */}
      {children.length > 1 && (
        <div className="flex items-center gap-2 flex-wrap">
          {children.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChild(c.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                selectedChild === c.id ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <Avatar name={c.name} size="xs" />
              {c.name}
            </button>
          ))}
        </div>
      )}

      {activeChild && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
          <Avatar name={activeChild.name} size="lg" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{activeChild.name}</h2>
            <p className="text-sm text-gray-500">{activeChild.studentNo} • {activeChild.className || activeChild.class?.name}</p>
          </div>
          {activeChild.classTeacherEmail && (
            <a
              href={`mailto:${activeChild.classTeacherEmail}`}
              className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-lg transition-colors"
            >
              <Mail className="h-4 w-4" /> Message Class Teacher
            </a>
          )}
        </div>
      )}

      {detailLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center text-sm text-gray-400 animate-pulse">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance summary */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <CheckSquare className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Attendance</h3>
            </div>
            {childData.attendance ? (
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: 'Present', value: childData.attendance.present, color: 'text-emerald-600' },
                  { label: 'Absent', value: childData.attendance.absent, color: 'text-red-600' },
                  { label: 'Late', value: childData.attendance.late, color: 'text-amber-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                    <p className={`text-xl font-bold ${s.color}`}>{s.value ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No attendance data available.</p>
            )}
          </div>

          {/* Grades */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <BarChart2 className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Grades</h3>
            </div>
            {childData.grades.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">No grades published yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {childData.grades.map((g, i) => (
                  <div key={g.id || i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-700">{g.subjectName || g.subject?.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-900">{g.total ?? '—'}</span>
                      {g.grade && <Badge variant="primary">{g.grade}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report cards */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
              <FileText className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Report Cards</h3>
            </div>
            {childData.reportCards.length === 0 ? (
              <p className="text-sm text-gray-400 p-5">No report cards released yet.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {childData.reportCards.map((r, i) => (
                  <div key={r.id || i} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-gray-700">{r.termName || r.term?.name}</span>
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700">
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">Not yet available</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}