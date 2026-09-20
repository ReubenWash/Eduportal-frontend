import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getReports,
  getReportClasses,
  updateReportRemarks,
  generateReports,
  openReportPreview,
} from '../../api/reportsApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { FileText, Eye, Save, Loader2, CheckCircle2, Search, ChevronRight } from 'lucide-react';

const MAX_REMARK = 500;

const TRAIT_SUGGESTIONS = ['Excellent', 'Very Good', 'Good', 'Fair', 'Needs Improvement'];

const REMARK_PHRASES = [
  'An excellent performance. Keep it up.',
  'A very good result. Aim even higher next term.',
  'A good result. More effort will bring better results.',
  'A fair performance. He/She needs to put in more effort.',
  'Performance is below average. He/She must study harder.',
];

const STATUS_VARIANT = { DRAFT: 'default', APPROVED: 'warning', RELEASED: 'success' };
const STATUS_LABEL = { DRAFT: 'Draft', APPROVED: 'Approved', RELEASED: 'Released' };

const levelLabel = (level) => String(level || '').replace(/^JHS(\d)$/, 'JHS $1');
const termLabel = (t) => `${t.academicYear} · ${String(t.termNumber || '').replace('TERM', 'Term ')}`;
const studentName = (r) => `${r.student?.lastName || ''} ${r.student?.firstName || ''}`.trim() || 'Student';

// Promotion options depend on the student's level
const promotionOptions = (level) => {
  if (level === 'JHS1') return ['JHS 2', 'REPEATED'];
  if (level === 'JHS2') return ['JHS 3', 'REPEATED'];
  if (level === 'JHS3') return ['COMPLETED JHS', 'REPEATED'];
  return ['PROMOTED', 'REPEATED'];
};

const FIELDS = ['teacherRemark', 'attitude', 'conduct', 'interest', 'promotedTo'];

