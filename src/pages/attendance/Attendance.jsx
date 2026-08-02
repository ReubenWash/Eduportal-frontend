import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getClasses } from '../../api/classesApi';
import { getStudents } from '../../api/studentsApi';
import { bulkMarkAttendance, getAttendance } from '../../api/attendanceApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { CheckCircle2, XCircle, Clock, Users, Save, BarChart2, Loader2 } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const STATUS = { PRESENT: 'PRESENT', ABSENT: 'ABSENT', LATE: 'LATE' };
const statusConfig = {
  PRESENT: { label: 'Present', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  ABSENT: { label: 'Absent', color: 'text-red-600', bg: 'bg-red-50 border-red-200', icon: XCircle },
  LATE: { label: 'Late', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', icon: Clock },
};

export default function Attendance() {
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false); // ✅ Track unsaved changes
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(true);
  const [saving, setSaving] = useState(false);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const role = user?.role;
  const canEdit = role === 'SCHOOL_ADMIN' || role === 'CLASS_TEACHER';

  // Load classes and terms on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const classData = await getClasses();
        setClasses(Array.isArray(classData) ? classData : []);
        
        const termData = await getSchoolTerms();
        setTerms(Array.isArray(termData) ? termData : []);
        setLoadingTerms(false);
        
        const activeTerm = termData.find(t => t.status === 'ACTIVE');
        if (activeTerm) {
          setSelectedTerm(activeTerm.id);
        } else if (termData.length > 0) {
          setSelectedTerm(termData[0].id);
        }
      } catch (err) {
        console.error('Failed to load data:', err);
        addToast('Failed to load classes or terms', 'error');
        setLoadingTerms(false);
      }
    };
    
    loadData();
  }, []);

  // Load students when class changes
  useEffect(() => {
    if (!selectedClass) {
      setRecords([]);
      setHasUnsavedChanges(false);
      return;
    }
    
    const loadStudents = async () => {
      setLoadingStudents(true);
      try {
        const students = await getStudents({ classId: selectedClass });
        const list = Array.isArray(students) ? students : [];
        
        // ✅ Check if there's existing attendance for today
        const today = new Date().toISOString().split('T')[0];
        let existingAttendance = {};
        
        try {
          const attendanceData = await getAttendance({
            classId: selectedClass,
            date: today,
            termId: selectedTerm
          });
          
          if (Array.isArray(attendanceData)) {
            attendanceData.forEach(a => {
              existingAttendance[a.studentId] = a.status;
            });
          }
        } catch (err) {
          console.log('No existing attendance found, using defaults');
        }
        
        const recordsData = list.map(s => ({
          id: s.id,
          name: s.name,
          studentNo: s.studentNo,
          photo: s.photo,
          status: existingAttendance[s.id] || STATUS.PRESENT,
          notes: '',
          hasAttendance: !!existingAttendance[s.id]
        }));
        
        setRecords(recordsData);
        setHasUnsavedChanges(false); // ✅ Reset changes flag
      } catch (err) {
        console.error('Failed to load students:', err);
        setRecords([]);
        addToast('Failed to load students', 'error');
      } finally {
        setLoadingStudents(false);
      }
    };

    loadStudents();
  }, [selectedClass, selectedTerm]);

  // Load attendance stats when class or term changes
  useEffect(() => {
    if (!selectedClass || !selectedTerm) {
      setAttendanceStats([]);
      return;
    }

    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const stats = await getAttendance({
          classId: selectedClass,
          termId: selectedTerm,
          limit: 30
        });
        setAttendanceStats(Array.isArray(stats) ? stats : []);
      } catch (err) {
        console.error('Failed to load attendance stats:', err);
        setAttendanceStats([]);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, [selectedClass, selectedTerm]);

  // ✅ Track changes when status or notes are updated
  const setStatus = (id, status) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        // ✅ Check if this change actually differs from current state
        const newRecord = { ...r, status };
        if (r.status !== status) {
          setHasUnsavedChanges(true);
        }
        return newRecord;
      }
      return r;
    }));
  };

  const setNote = (id, note) => {
    setRecords(prev => prev.map(r => {
      if (r.id === id) {
        if (r.notes !== note) {
          setHasUnsavedChanges(true);
        }
        return { ...r, notes: note };
      }
      return r;
    }));
  };

  const markAllPresent = () => {
    let changed = false;
    setRecords(prev => prev.map(r => {
      if (r.status !== STATUS.PRESENT) {
        changed = true;
        return { ...r, status: STATUS.PRESENT };
      }
      return r;
    }));
    if (changed) {
      setHasUnsavedChanges(true);
      addToast('All students marked present', 'success');
    } else {
      addToast('All students are already present', 'info');
    }
  };

  const markAllAbsent = () => {
    let changed = false;
    setRecords(prev => prev.map(r => {
      if (r.status !== STATUS.ABSENT) {
        changed = true;
        return { ...r, status: STATUS.ABSENT };
      }
      return r;
    }));
    if (changed) {
      setHasUnsavedChanges(true);
      addToast('All students marked absent', 'success');
    } else {
      addToast('All students are already absent', 'info');
    }
  };

  const handleSave = async () => {
    if (!selectedClass) {
      addToast('Please select a class first', 'error');
      return;
    }

    if (!selectedTerm) {
      addToast('Please select a term first', 'error');
      return;
    }

    if (!hasUnsavedChanges) {
      addToast('No changes to save', 'info');
      return;
    }

    setSaving(true);
    try {
      // ✅ Format data correctly for bulk attendance
      const payload = {
        classId: selectedClass,
        termId: selectedTerm,
        date: date,
        records: records.map(r => ({ 
          studentId: r.id, 
          status: r.status, 
          note: r.notes || null 
        }))
      };

      console.log('📤 Saving attendance:', payload);
      
      const result = await bulkMarkAttendance(payload);
      addToast(`Attendance saved successfully for ${result.marked || records.length} students`, 'success');
      
      // ✅ Reset changes flag after successful save
      setHasUnsavedChanges(false);
      
      // Refresh attendance stats after saving
      const stats = await getAttendance({
        classId: selectedClass,
        termId: selectedTerm,
        limit: 30
      });
      setAttendanceStats(Array.isArray(stats) ? stats : []);
      
    } catch (err) {
      console.error('❌ Save error:', err);
      
      // Show detailed error message
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ');
        addToast(`Validation failed: ${errorMessages}`, 'error');
      } else {
        addToast(err.response?.data?.message || 'Failed to save attendance', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // Calculate attendance summary
  const summary = {
    present: records.filter(r => r.status === STATUS.PRESENT).length,
    absent: records.filter(r => r.status === STATUS.ABSENT).length,
    late: records.filter(r => r.status === STATUS.LATE).length,
    total: records.length,
  };

  // Prepare chart data from real stats or fallback
  const chartData = attendanceStats.length > 0 
    ? attendanceStats.slice(0, 8).map((s, i) => ({
        day: s.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short' }) : `Day ${i + 1}`,
        rate: s.presentCount && s.totalCount ? Math.round((s.presentCount / s.totalCount) * 100) : 0
      }))
    : summaryData;

  return (
    <div>
      <PageHeader
        title="Attendance"
        subtitle={
          role === 'CLASS_TEACHER'
            ? 'Mark and track daily attendance for your class'
            : role === 'SUBJECT_TEACHER'
            ? 'View attendance records (read-only for subject teachers)'
            : 'Track and record daily student attendance'
        }
        action={
          canEdit ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto" 
                onClick={markAllPresent} 
                disabled={records.length === 0}
              >
                All Present
              </Button>
              <Button 
                variant="secondary" 
                className="w-full sm:w-auto" 
                onClick={markAllAbsent} 
                disabled={records.length === 0}
              >
                All Absent
              </Button>
              <Button 
                icon={Save} 
                loading={saving} 
                className="w-full sm:w-auto" 
                onClick={handleSave} 
                disabled={records.length === 0 || saving || !hasUnsavedChanges}
              >
                Save Attendance
              </Button>
            </div>
          ) : null
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-5">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Select
            label="Class"
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            value={selectedClass}
            onChange={e => setSelectedClass(e.target.value)}
            placeholder="Select class..."
          />
          <Select
            label="Term"
            options={terms.map(t => ({ 
              value: t.id, 
              label: `${t.academicYear} - ${t.termNumber?.replace('TERM', 'Term ')}` 
            }))}
            value={selectedTerm}
            onChange={e => setSelectedTerm(e.target.value)}
            placeholder="Select term..."
            disabled={loadingTerms}
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
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            </div>
          ) : records.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400">No students enrolled in this class yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <div className="divide-y divide-gray-100 min-w-[700px]">
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
                            onClick={() => canEdit && setStatus(row.id, val)}
                            disabled={!canEdit}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              isActive ? `${cfg.bg} ${cfg.color}` : 'bg-gray-50 border-gray-200 text-gray-400 hover:border-gray-300'
                            } ${!canEdit ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                      onChange={e => canEdit && setNote(row.id, e.target.value)}
                      disabled={!canEdit}
                      placeholder="Notes..."
                      className="w-28 text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-300 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trend chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Attendance Trend</h3>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            {attendanceStats.length > 0 ? 'Recent attendance records' : 'Past 8 days average %'}
          </p>
          {loadingStats ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="h-6 w-6 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="attendTrend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.12} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '8px', border: '1px solid #E5E7EB' }} />
                <Area 
                  type="monotone" 
                  dataKey="rate" 
                  name="Attendance %" 
                  stroke="#4F46E5" 
                  strokeWidth={2} 
                  fill="url(#attendTrend)" 
                  dot={false} 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// Fallback mock data for chart
const summaryData = [
  { day: 'Mon', rate: 94 }, { day: 'Tue', rate: 91 }, { day: 'Wed', rate: 96 },
  { day: 'Thu', rate: 88 }, { day: 'Fri', rate: 93 }, { day: 'Sat', rate: 95 },
  { day: 'Sun', rate: 92 }, { day: 'Mon', rate: 90 },
];