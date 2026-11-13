import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Clock3, Calendar, Download, BookOpen } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = [
  { time: '08:00 - 09:00', schedule: { Monday: 'JHS 1 (Math)', Tuesday: 'JHS 3 A (Math)', Wednesday: 'Free Period', Thursday: 'JHS 2 (Math)', Friday: 'JHS 1 (Math)' } },
  { time: '09:00 - 10:00', schedule: { Monday: 'JHS 2 (Math)', Tuesday: 'JHS 2 (Math)', Wednesday: 'JHS 3 B (Math)', Thursday: 'Free Period', Friday: 'JHS 3 A (Math)' } },
  { time: '10:00 - 10:30', isBreak: true, label: 'Morning Break' },
  { time: '10:30 - 11:30', schedule: { Monday: 'Free Period', Tuesday: 'Department Meeting', Wednesday: 'JHS 1 (Math)', Thursday: 'JHS 3 A (Math)', Friday: 'Free Period' } },
  { time: '11:30 - 12:30', schedule: { Monday: 'JHS 3 B (Math)', Tuesday: 'Free Period', Wednesday: 'JHS 2 (Math)', Thursday: 'JHS 1 (Math)', Friday: 'JHS 3 B (Math)' } },
  { time: '12:30 - 01:30', isBreak: true, label: 'Lunch Break' },
  { time: '01:30 - 02:30', schedule: { Monday: 'Office Hours', Tuesday: 'Remedial Prep', Wednesday: 'Free Period', Thursday: 'Remedial Prep', Friday: 'Staff Assembly' } },
];

export default function TeacherTimetablePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="My Teaching Schedule"
          subtitle="View assigned class periods, teaching rooms, and weekly schedule."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Download Schedule PDF
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left w-40">Period / Time</th>
              {DAYS.map((d) => (
                <th key={d} className="py-3 px-4 text-left">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {PERIODS.map((slot, i) => {
              if (slot.isBreak) {
                return (
                  <tr key={i} className="bg-amber-50/50">
                    <td className="py-3 px-4 font-semibold text-amber-800">{slot.time}</td>
                    <td colSpan={5} className="py-3 px-4 text-center font-bold text-amber-800 uppercase tracking-wider text-[11px]">
                      {slot.label}
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={i} className="hover:bg-gray-50/60 transition">
                  <td className="py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">{slot.time}</td>
                  {DAYS.map((day) => {
                    const activity = slot.schedule[day] || '—';
                    const isFree = activity === 'Free Period';
                    return (
                      <td key={day} className="py-3 px-4">
                        <span className={`block font-semibold ${isFree ? 'text-gray-400 font-normal' : 'text-indigo-900'}`}>
                          {activity}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

