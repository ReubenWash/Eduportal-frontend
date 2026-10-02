import { useEffect, useState } from 'react';
import { Search, User, ArrowDownToLine, Clock, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { exportAuditLogs, getAuditLogs } from '../../api/superAdminApi';

const ACTIONS = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'APPROVE', 'REJECT', 'SUSPEND', 'ACTIVATE', 'IMPORT', 'EXPORT', 'ROLE_CHANGE', 'PASSWORD_RESET'];
const actionVariant = { CREATE: 'success', UPDATE: 'warning', DELETE: 'danger', VIEW: 'info', LOGIN: 'primary', LOGIN_FAILED: 'danger', EXPORT: 'primary', IMPORT: 'primary' };

export default function AdminAuditLogs() {
  const [keyword, setKeyword] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    getAuditLogs({
      page,
      limit: 25,
      search: search || undefined,
      role: roleFilter || undefined,
      action: actionFilter || undefined,
    })
      .then(result => {
        if (!active) return;
        setLogs(result?.data || []);
        setPagination(result?.pagination || { total: 0, totalPages: 1 });
      })
      .catch(() => { if (active) setError('Audit logs could not be loaded. Please retry.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [actionFilter, page, refreshKey, roleFilter, search]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setSearch(keyword.trim());
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const file = await exportAuditLogs({ search: search || undefined, role: roleFilter || undefined, action: actionFilter || undefined });
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Audit log export failed. Please retry.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Trail & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Audit log of system-wide changes, configuration updates, and security events.</p>
        </div>
        <button onClick={handleExport} disabled={exporting} className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50">
          <ArrowDownToLine className="h-4 w-4" /> {exporting ? 'Exporting…' : 'Export CSV'}
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={submitSearch} className="relative flex flex-1 gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Search audit logs</span>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
            type="text" 
            placeholder="Search by actor, school, route, or IP..." 
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </label>
          <button type="submit" aria-label="Search audit logs" className="rounded-lg bg-gray-900 px-3 text-white hover:bg-gray-700"><Search className="h-4 w-4" /></button>
        </form>
        <select 
          value={roleFilter} 
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SCHOOL_ADMIN">School Admin</option>
          <option value="CLASS_TEACHER">Class Teacher</option>
          <option value="SUBJECT_TEACHER">Subject Teacher</option>
          <option value="PARENT">Parent</option>
          <option value="STUDENT">Student</option>
        </select>
        <select
          aria-label="Filter by action"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="">All Actions</option>
          {ACTIONS.map(action => <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>)}
        </select>
        <button type="button" onClick={() => setRefreshKey(value => value + 1)} className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-50" aria-label="Refresh audit logs" title="Refresh">
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <span>{pagination.total || 0} events</span>
        <span>Platform-wide activity</span>
      </div>
      {error && <div role="alert" className="border-l-4 border-red-500 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                {['Log ID', 'Actor', 'Role', 'Action/Event', 'IP Address', 'Timestamp'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-500">Loading audit logs…</td></tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">No audit logs match your search.</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-indigo-600">{log.id}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{[log.user?.staff?.firstName, log.user?.staff?.lastName].filter(Boolean).join(' ') || log.user?.email || 'System'}</span>
                      {log.school?.name && <span className="block pl-5 pt-0.5 text-xs text-gray-500">{log.school.name}</span>}
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge variant={log.role === 'SUPER_ADMIN' ? 'primary' : 'success'}>
                      {(log.user?.role || 'SYSTEM').replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 font-medium max-w-xs" title={`${log.action} ${log.resource}`}>
                    <Badge variant={actionVariant[log.action] || 'default'}>{log.action.replace(/_/g, ' ')}</Badge>
                    <span className="ml-2">{log.resource?.replace(/_/g, ' ') || 'EVENT'}</span>
                    {log.resourceId && <span className="mt-1 block text-xs font-normal text-gray-500">ID: {log.resourceId}</span>}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{log.ipAddress || '—'}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
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
