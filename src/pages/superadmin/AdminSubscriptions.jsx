import { useState } from 'react';
import { CreditCard, Plus, Edit2, Trash2, TrendingUp, DollarSign, School, CheckCircle } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const PLANS = [
  { id: '1', name: 'Basic',    price: 0,    billing: 'Free',    schools: 18, features: ['Up to 200 students', '3 staff accounts', 'Basic reports', 'Email support'], color: 'gray'   },
  { id: '2', name: 'Standard', price: 199,  billing: 'Monthly', schools: 84, features: ['Up to 800 students', '15 staff accounts', 'Advanced reports', 'SMS notifications', 'Priority support'], color: 'indigo' },
  { id: '3', name: 'Premium',  price: 499,  billing: 'Monthly', schools: 145,features: ['Unlimited students', 'Unlimited staff', 'Full analytics', 'API access', 'Custom branding', '24/7 support'], color: 'violet' },
];

const REVENUE = [
  { month: 'Jan', revenue: 28500 }, { month: 'Feb', revenue: 31200 }, { month: 'Mar', revenue: 35800 },
  { month: 'Apr', revenue: 38100 }, { month: 'May', revenue: 42600 }, { month: 'Jun', revenue: 51200 },
];

const PAYMENTS = [
  { id: 'INV-001', school: 'Golden Gate School',  plan: 'Premium',  amount: 499,  status: 'PAID',    date: '2024-06-01' },
  { id: 'INV-002', school: 'Riverside JHS',        plan: 'Standard', amount: 199,  status: 'PAID',    date: '2024-06-01' },
  { id: 'INV-003', school: 'Star of the Sea',      plan: 'Standard', amount: 199,  status: 'PENDING', date: '2024-06-03' },
  { id: 'INV-004', school: 'Sunshine Academy',     plan: 'Premium',  amount: 499,  status: 'PAID',    date: '2024-06-05' },
  { id: 'INV-005', school: 'Lakewood Academy',     plan: 'Basic',    amount: 0,    status: 'FREE',    date: '2024-06-10' },
  { id: 'INV-006', school: 'Crystal Springs JHS',  plan: 'Standard', amount: 199,  status: 'OVERDUE', date: '2024-05-28' },
];

const planColors = { gray: 'border-gray-200', indigo: 'border-indigo-300', violet: 'border-violet-300' };
const planBg    = { gray: 'bg-gray-50', indigo: 'bg-indigo-50', violet: 'bg-violet-50' };
const planText  = { gray: 'text-gray-700', indigo: 'text-indigo-700', violet: 'text-violet-700' };

export default function AdminSubscriptions() {
  const { addToast } = useToast();
  const [editPlan, setEditPlan] = useState(null);

  const totalMRR = PLANS.reduce((acc, p) => acc + p.price * p.schools, 0);

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Subscription & Billing</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subscription plans, track revenue, and view payment history.</p>
        </div>
        <button className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {/* MRR Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: 'Monthly Recurring Revenue', value: `$${totalMRR.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Paying Schools', value: PLANS.filter(p => p.price > 0).reduce((a, p) => a + p.schools, 0), icon: School, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Revenue Growth', value: '+21.4%', icon: TrendingUp, color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <div className={`h-10 w-10 rounded-xl ${s.bg} flex items-center justify-center mb-4`}><Icon className={`h-5 w-5 ${s.color}`} /></div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Revenue Overview (Last 6 Months)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={REVENUE} barSize={32}>
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ background: '#1F2937', border: 'none', borderRadius: 8, color: '#F9FAFB', fontSize: 12 }} formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
            <Bar dataKey="revenue" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map(plan => (
            <div key={plan.id} className={`bg-white rounded-xl border-2 ${planColors[plan.color]} p-5 relative`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${planBg[plan.color]} ${planText[plan.color]}`}>{plan.name}</span>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{plan.price === 0 ? 'Free' : `$${plan.price}`}<span className="text-sm font-normal text-gray-400">{plan.price > 0 ? '/mo' : ''}</span></p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setEditPlan(plan)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"><Edit2 className="h-3.5 w-3.5" /></button>
                  <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-3"><School className="h-3.5 w-3.5 inline mr-1 text-gray-400" />{plan.schools} schools on this plan</p>
              <ul className="space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-[13px] text-gray-600">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Payments</h2>
          <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View all invoices</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>{['Invoice', 'School', 'Plan', 'Amount', 'Status', 'Date'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {PAYMENTS.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/60">
                  <td className="px-5 py-3 text-sm font-mono text-indigo-600">{p.id}</td>
                  <td className="px-5 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">{p.school}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.plan}</td>
                  <td className="px-5 py-3 text-sm font-semibold text-gray-900">{p.amount === 0 ? '—' : `$${p.amount}`}</td>
                  <td className="px-5 py-3">
                    <Badge variant={p.status === 'PAID' ? 'success' : p.status === 'OVERDUE' ? 'danger' : p.status === 'FREE' ? 'default' : 'warning'} dot>{p.status}</Badge>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500 whitespace-nowrap">{new Date(p.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
