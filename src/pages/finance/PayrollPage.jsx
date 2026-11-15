import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, FileText, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { createPayrollEntry, getPayroll, getPayrollStaff, markPayrollEntryPaid } from '../../api/schoolOperationsApi';

const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};
const EMPTY_FORM = { staffId: '', period: currentPeriod(), basicSalary: '', allowances: '0', deductions: '0' };
const currency = (amount) => `GHS ${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PayrollPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({ gross: 0, paid: 0, pending: 0, staffCount: 0 });
  const [staff, setStaff] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState('');
  const { addToast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const [payroll, staffList] = await Promise.all([getPayroll({ period }), getPayrollStaff()]);
      setEntries(payroll?.entries || []);
      setSummary(payroll?.summary || { gross: 0, paid: 0, pending: 0, staffCount: 0 });
      setStaff(staffList);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load payroll data.';
      setLoadError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [period, addToast]);

  useEffect(() => { load(); }, [load]);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;
    return entries.filter((entry) =>
      [`${entry.staff?.firstName || ''} ${entry.staff?.lastName || ''}`, entry.staff?.user?.email, entry.staff?.user?.role]
        .some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [entries, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await createPayrollEntry({
        ...form,
        basicSalary: Number(form.basicSalary),
        allowances: Number(form.allowances || 0),
        deductions: Number(form.deductions || 0),
      });
      setFormOpen(false);
      setForm({ ...EMPTY_FORM, period });
      addToast('Payroll entry created.', 'success');
      await load();
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to create payroll entry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const markPaid = async (entry) => {
    setUpdatingId(entry.id);
    try {
      await markPayrollEntryPaid(entry.id);
      addToast('Payroll entry marked as paid.', 'success');
      await load();
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to update payroll status.', 'error');
    } finally {
      setUpdatingId('');
    }
  };

  const exportPayroll = () => {
    const rows = [
      ['Period', 'Staff', 'Role', 'Basic Salary', 'Allowances', 'Deductions', 'Net Pay', 'Status'],
      ...filteredEntries.map((entry) => [
        entry.period,
        `${entry.staff?.firstName || ''} ${entry.staff?.lastName || ''}`.trim(),
        entry.staff?.user?.role || '',
        entry.basicSalary,
        entry.allowances,
        entry.deductions,
        entry.netPay,
        entry.status,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value ?? '').replaceAll('"', '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `payroll-${period}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const changePeriod = (value) => {
    setPeriod(value);
    setForm((current) => ({ ...current, period: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Staff Payroll" subtitle="Record and track staff compensation for each payroll period." />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" className="gap-2" onClick={exportPayroll} disabled={!entries.length}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Button variant="primary" className="gap-2" onClick={() => { setForm({ ...EMPTY_FORM, period }); setFormOpen(true); }}>
            <Plus className="h-4 w-4" /> Add Payroll Entry
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <label className="block text-sm font-medium text-gray-700">
          Payroll period
          <Input type="month" value={period} onChange={(event) => changePeriod(event.target.value)} className="mt-1" />
        </label>
        <div className="text-sm text-gray-500">Summary reflects payroll entries saved for the selected period.</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Gross Payroll</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{currency(summary.gross)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Disbursed</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">{currency(summary.paid)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{currency(summary.pending)}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Staff on Payroll</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{summary.staffCount}</p>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Add Payroll Entry</h2>
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select required aria-label="Staff member" className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.staffId} onChange={(event) => setForm({ ...form, staffId: event.target.value })}>
              <option value="">Select staff member</option>
              {staff.map((member) => <option key={member.id} value={member.id}>{member.firstName} {member.lastName} · {member.user?.role}</option>)}
            </select>
            <Input required type="month" value={form.period} onChange={(event) => setForm({ ...form, period: event.target.value })} />
            <Input required type="number" min="0" step="0.01" placeholder="Basic salary" value={form.basicSalary} onChange={(event) => setForm({ ...form, basicSalary: event.target.value })} />
            <Input type="number" min="0" step="0.01" placeholder="Allowances" value={form.allowances} onChange={(event) => setForm({ ...form, allowances: event.target.value })} />
            <Input type="number" min="0" step="0.01" placeholder="Deductions" value={form.deductions} onChange={(event) => setForm({ ...form, deductions: event.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving || !staff.length}>{saving ? 'Saving...' : 'Save Entry'}</Button>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
          {!staff.length && <p className="text-sm text-amber-700">No active staff records are available for payroll.</p>}
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search staff payroll..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Staff</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Basic</th>
              <th className="px-4 py-3 text-right">Allowances</th>
              <th className="px-4 py-3 text-right">Deductions</th>
              <th className="px-4 py-3 text-right">Net Pay</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={8}>Loading payroll...</td></tr>
            ) : loadError ? (
              <tr><td className="px-4 py-10 text-center text-red-600" colSpan={8}>{loadError}</td></tr>
            ) : filteredEntries.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-gray-500" colSpan={8}>
                  <FileText className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  {entries.length ? 'No entries match your search.' : 'No payroll entries have been saved for this period.'}
                </td>
              </tr>
            ) : filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-semibold text-gray-900">{entry.staff?.firstName} {entry.staff?.lastName}</td>
                <td className="px-4 py-3 text-gray-600">{entry.staff?.user?.role || '—'}</td>
                <td className="px-4 py-3 text-right font-mono text-gray-700">{currency(entry.basicSalary)}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-700">{currency(entry.allowances)}</td>
                <td className="px-4 py-3 text-right font-mono text-red-600">{currency(entry.deductions)}</td>
                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-900">{currency(entry.netPay)}</td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={entry.status === 'PAID' ? 'success' : 'warning'}>{entry.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  {entry.status === 'PAID' ? <span className="text-xs text-gray-500">Paid {entry.paidAt ? new Date(entry.paidAt).toLocaleDateString() : ''}</span> : (
                    <Button variant="ghost" size="sm" disabled={updatingId === entry.id} onClick={() => markPaid(entry)}>
                      {updatingId === entry.id ? 'Saving...' : 'Mark Paid'}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
