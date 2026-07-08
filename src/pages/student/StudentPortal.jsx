import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { getMyProfile, getMyReportCards, getMyGrades, getMyTimetable } from '../../api/studentSelfApi';
import { FileText, BarChart2, CalendarDays, Download } from 'lucide-react';

export default function StudentPortal() {
  const [profile, setProfile] = useState(null);
  const [reportCards, setReportCards] = useState([]);
  const [grades, setGrades] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getMyReportCards().catch(() => []),
      getMyGrades().catch(() => []),
      getMyTimetable().catch(() => []),
    ])
      .then(([p, r, g, t]) => {
        setProfile(p);
        setReportCards(Array.isArray(r) ? r : []);
        setGrades(Array.isArray(g) ? g : []);
        setTimetable(Array.isArray(t) ? t : []);
        setLoadError(false);
      })
      .catch((err) => {
        console.error('Student self-profile fetch error:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <PageHeader title="Student Portal" subtitle="Loading your account…" />
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-16 text-center animate-pulse text-sm text-gray-400">Loading…</div>
      </div>
    );
  }

  if (loadError || !profile) {
    return (
      <div>
        <PageHeader title="Student Portal" subtitle="Your academic overview" />
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Couldn't load your profile from the server. Check the console for details.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Student Portal" subtitle="View your grades, report cards, and timetable." />

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-4">
        <Avatar src={profile.photo} name={profile.name} size="lg" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.studentNo} • {profile.className || profile.class?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grades */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">My Grades</h3>
          </div>
          {grades.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No grades published yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {grades.map((g, i) => (
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

        {/* Timetable */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <CalendarDays className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Class Timetable</h3>
          </div>
          {timetable.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No timetable published yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {timetable.map((t, i) => (
                <div key={t.id || i} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-700">{t.day} — {t.subjectName || t.subject?.name}</span>
                  <span className="text-xs text-gray-400">{t.time || `${t.startTime}–${t.endTime}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report cards */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
            <FileText className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Report Cards</h3>
          </div>
          {reportCards.length === 0 ? (
            <p className="text-sm text-gray-400 p-5">No report cards released yet.</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {reportCards.map((r, i) => (
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
    </div>
  );
}