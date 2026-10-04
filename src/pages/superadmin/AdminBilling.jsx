import { useState, useEffect, useCallback } from 'react';
import { Clock, CheckCircle, School, AlertTriangle, Eye, Save, FileText } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/helpers';
import {
  getBillingOverview, getBillingSettings, saveBillingSettings, listAdminPayments,
  approvePayment, rejectPayment, openProof, fetchProofBlob, formatGHS,
} from '../../api/billingApi';

const PAY_BADGE = {
  PENDING: { variant: 'warning', label: 'Pending' },
  APPROVED: { variant: 'success', label: 'Approved' },
  REJECTED: { variant: 'danger', label: 'Rejected' },
};
const errMsg = (e, fallback) => e?.response?.data?.message || e?.message || fallback;

function ProofPreview({ payment }) {
  const [src, setSrc] = useState(null);
  const isImage = payment.proof?.mime?.startsWith('image/');
  useEffect(() => {
    let url;
    if (!isImage) return undefined;
    fetchProofBlob(payment.proofUrl).then((b) => { url = URL.createObjectURL(b); setSrc(url); }).catch(() => {});
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [payment.proofUrl, isImage]);

  if (!isImage) {
    return (
      <button onClick={() => openProof(payment.proofUrl)} className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 p-8 text-sm text-gray-600 hover:bg-gray-50">
        <FileText className="h-8 w-8 text-gray-400" /> Open PDF proof
      </button>
    );
  }
  return src
    ? <img src={src} alt="Proof of payment" className="w-full rounded-xl border border-gray-200 max-h-[420px] object-contain bg-gray-50 cursor-zoom-in" onClick={() => openProof(payment.proofUrl)} />
    : <div className="h-48 rounded-xl bg-gray-50 animate-pulse" />;
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <span className="text-gray-500">{k}</span>
      <span className="font-medium text-gray-900 text-right break-words">{v || '—'}</span>
    </div>
  );
}

