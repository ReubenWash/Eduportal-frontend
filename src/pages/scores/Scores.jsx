import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getClasses } from '../../api/classesApi';
import { Calculator, Save, CheckCircle2, Download, Upload } from 'lucide-react';

// Mock score data
const mockStudents = [
  { id: '1', name: 'Ama Mensah', studentNo: 'STU/001' },
  { id: '2', name: 'Kofi Boateng', studentNo: 'STU/002' },
  { id: '3', name: 'Akua Sarpong', studentNo: 'STU/003' },
  { id: '4', name: 'Kwame Asante', studentNo: 'STU/004' },
  { id: '5', name: 'Abena Osei', studentNo: 'STU/005' },
];

function computeGrade(total) {
  if (total >= 90) return { grade: 'A1', color: 'success' };
  if (total >= 80) return { grade: 'B2', color: 'success' };
  if (total >= 75) return { grade: 'B3', color: 'success' };
  if (total >= 70) return { grade: 'C4', color: 'info' };
  if (total >= 65) return { grade: 'C5', color: 'info' };
  if (total >= 60) return { grade: 'C6', color: 'warning' };
  if (total >= 55) return { grade: 'D7', color: 'warning' };
  if (total >= 50) return { grade: 'E8', color: 'danger' };
  return { grade: 'F9', color: 'danger' };
}

