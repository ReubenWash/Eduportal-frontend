import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { Calendar, Clock, Plus, Filter, Download, BookOpen, Layers } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const SLOTS = [
  '08:00 - 09:00',
  '09:00 - 10:00',
  '10:00 - 10:30 (Break)',
  '10:30 - 11:30',
  '11:30 - 12:30',
  '12:30 - 01:30 (Lunch)',
  '01:30 - 02:30',
];

const mockSchedule = {
  'JHS 1': {
    Monday: ['Mathematics', 'English Language', 'Break', 'Integrated Science', 'Social Studies', 'Lunch', 'ICT / Computing'],
    Tuesday: ['English Language', 'Mathematics', 'Break', 'French / Ghanaian Lang', 'RME', 'Lunch', 'Creative Arts'],
    Wednesday: ['Integrated Science', 'ICT', 'Break', 'Social Studies', 'Mathematics', 'Lunch', 'Physical Education'],
    Thursday: ['Social Studies', 'Integrated Science', 'Break', 'English Language', 'French', 'Lunch', 'Career Technology'],
    Friday: ['Mathematics', 'RME', 'Break', 'English Language', 'Integrated Science', 'Lunch', 'Clubs & Societies'],
  },
};

export default function TimetablePage() {
  const [selectedClass, setSelectedClass] = useState('JHS 1');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Master Timetable"
          subtitle="Configure school-wide teaching timetables, class periods, and room allocations."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Schedule
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Add Timetable Slot
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold uppercase text-gray-500">Select Class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-800 shadow-sm focus:border-indigo-500 focus:outline-none"
          >
            <option value="JHS 1">JHS 1</option>
            <option value="JHS 2">JHS 2</option>
            <option value="JHS 3">JHS 3</option>
            <option value="Class 6">Class 6</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info">Active Term Schedule</Badge>
          <span className="text-xs text-gray-400">Term 1, 2025/2026</span>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left w-40">Period / Time</th>
              {DAYS.map(d => (
                <th key={d} className="py-3 px-4 text-left">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {SLOTS.map((slot, idx) => {
              const isBreak = slot.includes('Break') || slot.includes('Lunch');
              return (
                <tr key={idx} className={isBreak ? 'bg-amber-50/50 font-medium' : 'hover:bg-gray-50/60'}>
                  <td className="py-3 px-4 font-semibold text-gray-700 whitespace-nowrap">{slot}</td>
                  {DAYS.map(day => {
                    const subject = mockSchedule[selectedClass]?.[day]?.[idx] || (isBreak ? 'Interval' : 'Study / Prep');
                    return (
                      <td key={day} className="py-3 px-4">
                        <span className={`block font-semibold ${isBreak ? 'text-amber-800' : 'text-gray-900'}`}>
                          {subject}
                        </span>
                        {!isBreak && <span className="text-[10px] text-gray-400">Classroom A</span>}
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

