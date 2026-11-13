import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import { getTeacherTimetable } from '../../api/portalAcademicApi';

const DAYS = [
  ['MONDAY', 'Monday'],
  ['TUESDAY', 'Tuesday'],
  ['WEDNESDAY', 'Wednesday'],
  ['THURSDAY', 'Thursday'],
  ['FRIDAY', 'Friday'],
];

export default function TeacherTimetablePage() {
  const [data, setData] = useState({ term: null, slots: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getTeacherTimetable()
      .then((result) => {
        if (active) setData({ term: result.term, slots: Array.isArray(result.slots) ? result.slots : [] });
      })
      .catch((requestError) => {
        if (active) setError(requestError.response?.data?.message || requestError.message || 'Could not load your timetable.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const periods = useMemo(() => [...new Set(data.slots.map((slot) => `${slot.startTime} - ${slot.endTime}`))], [data.slots]);
  const label = data.term
    ? `${data.term.academicYear} · ${String(data.term.termNumber || '').replace('TERM', 'Term ')}`
    : 'No active term';

  return (
    <div className="space-y-6">
      <PageHeader title="My Teaching Schedule" subtitle="View assigned class periods, teaching rooms, and weekly schedule." />

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600">Schedule for the current academic term</p>
        <Badge variant={data.term ? 'info' : 'warning'}>{label}</Badge>
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
                {DAYS.map(([key, day]) => {
                  const slot = data.slots.find((item) => item.weekday === key && `${item.startTime} - ${item.endTime}` === time);
                  return (
                    <td key={day} className="px-4 py-3">
                      {slot ? (
                        <>
                          <span className="block font-semibold text-indigo-900">
                            {slot.class?.level} {slot.class?.section}{slot.subject?.name ? ` · ${slot.subject.name}` : ''}
                          </span>
                          {slot.room && <span className="text-gray-500">{slot.room}</span>}
                        </>
                      ) : <span className="text-gray-300">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
            {loading && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading your timetable…</td></tr>}
            {!loading && !error && periods.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No timetable slots are assigned to you for this term.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
