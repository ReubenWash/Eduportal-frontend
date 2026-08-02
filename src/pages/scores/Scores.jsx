import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getClasses } from '../../api/classesApi';
import { getSchool } from '../../api/schoolApi';
import { getSubjects } from '../../api/subjectsApi';
import { 
  getScores, 
  createScore, 
  updateScore, 
  getClassSummary, 
  getSubmissionStatus,
  downloadScoreTemplate,
  importScoresExcel,
  computeGrades
} from '../../api/scoresApi';
import { getStudents } from '../../api/studentsApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { Calculator, Save, CheckCircle2, Download, Upload, Loader2 } from 'lucide-react';

function computeGrade(total, boundaries) {
  if (!boundaries) {
    boundaries = { A1: 90, B2: 80, B3: 75, C4: 70, C5: 65, C6: 60, D7: 55, E8: 50 };
  }
  if (total >= boundaries.A1) return { grade: 'A1', color: 'success' };
  if (total >= boundaries.B2) return { grade: 'B2', color: 'success' };
  if (total >= boundaries.B3) return { grade: 'B3', color: 'success' };
  if (total >= boundaries.C4) return { grade: 'C4', color: 'info' };
  if (total >= boundaries.C5) return { grade: 'C5', color: 'info' };
  if (total >= boundaries.C6) return { grade: 'C6', color: 'warning' };
  if (total >= boundaries.D7) return { grade: 'D7', color: 'warning' };
  if (total >= boundaries.E8) return { grade: 'E8', color: 'danger' };
  return { grade: 'F9', color: 'danger' };
}

const getGradingConfig = () => {
  const defaults = { caCount: 3, caMaxScore: 10, examMaxScore: 70, boundaries: { A1: 90, B2: 80, B3: 75, C4: 70, C5: 65, C6: 60, D7: 55, E8: 50 } };
  try {
    const stored = JSON.parse(localStorage.getItem('schoolGradingConfig'));
    if (stored) return { ...defaults, ...stored, boundaries: { ...defaults.boundaries, ...(stored.boundaries || {}) } };
    return defaults;
  } catch {
    return defaults;
  }
};

