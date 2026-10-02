import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, Database, Download, Play, RefreshCw, Trash2 } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { createBackup, deleteBackup, downloadBackup, getBackups, restoreBackup } from '../../api/superAdminApi';

const statusVariant = { SUCCESS: 'success', FAILED: 'danger', IN_PROGRESS: 'warning', PENDING: 'info', CANCELLED: 'default' };
const formatSize = (bytes) => {
  if (!bytes) return '—';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  return `${size.toFixed(unit > 0 ? 1 : 0)} ${units[unit]}`;
};

export default function AdminBackup() {
  const { addToast } = useToast();
  const [backups, setBackups] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [storageStats, setStorageStats] = useState({ totalSize: 0, totalSnapshots: 0, lastBackup: null });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const result = await getBackups({ page: 1, limit: 100 });
      setBackups(result?.data || []);
      setSchedules(result?.schedules || []);
      setStorageStats(result?.storageStats || { totalSize: 0, totalSnapshots: 0, lastBackup: null });
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Could not load backup records.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!backups.some(backup => ['PENDING', 'IN_PROGRESS'].includes(backup.status))) return undefined;
    const timer = window.setInterval(load, 5000);
    return () => window.clearInterval(timer);
  }, [backups, load]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await createBackup({ type: 'DATABASE_ONLY' });
      addToast('Database backup started. Its status will update when processing finishes.', 'info');
      setBackups(current => [result, ...current]);
      await load();
    } catch (createError) {
      addToast(createError.response?.data?.message || 'Could not start database backup.', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleDownload = async (backup) => {
    setBusyId(backup.id);
    try {
      const blob = await downloadBackup(backup.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `eduportal-${backup.id}.dump`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      addToast(downloadError.response?.data?.message || 'Backup download failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const handleRestore = async (backup) => {
    const confirmationName = window.prompt(`This replaces matching database objects with the selected snapshot. Type the exact backup name to continue:\n\n${backup.name}`);
    if (confirmationName === null) return;
    setBusyId(backup.id);
    try {
      const result = await restoreBackup(backup.id, confirmationName);
      addToast(result?.message || 'Database restore completed.', 'success');
    } catch (restoreError) {
      addToast(restoreError.response?.data?.message || 'Database restore failed.', 'error');
    } finally {
      setBusyId(null);
      await load();
    }
  };

  const handleDelete = async (backup) => {
    if (!window.confirm(`Permanently delete backup ${backup.name}?`)) return;
    setBusyId(backup.id);
    try {
      await deleteBackup(backup.id);
      addToast('Backup deleted.', 'success');
      await load();
    } catch (deleteError) {
      addToast(deleteError.response?.data?.message || 'Backup deletion failed.', 'error');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Backup & Recovery"
        subtitle="Create and restore PostgreSQL database snapshots stored privately in Cloudinary."
        action={(
          <div className="flex gap-2">
            <button type="button" onClick={load} disabled={loading} className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50" aria-label="Refresh backups" title="Refresh">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button type="button" onClick={handleCreate} disabled={creating} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50">
              <Play className="h-4 w-4" /> {creating ? 'Starting…' : 'Create Database Backup'}
            </button>
          </div>
        )}
      />

      <div className="border-l-4 border-amber-500 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        Restore changes the live database. The server needs `pg_dump` and `pg_restore`, a direct PostgreSQL connection, and Cloudinary credentials. Only database-only snapshots are supported currently.
      </div>

      {error && <div role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Completed Snapshots', value: storageStats.totalSnapshots || 0, icon: Database },
          { label: 'Stored Database Data', value: `${storageStats.totalSize || 0} GB`, icon: CheckCircle },
          { label: 'Last Successful Backup', value: storageStats.lastBackup?.createdAt ? new Date(storageStats.lastBackup.createdAt).toLocaleString() : 'None', icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="border-b border-gray-200 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase text-gray-500"><Icon className="h-4 w-4" />{label}</div>
            <p className="mt-2 text-lg font-semibold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="border-t border-gray-200 pt-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Backup History</h2>
          <span className="text-sm text-gray-500">{backups.length} records</span>
        </div>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>{['Snapshot', 'Created', 'Size', 'Storage', 'Status', 'Actions'].map(label => <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">Loading backups…</td></tr>
              ) : backups.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-500">No database backups yet.</td></tr>
              ) : backups.map(backup => (
                <tr key={backup.id}>
                  <td className="px-4 py-3"><p className="text-sm font-medium text-gray-900">{backup.name}</p><p className="text-xs text-gray-500">{backup.type.replace(/_/g, ' ')}</p></td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{new Date(backup.createdAt).toLocaleString()}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{formatSize(backup.size)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{backup.storage}</td>
                  <td className="whitespace-nowrap px-4 py-3"><Badge variant={statusVariant[backup.status] || 'default'}>{backup.status}</Badge>
                    {backup.logs?.[0]?.level === 'ERROR' && <p className="mt-1 max-w-xs text-xs text-red-600">{backup.logs[0].message}</p>}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-1">
                      {backup.status === 'SUCCESS' && <>
                        <button type="button" onClick={() => handleDownload(backup)} disabled={busyId === backup.id} className="rounded p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" aria-label="Download backup" title="Download"><Download className="h-4 w-4" /></button>
                        <button type="button" onClick={() => handleRestore(backup)} disabled={busyId === backup.id} className="rounded p-2 text-amber-700 hover:bg-amber-50 disabled:opacity-50" aria-label="Restore backup" title="Restore"><AlertTriangle className="h-4 w-4" /></button>
                      </>}
                      <button type="button" onClick={() => handleDelete(backup)} disabled={busyId === backup.id || ['PENDING', 'IN_PROGRESS'].includes(backup.status)} className="rounded p-2 text-red-600 hover:bg-red-50 disabled:opacity-40" aria-label="Delete backup" title="Delete"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-t border-gray-200 pt-5">
        <h2 className="text-base font-semibold text-gray-900">Stored Schedule Settings</h2>
        <p className="mt-1 text-xs text-amber-700">Schedules are stored as configuration only; automatic backup execution is not enabled yet.</p>
        {schedules.length === 0 ? <p className="mt-2 text-sm text-gray-500">No enabled schedule settings.</p> : (
          <ul className="mt-3 divide-y divide-gray-100">
            {schedules.map(schedule => <li key={schedule.id} className="py-3 text-sm text-gray-700">{schedule.name} · {schedule.frequency} · {schedule.time || 'time not set'}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
