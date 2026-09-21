import { useState, useMemo, useRef, useEffect } from 'react';
import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { uploadStudentPhoto } from '../../api/studentsApi';
import { ImagePlus, Loader2, CheckCircle2 } from 'lucide-react';

const CONCURRENCY = 3; // photos uploaded at the same time

// ─── matching a photo to a student by its file name ────────────
// "JHS-2026-0005.jpg"  or  "Acquah Frederick.jpg"  or  "frederick acquah.png"
const squash = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9ɛɔ]/g, '');
const stemOf = (fileName) => fileName.replace(/\.[^.]+$/, '').replace(/\s*\(\d+\)\s*$/, ''); // drop ".jpg" and " (1)"

const buildIndex = (students) => {
  const index = new Map();
  const add = (key, student) => {
    if (!key) return;
    const list = index.get(key) || [];
    if (!list.includes(student)) list.push(student);
    index.set(key, list);
  };
  students.forEach((s) => {
    const first = squash(s.firstName);
    const last = squash(s.lastName);
    const other = squash(s.otherNames);
    add(squash(s.studentNumber || s.studentNo), s);
    add(last + first, s);
    add(first + last, s);
    if (other) {
      add(last + first + other, s);
      add(first + other + last, s);
      add(last + other + first, s);
    }
  });
  return index;
};

// ─── shrink phone photos before uploading (a 6 MB photo becomes ~80 KB) ───
const compressImage = (file, maxSide = 900, quality = 0.86) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (blob) resolve(new File([blob], `${stemOf(file.name) || 'photo'}.jpg`, { type: 'image/jpeg' }));
          else reject(new Error('Could not convert the image.'));
        },
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This image format cannot be read. Save it as JPG or PNG.'));
    };
    img.src = url;
  });

const displayName = (s) => `${s.lastName || ''} ${s.firstName || ''}`.trim().toUpperCase();
const studentLabel = (s) => `${displayName(s)}${s.className ? ` (${s.className})` : ''}`;

const STATUS = {
  ready:     { label: 'Ready',                 variant: 'success' },
  hasPhoto:  { label: 'Has a photo (skipped)', variant: 'warning' },
  duplicate: { label: 'Second photo (skipped)', variant: 'warning' },
  ambiguous: { label: 'Several students match', variant: 'danger' },
  unmatched: { label: 'No match',              variant: 'danger' },
};