function ScoreEntry({ selectedClass, selectedSubject, selectedTerm, gradingConfig, scoreLabels, onRefresh }) {
  const { addToast } = useToast();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadScores = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm) {
      setScores([]);
      return;
    }

    setLoading(true);
    try {
      // Get students in the class
      const students = await getStudents({ classId: selectedClass });
      const studentList = Array.isArray(students) ? students : [];

      // Get existing scores for this subject and term
      const existingScores = await getScores({ 
        subjectId: selectedSubject, 
        termId: selectedTerm,
        classId: selectedClass 
      });

      // Map scores to students
      const scoreMap = {};
      (Array.isArray(existingScores) ? existingScores : []).forEach(s => {
        scoreMap[s.studentId] = s;
      });

      // Build score entries
      const entries = studentList.map(s => {
        const existing = scoreMap[s.id] || {};
        return {
          id: s.id,
          scoreId: existing.id || null,
          name: s.name,
          studentNo: s.studentNo,
          ca1: existing.ca1 !== undefined && existing.ca1 !== null ? existing.ca1 : '',
          ca2: existing.ca2 !== undefined && existing.ca2 !== null ? existing.ca2 : '',
          ca3: existing.ca3 !== undefined && existing.ca3 !== null ? existing.ca3 : '',
          exam: existing.examScore !== undefined && existing.examScore !== null ? existing.examScore : '',
          saving: false
        };
      });

      setScores(entries);
    } catch (err) {
      console.error('Failed to load scores:', err);
      addToast('Failed to load scores', 'error');
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadScores();
  }, [selectedClass, selectedSubject, selectedTerm]);

  const updateScore = (id, field, val) => {
    setScores(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  };

  const getTotal = (row) => {
    const caScores = Array.from({ length: gradingConfig.caCount }).map((_, i) => Number(row[`ca${i+1}`]) || 0);
    const caTotal = caScores.reduce((a, b) => a + b, 0);
    const exam = Number(row.exam) || 0;
    return caTotal + exam;
  };

  const saveRow = async (id) => {
    if (!selectedSubject) {
      addToast('Please select a subject first', 'error');
      return;
    }

    const row = scores.find(s => s.id === id);
    if (!row) return;

    setScores(prev => prev.map(s => s.id === id ? { ...s, saving: true } : s));

    try {
      const data = {
        studentId: row.id,
        subjectId: selectedSubject,
        termId: selectedTerm,
        ca1: row.ca1 !== '' ? Number(row.ca1) : null,
        ca2: row.ca2 !== '' ? Number(row.ca2) : null,
        ca3: row.ca3 !== '' ? Number(row.ca3) : null,
        examScore: row.exam !== '' ? Number(row.exam) : null,
      };

      if (row.scoreId) {
        await updateScore(row.scoreId, data);
      } else {
        const result = await createScore(data);
        // Update with the new score ID
        setScores(prev => prev.map(s => 
          s.id === id ? { ...s, scoreId: result.id } : s
        ));
      }

      addToast('Score saved successfully', 'success');
      // Refresh to get computed values
      await loadScores();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to save score:', err);
      addToast('Failed to save score', 'error');
    } finally {
      setScores(prev => prev.map(s => s.id === id ? { ...s, saving: false } : s));
    }
  };

  const saveAll = async () => {
    if (!selectedSubject) {
      addToast('Please select a subject first', 'error');
      return;
    }
    if (scores.length === 0) {
      addToast('No students to save', 'warning');
      return;
    }

    setSaving(true);
    let saved = 0;
    let failed = 0;

    for (const row of scores) {
      try {
        const hasData = row.ca1 !== '' || row.ca2 !== '' || row.ca3 !== '' || row.exam !== '';
        if (!hasData) continue;

        const data = {
          studentId: row.id,
          subjectId: selectedSubject,
          termId: selectedTerm,
          ca1: row.ca1 !== '' ? Number(row.ca1) : null,
          ca2: row.ca2 !== '' ? Number(row.ca2) : null,
          ca3: row.ca3 !== '' ? Number(row.ca3) : null,
          examScore: row.exam !== '' ? Number(row.exam) : null,
        };

        if (row.scoreId) {
          await updateScore(row.scoreId, data);
        } else {
          const result = await createScore(data);
          setScores(prev => prev.map(s => 
            s.id === row.id ? { ...s, scoreId: result.id } : s
          ));
        }
        saved++;
      } catch (err) {
        failed++;
        console.error('Failed to save score for student:', row.name, err);
      }
    }

    if (saved > 0) {
      addToast(`${saved} scores saved successfully${failed > 0 ? `, ${failed} failed` : ''}`, 'success');
      await loadScores();
      if (onRefresh) onRefresh();
    } else if (failed > 0) {
      addToast(`Failed to save ${failed} scores`, 'error');
    }
    
    setSaving(false);
  };

  const handleDownload = async () => {
    try {
      const blob = await downloadScoreTemplate({
        classId: selectedClass,
        subjectId: selectedSubject,
        termId: selectedTerm
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Score_Template_${selectedSubject}_${selectedTerm}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      addToast('Template downloaded successfully', 'success');
    } catch (err) {
      console.error('Download template failed:', err);
      // Fallback: CSV download
      const caHeaders = Array.from({ length: gradingConfig.caCount }).map((_, i) => scoreLabels?.[`ca${i+1}`] || `CA ${i+1}`);
      const examLabel = scoreLabels?.examScore || 'Exam';
      const headers = ['Student', 'StudentNo', ...caHeaders, examLabel];
      const csvContent = [
        headers.join(','),
        ...scores.map(s => {
          const caVals = Array.from({ length: gradingConfig.caCount }).map((_, i) => `"${s[`ca${i+1}`] || ''}"`);
          return `"${s.name}","${s.studentNo}",${caVals.join(',')},"${s.exam || ''}"`;
        })
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Score_Template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await importScoresExcel(formData, {
        subjectId: selectedSubject,
        termId: selectedTerm
      });

      addToast(`Imported ${result.saved || 0} scores successfully`, 'success');
      await loadScores();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Upload failed:', err);
      addToast('Failed to import scores', 'error');
    }
    e.target.value = null;
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

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading students...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-700">Enter scores per student</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {gradingConfig.caCount} CAs (max {gradingConfig.caMaxScore} each) + Exam (max {gradingConfig.examMaxScore})
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={handleDownload} icon={Download} size="sm">Download Template</Button>
          <label className="cursor-pointer inline-flex items-center gap-2 justify-center rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
            <Upload className="h-4 w-4" />
            Upload CSV
            <input type="file" accept=".csv,.xlsx" className="hidden" onChange={handleUpload} />
          </label>
          <Button onClick={saveAll} icon={Save} size="sm" loading={saving}>Save All</Button>
        </div>
      </div>
      
      {scores.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-500">
          {selectedClass && selectedSubject ? 'No students found in this class' : 'Please select a class and subject'}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Student</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Stu. No.</th>
                {Array.from({ length: gradingConfig.caCount }).map((_, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {scoreLabels?.[`ca${i+1}`] || `CA ${i+1}`} /{gradingConfig.caMaxScore}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{scoreLabels?.examScore || 'Exam'} /{gradingConfig.examMaxScore}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Total</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">Grade</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {scores.map((row) => {
                const total = getTotal(row);
                const { grade, color } = computeGrade(total, gradingConfig.boundaries);
                return (
                  <tr key={row.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{row.name}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{row.studentNo}</td>
                    {Array.from({ length: gradingConfig.caCount }).map((_, i) => (
                      <td key={i} className="px-4 py-3">
                        <InputCell 
                          value={row[`ca${i+1}`]} 
                          onChange={(v) => updateScore(row.id, `ca${i+1}`, v)} 
                          max={gradingConfig.caMaxScore} 
                          placeholder="—" 
                        />
                      </td>
                    ))}
                    <td className="px-4 py-3">
                      <InputCell 
                        value={row.exam} 
                        onChange={(v) => updateScore(row.id, 'exam', v)} 
                        max={gradingConfig.examMaxScore} 
                        placeholder="—" 
                      />
                    </td>
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
                          <Loader2 className="h-4 w-4 animate-spin" />
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
      )}
    </div>
  );
}

function ClassSummary({ selectedClass, selectedTerm }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const gradingConfig = getGradingConfig();

  useEffect(() => {
    const loadSummary = async () => {
      if (!selectedClass || !selectedTerm) {
        setData([]);
        return;
      }

      setLoading(true);
      try {
        const summary = await getClassSummary({
          classId: selectedClass,
          termId: selectedTerm
        });
        setData(Array.isArray(summary) ? summary : []);
      } catch (err) {
        console.error('Failed to load class summary:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [selectedClass, selectedTerm]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading class summary...</div>;
  }

  if (data.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-500">No data available for this class and term.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Student', 'Student No.', 'Position', 'Aggregate', 'Grade'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {data.map((row, index) => {
            const avg = row.average || row.aggregate || 0;
            const { grade, color } = computeGrade(avg, gradingConfig.boundaries);
            return (
              <tr key={row.student?.id || index} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {row.student?.firstName} {row.student?.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">{row.student?.studentNumber || '—'}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.position || '—'}</td>
                <td className="px-4 py-3 text-sm font-bold text-gray-900">{row.aggregate || avg}</td>
                <td className="px-4 py-3"><Badge variant={color}>{grade}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function SubmissionStatus({ selectedClass, selectedTerm }) {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const loadStatus = async () => {
      if (!selectedClass || !selectedTerm) {
        setStatuses([]);
        return;
      }

      setLoading(true);
      try {
        const data = await getSubmissionStatus({
          classId: selectedClass,
          termId: selectedTerm
        });
        setStatuses(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load submission status:', err);
        setStatuses([]);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
  }, [selectedClass, selectedTerm]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-gray-500">Loading submission status...</div>;
  }

  if (statuses.length === 0) {
    return <div className="py-12 text-center text-sm text-gray-500">No submission data available.</div>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {['Teacher', 'Subject', 'Status', 'Submitted / Total', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {statuses.map((row, i) => {
            const teacherName = row.teacher 
              ? `${row.teacher.firstName || ''} ${row.teacher.lastName || ''}`.trim() || 'Not Assigned'
              : 'Not Assigned';
            const isSubmitted = row.submitted || false;
            
            return (
              <tr key={i} className="hover:bg-gray-50/80 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{teacherName}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{row.subject?.name || 'Unknown Subject'}</td>
                <td className="px-4 py-3">
                  <Badge variant={isSubmitted ? 'success' : 'warning'}>
                    {isSubmitted ? 'Submitted' : 'Pending'}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {row.submittedCount || 0} / {row.totalStudents || 0}
                </td>
                <td className="px-4 py-3">
                  {!isSubmitted && (
                    <button 
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                      onClick={() => window.location.href = '/scores'}
                    >
                      Enter Scores
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Scores() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [terms, setTerms] = useState([]);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [scoreLabels, setScoreLabels] = useState(null);
  const [computing, setComputing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { addToast } = useToast();
  const { user } = useAuth();
  const role = user?.role;

  const loadData = async () => {
    try {
      // Load classes
      const classList = await getClasses();
      setClasses(Array.isArray(classList) ? classList : []);
      if (classList.length > 0 && !selectedClass) {
        setSelectedClass(classList[0].id);
      }

      // Load subjects
      const subjectList = await getSubjects();
      setSubjects(Array.isArray(subjectList) ? subjectList : []);
      if (subjectList.length > 0 && !selectedSubject) {
        setSelectedSubject(subjectList[0].id);
      }

      // Load terms
      const termList = await getSchoolTerms();
      setTerms(Array.isArray(termList) ? termList : []);
      if (termList.length > 0 && !selectedTerm) {
        const activeTerm = termList.find(t => t.status === 'ACTIVE');
        setSelectedTerm(activeTerm?.id || termList[0].id);
      }

      // Load score labels from school settings
      const school = await getSchool();
      if (school?.scoreLabels) {
        setScoreLabels(school.scoreLabels);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
      addToast('Failed to load required data', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleComputeGrades = async () => {
    if (!selectedClass || !selectedTerm) {
      addToast('Please select a class and term', 'error');
      return;
    }

    setComputing(true);
    try {
      const result = await computeGrades({
        classId: selectedClass,
        termId: selectedTerm
      });
      addToast(`Grades computed for ${result.students || 0} students`, 'success');
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Compute grades failed:', err);
      addToast('Failed to compute grades', 'error');
    } finally {
      setComputing(false);
    }
  };

  const gradingConfig = getGradingConfig();

  // ✅ Filter tabs based on user role
  const allTabs = [
    { 
      label: 'Score Entry', 
      content: <ScoreEntry 
        key={refreshKey}
        selectedClass={selectedClass} 
        selectedSubject={selectedSubject} 
        selectedTerm={selectedTerm} 
        gradingConfig={gradingConfig} 
        scoreLabels={scoreLabels}
        onRefresh={() => setRefreshKey(prev => prev + 1)}
      />, 
      roles: ['SUBJECT_TEACHER', 'CLASS_TEACHER', 'SCHOOL_ADMIN'] 
    },
    { 
      label: 'Class Summary', 
      content: <ClassSummary 
        key={refreshKey}
        selectedClass={selectedClass} 
        selectedTerm={selectedTerm} 
      />, 
      roles: ['SCHOOL_ADMIN', 'CLASS_TEACHER', 'SUBJECT_TEACHER'] 
    },
    { 
      label: 'Submission Status', 
      content: <SubmissionStatus 
        key={refreshKey}
        selectedClass={selectedClass} 
        selectedTerm={selectedTerm} 
      />, 
      roles: ['SCHOOL_ADMIN', 'CLASS_TEACHER'] 
    },
  ];

  // ✅ Filter tabs based on user role
  const tabs = allTabs.filter(t => {
    if (!role) return true;
    return t.roles.includes(role);
  });

  const subtitleMap = {
    SUBJECT_TEACHER: 'Enter scores for your assigned classes and subjects',
    CLASS_TEACHER: 'View class scores and submission status for your class',
    SCHOOL_ADMIN: 'Enter and manage student scores and grades',
  };

  return (
    <div>
      <PageHeader
        title="Scores"
        subtitle={subtitleMap[role] || 'Enter and manage student scores and grades'}
        action={
          role === 'SCHOOL_ADMIN' ? (
            <Button 
              variant="secondary" 
              icon={Calculator} 
              onClick={handleComputeGrades}
              loading={computing}
            >
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
              options={terms.map(t => ({ 
                value: t.id, 
                label: `${t.academicYear} - ${t.termNumber.replace('TERM', 'Term ')}` 
              }))}
              placeholder="Select term..."
            />
            <Select
              label="Subject"
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
              options={subjects.map(s => ({ value: s.id, label: s.name }))}
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