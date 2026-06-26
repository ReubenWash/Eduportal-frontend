import { MessageSquare, Star, ThumbsUp, ThumbsDown, Eye, CheckCircle, Clock, XCircle, Search } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { useState } from 'react';

const TICKETS = [
  { id: 'TKT-001', from: 'Dr. Kwame Boateng',    school: 'Sunshine Academy',   subject: 'Unable to generate report cards', priority: 'HIGH',   status: 'OPEN',       time: '20 min ago' },
  { id: 'TKT-002', from: 'Mr. Emmanuel Darko',   school: 'Riverside JHS',       subject: 'Student import failing',           priority: 'MEDIUM', status: 'IN_PROGRESS',time: '2 hr ago'   },
  { id: 'TKT-003', from: 'Ms. Grace Ofori',      school: 'Riverside JHS',       subject: 'Password reset not working',       priority: 'LOW',    status: 'RESOLVED',   time: '1 day ago'  },
  { id: 'TKT-004', from: 'Mr. Peter Acquah',     school: 'Golden Gate School',  subject: 'API integration issue',           priority: 'HIGH',   status: 'OPEN',       time: '3 hr ago'   },
  { id: 'TKT-005', from: 'Ms. Janet Boakye',     school: 'Golden Gate School',  subject: 'Feature request: bulk SMS',       priority: 'LOW',    status: 'CLOSED',     time: '3 days ago' },
];
const FEEDBACK = [
  { id: 1, from: 'Sunshine Academy',  rating: 5, message: 'Excellent platform! Our teachers love the report card generation.', time: '2 days ago' },
  { id: 2, from: 'Riverside JHS',     rating: 4, message: 'Very useful system. Would love offline mode for attendance.', time: '5 days ago' },
  { id: 3, from: 'Golden Gate School',rating: 3, message: 'Good overall but SMS notifications need improvement.', time: '1 week ago' },
];

const priorityVariant = { HIGH: 'danger', MEDIUM: 'warning', LOW: 'default' };
const statusVariant = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default' };

export default function AdminSupport() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [keyword, setKeyword] = useState('');

  const filtered = TICKETS.filter(t => !keyword || t.subject.toLowerCase().includes(keyword.toLowerCase()) || t.from.toLowerCase().includes(keyword.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Support & Help Desk</h1>
        <p className="text-sm text-gray-500 mt-1">Manage support tickets, school feedback, and platform complaints.</p>
      </div>

      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {['tickets', 'feedback', 'announcements'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>{tab}</button>
        ))}
      </div>

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-4 gap-3 flex-1">
              {[
                { label: 'Open',       count: TICKETS.filter(t=>t.status==='OPEN').length,       color: 'text-amber-600',  bg: 'bg-amber-50'  },
                { label: 'In Progress',count: TICKETS.filter(t=>t.status==='IN_PROGRESS').length,color: 'text-blue-600',   bg: 'bg-blue-50'   },
                { label: 'Resolved',   count: TICKETS.filter(t=>t.status==='RESOLVED').length,   color: 'text-emerald-600',bg: 'bg-emerald-50'},
                { label: 'Closed',     count: TICKETS.filter(t=>t.status==='CLOSED').length,     color: 'text-gray-600',   bg: 'bg-gray-100'  },
              ].map(s => (
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center border border-white`}>
                  <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input value={keyword} onChange={e => setKeyword(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" placeholder="Search tickets..." />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>{['Ticket', 'School', 'Priority', 'Status', 'Time', ''].map(h => <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50/60">
                    <td className="px-5 py-4">
                      <p className="text-xs font-mono text-indigo-600">{t.id}</p>
                      <p className="text-sm font-medium text-gray-900 mt-0.5">{t.subject}</p>
                      <p className="text-[11px] text-gray-400">{t.from}</p>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{t.school}</td>
                    <td className="px-5 py-4 whitespace-nowrap"><Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge></td>
                    <td className="px-5 py-4 whitespace-nowrap"><Badge variant={statusVariant[t.status]} dot>{t.status.replace('_', ' ')}</Badge></td>
                    <td className="px-5 py-4 whitespace-nowrap text-xs text-gray-400">{t.time}</td>
                    <td className="px-5 py-4"><button className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Eye className="h-4 w-4" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {FEEDBACK.map(f => (
            <div key={f.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar name={f.from} size="sm" />
                  <div><p className="text-sm font-semibold text-gray-900">{f.from}</p><p className="text-[11px] text-gray-400">{f.time}</p></div>
                </div>
                <div className="flex gap-0.5">{[1,2,3,4,5].map(s => <Star key={s} className={`h-4 w-4 ${s <= f.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />)}</div>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">"{f.message}"</p>
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-emerald-600 transition-colors"><ThumbsUp className="h-3.5 w-3.5" /> Helpful</button>
                <button className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"><ThumbsDown className="h-3.5 w-3.5" /> Not helpful</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-sm text-gray-400 text-center py-8">Use the Notifications Center to publish announcements to schools and users.</p>
        </div>
      )}
    </div>
  );
}