function ReviewModal({ payment, onClose, onDone }) {
  const { addToast } = useToast();
  const [amount, setAmount] = useState(payment.amountExpected);
  const [months, setMonths] = useState(payment.months);
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState('');
  const pending = payment.status === 'PENDING';
  const mismatch = Number(amount) !== Number(payment.amountExpected);

  const approve = async () => {
    setBusy('approve');
    try {
      await approvePayment(payment.id, { amountReceived: Number(amount), months: Number(months) });
      addToast('Payment approved. The school has been emailed.', 'success');
      onDone();
    } catch (e) { addToast(errMsg(e, 'Could not approve'), 'error'); setBusy(''); }
  };
  const reject = async () => {
    if (reason.trim().length < 3) return addToast('Enter a reason for rejecting', 'error');
    setBusy('reject');
    try {
      await rejectPayment(payment.id, reason.trim());
      addToast('Payment rejected. The school has been emailed.', 'success');
      onDone();
    } catch (e) { addToast(errMsg(e, 'Could not reject'), 'error'); setBusy(''); }
  };

  return (
    <Modal isOpen onClose={onClose} title={`${payment.reference} · ${payment.school?.name || ''}`} subtitle={`Submitted ${formatDate(payment.createdAt)}`} size="xl">
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ProofPreview payment={payment} />
          <p className="text-xs text-gray-400 mt-2">{payment.proof?.name}</p>
        </div>
        <div>
          <div className="divide-y divide-gray-100 mb-4">
            <Row k="Expected" v={`${formatGHS(payment.amountExpected)} (${payment.studentCount} × ${formatGHS(payment.pricePerStudent)} × ${payment.months}mo)`} />
            <Row k="Method" v={payment.method === 'MOMO' ? 'Mobile Money' : 'Bank transfer'} />
            <Row k="Paid on" v={formatDate(payment.paidOn)} />
            <Row k="Transaction ID" v={payment.transactionRef} />
            <Row k="Payer" v={[payment.payerName, payment.payerPhone].filter(Boolean).join(' · ')} />
            <Row k="School contact" v={[payment.school?.email, payment.school?.phone].filter(Boolean).join(' · ')} />
            {payment.note && <Row k="Note" v={payment.note} />}
            {!pending && <Row k="Status" v={PAY_BADGE[payment.status].label} />}
            {payment.status === 'APPROVED' && <Row k="Active until" v={formatDate(payment.periodEnd)} />}
            {payment.status === 'REJECTED' && <Row k="Reason" v={payment.rejectionReason} />}
          </div>

          {pending && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Amount received (GHS)" type="number" min="0" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
                <Input label="Months to grant" type="number" min="1" max="12" value={months} onChange={(e) => setMonths(e.target.value)} />
              </div>
              {mismatch && <p className="text-xs text-amber-600">Amount differs from the expected {formatGHS(payment.amountExpected)}.</p>}
              <Button className="w-full" loading={busy === 'approve'} disabled={!!busy} onClick={approve} icon={CheckCircle}>Approve and activate plan</Button>
              <div className="pt-3 border-t border-gray-100">
                <textarea rows={2} placeholder="Reason for rejecting (the school will see this)" value={reason} onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-400 focus:ring-red-400" />
                <Button variant="danger" className="w-full mt-2" loading={busy === 'reject'} disabled={!!busy} onClick={reject}>Reject</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function PaymentsTab({ fixedStatus, onChanged, refreshKey }) {
  const { addToast } = useToast();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = { page, limit: 15 };
    const st = fixedStatus || status;
    if (st) params.status = st;
    if (q.trim()) params.q = q.trim();
    listAdminPayments(params)
      .then((r) => { setRows(r.rows); setPagination(r.pagination); })
      .catch((e) => addToast(errMsg(e, 'Could not load payments'), 'error'))
      .finally(() => setLoading(false));
  }, [page, status, q, fixedStatus, addToast, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { const t = setTimeout(load, q ? 300 : 0); return () => clearTimeout(t); }, [load, q]);

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-4">
        <Input className="w-64" placeholder="Search reference, school, transaction ID" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} />
        {!fixedStatus && (
          <Select className="w-44" placeholder="All statuses" value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }}
            options={[{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }]} />
        )}
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr><th className="px-4 py-2 text-left">Reference</th><th className="px-4 py-2 text-left">School</th><th className="px-4 py-2 text-left">Amount</th><th className="px-4 py-2 text-left">Submitted</th><th className="px-4 py-2 text-left">Status</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading…</td></tr>}
            {!loading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-gray-500">{fixedStatus === 'PENDING' ? 'Nothing waiting for review.' : 'No payments found.'}</td></tr>}
            {!loading && rows.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setActive(p)}>
                <td className="px-4 py-3 font-medium text-gray-900">{p.reference}</td>
                <td className="px-4 py-3 text-gray-700">{p.school?.name}</td>
                <td className="px-4 py-3">{formatGHS(p.amountExpected)}<span className="text-xs text-gray-400"> · {p.months}mo</span></td>
                <td className="px-4 py-3 text-gray-600">{formatDate(p.createdAt)}</td>
                <td className="px-4 py-3"><Badge variant={PAY_BADGE[p.status].variant} dot>{PAY_BADGE[p.status].label}</Badge></td>
                <td className="px-4 py-3 text-right"><Eye className="h-4 w-4 text-gray-400 inline" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" disabled={!pagination.hasPrev} onClick={() => setPage((p) => p - 1)}>Previous</Button>
            <Button size="sm" variant="secondary" disabled={!pagination.hasNext} onClick={() => setPage((p) => p + 1)}>Next</Button>
          </div>
        </div>
      )}
      {active && <ReviewModal payment={active} onClose={() => setActive(null)} onDone={() => { setActive(null); load(); onChanged(); }} />}
    </div>
  );
}

const EMPTY_SETTINGS = {
  pricePerStudent: '', gracePeriodDays: '', momoNetwork: '', momoNumber: '', momoAccountName: '',
  bankName: '', bankAccountName: '', bankAccountNumber: '', bankBranch: '', instructions: '',
};