export default function BulkPhotosModal({ isOpen, onClose, students = [], onDone }) {
  const { addToast } = useToast();
  const fileInput = useRef(null);
  const [items, setItems] = useState([]);           // [{ id, file, previewUrl, override }]
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [phase, setPhase] = useState('review');     // review | uploading | done
  const [results, setResults] = useState({});       // itemId -> { status: 'done'|'failed', error }
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const nextId = useRef(1);

  const index = useMemo(() => buildIndex(students), [students]);

  // free thumbnails when the modal is closed
  useEffect(() => () => items.forEach((i) => URL.revokeObjectURL(i.previewUrl)), []); // eslint-disable-line

  const addFiles = (fileList) => {
    const images = Array.from(fileList || []).filter((f) => /^image\/(jpeg|png|webp|gif)$/i.test(f.type));
    const skipped = (fileList?.length || 0) - images.length;
    if (skipped > 0) addToast(`${skipped} file${skipped === 1 ? ' is' : 's are'} not JPG, PNG or WebP and was ignored.`, 'warning');
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: nextId.current++, file, previewUrl: URL.createObjectURL(file), override: '' })),
    ]);
  };

  // decide what happens to each photo
  const resolved = useMemo(() => {
    const used = new Set();
    return items.map((item) => {
      let student = null;
      let status;
      if (item.override) {
        student = students.find((s) => s.id === item.override) || null;
      } else {
        const matches = index.get(squash(stemOf(item.file.name))) || [];
        if (matches.length === 1) student = matches[0];
        else if (matches.length > 1) status = 'ambiguous';
      }
      if (!student) status = status || 'unmatched';
      else if (used.has(student.id)) status = 'duplicate';
      else {
        used.add(student.id);
        status = student.photoUrl && !replaceExisting ? 'hasPhoto' : 'ready';
      }
      return { ...item, student, status };
    });
  }, [items, students, index, replaceExisting]);

  const ready = resolved.filter((r) => r.status === 'ready');
  const counts = {
    ready: ready.length,
    skipped: resolved.filter((r) => r.status === 'hasPhoto' || r.status === 'duplicate').length,
    problems: resolved.filter((r) => r.status === 'unmatched' || r.status === 'ambiguous').length,
  };
  const assigned = new Set(resolved.filter((r) => r.student).map((r) => r.student.id));
  const pool = useMemo(
    () => students.filter((s) => !assigned.has(s.id)).sort((a, b) => displayName(a).localeCompare(displayName(b))),
    [students, resolved] // eslint-disable-line
  );

  const remove = (id) => {
    setItems((prev) => {
      const gone = prev.find((i) => i.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const reset = () => {
    items.forEach((i) => URL.revokeObjectURL(i.previewUrl));
    setItems([]);
    setResults({});
    setPhase('review');
    setProgress({ done: 0, total: 0 });
    if (fileInput.current) fileInput.current.value = '';
  };

  const close = () => {
    const changed = Object.values(results).some((r) => r.status === 'done');
    reset();
    onClose();
    if (changed && onDone) onDone();
  };

  // ── upload: a few at a time ──
  const start = async () => {
    const queue = [...ready];
    setPhase('uploading');
    setProgress({ done: 0, total: queue.length });
    let finished = 0;

    const worker = async () => {
      while (queue.length > 0) {
        const job = queue.shift();
        try {
          const small = await compressImage(job.file);
          await uploadStudentPhoto(job.student.id, small);
          setResults((prev) => ({ ...prev, [job.id]: { status: 'done' } }));
        } catch (err) {
          const error = err?.response?.data?.message || err?.message || 'Upload failed';
          setResults((prev) => ({ ...prev, [job.id]: { status: 'failed', error } }));
        }
        finished += 1;
        setProgress((p) => ({ ...p, done: finished }));
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    setPhase('done');
  };

  const doneCount = Object.values(results).filter((r) => r.status === 'done').length;
  const failed = resolved.filter((r) => results[r.id]?.status === 'failed');

  return (
    <Modal
      isOpen={isOpen}
      onClose={phase === 'uploading' ? () => {} : close}
      title="Upload student photos"
      subtitle="Add many passport photos at once. They appear on report cards and student profiles."
      size="xl"
    >
      {phase === 'review' && (
        <div className="space-y-4">
          <div className="rounded-lg bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            <p className="font-medium">Name each photo file after the student</p>
            <p className="mt-1 text-indigo-800/80">
              Use the Student ID (<span className="font-mono">JHS-2026-0005.jpg</span>) or the name
              (<span className="font-mono">Acquah Frederick.jpg</span>). Best photos: passport style, face in the middle, JPG or PNG.
              Photos are matched automatically and you check them before anything is uploaded.
            </p>
          </div>

          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40"
          >
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
            <ImagePlus className="h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">Click to choose photos, or drop them here</p>
            <p className="text-xs text-gray-500">Select many at once (Ctrl + A in the folder)</p>
          </label>

          {items.length > 0 && (
            <>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <span className="text-emerald-700 font-medium">{counts.ready} ready</span>
                {counts.skipped > 0 && <span className="text-amber-700">{counts.skipped} skipped</span>}
                {counts.problems > 0 && <span className="text-red-700">{counts.problems} need a student</span>}
                <label className="ml-auto flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={replaceExisting}
                    onChange={(e) => setReplaceExisting(e.target.checked)}
                  />
                  Replace photos students already have
                </label>
              </div>

              <div className="max-h-80 overflow-auto rounded-lg border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-3 py-2">Photo</th>
                      <th className="px-3 py-2">File</th>
                      <th className="px-3 py-2">Student</th>
                      <th className="px-3 py-2">Check</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {resolved.map((r) => (
                      <tr key={r.id}>
                        <td className="px-3 py-2">
                          <img src={r.previewUrl} alt="" className="h-12 w-10 rounded object-cover border border-gray-200" />
                        </td>
                        <td className="px-3 py-2 text-gray-600 break-all">{r.file.name}</td>
                        <td className="px-3 py-2">
                          {r.student && !r.override ? (
                            <span className="font-medium text-gray-900">{studentLabel(r.student)}</span>
                          ) : (
                            <select
                              value={r.override}
                              onChange={(e) => setItems((prev) => prev.map((i) => (i.id === r.id ? { ...i, override: e.target.value } : i)))}
                              className="max-w-[16rem] rounded-md border border-gray-300 px-2 py-1 text-xs"
                            >
                              <option value="">Choose the student…</option>
                              {r.student && <option value={r.student.id}>{studentLabel(r.student)}</option>}
                              {pool.map((s) => <option key={s.id} value={s.id}>{studentLabel(s)}</option>)}
                            </select>
                          )}
                        </td>
                        <td className="px-3 py-2"><Badge variant={STATUS[r.status].variant}>{STATUS[r.status].label}</Badge></td>
                        <td className="px-3 py-2 text-right">
                          <button onClick={() => remove(r.id)} className="text-xs text-gray-400 hover:text-red-600">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
            <Button variant="secondary" onClick={close}>Cancel</Button>
            <Button onClick={start} disabled={counts.ready === 0}>
              Upload {counts.ready} photo{counts.ready === 1 ? '' : 's'}
            </Button>
          </div>
        </div>
      )}

      {phase === 'uploading' && (
        <div className="py-10 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-500" />
          <p className="mt-4 text-sm font-medium text-gray-900">Uploading photos… {progress.done} of {progress.total}</p>
          <div className="mx-auto mt-4 h-2 max-w-sm overflow-hidden rounded-full bg-gray-100">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
          <p className="mt-3 text-xs text-gray-500">Please keep this window open.</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-500" />
            <div>
              <p className="text-base font-semibold text-gray-900">{doneCount} photo{doneCount === 1 ? '' : 's'} saved</p>
              {failed.length > 0 && <p className="text-sm text-red-600">{failed.length} could not be saved.</p>}
            </div>
          </div>
          {failed.length > 0 && (
            <ul className="list-disc rounded-lg border border-red-200 bg-red-50 py-3 pl-8 pr-4 text-xs text-red-800">
              {failed.slice(0, 8).map((f) => (
                <li key={f.id}>{f.file.name}: {results[f.id].error}</li>
              ))}
            </ul>
          )}
          <div className="flex justify-end border-t border-gray-100 pt-4">
            <Button onClick={close}>Done</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
