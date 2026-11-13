import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { Database, Download, Upload, RefreshCw, CheckCircle2, Clock, ShieldCheck, AlertTriangle } from 'lucide-react';

const mockBackups = [
  {
    id: 'BKP-2026-05-14',
    name: 'Weekly Automated System Snapshot',
    date: '2026-05-14 02:00 AM',
    size: '18.4 MB',
    type: 'AUTOMATED',
    status: 'HEALTHY',
  },
  {
    id: 'BKP-2026-05-07',
    name: 'Weekly Automated System Snapshot',
    date: '2026-05-07 02:00 AM',
    size: '17.9 MB',
    type: 'AUTOMATED',
    status: 'HEALTHY',
  },
  {
    id: 'BKP-2026-04-30',
    name: 'Manual Term 1 Pre-exam Archive',
    date: '2026-04-30 05:30 PM',
    size: '17.2 MB',
    type: 'MANUAL',
    status: 'HEALTHY',
  },
];

export default function BackupRestorePage() {
  const [backups, setBackups] = useState(mockBackups);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useToast();

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      const newBackup = {
        id: `BKP-${new Date().toISOString().slice(0, 10)}`,
        name: 'Manual Full School Archive',
        date: new Date().toLocaleString(),
        size: '18.6 MB',
        type: 'MANUAL',
        status: 'HEALTHY',
      };
      setBackups([newBackup, ...backups]);
      addToast('School backup archive successfully generated and downloaded.', 'success');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Backup & Data Recovery"
          subtitle="Generate point-in-time archives of student records, financial ledgers, and academic marks."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" /> Restore From Archive
          </Button>
          <Button variant="primary" className="gap-2" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isExporting ? 'Generating Archive...' : 'Create Backup Snapshot'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Automated Backup Cadence</p>
          <p className="text-xl font-bold text-gray-900 mt-1">Every Sunday at 2:00 AM</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">Encrypted in-region storage</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Successful Snapshot</p>
          <p className="text-xl font-bold text-gray-900 mt-1">May 14, 2026</p>
          <p className="text-xs text-gray-500 mt-1">Size: 18.4 MB (Complete)</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Recovery Readiness</p>
          <p className="text-xl font-bold text-emerald-600 mt-1">100% Operational</p>
          <p className="text-xs text-gray-500 mt-1">Full DB & Media schema</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Snapshot Name & ID</th>
              <th className="py-3 px-4 text-left">Type</th>
              <th className="py-3 px-4 text-left">Creation Timestamp</th>
              <th className="py-3 px-4 text-center">Archive Size</th>
              <th className="py-3 px-4 text-left">Integrity</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {backups.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4">
                  <p className="font-bold text-gray-900">{b.name}</p>
                  <p className="font-mono text-xs text-gray-400">{b.id}</p>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={b.type === 'AUTOMATED' ? 'info' : 'default'}>{b.type}</Badge>
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">{b.date}</td>
                <td className="py-3 px-4 text-center font-mono text-xs font-semibold text-gray-800">{b.size}</td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Healthy
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