function SettingsTab() {
  const { addToast } = useToast();
  const [f, setF] = useState(EMPTY_SETTINGS);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBillingSettings().then((s) => setF({
      pricePerStudent: s.pricePerStudent ?? '', gracePeriodDays: s.gracePeriodDays ?? '',
      momoNetwork: s.momo?.network ?? '', momoNumber: s.momo?.number ?? '', momoAccountName: s.momo?.accountName ?? '',
      bankName: s.bank?.name ?? '', bankAccountName: s.bank?.accountName ?? '',
      bankAccountNumber: s.bank?.accountNumber ?? '', bankBranch: s.bank?.branch ?? '', instructions: s.instructions ?? '',
    })).catch((e) => addToast(errMsg(e, 'Could not load settings'), 'error'));
  }, [addToast]);

  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await saveBillingSettings({ ...f, pricePerStudent: Number(f.pricePerStudent), gracePeriodDays: Number(f.gracePeriodDays) });
      addToast('Billing settings saved. Schools see the new details immediately.', 'success');
    } catch (e) { addToast(errMsg(e, 'Could not save'), 'error'); }
    finally { setSaving(false); }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Price per active student per month (GHS)" type="number" min="0" step="0.01" value={f.pricePerStudent} onChange={set('pricePerStudent')} />
        <Input label="Grace period after expiry (days)" type="number" min="0" max="90" value={f.gracePeriodDays} onChange={set('gracePeriodDays')} />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Mobile Money</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Network" placeholder="MTN, Telecel, AirtelTigo" value={f.momoNetwork} onChange={set('momoNetwork')} />
          <Input label="Number" value={f.momoNumber} onChange={set('momoNumber')} />
          <Input label="Account name" value={f.momoAccountName} onChange={set('momoAccountName')} />
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Bank account</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Bank" value={f.bankName} onChange={set('bankName')} />
          <Input label="Branch" value={f.bankBranch} onChange={set('bankBranch')} />
          <Input label="Account name" value={f.bankAccountName} onChange={set('bankAccountName')} />
          <Input label="Account number" value={f.bankAccountNumber} onChange={set('bankAccountNumber')} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Instructions shown to schools</label>
        <textarea rows={3} maxLength={1000} value={f.instructions} onChange={set('instructions')} placeholder="e.g. Use your school name as the payment reference."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500" />
      </div>
      <Button icon={Save} loading={saving} onClick={save}>Save settings</Button>
    </div>
  );
}

export default function AdminBilling() {
  const { addToast } = useToast();
  const [tab, setTab] = useState('pending');
  const [overview, setOverview] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadOverview = useCallback(() => {
    getBillingOverview().then(setOverview).catch((e) => addToast(errMsg(e, 'Could not load overview'), 'error'));
  }, [addToast]);
  useEffect(() => { loadOverview(); }, [loadOverview]);

  const changed = () => { loadOverview(); setRefreshKey((k) => k + 1); };
  const o = overview;
  const tabs = [['pending', `Pending review${o?.pendingCount ? ` (${o.pendingCount})` : ''}`], ['all', 'All payments'], ['settings', 'Price & payment details']];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Review proofs of payment and activate school plans" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Clock} title="Pending review" value={o?.pendingCount ?? '—'} trendLabel={o ? formatGHS(o.pendingAmount) : ''} color="amber" />
        <StatCard icon={CheckCircle} title="Approved this month" value={o ? formatGHS(o.approvedThisMonth.amount) : '—'} trendLabel={o ? `${o.approvedThisMonth.count} payments` : ''} color="green" />
        <StatCard icon={School} title="Schools not paid yet" value={o?.schoolsUnpaid ?? '—'} color="blue" />
        <StatCard icon={AlertTriangle} title="Expiring or expired" value={o ? o.schoolsExpiringSoon + o.schoolsExpired : '—'} trendLabel={o ? `${o.schoolsExpired} expired` : ''} color="amber" />
      </div>

      <div className="border-b border-gray-200 mb-5 flex gap-5">
        {tabs.map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`pb-3 border-b-2 text-sm font-medium ${tab === id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>{label}</button>
        ))}
      </div>

      {tab === 'pending' && <PaymentsTab fixedStatus="PENDING" onChanged={changed} refreshKey={refreshKey} />}
      {tab === 'all' && <PaymentsTab onChanged={changed} refreshKey={refreshKey} />}
      {tab === 'settings' && <SettingsTab />}
    </div>
  );
}