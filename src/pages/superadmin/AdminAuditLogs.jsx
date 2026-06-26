import { useState } from 'react';
import { Search, ShieldAlert, Eye, User, FileText, ArrowDownToLine, Clock } from 'lucide-react';
import Badge from '../../components/ui/Badge';

const AUDIT_LOGS = [
  { id: 'AUD-001', actor: 'Super Admin (You)', role: 'SUPER_ADMIN', action: 'Approved school registration: Sunshine Academy', ip: '196.168.1.42',  timestamp: '2026-06-24 10:15 AM' },
  { id: 'AUD-002', actor: 'kwame@sunshine.edu.gh', role: 'SCHOOL_ADMIN', action: 'Created new class: JHS 1 Gold', ip: '196.168.1.50', timestamp: '2026-06-24 09:30 AM' },
  { id: 'AUD-003', actor: 'kofi@sunshine.edu.gh',  role: 'CLASS_TEACHER', action: 'Recorded attendance for JHS 1 Gold', ip: '196.168.1.112', timestamp: '2026-06-24 08:45 AM' },
  { id: 'AUD-004', actor: 'Super Admin (You)', role: 'SUPER_ADMIN', action: 'Updated API Keys for Paystack Integration', ip: '196.168.1.42',  timestamp: '2026-06-23 04:20 PM' },
  { id: 'AUD-005', actor: 'edarko@riverside.edu.gh', role: 'SCHOOL_ADMIN', action: 'Suspended user: grace@riverside.edu.gh', ip: '197.255.12.8',  timestamp: '2026-06-23 02:10 PM' },
  { id: 'AUD-006', actor: 'Super Admin (You)', role: 'SUPER_ADMIN', action: 'Triggered global notification to school admins', ip: '196.168.1.42',  timestamp: '2026-06-23 11:05 AM' },
  { id: 'AUD-007', actor: 'peter@golden.edu.gh',   role: 'SCHOOL_ADMIN', action: 'Generated quarterly revenue report', ip: '196.0.0.1',     timestamp: '2026-06-23 09:15 AM' },
];

export default function AdminAuditLogs() {
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const filtered = AUDIT_LOGS.filter(log => {
    const matchKeyword = log.action.toLowerCase().includes(keyword.toLowerCase()) || 
                          log.actor.toLowerCase().includes(keyword.toLowerCase()) || 
                          log.ip.includes(keyword);
    const matchRole = !roleFilter || log.role === roleFilter;
    return matchKeyword && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Audit Trail & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Audit log of system-wide changes, configuration updates, and security events.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
          <ArrowDownToLine className="h-4 w-4" /> Export CSV
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search by action, actor, or IP address..." 
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
          />
        </div>
        <select 
          value={roleFilter} 
          onChange={e => setRoleFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
        >
          <option value="">All Roles</option>
          <option value="SUPER_ADMIN">Super Admin</option>
          <option value="SCHOOL_ADMIN">School Admin</option>
          <option value="CLASS_TEACHER">Class Teacher</option>
        </select>
      </div>

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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-sm text-gray-400">No audit logs match your search.</td>
                </tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-indigo-600">{log.id}</td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-sm font-semibold text-gray-900">{log.actor}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap">
                    <Badge variant={log.role === 'SUPER_ADMIN' ? 'primary' : 'success'}>
                      {log.role.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-800 font-medium max-w-xs truncate" title={log.action}>
                    {log.action}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-xs font-mono text-gray-500">{log.ip}</td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      {log.timestamp}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
