import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  getReports, approveReport, releaseReport, releaseBulkReports,
  sendReportEmail, generateReports, regenerateReport, getReportDownloadUrl,
} from '../../api/reportsApi';
import { getClasses } from '../../api/classesApi';
import { getSchoolTerms } from '../../api/schoolApi';
import { FileText, Eye, CheckCircle, Send, RefreshCw, Download, Layers, Loader2 } from 'lucide-react';

const statusVariant = { DRAFT: 'default', APPROVED: 'warning', RELEASED: 'success' };

function ActionButton({ icon: Icon, label, onClick, variant = 'gray', loading }) {
  const colors = {
    gray: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    indigo: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
    green: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
    amber: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
    red: 'text-red-600 hover:text-red-700 hover:bg-red-50',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors disabled:opacity-50 ${colors[variant]}`}
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
        getSchoolTerms()
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
    setActionLoading(prev => ({ ...prev, [id]: val }));

  const toggleRow = (id) => setSelectedRows(prev =>
    prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  
  const toggleAll = () =>
    setSelectedRows(selectedRows.length === data.length ? [] : data.map(r => r.id));

  const handleApprove = async (row) => {
    setRowLoading(row.id, true);
    try {
      const result = await approveReport(row.id);
      setData(prev => prev.map(r => r.id === row.id ? { ...r, status: 'APPROVED', ...result } : r));
      addToast(`Report for ${getStudentName(row)} approved`, 'success');
    } catch (err) {
      console.error('Approve error:', err);
      addToast('Failed to approve report', 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  const handleRelease = async (row) => {
    setRowLoading(row.id, true);
    try {
      const result = await releaseReport(row.id);
      setData(prev => prev.map(r => r.id === row.id ? { ...r, status: 'RELEASED', ...result } : r));
      addToast(`Report for ${getStudentName(row)} released`, 'success');
    } catch (err) {
      console.error('Release error:', err);
      addToast('Failed to release report', 'error');
    } finally {
      setRowLoading(row.id, false);
    }
  };

  const handleEmail = async (row) => {
    setRowLoading(row.id, true);
    try {
      await sendReportEmail(row.id, {});
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
      setData(prev => prev.map(r => r.id === row.id ? { ...r, pdfUrl: result.pdfUrl } : r));
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
      setData(prev => prev.map(r => 
        selectedRows.includes(r.id) ? { ...r, status: 'RELEASED' } : r
      ));
      addToast(`${selectedRows.length} reports released successfully`, 'success');
      setSelectedRows([]);
    } catch (err) {
      console.error('Bulk release error:', err);
      addToast('Bulk release failed', 'error');
    } finally {
      setBulkReleasing(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = await generateReports({
        termId: termFilter || undefined,
        classId: classFilter || undefined,
      });
      const count = result?.generated || result?.count || result?.length || 0;
      addToast(`Reports generated${count ? ` (${count})` : ''}`, 'success');
      await fetchReports();
    } catch (err) {
      console.error('Generate error:', err);
      addToast('Failed to generate reports', 'error');
    } finally {
      setGenerating(false);
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

  const stats = {
    total: data.length,
    draft: data.filter(r => r.status === 'DRAFT').length,
    approved: data.filter(r => r.status === 'APPROVED').length,
    released: data.filter(r => r.status === 'RELEASED').length,
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Generate, approve and release student report cards"
        action={
          <div className="flex items-center gap-2">
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
              icon={FileText} 
              onClick={handleGenerate}
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
          { label: 'Draft',         val: stats.draft,     color: 'text-gray-600 bg-gray-50 border-gray-200' },
          { label: 'Approved',      val: stats.approved,  color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Released',      val: stats.released,  color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color} shadow-sm`}>
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
            options={classes.map(c => ({ value: c.id, label: c.name }))}
            placeholder="All Classes"
            className="w-40"
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
          />
          <Select
            label=""
            options={terms.map(t => ({ 
              value: t.id, 
              label: `${t.academicYear} - ${t.termNumber}` 
            }))}
            placeholder="All Terms"
            className="w-48"
            value={termFilter}
            onChange={e => setTermFilter(e.target.value)}
          />
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Download}
              onClick={() => addToast('Downloading ZIP...', 'info')}
            >
              Download ZIP
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
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
                  {['Student', 'Student No.', 'Class', 'Term', 'Average', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {data.map((row) => (
                  <tr key={row.id} className={`hover:bg-gray-50/80 transition-colors ${selectedRows.includes(row.id) ? 'bg-indigo-50/50' : ''}`}>
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(row.id)}
                        onChange={() => toggleRow(row.id)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{getStudentName(row)}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{getStudentNo(row)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{getClass(row)}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{getTerm(row)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">
                      {getAvg(row) !== '—' ? `${getAvg(row)}%` : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
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
                        {row.status === 'APPROVED' && (
                          <ActionButton 
                            icon={Send} 
                            label="Release" 
                            onClick={() => handleRelease(row)} 
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
                              icon={Send} 
                              label="Email" 
                              onClick={() => handleEmail(row)} 
                              variant="indigo" 
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title={`Report Preview — ${getStudentName(previewModal || {})}`}>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 min-h-48 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">Report Card Preview</p>
          <p className="text-xs text-gray-500 mt-1">
            {getStudentName(previewModal || {})} • {getTerm(previewModal || {})} • Average: {getAvg(previewModal || {})}%
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
            <p className="mt-4 text-xs text-amber-600">Preview available only for released reports.</p>
          )}
        </div>
      </Modal>
    </div>
  );
}