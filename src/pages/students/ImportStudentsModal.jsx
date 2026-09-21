import { useState, useRef, useMemo } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import {
  downloadStudentImportTemplate,
  previewStudentImport,
  bulkImportStudents,
} from '../../api/studentsApi';
import {
  FileSpreadsheet,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

const BATCH_SIZE = 20; // students saved per request: keeps every request short and lets us show progress

// ─── small helpers ──────────────────────────────────────────────
const saveBlob = (blob, fileName) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const saveCsv = (fileName, header, rows) => {
  const body = [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n');
  // BOM so Excel opens Ghanaian letters (Ɛ, Ɔ) correctly
  saveBlob(new Blob(['\uFEFF', body], { type: 'text/csv;charset=utf-8' }), fileName);
};

const errorText = (err, fallback) =>
  err?.response?.data?.message || err?.response?.data?.errors?.[0]?.msg || err?.message || fallback;

const STATUS_STYLE = {
  ready: { label: 'Ready', variant: 'success' },
  duplicate: { label: 'Already registered', variant: 'warning' },
  error: { label: 'Needs fixing', variant: 'danger' },
};

function StatCard({ label, value, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-50 text-gray-900',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-xl px-4 py-3 ${tones[tone]}`}>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}

// ─── component ──────────────────────────────────────────────────
export default function ImportStudentsModal({ isOpen, onClose, onImported }) {
  const { addToast } = useToast();
  const fileInput = useRef(null);
  const cancelled = useRef(false);

  const [step, setStep] = useState('upload'); // upload | preview | importing | done
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('all');
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [outcome, setOutcome] = useState(null); // { rows: [{ row, status, studentNumber, error, ... }] }

  const reset = () => {
    cancelled.current = false;
    setStep('upload');
    setFileName('');
    setBusy(false);
    setError('');
    setPreview(null);
    setFilter('all');
    setProgress({ done: 0, total: 0 });
    setOutcome(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  const close = () => {
    // closing while saving stops after the current batch
    cancelled.current = true;
    const changed = outcome && outcome.created > 0;
    reset();
    onClose();
    if (changed && onImported) onImported();
  };

  // ── 1. template + upload ──
  const handleTemplate = async () => {
    try {
      const blob = await downloadStudentImportTemplate();
      saveBlob(blob, 'Student Import Template.xlsx');
    } catch (err) {
      addToast('Could not download the template.', 'error');
    }
  };

  const handleFile = async (file) => {
    if (!file) return;
    setError('');
    if (!/\.xlsx$/i.test(file.name)) {
      setError('Please upload an Excel file (.xlsx). Use the template above.');
      return;
    }
    setBusy(true);
    setFileName(file.name);
    try {
      const result = await previewStudentImport(file);
      setPreview(result);
      setFilter(result.summary.errors > 0 ? 'error' : 'all');
      setStep('preview');
    } catch (err) {
      setError(errorText(err, 'Could not read that file.'));
    } finally {
      setBusy(false);
    }
  };

  // ── 2. review ──
  const rows = preview?.rows || [];
  const visibleRows = useMemo(
    () => (filter === 'all' ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter]
  );
  const readyRows = rows.filter((r) => r.status === 'ready');
  const needsTerm = preview && !preview.term && readyRows.some((r) => r.data.classId);

  const downloadProblems = () => {
    const problems = rows.filter((r) => r.status !== 'ready');
    saveCsv(
      'students-to-fix.csv',
      ['Row', 'Name', 'Class', 'Status', 'What to fix'],
      problems.map((r) => [
        r.rowNumber,
        r.display.name,
        r.display.className,
        STATUS_STYLE[r.status]?.label,
        [...r.errors, ...(r.status === 'duplicate' ? r.warnings : [])].join(' | '),
      ])
    );
  };

  // ── 3. save, a few students at a time ──
  const startImport = async () => {
    cancelled.current = false;
    setStep('importing');
    setProgress({ done: 0, total: readyRows.length });

    const done = [];
    let created = 0;
    let failed = 0;

    for (let i = 0; i < readyRows.length; i += BATCH_SIZE) {
      if (cancelled.current) break;
      const batch = readyRows.slice(i, i + BATCH_SIZE);
      try {
        const res = await bulkImportStudents(batch.map((r) => r.data));
        (res.results || []).forEach((r) => {
          const src = batch[r.index];
          if (r.status === 'created') created += 1;
          else failed += 1;
          done.push({ ...r, row: src.rowNumber, name: src.display.name, className: src.display.className, data: src.data });
        });
      } catch (err) {
        const message = errorText(err, 'Request failed');
        batch.forEach((src) => {
          failed += 1;
          done.push({ status: 'failed', error: message, row: src.rowNumber, name: src.display.name, className: src.display.className, data: src.data });
        });
      }
      setProgress({ done: Math.min(i + BATCH_SIZE, readyRows.length), total: readyRows.length });
    }

    setOutcome({ rows: done, created, failed, skippedAtStart: rows.length - readyRows.length });
    setStep('done');
    if (created > 0) addToast(`${created} student${created === 1 ? '' : 's'} registered.`, 'success');
  };

  const downloadLogins = () => {
    const created = (outcome?.rows || []).filter((r) => r.status === 'created');
    saveCsv(
      'student-and-guardian-logins.csv',
      ['Student ID (login)', 'Student temporary password', 'Name', 'Class', 'Guardian', 'Guardian email', 'Guardian temporary password'],
      created.map((r) => [
        r.studentNumber,
        r.studentPortal?.password || '',
        r.name,
        r.className,
        r.guardian?.name || '',
        r.guardian?.email || '',
        r.guardian?.isNew ? r.guardian.tempPassword || '' : r.guardian?.email ? '(existing account)' : '',
      ])
    );
  };

  const downloadFailed = () => {
    const failed = (outcome?.rows || []).filter((r) => r.status !== 'created');
    saveCsv(
      'students-not-saved.csv',
      ['Row', 'Name', 'Class', 'Reason'],
      failed.map((r) => [r.row, r.name, r.className, r.error])
    );
  };

  // ─────────────────────────── render ───────────────────────────
  return (
    <Modal
      isOpen={isOpen}
      onClose={step === 'importing' ? () => {} : close}
      title="Import students"
      subtitle="Register many students at once and enrol them in their classes"
      size="xl"
    >
      {/* ───────── step 1: upload ───────── */}
      {step === 'upload' && (
        <div className="space-y-5">
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">1</span>
              <div>
                <p className="font-medium text-gray-900">Download the template</p>
                <p className="text-gray-500">It already has your school&apos;s classes in a dropdown.</p>
                <Button variant="secondary" size="sm" icon={Download} className="mt-2" onClick={handleTemplate}>
                  Download template (.xlsx)
                </Button>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">2</span>
              <div>
                <p className="font-medium text-gray-900">Fill it in</p>
                <p className="text-gray-500">One student per row. Required: first name, last name, gender, date of birth (dd/mm/yyyy). Add a guardian email so parents get a portal login.</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">3</span>
              <div className="flex-1">
                <p className="font-medium text-gray-900">Upload it - you check everything before it is saved</p>
              </div>
            </li>
          </ol>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
          >
            <input
              ref={fileInput}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
            {busy ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                <p className="mt-3 text-sm font-medium text-gray-700">Checking {fileName}…</p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-700">Click to choose your Excel file, or drop it here</p>
                <p className="text-xs text-gray-500 mt-1">.xlsx, up to 1,000 students</p>
              </>
            )}
          </label>

          {error && (
            <div className="flex gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* ───────── step 2: review ───────── */}
      {step === 'preview' && preview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FileSpreadsheet className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">{fileName}</span>
            <button className="ml-auto text-indigo-600 hover:underline text-xs" onClick={reset}>Choose another file</button>
          </div>

          {preview.term ? (
            <p className="text-sm text-gray-600">
              Students with a class will be enrolled for <span className="font-medium text-gray-900">{preview.term.label}</span> (the active term).
            </p>
          ) : (
            <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>There is no active term yet, so students cannot be enrolled in classes. Create and activate a term in your school settings first, then import again.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Rows in file" value={preview.summary.total} />
            <StatCard label="Ready to import" value={preview.summary.ready} tone="green" />
            <StatCard label="Already registered (skipped)" value={preview.summary.duplicates} tone="amber" />
            <StatCard label="Need fixing (skipped)" value={preview.summary.errors} tone="red" />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            {[
              ['all', 'All'],
              ['error', 'Need fixing'],
              ['duplicate', 'Already registered'],
              ['ready', 'Ready'],
            ].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${filter === key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {label}
              </button>
            ))}
            {(preview.summary.errors > 0 || preview.summary.duplicates > 0) && (
              <button onClick={downloadProblems} className="ml-auto text-xs text-indigo-600 hover:underline">
                Download the rows to fix (.csv)
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-auto rounded-lg border border-gray-200">
            <table className="min-w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-3 py-2">Row</th>
                  <th className="px-3 py-2">Student</th>
                  <th className="px-3 py-2">Class</th>
                  <th className="px-3 py-2">Guardian</th>
                  <th className="px-3 py-2">Check</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleRows.map((r) => (
                  <tr key={r.rowNumber} className={r.status === 'error' ? 'bg-red-50/40' : ''}>
                    <td className="px-3 py-2 text-gray-500">{r.rowNumber}</td>
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">{r.display.name || '—'}</p>
                      <p className="text-xs text-gray-500">{[r.display.gender, r.display.dateOfBirth].filter(Boolean).join(' · ')}</p>
                    </td>
                    <td className="px-3 py-2 text-gray-700">{r.display.className || '—'}</td>
                    <td className="px-3 py-2 text-gray-700">
                      {r.display.guardianName || '—'}
                      {r.display.guardianEmail && <p className="text-xs text-gray-500">{r.display.guardianEmail}</p>}
                    </td>
                    <td className="px-3 py-2">
                      <Badge variant={STATUS_STYLE[r.status].variant}>{STATUS_STYLE[r.status].label}</Badge>
                      {r.errors.map((e) => <p key={e} className="mt-1 text-xs text-red-600">{e}</p>)}
                      {r.warnings.map((w) => <p key={w} className="mt-1 text-xs text-amber-600">{w}</p>)}
                    </td>
                  </tr>
                ))}
                {visibleRows.length === 0 && (
                  <tr><td colSpan={5} className="px-3 py-6 text-center text-gray-500">Nothing to show here.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-500">
              {preview.summary.errors + preview.summary.duplicates > 0
                ? 'Rows that need fixing or are already registered are skipped. Fix them in your file and upload again to add them.'
                : 'Everything looks good.'}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={close}>Cancel</Button>
              <Button onClick={startImport} disabled={readyRows.length === 0 || needsTerm}>
                Import {readyRows.length} student{readyRows.length === 1 ? '' : 's'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── step 3: saving ───────── */}
      {step === 'importing' && (
        <div className="py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <p className="mt-4 text-sm font-medium text-gray-900">
            Registering students… {progress.done} of {progress.total}
          </p>
          <div className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full bg-indigo-500 transition-all"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-gray-500">Please keep this window open.</p>
        </div>
      )}

      {/* ───────── step 4: done ───────── */}
      {step === 'done' && outcome && (
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-500" />
            <div>
              <p className="text-base font-semibold text-gray-900">
                {outcome.created} student{outcome.created === 1 ? '' : 's'} registered and enrolled
              </p>
              <p className="text-sm text-gray-500">
                {outcome.failed > 0 && `${outcome.failed} could not be saved. `}
                {outcome.skippedAtStart > 0 && `${outcome.skippedAtStart} row${outcome.skippedAtStart === 1 ? ' was' : 's were'} skipped (already registered or needing a fix).`}
              </p>
            </div>
          </div>

          {outcome.created > 0 && (
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
              <p className="font-medium">Give students and parents their logins</p>
              <p className="mt-1 text-indigo-800/80">
                Every student logs in with their Student ID and a temporary password, and must change it at first login.
                Guardians with an email were sent their login by email. Keep this file safe and share it only with the school.
              </p>
              <Button size="sm" icon={Download} className="mt-3" onClick={downloadLogins}>
                Download logins (.csv)
              </Button>
            </div>
          )}

          {outcome.failed > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              <p className="font-medium">{outcome.failed} not saved</p>
              <ul className="mt-1 list-disc pl-5 text-xs">
                {outcome.rows.filter((r) => r.status !== 'created').slice(0, 5).map((r) => (
                  <li key={`${r.row}-${r.name}`}>Row {r.row} {r.name}: {r.error}</li>
                ))}
              </ul>
              <button onClick={downloadFailed} className="mt-2 text-xs text-red-700 underline">Download the list (.csv)</button>
            </div>
          )}

          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
