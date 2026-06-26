import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { FileText, Eye, CheckCircle, Send, RefreshCw, Download, Layers } from 'lucide-react';

const mockReports = [
  { id: 1, student: 'Ama Mensah', studentNo: 'STU/001', className: 'JHS1 A', term: 'Term 1, 2025', status: 'RELEASED', average: 78 },
  { id: 2, student: 'Kofi Boateng', studentNo: 'STU/002', className: 'JHS1 A', term: 'Term 1, 2025', status: 'APPROVED', average: 82 },
  { id: 3, student: 'Akua Sarpong', studentNo: 'STU/003', className: 'JHS1 A', term: 'Term 1, 2025', status: 'DRAFT', average: 74 },
  { id: 4, student: 'Kwame Asante', studentNo: 'STU/004', className: 'JHS1 A', term: 'Term 1, 2025', status: 'DRAFT', average: 91 },
  { id: 5, student: 'Abena Osei', studentNo: 'STU/005', className: 'JHS1 A', term: 'Term 1, 2025', status: 'APPROVED', average: 68 },
];

const statusVariant = { DRAFT: 'default', APPROVED: 'warning', RELEASED: 'success' };

function ActionButton({ icon: Icon, label, onClick, variant = 'gray' }) {
  const colors = {
    gray: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100',
    indigo: 'text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50',
    green: 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50',
    amber: 'text-amber-600 hover:text-amber-700 hover:bg-amber-50',
  };
  return (
    <button
      onClick={onClick}
      title={label}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${colors[variant]}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export default function Reports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewModal, setPreviewModal] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    setTimeout(() => { setData(mockReports); setLoading(false); }, 600);
  }, []);

  const toggleRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll = () => setSelectedRows(selectedRows.length === data.length ? [] : data.map(r => r.id));

  const handleAction = (action, student) => {
    const messages = {
      approve: `Report for ${student} approved`,
      release: `Report for ${student} released`,
      email: `Report card emailed to ${student}'s guardian`,
      regenerate: `Report for ${student} regenerated`,
    };
    addToast(messages[action] || 'Action completed', 'success');
    if (action === 'approve' || action === 'release') {
      setData(prev => prev.map(r => r.student === student
        ? { ...r, status: action === 'approve' ? 'APPROVED' : 'RELEASED' }
        : r
      ));
    }
  };

  const handleBulkRelease = () => {
    addToast(`${selectedRows.length} reports released`, 'success');
    setData(prev => prev.map(r => selectedRows.includes(r.id) ? { ...r, status: 'RELEASED' } : r));
    setSelectedRows([]);
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
              <Button variant="secondary" onClick={handleBulkRelease} icon={Layers}>
                Release {selectedRows.length} Selected
              </Button>
            )}
            <Button icon={FileText} onClick={() => addToast('Reports generated', 'success')}>Generate Reports</Button>
          </div>
        }
      />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Reports', val: stats.total, color: 'text-gray-900 bg-white' },
          { label: 'Draft', val: stats.draft, color: 'text-gray-600 bg-gray-50 border-gray-200' },
          { label: 'Approved', val: stats.approved, color: 'text-amber-700 bg-amber-50 border-amber-200' },
          { label: 'Released', val: stats.released, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
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
          <Select label="" options={[{ value: 'jhs1a', label: 'JHS1 A' }]} placeholder="All Classes" className="w-40" />
          <Select label="" options={[{ value: 't1', label: 'Term 1, 2025' }]} placeholder="All Terms" className="w-40" />
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" icon={Download} onClick={() => addToast('Downloading ZIP...', 'info')}>
              Download ZIP
            </Button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}
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
                    <td className="px-4 py-3.5 text-sm font-medium text-gray-900 whitespace-nowrap">{row.student}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{row.studentNo}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.className}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-700">{row.term}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">{row.average}%</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={statusVariant[row.status] || 'default'}>{row.status}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-0.5 flex-wrap">
                        <ActionButton icon={Eye} label="Preview" onClick={() => setPreviewModal(row)} variant="indigo" />
                        {row.status === 'DRAFT' && (
                          <ActionButton icon={CheckCircle} label="Approve" onClick={() => handleAction('approve', row.student)} variant="green" />
                        )}
                        {row.status === 'APPROVED' && (
                          <ActionButton icon={Send} label="Release" onClick={() => handleAction('release', row.student)} variant="green" />
                        )}
                        <ActionButton icon={RefreshCw} label="Regen" onClick={() => handleAction('regenerate', row.student)} variant="amber" />
                        {row.status === 'RELEASED' && (
                          <ActionButton icon={Send} label="Email" onClick={() => handleAction('email', row.student)} variant="indigo" />
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
      <Modal isOpen={!!previewModal} onClose={() => setPreviewModal(null)} title={`Report Preview — ${previewModal?.student}`}>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 min-h-48 text-center">
          <FileText className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-700">Report Card Preview</p>
          <p className="text-xs text-gray-500 mt-1">{previewModal?.student} • {previewModal?.term} • Average: {previewModal?.average}%</p>
          <p className="text-xs text-gray-400 mt-4">In production, this would render the PDF report in an iframe.</p>
        </div>
      </Modal>
    </div>
  );
}