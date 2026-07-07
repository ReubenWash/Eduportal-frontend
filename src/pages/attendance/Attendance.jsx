import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { getClasses } from '../../api/classesApi';
import { getStudents } from '../../api/studentsApi';
import { bulkMarkAttendance } from '../../api/attendanceApi';
import { CheckCircle2, XCircle, Clock, Users, Save, BarChart2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const STATUS = { PRESENT: 'PRESENT', ABSENT: 'ABSENT', LATE: 'LATE' };
const statusConfig = {
  PRESENT: { label: 'Present', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  ABSENT: { label: 'Absent', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
  LATE: { label: 'Late', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
};

const summaryData = [
  { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 91 }, { day: 'Wed', rate: 96 },
  { day: 'Thu', rate: 88 }, { day: 'Fri', rate: 93 }, { day: 'Mon', rate: 95 },
  { day: 'Tue', rate: 92 }, { day: 'Wed', rate: 90 },
];

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    getClasses()
      .then(d => setClasses(Array.isArray(d) ? d : []))
      .catch(err => console.error('Classes fetch error:', err));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setRecords([]);
      return;
    }
    setLoadingStudents(true);
    getStudents({ classId: selectedClass })
      .then(students => {
        const list = Array.isArray(students) ? students : [];
        setRecords(list.map(s => ({ id: s.id, name: s.name, studentNo: s.studentNo, photo: s.photo, status: STATUS.PRESENT, notes: '' })));
      })
      .catch(err => {
        console.error('Students fetch error:', err);
        setRecords([]);
      })
      .finally(() => setLoadingStudents(false));
  }, [selectedClass]);

  const setStatus = (id, status) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const setNote = (id, note) => {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, notes: note } : r));
  };

  const markAllPresent = () => {
    setRecords(prev => prev.map(r => ({ ...r, status: STATUS.PRESENT })));
    addToast('All students marked present', 'success');
  };

  const handleSave = async () => {
    if (!selectedClass) {
      addToast('Please select a class first', 'error');
      return;
    }
    setSaving(true);
    try {
      await bulkMarkAttendance({
        classId: selectedClass,
        date,
        records: records.map(r => ({ studentId: r.id, status: r.status, notes: r.notes })),
      });
      addToast('Attendance saved successfully', 'success');
    } catch (err) {
      console.error('Attendance save error:', err);
      addToast('Failed to save attendance', 'error');
    } finally {
      setSaving(false);
    }
  };

  const summary = {
    present: records.filter(r => r.status === STATUS.PRESENT).length,
    absent: records.filter(r => r.status === STATUS.ABSENT).length,
    late: records.filter(r => r.status === STATUS.LATE).length,
  };

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle="Track and record daily student attendance"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={markAllPresent} disabled={records.length === 0}>Mark All Present</Button>
            <Button icon={Save} loading={saving} onClick={handleSave} disabled={records.length === 0}>Save Attendance</Button>
          </div>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Class"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            placeholder="Select class..."
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
            />
          </div>
          <div className="flex items-end">
            <div className="grid grid-cols-3 gap-2 w-full">
              {[
                { label: 'Present', count: summary.present, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
                { label: 'Absent', count: summary.absent, color: 'text-red-600 bg-red-50 border-red-200' },
                { label: 'Late', count: summary.late, color: 'text-amber-600 bg-amber-50 border-amber-200' },
              ].map(s => (
                <div key={s.label} className={`text-center rounded-lg border px-2 py-2 ${s.color}`}>
                  <p className="text-lg font-bold">{s.count}</p>
                  <p className="text-xs font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Attendance grid */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200">
            <Users className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Student Attendance</h3>
            <span className="ml-auto text-xs text-gray-500">{records.length} students</span>
          </div>
          {!selectedClass ? (
            <div className="py-16 text-center text-sm text-gray-400">Select a class to load its student roster.</div>
          ) : loadingStudents ? (
            <div className="py-16 text-center text-sm text-gray-400">Loading students…</div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No students enrolled in this class yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {records.map((row) => (
                <div key={row.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50/60 transition-colors">
                  <Avatar src={row.photo} name={row.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{row.name}</p>
                    <p className="text-xs text-gray-500">{row.studentNo}</p>
                  </div>
                  {/* Status toggles */}
                  <div className="flex items-center gap-1">
                    {Object.entries(STATUS).map(([key, val]) => {
                      const cfg = statusConfig[val];
                      const isActive = row.status === val;
                      return (
                        <button
                          key={key}
                          onClick={() => setStatus(row.id, val)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            isActive ? `${cfg.bg} ${cfg.color}` : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          <cfg.icon className="h-3 w-3" />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                  {/* Notes */}
                  <input
                    type="text"
                    value={row.notes}
                    onChange={e => setNote(row.id, e.target.value)}
                    placeholder="Notes..."
                    className="w-28 text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Attendance Trend</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">Past 8 days average %</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={summaryData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="attendTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis domain={[80, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
              <Area type="monotone" dataKey="rate" name="%" stroke="#4F46E5" strokeWidth={2} fill="url(#attendTrend)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}