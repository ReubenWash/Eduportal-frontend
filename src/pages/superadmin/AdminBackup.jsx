import { Database, HardDrive, Clock, CheckCircle, AlertTriangle, Download, Play, RefreshCw } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';

const BACKUPS = [
  { id: 'BK001', type: 'Full Backup',     size: '2.4 GB',  status: 'SUCCESS', time: '2024-06-24 02:00 AM', auto: true  },
  { id: 'BK002', type: 'Incremental',     size: '128 MB',  status: 'SUCCESS', time: '2024-06-23 02:00 AM', auto: true  },
  { id: 'BK003', type: 'Database Only',   size: '890 MB',  status: 'SUCCESS', time: '2024-06-22 02:00 AM', auto: true  },
  { id: 'BK004', type: 'Full Backup',     size: '2.3 GB',  status: 'FAILED',  time: '2024-06-21 02:00 AM', auto: true  },
  { id: 'BK005', type: 'Manual Backup',   size: '2.1 GB',  status: 'SUCCESS', time: '2024-06-20 10:30 AM', auto: false },
];

export default function AdminBackup() {
  const { addToast } = useToast();
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Backup & Recovery</h1>
          <p className="text-sm text-gray-500 mt-1">Schedule automatic backups, restore from any snapshot, and manage backup storage.</p>
        </div>
        <button onClick={() => addToast('Manual backup started...', 'success')} className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Play className="h-4 w-4" /> Run Backup Now
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Last Backup',       value: '2h ago',  icon: Clock,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Storage Used',      value: '18.4 GB', icon: HardDrive, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Total Snapshots',   value: '42',      icon: Database,  color: 'text-emerald-600',bg: 'bg-emerald-50' },
        ].map(s => { const Icon = s.icon; return (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
            <p className="text-xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        );})}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Backup History</h2></div>
          <div className="divide-y divide-gray-100">
            {BACKUPS.map(b => (
              <div key={b.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  {b.status === 'SUCCESS' ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-red-500" />}
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.type}</p>
                    <p className="text-[11px] text-gray-400">{b.time} · {b.size} · {b.auto ? 'Automatic' : 'Manual'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={b.status === 'SUCCESS' ? 'success' : 'danger'}>{b.status}</Badge>
                  {b.status === 'SUCCESS' && (
                    <button onClick={() => addToast(`Downloading ${b.id}...`, 'success')} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Download className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => addToast(`Restoring from ${b.id}...`, 'success')} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Restore"><RefreshCw className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 h-fit">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Backup Schedule</h2>
          <div className="space-y-4">
            {[
              { label: 'Full Backup',   schedule: 'Weekly - Sunday 2:00 AM',    active: true  },
              { label: 'Incremental',   schedule: 'Daily - 2:00 AM',            active: true  },
              { label: 'Database Only', schedule: 'Every 6 hours',              active: false },
            ].map(s => (
              <div key={s.label} className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-900">{s.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{s.schedule}</p>
                </div>
                <button className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${s.active ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${s.active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
            <div className="pt-3 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Retention Period</label>
              <select className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400">
                <option>30 days</option><option>60 days</option><option>90 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
