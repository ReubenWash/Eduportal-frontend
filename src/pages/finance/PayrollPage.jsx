import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { DollarSign, Plus, Search, Download, CheckCircle, FileText } from 'lucide-react';

const mockPayroll = [
  {
    id: 'PAY-2026-04-01',
    staffName: 'Mr. David Mensah',
    role: 'Class Teacher',
    basicSalary: 3500.00,
    allowances: 450.00,
    deductions: 280.00,
    netPay: 3670.00,
    status: 'PAID',
    paymentDate: '2026-04-28',
  },
  {
    id: 'PAY-2026-04-02',
    staffName: 'Mrs. Janet Arthur',
    role: 'Science Teacher',
    basicSalary: 3800.00,
    allowances: 500.00,
    deductions: 310.00,
    netPay: 3990.00,
    status: 'PAID',
    paymentDate: '2026-04-28',
  },
  {
    id: 'PAY-2026-04-03',
    staffName: 'Mr. Samuel Antwi',
    role: 'Accountant',
    basicSalary: 4200.00,
    allowances: 600.00,
    deductions: 350.00,
    netPay: 4450.00,
    status: 'PENDING',
    paymentDate: '2026-05-28',
  },
];

export default function PayrollPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Staff Payroll & Salaries"
          subtitle="Process monthly staff compensation, tax deductions, allowances, and payslips."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Payroll Sheet
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Run Monthly Payroll
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Gross Payroll</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">GHS 124,500.00</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Disbursed This Month</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">GHS 118,240.00</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Pending Approvals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">GHS 6,260.00</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Active Staff On Payroll</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">34</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search staff payroll records..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Staff Name</th>
              <th className="py-3 px-4 text-left">Role / Designation</th>
              <th className="py-3 px-4 text-right">Basic (GHS)</th>
              <th className="py-3 px-4 text-right">Allowances</th>
              <th className="py-3 px-4 text-right">Deductions</th>
              <th className="py-3 px-4 text-right">Net Salary</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4 text-right">Payslip</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockPayroll.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-bold text-gray-900">{item.staffName}</td>
                <td className="py-3 px-4 text-gray-600 text-xs">{item.role}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-700">{item.basicSalary.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-600">+{item.allowances.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono text-red-500">-{item.deductions.toFixed(2)}</td>
                <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">GHS {item.netPay.toFixed(2)}</td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={item.status === 'PAID' ? 'success' : 'warning'}>
                    {item.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                    <FileText className="h-3.5 w-3.5" /> View
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

