import { useState, useEffect, useCallback } from 'react';
import { CreditCard, Copy, Upload, Eye, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';
import { getBillingSummary, submitPaymentProof, openProof, formatGHS } from '../../api/billingApi';

const PLAN_BADGE = {
  UNPAID: { variant: 'warning', label: 'Not paid yet' },
  ACTIVE: { variant: 'success', label: 'Active' },
  EXPIRING: { variant: 'warning', label: 'Expiring soon' },
  GRACE: { variant: 'warning', label: 'Grace period' },
  EXPIRED: { variant: 'danger', label: 'Expired' },
};
const PAY_BADGE = {
  PENDING: { variant: 'warning', label: 'Awaiting review' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};
const MONTH_OPTIONS = [
  { value: 1, label: '1 month' },
  { value: 3, label: '3 months' },
  { value: 6, label: '6 months' },
  { value: 12, label: '12 months' },
];
const METHOD_OPTIONS = [
  { value: 'MOMO', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
];
const today = () => new Date().toISOString().slice(0, 10);
const EMPTY_FORM = { months: 1, method: 'MOMO', paidOn: today(), transactionRef: '', payerName: '', payerPhone: '', note: '' };

const errMsg = (e, fallback) => e?.response?.data?.message || e?.message || fallback;

function CopyRow({ label, value }) {
  const { addToast } = useToast();
  if (!value) return null;
  const copy = () => navigator.clipboard?.writeText(value).then(() => addToast(`${label} copied`, 'success'));
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 break-words">{value}</p>
      </div>
      <button onClick={copy} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="Copy">
        <Copy className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function Billing() {
  const { addToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    getBillingSummary()
      .then(setSummary)
      .catch((e) => addToast(errMsg(e, 'Could not load billing'), 'error'))
      .finally(() => setLoading(false));
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) return addToast('File must be 5MB or smaller', 'error');
    if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(f.type)) return addToast('Use a JPG, PNG, WEBP or PDF file', 'error');
    setFile(f);
  };

  const openModal = () => { setForm({ ...EMPTY_FORM, paidOn: today() }); setFile(null); setOpen(true); };

  const submit = async () => {
    if (!file) return addToast('Attach your proof of payment', 'error');
    if (!form.paidOn) return addToast('Enter the date you paid', 'error');
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
    fd.append('proof', file);
    setSaving(true);
    try {
      await submitPaymentProof(fd);
      addToast('Proof submitted. We will confirm by email once verified.', 'success');
      setOpen(false);
      load();
    } catch (e) {
      addToast(errMsg(e, 'Could not submit payment'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const view = async (p) => {
    try { await openProof(p.proofUrl); } catch (e) { addToast(errMsg(e, 'Could not open proof'), 'error'); }
  };

  if (loading && !summary) return <div className="p-8 text-sm text-gray-500">Loading billing…</div>;
  if (!summary) return null;

  const s = summary;
  const plan = PLAN_BADGE[s.planStatus] || PLAN_BADGE.UNPAID;
  const d = s.paymentDetails || {};
  const hasDetails = d.momo?.number || d.bank?.accountNumber;
  const expectedNow = Math.round(s.activeStudents * s.pricePerStudent * Number(form.months) * 100) / 100;
  const canPay = !s.pendingPayment && s.activeStudents > 0 && hasDetails;

  return (
    <div>
      <PageHeader
        title="Billing"
        subtitle={`${formatGHS(s.pricePerStudent)} per active student per month`}
        action={<Button icon={Upload} onClick={openModal} disabled={!canPay}>Submit payment proof</Button>}
      />

      {s.pendingPayment && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-600 mt-0.5" />
          <p className="text-sm text-amber-800">
            Payment <strong>{s.pendingPayment.reference}</strong> ({formatGHS(s.pendingPayment.amountExpected)}) is awaiting review.
            You will get an email once it is approved.
          </p>
        </div>
      )}
      {!hasDetails && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
          Payment details have not been published yet. Please contact support.
        </div>
      )}
      {s.planStatus === 'EXPIRED' && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <p className="text-sm text-red-800">Your plan has expired. Make a payment to continue making changes.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={CheckCircle} title="Plan status" value={<Badge variant={plan.variant} dot>{plan.label}</Badge>}
          trendLabel={s.planRenewsAt ? `Active until ${formatDate(s.planRenewsAt)}` : 'No payment recorded yet'} color="green" />
        <StatCard icon={Users} title="Active students" value={s.activeStudents} color="blue" />
        <StatCard icon={CreditCard} title="Due for 1 month" value={formatGHS(s.amountDue)}
          trendLabel={`${s.activeStudents} × ${formatGHS(s.pricePerStudent)}`} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 h-fit">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Pay to</h3>
          {d.momo?.number && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Mobile Money {d.momo.network ? `· ${d.momo.network}` : ''}</p>
              <CopyRow label="Number" value={d.momo.number} />
              <CopyRow label="Account name" value={d.momo.accountName} />
            </div>
          )}
          {d.bank?.accountNumber && (
            <div className="mb-3">
              <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Bank transfer</p>
              <CopyRow label="Bank" value={d.bank.name} />
              <CopyRow label="Account name" value={d.bank.accountName} />
              <CopyRow label="Account number" value={d.bank.accountNumber} />
              <CopyRow label="Branch" value={d.bank.branch} />
            </div>
          )}
          {d.instructions && <p className="text-xs text-gray-500 mt-2 whitespace-pre-line">{d.instructions}</p>}
          <p className="text-xs text-gray-400 mt-3">After paying, upload your receipt or screenshot using "Submit payment proof".</p>
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100"><h3 className="text-sm font-semibold text-gray-900">Payment history</h3></div>
          {s.recentPayments.length === 0 ? (
            <p className="p-6 text-sm text-gray-500">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr><th className="px-4 py-2 text-left">Reference</th><th className="px-4 py-2 text-left">Date</th><th className="px-4 py-2 text-left">Amount</th><th className="px-4 py-2 text-left">Status</th><th /></tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {s.recentPayments.map((p) => {
                    const b = PAY_BADGE[p.status];
                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium text-gray-900">{p.reference}</td>
                        <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                        <td className="px-4 py-3">{formatGHS(p.amountExpected)}<span className="text-xs text-gray-400"> · {p.months}mo</span></td>
                        <td className="px-4 py-3">
                          <Badge variant={b.variant} dot>{b.label}</Badge>
                          {p.status === 'REJECTED' && p.rejectionReason && <p className="text-xs text-red-600 mt-1">{p.rejectionReason}</p>}
                          {p.status === 'APPROVED' && p.periodEnd && <p className="text-xs text-gray-500 mt-1">Until {formatDate(p.periodEnd)}</p>}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => view(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100" title="View proof"><Eye className="h-4 w-4" /></button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Submit proof of payment" subtitle={`${s.activeStudents} active students × ${formatGHS(s.pricePerStudent)}`} size="lg">
        <div className="p-6 space-y-4">
          <div className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 text-sm text-indigo-800">
            Amount to pay: <strong>{formatGHS(expectedNow)}</strong>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Pay for" options={MONTH_OPTIONS} value={form.months} onChange={set('months')} />
            <Select label="Paid with" options={METHOD_OPTIONS} value={form.method} onChange={set('method')} />
            <Input label="Date paid" type="date" value={form.paidOn} max={today()} onChange={set('paidOn')} required />
            <Input label="Transaction ID" placeholder="From the MoMo/bank message" value={form.transactionRef} onChange={set('transactionRef')} />
            <Input label="Payer name" value={form.payerName} onChange={set('payerName')} />
            <Input label="Payer phone" value={form.payerPhone} onChange={set('payerPhone')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Proof (screenshot, photo or PDF, max 5MB) <span className="text-red-500">*</span></label>
            <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickFile}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100" />
            {file && <p className="text-xs text-gray-500 mt-1">{file.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
            <textarea rows={2} maxLength={500} value={form.note} onChange={set('note')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={submit}>Submit</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}