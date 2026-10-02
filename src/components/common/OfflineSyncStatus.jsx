import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import useOfflineStatus from '../../hooks/useOfflineStatus';
import { retryOfflineQueue } from '../../utils/offlineSync';

export default function OfflineSyncStatus() {
  const { online, pending, failed, syncing } = useOfflineStatus();
  const hasQueue = pending > 0 || failed > 0;

  return (
    <div className={`mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-l-4 px-3 py-2 text-sm ${
      !online ? 'border-amber-500 bg-amber-50 text-amber-900' : failed ? 'border-red-500 bg-red-50 text-red-800' : hasQueue ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-emerald-500 bg-emerald-50 text-emerald-800'
    }`} role="status" aria-live="polite">
      {online ? <Cloud className="h-4 w-4" /> : <CloudOff className="h-4 w-4" />}
      <span>{online ? 'Online' : 'Offline'}</span>
      {pending > 0 && <span>{pending} change{pending === 1 ? '' : 's'} waiting to sync</span>}
      {failed > 0 && <span>{failed} change{failed === 1 ? '' : 's'} need attention</span>}
      {!online && <span>Changes are saved on this device and will sync when connected.</span>}
      {online && syncing && <span>Syncing saved changes…</span>}
      {online && hasQueue && !syncing && (
          <button type="button" onClick={retryOfflineQueue} className="ml-auto inline-flex items-center gap-1 font-medium underline underline-offset-2">
          <RefreshCw className="h-3.5 w-3.5" /> Retry sync
        </button>
      )}
      {online && !hasQueue && <span>All changes synced</span>}
    </div>
  );
}
