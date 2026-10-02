import { useEffect, useState } from 'react';
import { Activity, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import { getActivityLogs } from '../../api/activityApi';

const ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT'];
const actionVariant = { VIEW: 'info', CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', IMPORT: 'primary', EXPORT: 'primary' };

const actorName = (user) => {
  const name = [user?.staff?.firstName, user?.staff?.lastName].filter(Boolean).join(' ');
  return name || user?.email || 'Unknown user';
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [action, setAction] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getActivityLogs({ page, limit: 25, action: action || undefined, search: search || undefined })
      .then(result => {
        if (!active) return;
        setLogs(result?.data || []);
        setPagination(result?.pagination || { page: 1, totalPages: 1, total: 0 });
      })
      .catch(() => {
        if (active) setError('Activity logs could not be loaded. Please retry.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [action, page, refreshKey, search]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchValue.trim());
  };

  return (
    <div className="space-y-5">
      <PageHeader title="Activity Log" subtitle="Staff access and changes across your school" />

      <div className="flex flex-col gap-3 border-b border-gray-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={submitSearch} className="flex min-w-0 flex-1 gap-2 sm:max-w-xl">
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">Search activity</span>
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchValue}
              onChange={event => setSearchValue(event.target.value)}
              placeholder="Search staff, route, or record ID"
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </label>
          <button type="submit" className="rounded-lg bg-gray-900 px-3 text-white hover:bg-gray-700" aria-label="Search">
            <Search className="h-4 w-4" />
          </button>
        </form>
        <div className="flex items-center gap-2">
          <label htmlFor="activity-action" className="text-sm text-gray-600">Action</label>
          <select
            id="activity-action"
            value={action}
            onChange={event => { setAction(event.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
          >
            <option value="">All activity</option>
            {ACTIONS.map(item => <option key={item} value={item}>{item.charAt(0) + item.slice(1).toLowerCase()}</option>)}
          </select>
          <button
            type="button"
            onClick={() => { setPage(1); setRefreshKey(value => value + 1); }}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50"
            title="Refresh activity"
            aria-label="Refresh activity"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{pagination.total || 0} events</span>
        <span>Only staff activity for this school is shown</span>
      </div>

      {error && <div role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Staff member', 'Action', 'Area', 'Request details', 'Time'].map(label => (
                  <th key={label} className="whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-500">Loading activity…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center">
                  <Activity className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-500">No activity found for these filters.</p>
                </td></tr>
              ) : logs.map(log => {
                const metadata = log.metadata || {};
                return (
                  <tr key={log.id} className="align-top hover:bg-gray-50/70">
                    <td className="whitespace-nowrap px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{actorName(log.user)}</p>
                      <p className="mt-0.5 text-xs text-gray-500">{log.user?.role?.replace(/_/g, ' ') || 'System'}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3"><Badge variant={actionVariant[log.action] || 'default'}>{log.action}</Badge></td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">{log.resource}</td>
                    <td className="max-w-md px-4 py-3">
                      <p className="break-all font-mono text-xs text-gray-700">{metadata.method} {metadata.route}</p>
                      {log.resourceId && <p className="mt-1 text-xs text-gray-500">Record: {log.resourceId}</p>}
                      {metadata.bodyFields?.length > 0 && <p className="mt-1 text-xs text-gray-500">Fields changed: {metadata.bodyFields.join(', ')}</p>}
                      {log.ipAddress && <p className="mt-1 text-xs text-gray-400">IP: {log.ipAddress}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3">
          <span className="text-xs text-gray-500">Page {pagination.page || page} of {Math.max(pagination.totalPages || 1, 1)}</span>
          <div className="flex gap-2">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)} className="rounded border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
            <button type="button" disabled={page >= (pagination.totalPages || 1) || loading} onClick={() => setPage(value => value + 1)} className="rounded border border-gray-300 p-1.5 text-gray-600 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
