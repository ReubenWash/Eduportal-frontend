import { useState } from 'react';
import { Shield, AlertTriangle, Lock, Activity, Globe, Clock, Eye, Ban } from 'lucide-react';
import Badge from '../../components/ui/Badge';

const LOGIN_LOGS = [
  { id: 1, user: 'admin@sunshine.edu.gh', ip: '196.168.1.42',  location: 'Accra, GH',   status: 'SUCCESS', time: '2 min ago'  },
  { id: 2, user: 'kofi@riverside.edu.gh', ip: '197.255.12.8',  location: 'Kumasi, GH',  status: 'SUCCESS', time: '5 min ago'  },
  { id: 3, user: 'unknown@gmail.com',     ip: '185.220.101.5', location: 'Russia',      status: 'FAILED',  time: '12 min ago' },
  { id: 4, user: 'unknown@gmail.com',     ip: '185.220.101.5', location: 'Russia',      status: 'FAILED',  time: '12 min ago' },
  { id: 5, user: 'unknown@gmail.com',     ip: '185.220.101.5', location: 'Russia',      status: 'BLOCKED', time: '12 min ago' },
  { id: 6, user: 'peter@golden.edu.gh',   ip: '196.0.0.1',     location: 'Accra, GH',  status: 'SUCCESS', time: '1 hr ago'   },
];

export default function AdminSecurity() {
  const [twoFA, setTwoFA] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Security Management</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor login activity, manage security settings, and protect platform access.</p>
      </div>

      {/* Security Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Failed Logins (24h)', value: '3', color: 'text-red-600',    bg: 'bg-red-50',    icon: AlertTriangle },
          { label: 'Blocked IPs',         value: '1', color: 'text-orange-600', bg: 'bg-orange-50', icon: Ban           },
          { label: 'Active Sessions',     value: '142',color: 'text-indigo-600',bg: 'bg-indigo-50', icon: Activity      },
          { label: 'Last Security Scan',  value: '2h ago', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Shield },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Login Activity */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Login Activity Log</h2>
            <button className="text-xs text-indigo-600 font-medium hover:text-indigo-700">View all</button>
          </div>
          <div className="divide-y divide-gray-100">
            {LOGIN_LOGS.map(log => (
              <div key={log.id} className={`flex items-center justify-between px-5 py-3 ${log.status === 'FAILED' || log.status === 'BLOCKED' ? 'bg-red-50/30' : ''}`}>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">{log.user}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{log.ip} · {log.location} · {log.time}</p>
                </div>
                <Badge variant={log.status === 'SUCCESS' ? 'success' : 'danger'} dot className="flex-shrink-0 ml-3">{log.status}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Security Settings */}
        <div className="space-y-4">
          {[
            { label: 'Two-Factor Authentication', desc: 'Require 2FA for all admin accounts', value: twoFA, setter: setTwoFA, icon: Lock, color: 'text-indigo-600' },
            { label: 'Maintenance Mode', desc: 'Take platform offline for scheduled maintenance', value: maintenance, setter: setMaintenance, icon: AlertTriangle, color: 'text-amber-600' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${s.color}`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{s.label}</p>
                    <p className="text-xs text-gray-500">{s.desc}</p>
                  </div>
                </div>
                <button onClick={() => s.setter(!s.value)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${s.value ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s.value ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            );
          })}

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2"><Globe className="h-4 w-4 text-gray-400" /> IP Whitelist</h3>
            <div className="space-y-2 text-xs">
              {['196.168.0.0/24 — Office Network', '197.255.0.0/16 — Ghana MTN Range'].map(ip => (
                <div key={ip} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                  <span className="font-mono text-gray-700">{ip}</span>
                  <button className="text-red-500 hover:text-red-600 font-medium">Remove</button>
                </div>
              ))}
              <input className="w-full border border-dashed border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-400 transition-colors" placeholder="Add IP or CIDR range..." />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
