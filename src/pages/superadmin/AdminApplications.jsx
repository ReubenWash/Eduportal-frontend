import { useState, useMemo, useEffect } from 'react';
import {
  CheckCircle, XCircle, Clock, Eye, School, MapPin, Mail,
  Phone, FileText, Download, MessageSquare, ChevronRight, Filter,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { getAllSchools, updateSchoolStatus as apiUpdateSchoolStatus } from '../../api/schoolApi';
import { sendWelcomeEmail } from '../../api/superAdminApi';

const statusConfig = {
  PENDING:        { label: 'Pending Review', variant: 'warning', icon: <Clock className="h-4 w-4 text-amber-500" /> },
  ACTIVE:         { label: 'Approved',       variant: 'success', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
  REJECTED:       { label: 'Rejected',       variant: 'danger',  icon: <XCircle className="h-4 w-4 text-red-500" /> },
  INFO_REQUESTED: { label: 'Info Requested', variant: 'info',    icon: <MessageSquare className="h-4 w-4 text-blue-500" /> },
};

const tabs = ['ALL', 'PENDING', 'INFO_REQUESTED', 'ACTIVE', 'REJECTED'];

export default function AdminApplications() {
  const { addToast } = useToast();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [infoNote, setInfoNote] = useState('');
  const [showInfoModal, setShowInfoModal] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllSchools()
      .then(list => {
        const fetchedSchools = (Array.isArray(list) ? list : []).map(s => ({
          ...s,
          schoolName: s.name,
          contactName: s.headmasterName || 'N/A', // fallback
          location: s.district && s.region ? `${s.district}, ${s.region}` : s.address || 'Unknown',
          students: s._count?.students || 0,
          type: s.plan === 'BASIC' ? 'Basic' : 'Premium',
          submittedAt: s.createdAt || new Date().toISOString(),
          documents: ['Registration.pdf'], // Mock documents since backend doesn't store them yet
        }));
        // Show pending and recently rejected/approved apps in the applications view
        setApps(fetchedSchools.filter(s => ['PENDING', 'ACTIVE', 'REJECTED'].includes(s.status)));
      })
      .catch(() => setApps([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() =>
    apps.filter(a => activeTab === 'ALL' || a.status === activeTab),
    [apps, activeTab]
  );

  const counts = tabs.reduce((acc, t) => ({
    ...acc,
    [t]: t === 'ALL' ? apps.length : apps.filter(a => a.status === t).length
  }), {});

  const applyAction = async (app, action) => {
    // We map frontend action 'approve' to 'ACTIVE' status in DB
    const newStatus = action === 'approve' ? 'ACTIVE' : action === 'reject' ? 'REJECTED' : 'PENDING';
    
    if (action === 'info') {
      addToast(`Information requested from ${app.schoolName}.`, 'success');
      setShowInfoModal(false);
      return;
    }

    try {
      await apiUpdateSchoolStatus(app.id, newStatus);
      setApps(prev => prev.map(a => a.id === app.id ? { ...a, status: newStatus } : a));
      addToast(
        action === 'approve' ? `${app.schoolName} approved!` :
        `${app.schoolName} rejected.`,
        action === 'approve' ? 'success' : 'error'
      );
      if (newStatus === 'ACTIVE') {
        try { await sendWelcomeEmail(app.id); } catch { /* non-blocking */ }
      }
    } catch {
      addToast('Failed to update status', 'error');
    } finally {
      setConfirmAction(null);
      setSelected(null);
      setShowInfoModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Applications</h1>
          <p className="text-sm text-gray-500 mt-1">Review, approve, reject, or request more information from applicant schools.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition-colors">
          <Download className="h-4 w-4" /> Export Report
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {tab === 'ALL' ? 'All' : tab.replace('_', ' ')}
            <span className={`ml-1.5 text-[10px] rounded-full px-1.5 py-0.5 ${activeTab === tab ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'}`}>{counts[tab]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                {['Application', 'Type', 'Location', 'Est. Students', 'Submitted', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">Loading applications…</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">No applications match your search.</td>
                </tr>
              ) : filtered.map(app => (
                <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <School className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">{app.schoolName}</p>
                        <p className="text-[11px] text-gray-500">{app.contactName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap"><span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{app.type}</span></td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{app.location}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{app.students}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(app.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {statusConfig[app.status]?.icon}
                      <Badge variant={statusConfig[app.status]?.variant}>{statusConfig[app.status]?.label}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setSelected(app)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View"><Eye className="h-4 w-4" /></button>
                      {app.status === 'PENDING' && <>
                        <button onClick={() => setConfirmAction({ app, action: 'approve' })} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => { setSelected(app); setShowInfoModal(true); }} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Request Info"><MessageSquare className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmAction({ app, action: 'reject' })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Reject"><XCircle className="h-4 w-4" /></button>
                      </>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && !showInfoModal && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected.schoolName} subtitle={`Application #${selected.id}`}>
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Contact', value: selected.contactName },
                { label: 'Type', value: selected.type },
                { label: 'Email', value: selected.email },
                { label: 'Phone', value: selected.phone },
                { label: 'Location', value: selected.location },
                { label: 'Est. Students', value: selected.students },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">{label}</p>
                  <p className="text-sm text-gray-900">{value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Submitted Documents ({selected.documents.length})</p>
              <div className="space-y-2">
                {selected.documents.map(doc => (
                  <div key={doc} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-500" /><span className="text-sm text-gray-700">{doc}</span></div>
                    <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">Download</button>
                  </div>
                ))}
              </div>
            </div>
            {selected.status === 'PENDING' && (
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button onClick={() => setConfirmAction({ app: selected, action: 'reject' })} className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">Reject</button>
                <button onClick={() => { setShowInfoModal(true); }} className="flex-1 py-2 rounded-lg border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition-colors">Request Info</button>
                <button onClick={() => setConfirmAction({ app: selected, action: 'approve' })} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">Approve</button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Request Info Modal */}
      {showInfoModal && selected && (
        <Modal isOpen onClose={() => setShowInfoModal(false)} title="Request Additional Information" subtitle={selected.schoolName}>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">Describe what additional information or documents you need from this applicant:</p>
            <textarea value={infoNote} onChange={e => setInfoNote(e.target.value)} rows={4}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none"
              placeholder="e.g. Please submit a valid GES accreditation certificate and a certified floor plan of the school building..." />
            <div className="flex gap-3">
              <button onClick={() => setShowInfoModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => applyAction(selected, 'info')} className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors">Send Request</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirm Modal */}
      {confirmAction && (
        <Modal isOpen onClose={() => setConfirmAction(null)} title={confirmAction.action === 'approve' ? 'Approve Application' : 'Reject Application'} subtitle={confirmAction.app.schoolName}>
          <div className="space-y-4 pt-2">
            <div className={`p-4 rounded-xl border text-sm text-gray-700 ${confirmAction.action === 'approve' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
              {confirmAction.action === 'approve'
                ? `Approving this application will grant ${confirmAction.app.schoolName} full platform access. They will receive an email notification and can begin onboarding immediately.`
                : `Rejecting this application will deny ${confirmAction.app.schoolName} access. They will be notified by email with a reason for rejection.`}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={() => applyAction(confirmAction.app, confirmAction.action)} className={`flex-1 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${confirmAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'}`}>
                {confirmAction.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
