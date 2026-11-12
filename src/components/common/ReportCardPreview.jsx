import { useEffect, useState } from 'react';
import { AlertCircle, Download, FileText, LoaderCircle, X } from 'lucide-react';
import { downloadReportPDF, fetchReportPreviewPDF } from '../../api/reportsApi';

export default function ReportCardPreview({ report, title, onClose }) {
  const [pdfUrl, setPdfUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let objectUrl = '';

    setPdfUrl('');
    setError('');
    setLoading(true);

    fetchReportPreviewPDF(report.id)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      })
      .catch(() => {
        if (active) setError('This released report could not be loaded. Please try again or download the PDF.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [report.id]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-2 backdrop-blur-sm sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-slate-100 shadow-2xl"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-sm font-semibold text-slate-900 sm:text-base">{title}</h2>
            <p className="text-xs text-slate-500">Released report card</p>
          </div>
          <button
            type="button"
            onClick={() => downloadReportPDF(report.id)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 sm:text-sm"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download PDF</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report preview"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="relative min-h-0 flex-1 overflow-hidden p-2 sm:p-5">
          {loading && (
            <div className="absolute inset-0 z-10 grid place-items-center text-sm text-slate-500">
              <span className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 shadow-sm">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Loading report card…
              </span>
            </div>
          )}
          {error && (
            <div role="alert" className="mx-auto mt-10 flex max-w-lg items-start gap-3 rounded-xl border border-red-200 bg-white p-5 text-sm text-red-700 shadow-sm">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
          {pdfUrl && (
            <iframe
              title={title}
              src={pdfUrl}
              className="h-full w-full rounded-lg border border-slate-200 bg-white shadow-sm"
            />
          )}
        </div>
      </section>
    </div>
  );
}
