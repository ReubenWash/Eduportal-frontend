import { Activity, Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const cpuData = Array.from({ length: 20 }, (_, i) => ({ t: i, v: 20 + Math.random() * 40 }));
const memData = Array.from({ length: 20 }, (_, i) => ({ t: i, v: 50 + Math.random() * 30 }));

const SERVICES = [
  { name: 'API Server',       status: 'HEALTHY', uptime: '99.98%', latency: '42ms',   icon: Server   },
  { name: 'Database',         status: 'HEALTHY', uptime: '99.99%', latency: '8ms',    icon: Database },
  { name: 'File Storage',     status: 'HEALTHY', uptime: '100%',   latency: '120ms',  icon: HardDrive},
  { name: 'Email Service',    status: 'DEGRADED',uptime: '97.2%',  latency: '340ms',  icon: Wifi     },
  { name: 'SMS Gateway',      status: 'HEALTHY', uptime: '99.5%',  latency: '210ms',  icon: Activity },
];
const ERRORS = [
  { code: 500, path: '/api/v1/reports/generate', count: 3, last: '2 min ago' },
  { code: 504, path: '/api/v1/schools/export',   count: 1, last: '1 hr ago'  },
  { code: 422, path: '/api/v1/auth/register',    count: 7, last: '3 hr ago'  },
];

export default function AdminMonitoring() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Monitoring & Maintenance</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time platform health, service status, error logs, and performance metrics.</p>
      </div>

      {/* Service Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {SERVICES.map(s => {
          const Icon = s.icon;
          const healthy = s.status === 'HEALTHY';
          return (
            <div key={s.name} className={`bg-white rounded-xl border ${healthy ? 'border-gray-200' : 'border-amber-300'} shadow-sm p-4`}>
              <div className="flex items-center justify-between mb-3">
                <Icon className={`h-5 w-5 ${healthy ? 'text-emerald-500' : 'text-amber-500'}`} />
                {healthy ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
              </div>
              <p className="text-xs font-semibold text-gray-900">{s.name}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${healthy ? 'text-emerald-600' : 'text-amber-600'}`}>{s.status}</p>
              <p className="text-[10px] text-gray-400 mt-1">{s.uptime} uptime · {s.latency}</p>
            </div>
          );
        })}
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[
          { title: 'CPU Usage', data: cpuData, color: '#4F46E5', label: 'CPU %', max: 100 },
          { title: 'Memory Usage', data: memData, color: '#7C3AED', label: 'RAM %', max: 100 },
        ].map(chart => (
          <div key={chart.title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900">{chart.title}</h2>
              <span className="text-xs font-bold text-gray-500">{chart.data[chart.data.length - 1]?.v.toFixed(1)}%</span>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={chart.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, chart.max]} axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8, color: '#F9FAFB', fontSize: 11 }} formatter={v => [`${v.toFixed(1)}%`, chart.label]} labelFormatter={() => ''} />
                <Line type="monotone" dataKey="v" stroke={chart.color} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* Error Log */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Recent Errors</h2></div>
        <div className="divide-y divide-gray-100">
          {ERRORS.map((e, i) => (
            <div key={i} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-md">{e.code}</span>
                <span className="text-sm font-mono text-gray-700">{e.path}</span>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-700">{e.count}x</p>
                <p className="text-[10px] text-gray-400">{e.last}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
