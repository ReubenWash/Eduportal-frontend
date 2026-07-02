import { useState, useMemo, useEffect } from 'react';
import {
  Search, CheckCircle, XCircle, Clock, Eye, School,
  MapPin, Mail, Phone, Users, CalendarDays, ChevronDown, Filter,
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { getAllSchools, updateSchoolStatus as apiUpdateSchoolStatus } from '../../api/schoolApi';

// Mock school data
const MOCK_SCHOOLS = [
  { id: '1', name: 'Sunshine Academy',      email: 'admin@sunshine.edu.gh',    phone: '+233 24 111 1111', location: 'Accra, Greater Accra',   students: 842,  status: 'ACTIVE',   registeredAt: '2024-01-15', plan: 'Premium' },
  { id: '2', name: 'Hilltop School',        email: 'admin@hilltop.edu.gh',      phone: '+233 20 222 2222', location: 'Kumasi, Ashanti',          students: 0,    status: 'PENDING',  registeredAt: '2024-06-22', plan: 'Basic'   },
  { id: '3', name: 'East Bay College',      email: 'info@eastbay.edu.gh',       phone: '+233 27 333 3333', location: 'Takoradi, Western',        students: 0,    status: 'REJECTED', registeredAt: '2024-06-18', plan: 'Basic'   },
  { id: '4', name: 'Riverside JHS',         email: 'admin@riverside.edu.gh',    phone: '+233 26 444 4444', location: 'Tamale, Northern',         students: 512,  status: 'ACTIVE',   registeredAt: '2024-03-01', plan: 'Standard'},
  { id: '5', name: 'Lakewood Academy',      email: 'contact@lakewood.edu.gh',   phone: '+233 55 555 5555', location: 'Cape Coast, Central',      students: 0,    status: 'PENDING',  registeredAt: '2024-06-21', plan: 'Premium' },
  { id: '6', name: 'Golden Gate School',    email: 'info@goldengate.edu.gh',    phone: '+233 24 666 6666', location: 'Accra, Greater Accra',     students: 1203, status: 'ACTIVE',   registeredAt: '2023-09-10', plan: 'Premium' },
  { id: '7', name: 'Star of the Sea Academy',email: 'admin@startsea.edu.gh',   phone: '+233 20 777 7777', location: 'Tema, Greater Accra',      students: 389,  status: 'ACTIVE',   registeredAt: '2024-02-14', plan: 'Standard'},
  { id: '8', name: 'Crystal Springs JHS',   email: 'crystal@springs.edu.gh',    phone: '+233 27 888 8888', location: 'Sunyani, Bono',            students: 0,    status: 'PENDING',  registeredAt: '2024-06-20', plan: 'Basic'   },
];

const statusVariant = { ACTIVE: 'success', PENDING: 'warning', REJECTED: 'danger', SUSPENDED: 'danger' };
const statusIcon = {
  ACTIVE:   <CheckCircle className="h-4 w-4 text-emerald-500" />,
  PENDING:  <Clock className="h-4 w-4 text-amber-500" />,
  REJECTED: <XCircle className="h-4 w-4 text-red-500" />,
  SUSPENDED: <XCircle className="h-4 w-4 text-red-500" />,
};

export default function AdminSchools() {
  const { addToast } = useToast();
  const [schools, setSchools] = useState(MOCK_SCHOOLS);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewSchool, setViewSchool] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    getAllSchools()
      .then(data => {
        const fetchedSchools = (data.data || data).map(s => ({
          ...s,
          location: s.district && s.region ? `${s.district}, ${s.region}` : s.address || 'Unknown',
          students: s._count?.students || 0,
          registeredAt: s.createdAt || new Date().toISOString()
        }));
        setSchools(fetchedSchools);
      })
      .catch(err => {
        console.warn("Schools fetch/parse error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => schools.filter(s => {
    if (keyword && !s.name.toLowerCase().includes(keyword.toLowerCase()) && !s.email.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  }), [schools, keyword, statusFilter]);

  const counts = {
    ALL:      schools.length,
    ACTIVE:   schools.filter(s => s.status === 'ACTIVE').length,
    PENDING:  schools.filter(s => s.status === 'PENDING').length,
    REJECTED: schools.filter(s => s.status === 'REJECTED').length,
  };

  const applyAction = async (school, action) => {
    const newStatus = action === 'approve' ? 'ACTIVE' : action === 'reject' ? 'REJECTED' : 'SUSPENDED';
    try {
      await apiUpdateSchoolStatus(school.id, newStatus);
      setSchools(prev => prev.map(s => s.id === school.id ? { ...s, status: newStatus } : s));
      addToast(`${school.name} status updated successfully`, 'success');
    } catch (err) {
      console.warn("Backend update failed, applying locally", err);
      setSchools(prev => prev.map(s => s.id === school.id ? { ...s, status: newStatus } : s));
      addToast(`(Mock) ${school.name} status updated`, 'success');
    } finally {
      setConfirmAction(null);
      setViewSchool(null);
    }
  };

  const tabs = ['ALL', 'PENDING', 'ACTIVE', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">School Management</h1>
        <p className="text-sm text-gray-500 mt-1">Review registrations, approve or reject schools, and manage their access.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab === 'ALL' ? '' : tab)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              (tab === 'ALL' && !statusFilter) || statusFilter === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'ALL' ? 'All Schools' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            <span className="ml-2 text-xs bg-gray-200 text-gray-600 rounded-full px-1.5 py-0.5">
              {counts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search schools by name or email..."
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <div className="sm:ml-auto text-sm text-gray-500 font-medium">{filtered.length} school{filtered.length !== 1 ? 's' : ''}</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                {['School', 'Location', 'Plan', 'Students', 'Registered', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-sm text-gray-400">No schools match your search.</td>
                </tr>
              ) : filtered.map(school => (
                <tr key={school.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0">
                        <School className="h-4 w-4 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{school.name}</p>
                        <p className="text-[11px] text-gray-500">{school.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{school.location}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      school.plan === 'Premium' ? 'bg-indigo-50 text-indigo-700' :
                      school.plan === 'Standard' ? 'bg-violet-50 text-violet-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{school.plan}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{school.students > 0 ? school.students.toLocaleString() : '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(school.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {statusIcon[school.status]}
                      <Badge variant={statusVariant[school.status]}>{school.status}</Badge>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setViewSchool(school)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View Details">
                        <Eye className="h-4 w-4" />
                      </button>
                      {school.status === 'PENDING' && (
                        <>
                          <button onClick={() => setConfirmAction({ school, action: 'approve' })} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Approve">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button onClick={() => setConfirmAction({ school, action: 'reject' })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Reject">
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {school.status === 'ACTIVE' && (
                        <button onClick={() => setConfirmAction({ school, action: 'suspend' })} className="text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors">
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* View School Details Modal */}
      {viewSchool && (
        <Modal isOpen={!!viewSchool} onClose={() => setViewSchool(null)} title={viewSchool.name} subtitle="School registration details">
          <div className="space-y-5 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Status</p>
                <div className="flex items-center gap-1.5">{statusIcon[viewSchool.status]}<Badge variant={statusVariant[viewSchool.status]}>{viewSchool.status}</Badge></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Plan</p>
                <p className="text-sm font-semibold text-gray-900">{viewSchool.plan}</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { icon: Mail,        label: 'Email',      value: viewSchool.email },
                { icon: Phone,       label: 'Phone',      value: viewSchool.phone },
                { icon: MapPin,      label: 'Location',   value: viewSchool.location },
                { icon: Users,       label: 'Students',   value: viewSchool.students > 0 ? `${viewSchool.students.toLocaleString()} enrolled` : 'Not yet active' },
                { icon: CalendarDays,label: 'Registered', value: new Date(viewSchool.registeredAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">{label}</p>
                    <p className="text-sm text-gray-800">{value}</p>
                  </div>
                </div>
              ))}
            </div>
            {viewSchool.status === 'PENDING' && (
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button onClick={() => setConfirmAction({ school: viewSchool, action: 'reject' })} className="flex-1 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                  Reject
                </button>
                <button onClick={() => setConfirmAction({ school: viewSchool, action: 'approve' })} className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-colors">
                  Approve School
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <Modal
          isOpen={!!confirmAction}
          onClose={() => setConfirmAction(null)}
          title={confirmAction.action === 'approve' ? 'Approve School' : confirmAction.action === 'reject' ? 'Reject School' : 'Suspend School'}
          subtitle={confirmAction.school.name}
        >
          <div className="space-y-5 pt-2">
            <div className={`rounded-xl p-4 ${
              confirmAction.action === 'approve' ? 'bg-emerald-50 border border-emerald-200' :
              'bg-red-50 border border-red-200'
            }`}>
              <p className="text-sm text-gray-700">
                {confirmAction.action === 'approve'
                  ? `You are about to approve ${confirmAction.school.name}. They will gain full platform access and can start onboarding their staff and students.`
                  : confirmAction.action === 'reject'
                  ? `You are about to reject ${confirmAction.school.name}. They will be notified and will not be able to access the platform.`
                  : `You are about to suspend ${confirmAction.school.name}. All users in this school will lose access immediately.`}
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmAction(null)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button
                onClick={() => applyAction(confirmAction.school, confirmAction.action)}
                className={`flex-1 py-2 rounded-lg text-white text-sm font-semibold transition-colors ${
                  confirmAction.action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-red-600 hover:bg-red-500'
                }`}
              >
                {confirmAction.action === 'approve' ? 'Yes, Approve' : confirmAction.action === 'reject' ? 'Yes, Reject' : 'Yes, Suspend'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