export default function ReportRemarks() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState('');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [edits, setEdits] = useState({}); // reportId -> { field: value } (unsaved changes)
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [search, setSearch] = useState('');

  // ── load classes + terms once ──
  useEffect(() => {
    (async () => {
      try {
        const [classList, termList] = await Promise.all([getReportClasses(), getSchoolTerms()]);
        const cls = Array.isArray(classList) ? classList : [];
        const trm = Array.isArray(termList) ? termList : [];
        setClasses(cls);
        setTerms(trm);
        const active = trm.find((t) => t.status === 'ACTIVE') || trm[0];
        if (active) setTermId(active.id);
      } catch (err) {
        console.error('Failed to load remarks filters:', err);
        addToast('Could not load your classes and terms.', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedTerm = terms.find((t) => t.id === termId);

  // classes that belong to the selected term's academic year
  const classOptions = useMemo(() => {
    const list = selectedTerm ? classes.filter((c) => c.academicYear === selectedTerm.academicYear) : classes;
    return list.map((c) => ({ value: c.id, label: `${levelLabel(c.level)} ${c.section}` }));
  }, [classes, selectedTerm]);

  // keep the class selection valid when the term changes
  useEffect(() => {
    if (classOptions.length === 0) {
      setClassId('');
    } else if (!classOptions.some((o) => o.value === classId)) {
      setClassId(classOptions[0].value);
    }
  }, [classOptions]);

  const fetchReports = async (keepSelection = false) => {
    if (!classId || !termId) {
      setReports([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getReports({ classId, termId });
      const rows = Array.isArray(list) ? list : [];
      setReports(rows);
      if (!keepSelection || !rows.some((r) => r.id === selectedId)) {
        setSelectedId(rows[0]?.id || null);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
      addToast(err.response?.data?.message || 'Failed to load report cards.', 'error');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setEdits({});
    fetchReports();
  }, [classId, termId]);

  const selected = reports.find((r) => r.id === selectedId) || null;
  const selectedClass = classes.find((c) => c.id === classId);

  const valueOf = (report, field) =>
    edits[report.id]?.[field] !== undefined ? edits[report.id][field] : (report[field] ?? '');

  const setField = (field, value) =>
    setEdits((prev) => ({ ...prev, [selected.id]: { ...prev[selected.id], [field]: value } }));

  const isDirty = selected && edits[selected.id] && Object.keys(edits[selected.id]).length > 0;

  // Class teachers can only edit DRAFT reports; admins can also edit APPROVED ones.
  const canEdit = (r) => r && (r.status === 'DRAFT' || (isAdmin && r.status === 'APPROVED'));

  const written = reports.filter((r) => (r.teacherRemark || '').trim()).length;

  const visibleReports = reports.filter((r) =>
    !search.trim() || studentName(r).toLowerCase().includes(search.trim().toLowerCase())
    || String(r.student?.studentNumber || '').toLowerCase().includes(search.trim().toLowerCase())
  );

  // ── save ──
  const save = async ({ next = false } = {}) => {
    if (!selected || !isDirty) {
      if (next) goNext();
      return;
    }
    setSaving(true);
    try {
      const payload = {};
      const changed = edits[selected.id];
      [...FIELDS, ...(isAdmin ? ['headRemark'] : [])].forEach((f) => {
        if (changed[f] !== undefined) payload[f] = changed[f];
      });
      const updated = await updateReportRemarks(selected.id, payload);
      setReports((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ...updated } : r)));
      setEdits((prev) => {
        const copy = { ...prev };
        delete copy[selected.id];
        return copy;
      });
      addToast(`Saved remarks for ${studentName(selected)}.`, 'success');
      if (next) goNext();
    } catch (err) {
      console.error('Save remarks error:', err);
      addToast(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to save remarks.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const goNext = () => {
    const idx = reports.findIndex((r) => r.id === selectedId);
    if (idx >= 0 && idx < reports.length - 1) setSelectedId(reports[idx + 1].id);
  };

  const handlePreview = async () => {
    if (!selected) return;
    setPreviewing(true);
    try {
      await openReportPreview(selected.id);
    } catch (err) {
      addToast('Could not open the preview.', 'error');
    } finally {
      setPreviewing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateReports({ termId, classId });
      addToast('Draft report cards created. You can now write remarks.', 'success');
      await fetchReports();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to generate report cards.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const addPhrase = (phrase) => {
    const current = String(valueOf(selected, 'teacherRemark') || '').trim();
    const next = current ? `${current} ${phrase}` : phrase;
    setField('teacherRemark', next.slice(0, MAX_REMARK));
  };

  // ─────────────────────────────── render ───────────────────────────────
  const editable = canEdit(selected);
  const studentLevel = selected?.student?.enrollments?.[0]?.class?.level || selectedClass?.level;

  return (
    <div>
      <PageHeader
        title="Report Card Remarks"
        subtitle="Write the class teacher's remarks, attitude, conduct, interest and promotion for each learner."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-xl">
        <Select
          label="Term"
          value={termId}
          onChange={(e) => setTermId(e.target.value)}
          options={terms.map((t) => ({ value: t.id, label: termLabel(t) }))}
          placeholder="Select term"
        />
        <Select
          label="Class"
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          options={classOptions}
          placeholder={classOptions.length ? 'Select class' : 'No class assigned'}
          disabled={classOptions.length === 0}
        />
      </div>

      {loading && reports.length === 0 ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>
      ) : classOptions.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No class assigned"
          description={isAdmin
            ? 'Create a class for this academic year first.'
            : 'You are not assigned as class teacher for this academic year. Ask your school admin to assign you to a class.'}
        />
      ) : reports.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No report cards yet for this class"
          description={isAdmin
            ? 'Generate the draft report cards first, then remarks can be written.'
            : 'The school admin needs to generate the draft report cards before you can write remarks.'}
          action={isAdmin ? <Button onClick={handleGenerate} loading={generating}>Generate draft report cards</Button> : null}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── learner list ── */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-900">
                  {selectedClass ? `${levelLabel(selectedClass.level)} ${selectedClass.section}` : 'Class'}
                </p>
                <span className="text-xs text-gray-500">{written} of {reports.length} remarks written</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-3">
                <div className="h-full bg-emerald-500 transition-all" style={{ width: `${reports.length ? (written / reports.length) * 100 : 0}%` }} />
              </div>
              <div className="relative">
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search learner…"
                  className="w-full rounded-lg border border-gray-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400"
                />
              </div>
            </div>
            <ul className="max-h-[560px] overflow-y-auto divide-y divide-gray-100">
              {visibleReports.map((r) => {
                const done = (r.teacherRemark || '').trim();
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelectedId(r.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                        r.id === selectedId ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      {done
                        ? <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                        : <span className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{studentName(r)}</p>
                        <p className="text-xs text-gray-500">{r.student?.studentNumber}</p>
                      </div>
                      {edits[r.id] && <span className="h-2 w-2 rounded-full bg-amber-500" title="Unsaved changes" />}
                      <Badge variant={STATUS_VARIANT[r.status]}>{STATUS_LABEL[r.status] || r.status}</Badge>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </button>
                  </li>
                );
              })}
              {visibleReports.length === 0 && (
                <li className="px-4 py-6 text-sm text-gray-500 text-center">No learner matches your search.</li>
              )}
            </ul>
          </div>

          {/* ── editor ── */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
            {!selected ? (
              <p className="text-sm text-gray-500">Select a learner to write remarks.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{studentName(selected)}</h2>
                    <p className="text-sm text-gray-500">
                      {selected.student?.studentNumber}
                      {selected.classPosition ? ` · Position ${selected.classPosition}${selected.totalStudents ? ` of ${selected.totalStudents}` : ''}` : ''}
                    </p>
                  </div>
                  <Button variant="secondary" size="sm" icon={Eye} onClick={handlePreview} loading={previewing}>
                    Preview report card
                  </Button>
                </div>

                {!editable && (
                  <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                    {selected.status === 'RELEASED'
                      ? 'This report card has been released and can no longer be edited.'
                      : 'This report card has been approved. Ask the school admin if a change is needed.'}
                  </div>
                )}

                {/* class teacher's remarks */}
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-700">Class teacher&apos;s remarks</label>
                    <span className={`text-xs ${String(valueOf(selected, 'teacherRemark')).length > MAX_REMARK - 30 ? 'text-amber-600' : 'text-gray-400'}`}>
                      {String(valueOf(selected, 'teacherRemark')).length}/{MAX_REMARK}
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={MAX_REMARK}
                    disabled={!editable}
                    value={valueOf(selected, 'teacherRemark')}
                    onChange={(e) => setField('teacherRemark', e.target.value)}
                    placeholder="e.g. A very hardworking and disciplined learner…"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  {editable && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {REMARK_PHRASES.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => addPhrase(p)}
                          className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300"
                        >
                          + {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* attitude / conduct / interest */}
                <datalist id="trait-suggestions">
                  {TRAIT_SUGGESTIONS.map((t) => <option key={t} value={t} />)}
                </datalist>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                  <Input
                    label="Attitude"
                    list="trait-suggestions"
                    maxLength={80}
                    disabled={!editable}
                    value={valueOf(selected, 'attitude')}
                    onChange={(e) => setField('attitude', e.target.value)}
                  />
                  <Input
                    label="Conduct"
                    list="trait-suggestions"
                    maxLength={80}
                    disabled={!editable}
                    value={valueOf(selected, 'conduct')}
                    onChange={(e) => setField('conduct', e.target.value)}
                  />
                  <Input
                    label="Interest"
                    maxLength={80}
                    disabled={!editable}
                    placeholder="e.g. Sports, Reading"
                    value={valueOf(selected, 'interest')}
                    onChange={(e) => setField('interest', e.target.value)}
                  />
                </div>

                {/* promoted to */}
                <div className="mb-5 max-w-xs">
                  <Select
                    label="Promoted to (usually end of Term 3)"
                    value={valueOf(selected, 'promotedTo')}
                    onChange={(e) => setField('promotedTo', e.target.value)}
                    options={promotionOptions(studentLevel)}
                    placeholder="Not set"
                    disabled={!editable}
                  />
                </div>

                {/* head teacher's remark — admin only */}
                {isAdmin && (
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Head teacher&apos;s remark (optional)</label>
                    <textarea
                      rows={2}
                      maxLength={MAX_REMARK}
                      disabled={!editable}
                      value={valueOf(selected, 'headRemark')}
                      onChange={(e) => setField('headRemark', e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                  <Button icon={Save} onClick={() => save()} loading={saving} disabled={!editable || !isDirty}>
                    Save
                  </Button>
                  <Button variant="secondary" onClick={() => save({ next: true })} disabled={saving}>
                    {isDirty ? 'Save & next learner' : 'Next learner'}
                  </Button>
                  {isDirty && <span className="text-xs text-amber-600">You have unsaved changes</span>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}