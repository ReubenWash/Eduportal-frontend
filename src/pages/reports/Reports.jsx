import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  getReports,
  getReportStats,
  getReportPreview,
  approveReport,
  releaseReport,
  releaseBulkReports,
  sendBulkReportEmails,
  generateReports,
  generateBatchReports,
  regenerateReport,
  getReportDownloadUrl,
  getClassZipDownloadUrl,
  downloadClassZip,
} from '../../api/reportsApi';
import { getClasses } from '../../api/classesApi';
import { getSchoolTerms } from '../../api/schoolApi';
import {
  FileText,
  Eye,
  CheckCircle,
  Send,
  RefreshCw,
  Download,
  Layers,
  Loader2,
  Mail,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

const statusVariant = {
  DRAFT: 'default',
  APPROVED: 'warning',
  RELEASED: 'success',
};

const STATUS_LABELS = {
  DRAFT: 'Draft',
  APPROVED: 'Approved',
  RELEASED: 'Released',
};

function ActionButton({ icon: Icon, label, onClick, variant = 'gray', loading, disabled }) {
  const colors = {
    gray: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    indigo: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
    green: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
    amber: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
    red: 'text-red-600 hover:text-red-700 hover:bg-red-50',
    blue: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${colors[variant]}`}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [previewModal, setPreviewModal] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [bulkReleasing, setBulkReleasing] = useState(false);
  const [emailing, setEmailing] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [generateType, setGenerateType] = useState('single');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, draft: 0, approved: 0, released: 0 });
  const { addToast } = useToast();

  const fetchReports = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const params = {};
      if (classFilter) params.classId = classFilter;
      if (termFilter) params.termId = termFilter;
      const list = await getReports(params);
      setData(Array.isArray(list) ? list : []);
      
      if (termFilter) {
        const statsRes = await getReportStats(termFilter);
        setStats(statsRes || { total: 0, draft: 0, approved: 0, released: 0 });
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setLoadError(true);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [classList, termList] = await Promise.all([
        getClasses(),
        getSchoolTerms(),
      ]);
      setClasses(Array.isArray(classList) ? classList : []);
      setTerms(Array.isArray(termList) ? termList : []);
    } catch (err) {
      console.error('Failed to fetch filters:', err);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchReports();
  }, [classFilter, termFilter]);

  const setRowLoading = (id, val) =>
    setActionLoading((prev) => ({ ...prev, [id]: val }));

  const toggleRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const toggleAll = () =>
    setSelectedRows(selectedRows.length === data.length ? [] : data.map((r) => r.id));

  // ─── HANDLE APPROVE ───
  const handleApprove = async (row) => {
    setRowLoading(row.id, true);
    try {
      // First, ensure PDF is generated
      if (!row.pdfUrl) {
        addToast('Generating PDF before approval...', 'info');
        const regenResult = await regenerateReport(row.id);
        // Update the row with new PDF URL
        setData((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, pdfUrl: regenResult.pdfUrl } : r
          )
        );
        row.pdfUrl = regenResult.pdfUrl;
      }

      // Now approve the report
      const result = await approveReport(row.id);
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, status: 'APPROVED', ...result } : r
        )
      );
      addToast(`Report for ${getStudentName(row)} approved! You can now release it.`, 'success');
      await fetchReports();
    } catch (err) {
      console.error('Approve error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      addToast(`Failed to approve report: ${errorMsg}`, 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  // ─── HANDLE RELEASE ───
  const handleRelease = async (row) => {
    setRowLoading(row.id, true);
    try {
      // Check if report has PDF generated
      if (!row.pdfUrl) {
        addToast('PDF not generated yet. Regenerating...', 'info');
        const regenResult = await regenerateReport(row.id);
        setData((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, pdfUrl: regenResult.pdfUrl } : r
          )
        );
        row.pdfUrl = regenResult.pdfUrl;
        addToast('PDF regenerated successfully!', 'success');
      }

      // Check if report is approved
      if (row.status !== 'APPROVED') {
        addToast('Report must be approved before releasing. Approving now...', 'info');
        await approveReport(row.id);
        setData((prev) =>
          prev.map((r) =>
            r.id === row.id ? { ...r, status: 'APPROVED' } : r
          )
        );
        row.status = 'APPROVED';
      }

      // Now release the report
      const result = await releaseReport(row.id);
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, status: 'RELEASED', ...result } : r
        )
      );
      addToast(`Report for ${getStudentName(row)} released successfully!`, 'success');
      await fetchReports();
    } catch (err) {
      console.error('Release error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      
      if (errorMsg.includes('PDF has not been generated')) {
        addToast('Please regenerate the PDF before releasing.', 'error');
      } else if (errorMsg.includes('Only APPROVED reports can be released')) {
        addToast('Please approve the report first.', 'warning');
      } else if (errorMsg.includes('already released')) {
        addToast('This report is already released.', 'info');
      } else {
        addToast(`Failed to release report: ${errorMsg}`, 'error');
      }
    } finally {
      setRowLoading(row.id, false);
    }
  };

  // ─── REGENERATE & RELEASE ───
  const handleRegenerateAndRelease = async (row) => {
    setRowLoading(row.id, true);
    try {
      // 1. Regenerate PDF
      addToast('Generating PDF...', 'info');
      const regenResult = await regenerateReport(row.id);
      
      // 2. Approve the report (if not already approved)
      if (row.status !== 'APPROVED') {
        addToast('Approving report...', 'info');
        await approveReport(row.id);
      }
      
      // 3. Release the report
      addToast('Releasing report...', 'info');
      const releaseResult = await releaseReport(row.id);
      
      // Update the row
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { 
            ...r, 
            status: 'RELEASED', 
            pdfUrl: regenResult.pdfUrl,
            ...releaseResult 
          } : r
        )
      );
      addToast(`Report for ${getStudentName(row)} released successfully!`, 'success');
      await fetchReports();
    } catch (err) {
      console.error('Regenerate and release error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      addToast(`Failed: ${errorMsg}`, 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  const handleEmail = async (row) => {
    setRowLoading(row.id, true);
    try {
      await sendBulkReportEmails({
        termId: row.termId,
        studentId: row.studentId,
      });
      addToast(`Report emailed to ${getStudentName(row)}'s guardian`, 'success');
    } catch (err) {
      console.error('Email error:', err);
      addToast('Failed to send email', 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  const handleRegen = async (row) => {
    setRowLoading(row.id, true);
    try {
      const result = await regenerateReport(row.id);
      setData((prev) =>
        prev.map((r) =>
          r.id === row.id ? { ...r, pdfUrl: result.pdfUrl } : r
        )
      );
      addToast(`Report for ${getStudentName(row)} regenerated`, 'success');
    } catch (err) {
      console.error('Regenerate error:', err);
      addToast('Failed to regenerate report', 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  const handleBulkRelease = async () => {
    if (selectedRows.length === 0) {
      addToast('No reports selected', 'warning');
      return;
    }

    setBulkReleasing(true);
    try {
      const result = await releaseBulkReports({ ids: selectedRows });
      setData((prev) =>
        prev.map((r) =>
          selectedRows.includes(r.id) ? { ...r, status: 'RELEASED' } : r
        )
      );
      addToast(`${selectedRows.length} reports released successfully`, 'success');
      setSelectedRows([]);
    } catch (err) {
      console.error('Bulk release error:', err);
      addToast('Bulk release failed. Make sure all selected reports are approved and have PDFs.', 'error');
    } finally {
      setBulkReleasing(false);
    }
  };

  const handleBulkEmail = async () => {
    if (!termFilter || !classFilter) {
      addToast('Please select both term and class', 'warning');
      return;
    }

    setEmailing(true);
    try {
      const result = await sendBulkReportEmails({
        termId: termFilter,
        classId: classFilter,
      });
      addToast(`${result.sent || 0} emails sent, ${result.failed || 0} failed.`, 'success');
      setShowEmailModal(false);
    } catch (err) {
      console.error('Bulk email error:', err);
      addToast('Failed to send emails', 'error');
    } finally {
      setEmailing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      let result;
      if (generateType === 'single' && selectedStudent) {
        result = await generateReports({
          termId: termFilter,
          studentId: selectedStudent,
        });
      } else if (generateType === 'batch' && selectedClasses.length > 0) {
        result = await generateBatchReports({
          termId: termFilter,
          classIds: selectedClasses,
        });
      } else {
        addToast('Please select a student or class(es)', 'warning');
        setGenerating(false);
        return;
      }

      const count = result?.generated || 0;
      addToast(`${count} report${count !== 1 ? 's' : ''} generated successfully!`, 'success');
      setShowGenerateModal(false);
      setSelectedClasses([]);
      await fetchReports();
    } catch (err) {
      console.error('Generate error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      
      if (errorMsg.includes('No students enrolled')) {
        addToast('No students enrolled in this class for the selected term.', 'error');
      } else {
        addToast(`Failed to generate reports: ${errorMsg}`, 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadClassZip = async () => {
    if (!classFilter || !termFilter) {
      addToast('Please select both class and term', 'warning');
      return;
    }

    try {
      const blob = await downloadClassZip(classFilter, termFilter);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reports-class-${classFilter}-term-${termFilter}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast('ZIP download started', 'success');
    } catch (err) {
      console.error('Download ZIP error:', err);
      const errorMsg = err.response?.data?.message || err.message;
      
      if (errorMsg.includes('No students enrolled')) {
        addToast('No students enrolled in this class for the selected term.', 'error');
      } else {
        addToast(`Failed to download ZIP: ${errorMsg}`, 'error');
      }
    }
  };

  const getStudentName = (row) => {
    if (row.studentName) return row.studentName;
    if (row.student?.firstName) return `${row.student.firstName} ${row.student.lastName}`;
    if (row.student) return row.student;
    return '—';
  };

  const getStudentNo = (row) => {
    if (row.studentNo) return row.studentNo;
    if (row.student?.studentNumber) return row.student.studentNumber;
    return '—';
  };

  const getClass = (row) => {
    if (row.className) return row.className;
    if (row.class?.name) return row.class.name;
    if (row.class) return row.class;
    return '—';
  };

  const getTerm = (row) => {
    if (row.termName) return row.termName;
    if (row.term?.academicYear && row.term?.termNumber) {
      return `${row.term.academicYear} - ${row.term.termNumber}`;
    }
    return '—';
  };

  const getAvg = (row) => {
    if (row.average !== undefined && row.average !== null) return row.average;
    if (row.avg !== undefined && row.avg !== null) return row.avg;
    if (row.aggregate !== undefined && row.aggregate !== null) return row.aggregate;
    return '—';
  };

  const getAvgColor = (avg) => {
    if (avg === '—') return 'text-gray-400';
    if (avg >= 70) return 'text-emerald-600';
    if (avg >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getAvgIcon = (avg) => {
    if (avg === '—') return <Minus className="h-4 w-4" />;
    if (avg >= 70) return <TrendingUp className="h-4 w-4" />;
    if (avg >= 50) return <Minus className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate, approve and release student report cards"
        action={
          <div className="flex flex-wrap items-center gap-2">
            {selectedRows.length > 0 && (
              <Button
                variant="secondary"
                onClick={handleBulkRelease}
                icon={Layers}
                loading={bulkReleasing}
                disabled={bulkReleasing}
              >
                Release {selectedRows.length} Selected
              </Button>
            )}
            <Button
              variant="secondary"
              icon={Mail}
              onClick={() => setShowEmailModal(true)}
            >
              Email Reports
            </Button>
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownloadClassZip}
            >
              Download ZIP
            </Button>
            <Button
              icon={FileText}
              onClick={() => setShowGenerateModal(true)}
              loading={generating}
              disabled={generating}
            >
              Generate Reports
            </Button>
          </div>
        }
      />

      {loadError && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-5">
          Couldn't load reports from the server. Check your connection and try again.
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Reports', val: stats.total, color: 'text-gray-900 bg-white' },
          { label: 'Draft', val: stats.draft, color: 'text-gray-600 bg-gray-50 border-gray-200' },
          { label: 'Approved', val: stats.approved, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Released', val: stats.released, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-4 ${s.color} shadow-sm`}
          >
            <p className="text-2xl font-bold">{s.val}</p>
            <p className="text-xs font-medium mt-0.5 opacity-70">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 p-4 border-b border-gray-200">
          <Select
            label=""
            options={classes.map((c) => ({
              value: c.id,
              label: `${c.level} ${c.section}`,
            }))}
            placeholder="All Classes"
            className="w-40"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
          <Select
            label=""
            options={terms.map((t) => ({
              value: t.id,
              label: `${t.academicYear} - ${t.termNumber}`,
            }))}
            placeholder="All Terms"
            className="w-48"
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={RefreshCw}
              onClick={fetchReports}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <FileText className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            No reports found. Generate reports to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selectedRows.length === data.length && data.length > 0}
                      onChange={toggleAll}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  {['Student', 'Student No.', 'Class', 'Term', 'Average', 'Status', 'Actions'].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((row) => {
                  const avg = getAvg(row);
                  const avgColor = getAvgColor(avg);
                  const avgIcon = getAvgIcon(avg);
                  return (
                    <tr
                      key={row.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        selectedRows.includes(row.id) ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="px-4 py-3.5">
                        <input
                          type="checkbox"
                          checked={selectedRows.includes(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">
                        {getStudentName(row)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-gray-500">
                        {getStudentNo(row)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {getClass(row)}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-gray-700">
                        {getTerm(row)}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className={`flex items-center gap-1 text-sm font-semibold ${avgColor}`}>
                          {avgIcon}
                          {avg !== '—' ? `${avg}%` : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={statusVariant[row.status] || 'default'}>
                          {STATUS_LABELS[row.status] || row.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-0.5 flex-wrap">
                          <ActionButton
                            icon={Eye}
                            label="Preview"
                            onClick={() => setPreviewModal(row)}
                            variant="indigo"
                            loading={!!actionLoading[row.id]}
                          />
                          {row.status === 'DRAFT' && (
                            <ActionButton
                              icon={CheckCircle}
                              label="Approve"
                              onClick={() => handleApprove(row)}
                              variant="green"
                              loading={!!actionLoading[row.id]}
                            />
                          )}
                          {row.status === 'APPROVED' && row.pdfUrl && (
                            <ActionButton
                              icon={Send}
                              label="Release"
                              onClick={() => handleRelease(row)}
                              variant="green"
                              loading={!!actionLoading[row.id]}
                            />
                          )}
                          {row.status === 'APPROVED' && !row.pdfUrl && (
                            <ActionButton
                              icon={RefreshCw}
                              label="Regen & Release"
                              onClick={() => handleRegenerateAndRelease(row)}
                              variant="green"
                              loading={!!actionLoading[row.id]}
                            />
                          )}
                          <ActionButton
                            icon={RefreshCw}
                            label="Regen"
                            onClick={() => handleRegen(row)}
                            variant="amber"
                            loading={!!actionLoading[row.id]}
                          />
                          {row.status === 'RELEASED' && (
                            <>
                              <ActionButton
                                icon={Mail}
                                label="Email"
                                onClick={() => handleEmail(row)}
                                variant="blue"
                                loading={!!actionLoading[row.id]}
                              />
                              <a
                                href={getReportDownloadUrl(row.id)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                              >
                                <Download className="h-3.5 w-3.5" /> PDF
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={!!previewModal}
        onClose={() => setPreviewModal(null)}
        title={`Report Preview — ${getStudentName(previewModal || {})}`}
      >
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 min-h-48 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">Report Card Preview</p>
          <p className="text-xs text-gray-500 mt-1">
            {getStudentName(previewModal || {})} • {getTerm(previewModal || {})} • Average:{' '}
            {getAvg(previewModal || {})}%
          </p>
          {previewModal && previewModal.status === 'RELEASED' && (
            <a
              href={getReportDownloadUrl(previewModal.id)}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <Download className="h-4 w-4" /> Download PDF
            </a>
          )}
          {previewModal && previewModal.status !== 'RELEASED' && (
            <p className="mt-4 text-xs text-amber-600">
              Preview available only for released reports.
            </p>
          )}
        </div>
      </Modal>

      {/* Generate Reports Modal */}
      {showGenerateModal && (
        <Modal
          isOpen={showGenerateModal}
          onClose={() => {
            setShowGenerateModal(false);
            setSelectedClasses([]);
          }}
          title="Generate Reports"
        >
          <div className="space-y-4 pt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Reports will be generated in DRAFT status.
              </p>
            </div>

            <Select
              label="Term"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              options={terms.map((t) => ({
                value: t.id,
                label: `${t.termNumber} - ${t.academicYear}`,
              }))}
              placeholder="Select Term"
              required
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="single"
                  checked={generateType === 'single'}
                  onChange={(e) => setGenerateType(e.target.value)}
                />
                Single Student
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  value="batch"
                  checked={generateType === 'batch'}
                  onChange={(e) => setGenerateType(e.target.value)}
                />
                Batch (Class)
              </label>
            </div>

            {generateType === 'single' ? (
              <Select
                label="Student"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                options={students.map((s) => ({
                  value: s.id,
                  label: `${s.firstName} ${s.lastName} (${s.studentNumber})`,
                }))}
                placeholder="Select Student"
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Classes
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                  {classes.map((c) => (
                    <label key={c.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedClasses.includes(c.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedClasses([...selectedClasses, c.id]);
                          } else {
                            setSelectedClasses(
                              selectedClasses.filter((id) => id !== c.id)
                            );
                          }
                        }}
                      />
                      <span className="text-sm">
                        {c.level} {c.section}
                      </span>
                    </label>
                  ))}
                </div>
                {selectedClasses.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedClasses.length} class(es) selected
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowGenerateModal(false);
                  setSelectedClasses([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={
                  generating ||
                  !termFilter ||
                  (generateType === 'single' && !selectedStudent) ||
                  (generateType === 'batch' && selectedClasses.length === 0)
                }
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Generate {generateType === 'batch' ? 'Reports' : 'Report'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Email Reports Modal */}
      {showEmailModal && (
        <Modal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          title="Email Reports to Parents"
        >
          <div className="space-y-4 pt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Reports will be emailed to parents with valid email addresses.
              </p>
            </div>
            <Select
              label="Term"
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              options={terms.map((t) => ({
                value: t.id,
                label: `${t.termNumber} - ${t.academicYear}`,
              }))}
              placeholder="Select Term"
              required
            />
            <Select
              label="Class"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              options={classes.map((c) => ({
                value: c.id,
                label: `${c.level} ${c.section}`,
              }))}
              placeholder="Select Class"
              required
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEmailModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleBulkEmail}
                disabled={emailing || !termFilter || !classFilter}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {emailing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {emailing ? 'Sending...' : 'Send Emails'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}