function ScoreEntry({ selectedClass, selectedSubject, selectedTerm }) {
  const { addToast } = useToast();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedClass) {
      setScores([]);
      return;
    }
    
    setLoading(true);
    // Dynamically import the API to prevent circular dependencies if any
    import('../../api/studentsApi').then(({ getStudents }) => {
      getStudents({ classId: selectedClass }).then(data => {
        const list = Array.isArray(data) && data.length > 0 ? data : mockStudents;
        setScores(list.map(s => ({
          ...s,
          ca1: '', ca2: '', ca3: '', exam: '', saving: false
        })));
      }).catch(() => {
        setScores(mockStudents.map(s => ({ ...s, ca1: '', ca2: '', ca3: '', exam: '', saving: false })));
      }).finally(() => {
        setLoading(false);
      });
    });
  }, [selectedClass, selectedSubject, selectedTerm]);

  const updateScore = (id, field, val) => {
    setScores(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const getTotal = (row) => {
    const ca1 = Number(row.ca1) || 0;
    const ca2 = Number(row.ca2) || 0;
    const ca3 = Number(row.ca3) || 0;
    const exam = Number(row.exam) || 0;
    return ca1 + ca2 + ca3 + exam;
  };

  const saveRow = (id) => {
    if (!selectedSubject) return addToast('Please select a subject first', 'error');
    setScores(prev => prev.map(s => s.id === id ? { ...s, saving: true } : s));
    setTimeout(() => {
      setScores(prev => prev.map(s => s.id === id ? { ...s, saving: false } : s));
      addToast('Score saved successfully', 'success');
    }, 800);
  };

  const saveAll = () => {
    if (!selectedSubject) return addToast('Please select a subject first', 'error');
    if (scores.length === 0) return addToast('No students to save', 'warning');
    addToast('All scores saved successfully', 'success');
  };

  const handleDownload = () => {
    const headers = ['Student', 'StudentNo', 'CA1', 'CA2', 'CA3', 'Exam'];
    const csvContent = [
      headers.join(','),
      ...scores.map(s => `"${s.name}","${s.studentNo}","${s.ca1 || ''}","${s.ca2 || ''}","${s.ca3 || ''}","${s.exam || ''}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Score_Template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split('\n');
      if (lines.length < 2) return addToast('Invalid or empty file', 'error');
      
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const newScores = [...scores];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Handle quotes in CSV line correctly (basic handling)
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const rowData = {};
        headers.forEach((h, idx) => {
           rowData[h] = values[idx];
        });
        
        const studentIndex = newScores.findIndex(s => s.studentNo === rowData.StudentNo);
        if (studentIndex >= 0) {
           newScores[studentIndex].ca1 = rowData.CA1 || '';
           newScores[studentIndex].ca2 = rowData.CA2 || '';
           newScores[studentIndex].ca3 = rowData.CA3 || '';
           newScores[studentIndex].exam = rowData.Exam || '';
        }
      }
      setScores(newScores);
      addToast('Scores imported successfully', 'success');
      e.target.value = null; // reset input
    };
    reader.readAsText(file);
  };

  const InputCell = ({ value, onChange, max, placeholder }) => (
    <input
      type="number"
      min="0"
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-16 text-center border border-gray-200 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
    />
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Enter scores per student</p>
          <p className="text-xs text-gray-500 mt-0.5">CA1, CA2, CA3 (max 10 each) + Exam (max 70)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleDownload} icon={Download} size="sm">Download Template</Button>
          <label className="cursor-pointer inline-flex items-center gap-2 justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <Upload className="h-4 w-4" />
            Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          </label>
          <Button onClick={saveAll} icon={Save} size="sm">Save All</Button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Student', 'Stu. No.', 'CA1 /10', 'CA2 /10', 'CA3 /10', 'Exam /70', 'Total', 'Grade', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {scores.map((row) => {
              const total = getTotal(row);
              const { grade, color } = computeGrade(total);
              return (
                <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{row.studentNo}</td>
                  <td className="px-4 py-3"><InputCell value={row.ca1} onChange={(v) => updateScore(row.id, 'ca1', v)} max={10} placeholder="—" /></td>
                  <td className="px-4 py-3"><InputCell value={row.ca2} onChange={(v) => updateScore(row.id, 'ca2', v)} max={10} placeholder="—" /></td>
                  <td className="px-4 py-3"><InputCell value={row.ca3} onChange={(v) => updateScore(row.id, 'ca3', v)} max={10} placeholder="—" /></td>
                  <td className="px-4 py-3"><InputCell value={row.exam} onChange={(v) => updateScore(row.id, 'exam', v)} max={70} placeholder="—" /></td>
                  <td className="px-4 py-3 text-sm font-bold text-gray-900">{total > 0 ? total : '—'}</td>
                  <td className="px-4 py-3">
                    {total > 0 ? <Badge variant={color}>{grade}</Badge> : <span className="text-gray-300 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => saveRow(row.id)}
                      disabled={row.saving}
                      className="text-indigo-600 hover:text-indigo-500 disabled:opacity-50 transition-colors"
                    >
                      {row.saving ? (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClassSummary() {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Student', 'Maths', 'English', 'Science', 'Social Studies', 'Average', 'Grade'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {mockStudents.map((s) => {
            const scores = [78, 82, 75, 90];
            const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
            const { grade, color } = computeGrade(avg);
            return (
              <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{s.name}</td>
                {scores.map((sc, i) => (
                  <td key={i} className="px-4 py-3 text-sm text-gray-700">{sc}</td>
                ))}
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{avg}</td>
                <td className="px-4 py-3"><Badge variant={color}>{grade}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionStatus() {
  const submissions = [
    { teacher: 'Mr. Kofi Adu', subject: 'Mathematics', class: 'JHS1 A', submitted: true, date: '12 Jun 2025' },
    { teacher: 'Mrs. Abena Mensah', subject: 'English', class: 'JHS1 A', submitted: true, date: '11 Jun 2025' },
    { teacher: 'Mr. Kwame Boateng', subject: 'Science', class: 'JHS1 A', submitted: false, date: null },
    { teacher: 'Mrs. Akua Osei', subject: 'Social Studies', class: 'JHS1 A', submitted: false, date: null },
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Teacher', 'Subject', 'Class', 'Status', 'Submitted On'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {submissions.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50/80 transition-colors">
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.teacher}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{row.subject}</td>
              <td className="px-4 py-3 text-sm text-gray-700">{row.class}</td>
              <td className="px-4 py-3">
                <Badge variant={row.submitted ? 'success' : 'warning'}>{row.submitted ? 'Submitted' : 'Pending'}</Badge>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">{row.date || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Scores() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  
  const { addToast } = useToast();
  const { user } = useAuth();
  const role = user?.role;

  useEffect(() => {
    getClasses().then(d => {
      setClasses(d);
      if (d.length > 0) setSelectedClass(d[0].id);
    }).catch(() => {});
    
    // Fetch subjects or use fallback
    import('../../api/subjectsApi').then(({ getSubjects }) => {
      getSubjects().then(s => {
        setSubjects(s);
        if (s.length > 0) setSelectedSubject(s[0].id);
      }).catch(() => {});
    });
    
    // Default term
    setSelectedTerm('term1');
  }, []);

  const allTabs = [
    { label: 'Score Entry', content: <ScoreEntry selectedClass={selectedClass} selectedSubject={selectedSubject} selectedTerm={selectedTerm} />, roles: ['SUBJECT_TEACHER', 'SCHOOL_ADMIN'] },
    { label: 'Class Summary', content: <ClassSummary selectedClass={selectedClass} />, roles: ['SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] },
    { label: 'Submission Status', content: <SubmissionStatus selectedClass={selectedClass} />, roles: ['SCHOOL_ADMIN', 'CLASS_TEACHER'] },
  ];

  const tabs = allTabs.filter(t => !role || t.roles.includes(role));

  const subtitleMap = {
    SUBJECT_TEACHER: 'Enter scores for your assigned classes and subjects',
    CLASS_TEACHER: 'View class scores and submission status',
    SCHOOL_ADMIN: 'Enter and manage student scores and grades',
  };

  return (
    <div>
      <PageHeader
        title="Scores"
        subtitle={subtitleMap[role] || 'Enter and manage student scores and grades'}
        action={
          role === 'SCHOOL_ADMIN' ? (
            <Button variant="secondary" icon={Calculator} onClick={() => addToast('Grades computed successfully', 'success')}>
              Compute Grades
            </Button>
          ) : null
        }
      />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-3">Filter scores by</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Class"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              options={classes.map(c => ({ value: c.id, label: c.name }))}
              placeholder="Select class..."
            />
            <Select
              label="Term"
              value={selectedTerm}
              onChange={e => setSelectedTerm(e.target.value)}
              options={[{ value: 'term1', label: 'Term 1, 2025' }, { value: 'term2', label: 'Term 2, 2025' }]}
              placeholder="Select term..."
            />
            <Select
              label="Subject"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              options={subjects.length > 0 ? subjects.map(s => ({ value: s.id, label: s.name })) : [{ value: 'maths', label: 'Mathematics' }, { value: 'english', label: 'English' }]}
              placeholder="Select subject..."
            />
          </div>
        </div>
        <div className="p-5">
          <Tabs tabs={tabs} />
        </div>
      </div>
    </div>
  );
}