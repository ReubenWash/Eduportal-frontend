import { useCallback, useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getFeeOptions,
  getFeeStructures,
  saveFeeStructure,
  generateFeeInvoices,
  getFeeInvoices,
  getFeeArrears,
  getFinanceCategories,
  addFeeConcession,
  sendFeeReminders,
  recordFinanceTransaction,
  PAYMENT_METHODS,
} from '../../api/financeApi';
import { Mail, Plus, Receipt } from 'lucide-react';

const EMPTY_PAYMENT = { amount: '', categoryId: '', method: 'CASH', reference: '' };
const EMPTY_CONCESSION = { amount: '', reason: '' };
const money = (value) => `GHS ${Number(value || 0).toFixed(2)}`;
const classLabel = (record) => `${record.level} ${record.section}`;
const termLabel = (record) => `${record.academicYear} · ${record.termNumber.replace('TERM', 'Term ')}`;

export default function FeeManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState('setup');
  const [classes, setClasses] = useState([]);
  const [terms, setTerms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [structures, setStructures] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [arrears, setArrears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [classId, setClassId] = useState('');
  const [termId, setTermId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState([]);
  const [paymentInvoice, setPaymentInvoice] = useState(null);
  const [payment, setPayment] = useState(EMPTY_PAYMENT);
  const [concessionInvoice, setConcessionInvoice] = useState(null);
  const [concession, setConcession] = useState(EMPTY_CONCESSION);
  const [selectedArrears, setSelectedArrears] = useState([]);
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [options, nextStructures, nextInvoices, nextArrears, nextCategories] = await Promise.all([
        getFeeOptions(),
        getFeeStructures(),
        getFeeInvoices(),
        getFeeArrears(),
        getFinanceCategories(),
      ]);
      setClasses(options.classes || []);
      setTerms(options.terms || []);
      setStructures(nextStructures);
      setInvoices(nextInvoices);
      setArrears(nextArrears);
      setSelectedArrears([]);
      setCategories(nextCategories);
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to load fee management data', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { load(); }, [load]);

  const currentStructure = useMemo(
    () => structures.find((structure) => structure.classId === classId && structure.termId === termId),
    [structures, classId, termId]
  );
  const selectedClassYear = classes.find((record) => record.id === classId)?.academicYear;
  const availableTerms = terms.filter((record) => !selectedClassYear || record.academicYear === selectedClassYear);

  useEffect(() => {
    if (!classId || !termId) {
      setItems([]);
      return;
    }
    if (currentStructure) {
      setItems(currentStructure.items.map((item) => ({
        categoryId: item.categoryId,
        amount: String(item.amount),
      })));
    } else {
      setItems(categories.map((category) => ({ categoryId: category.id, amount: '' })));
    }
  }, [categories, classId, currentStructure, termId]);

  const updateItem = (index, key, value) => {
    setItems((previous) => previous.map((item, itemIndex) =>
      itemIndex === index ? { ...item, [key]: value } : item
    ));
  };

  const handleSaveStructure = async (event) => {
    event.preventDefault();
    const feeItems = items.filter((item) => item.categoryId && Number(item.amount) > 0);
    if (!classId || !termId || feeItems.length === 0) {
      addToast('Choose a class, term, and at least one fee amount.', 'error');
      return;
    }
    setBusy(true);
    try {
      await saveFeeStructure({ classId, termId, items: feeItems.map((item) => ({ ...item, amount: Number(item.amount) })) });
      addToast('Fee structure saved', 'success');
      await load();
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to save fee structure', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateInvoices = async () => {
    if (!classId || !termId || !dueDate) {
      addToast('Choose a class, term, and due date.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await generateFeeInvoices({ classId, termId, dueDate });
      addToast(`${result.created} invoice(s) generated; ${result.skipped} already existed.`, 'success');
      await load();
      setTab('invoices');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to generate invoices', 'error');
    } finally {
      setBusy(false);
    }
  };

  const openPayment = (invoice) => {
    setPaymentInvoice(invoice);
    setPayment({ ...EMPTY_PAYMENT, categoryId: invoice.items[0]?.categoryId || '' });
  };

  const handlePayment = async (event) => {
    event.preventDefault();
    if (!paymentInvoice) return;
    setBusy(true);
    try {
      await recordFinanceTransaction({
        studentId: paymentInvoice.studentId,
        termId: paymentInvoice.termId,
        feeInvoiceId: paymentInvoice.id,
        categoryId: payment.categoryId,
        amount: Number(payment.amount),
        method: payment.method,
        reference: payment.reference,
      });
      addToast('Invoice payment recorded', 'success');
      setPaymentInvoice(null);
      await load();
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to record payment', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleConcession = async (event) => {
    event.preventDefault();
    if (!concessionInvoice) return;
    setBusy(true);
    try {
      await addFeeConcession(concessionInvoice.id, { ...concession, amount: Number(concession.amount) });
      addToast('Concession applied', 'success');
      setConcessionInvoice(null);
      await load();
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to apply concession', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleReminders = async () => {
    if (selectedArrears.length === 0) {
      addToast('Select at least one arrears invoice.', 'error');
      return;
    }
    setBusy(true);
    try {
      const result = await sendFeeReminders(selectedArrears);
      const skipped = result.results.filter((item) => item.reason).length;
      addToast(`${result.sent} reminder(s) sent; ${result.failed} failed; ${skipped} invoice(s) skipped.`, result.failed ? 'error' : 'success');
    } catch (error) {
      addToast(error?.response?.data?.message || 'Failed to send reminders', 'error');
    } finally {
      setBusy(false);
    }
  };

  const tabs = [
    { id: 'setup', label: 'Fee setup' },
    { id: 'invoices', label: 'Invoices' },
    { id: 'arrears', label: 'Arrears' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Fees and Invoices"
        subtitle="Set class fees, generate term invoices, record partial payments, and follow up on overdue balances."
        action={<Button variant="secondary" onClick={load} icon={Receipt}>Refresh</Button>}
      />

      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${tab === item.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'setup' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <form onSubmit={handleSaveStructure} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Class fee structure</h2>
              <p className="mt-1 text-sm text-gray-500">Fees are built from the school's active financial categories.</p>
            </div>
            <Select
              label="Class"
              value={classId}
              onChange={(event) => {
                const nextClassId = event.target.value;
                const nextYear = classes.find((record) => record.id === nextClassId)?.academicYear;
                setClassId(nextClassId);
                if (terms.find((record) => record.id === termId)?.academicYear !== nextYear) setTermId('');
              }}
              options={classes.map((record) => ({ value: record.id, label: `${classLabel(record)} · ${record.academicYear}` }))}
              placeholder="Select a class"
            />
            <Select
              label="Term"
              value={termId}
              onChange={(event) => setTermId(event.target.value)}
              options={availableTerms.map((record) => ({ value: record.id, label: termLabel(record) }))}
              placeholder="Select a term"
            />
            {items.length > 0 ? (
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={`${item.categoryId}-${index}`} className="grid items-end gap-3 sm:grid-cols-2">
                    <Select
                      label="Category"
                      value={item.categoryId}
                      onChange={(event) => updateItem(index, 'categoryId', event.target.value)}
                      options={categories
                        .filter((category) => !items.some((other, otherIndex) => otherIndex !== index && other.categoryId === category.id))
                        .map((category) => ({ value: category.id, label: category.name }))}
                      placeholder="Select a category"
                    />
                    <Input
                      label="Amount (GHS)"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.amount}
                      onChange={(event) => updateItem(index, 'amount', event.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                ))}
                {items.length < categories.length && (
                  <Button type="button" variant="secondary" icon={Plus} onClick={() => setItems((previous) => [...previous, { categoryId: '', amount: '' }])}>
                    Add fee item
                  </Button>
                )}
              </div>
            ) : (
              <p className="rounded-lg bg-gray-50 p-3 text-sm text-gray-500">
                {categories.length ? 'Select a class and term to enter the fees.' : 'Create active financial categories in Finance before setting fees.'}
              </p>
            )}
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button type="submit" disabled={busy || items.length === 0}>{busy ? 'Saving…' : 'Save fee structure'}</Button>
            </div>
          </form>

          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
            <div>
              <h2 className="text-base font-semibold text-gray-900">Generate term invoices</h2>
              <p className="mt-1 text-sm text-gray-500">One invoice is created for each active student enrolled in the selected class and term. Existing invoices are skipped.</p>
            </div>
            <Input label="Invoice due date" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Button onClick={handleGenerateInvoices} disabled={busy}>{busy ? 'Generating…' : 'Generate invoices'}</Button>
            </div>
            <p className="text-xs text-gray-500">Save the fee structure for the selected class and term first.</p>
          </div>
        </div>
      )}

      {tab === 'invoices' && (
        <Table
          loading={loading}
          data={invoices}
          emptyMessage="No fee invoices have been generated."
          columns={[
            { header: 'Invoice', key: 'invoiceNumber', render: (value) => <span className="font-mono text-xs">{value}</span> },
            { header: 'Student', key: 'student', render: (_, row) => <div><p className="font-medium">{row.student.firstName} {row.student.lastName}</p><p className="text-xs text-gray-500">{row.student.studentNumber}</p></div> },
            { header: 'Class', key: 'class', render: (_, row) => row.student.class ? classLabel(row.student.class) : '—' },
            { header: 'Due', key: 'dueDate', render: (value) => new Date(value).toLocaleDateString() },
            { header: 'Total', key: 'totalDue', render: (value) => money(value) },
            { header: 'Paid', key: 'paid', render: (value) => money(value) },
            { header: 'Balance', key: 'balance', render: (value) => <span className="font-semibold">{money(value)}</span> },
            { header: 'Status', key: 'status', render: (value) => <Badge variant={value === 'PAID' ? 'success' : value === 'OVERDUE' ? 'warning' : 'info'}>{value.replace('_', ' ')}</Badge> },
          ]}
          rowActions={(invoice) => invoice.balance > 0 ? (
            <div className="flex gap-2">
              <button type="button" onClick={() => openPayment(invoice)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Record payment</button>
              {isAdmin && <button type="button" onClick={() => { setConcessionInvoice(invoice); setConcession(EMPTY_CONCESSION); }} className="text-xs font-medium text-gray-600 hover:text-gray-900">Concession</button>}
            </div>
          ) : null}
        />
      )}

      {tab === 'arrears' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Overdue balances</h2>
              <p className="text-sm text-gray-500">{arrears.length} outstanding invoice(s) past due.</p>
            </div>
            <Button onClick={handleReminders} disabled={busy || selectedArrears.length === 0} icon={Mail}>
              {busy ? 'Sending…' : `Send reminders (${selectedArrears.length})`}
            </Button>
          </div>
          <Table
            loading={loading}
            data={arrears}
            emptyMessage="There are no overdue balances."
            columns={[
              { header: 'Select', key: 'id', render: (id) => (
                <input
                  type="checkbox"
                  checked={selectedArrears.includes(id)}
                  aria-label="Select invoice for reminder"
                  onChange={(event) => {
                    if (event.target.checked && selectedArrears.length >= 100) {
                      addToast('Select no more than 100 invoices per reminder request.', 'error');
                      return;
                    }
                    setSelectedArrears((previous) => event.target.checked
                      ? [...new Set([...previous, id])]
                      : previous.filter((item) => item !== id));
                  }}
                />
              ) },
              { header: 'Invoice', key: 'invoiceNumber', render: (value) => <span className="font-mono text-xs">{value}</span> },
              { header: 'Student', key: 'student', render: (_, row) => <div><p className="font-medium">{row.student.firstName} {row.student.lastName}</p><p className="text-xs text-gray-500">{row.student.studentNumber}</p></div> },
              { header: 'Class', key: 'class', render: (_, row) => row.student.class ? classLabel(row.student.class) : '—' },
              { header: 'Days overdue', key: 'daysOverdue' },
              { header: 'Aging', key: 'agingBucket', render: (value) => ({ '1_30': '1–30 days', '31_60': '31–60 days', '61_90': '61–90 days', over_90: 'Over 90 days' }[value] || value) },
              { header: 'Balance', key: 'balance', render: (value) => <span className="font-semibold text-red-700">{money(value)}</span> },
              { header: 'Guardian email', key: 'guardians', render: (value) => value.map((guardian) => guardian.email).filter(Boolean).join(', ') || 'Not provided' },
            ]}
            rowActions={(invoice) => (
              <div className="flex gap-2">
                <button type="button" onClick={() => openPayment(invoice)} className="text-xs font-medium text-indigo-600 hover:text-indigo-800">Record payment</button>
                {isAdmin && <button type="button" onClick={() => { setConcessionInvoice(invoice); setConcession(EMPTY_CONCESSION); }} className="text-xs font-medium text-gray-600 hover:text-gray-900">Concession</button>}
              </div>
            )}
          />
        </div>
      )}

      <Modal isOpen={Boolean(paymentInvoice)} onClose={() => setPaymentInvoice(null)} title="Record invoice payment">
        {paymentInvoice && (
          <form onSubmit={handlePayment} className="space-y-4">
            <p className="text-sm text-gray-600">
              {paymentInvoice.invoiceNumber} · Balance {money(paymentInvoice.balance)}
            </p>
            <Select
              label="Fee category"
              value={payment.categoryId}
              onChange={(event) => setPayment({ ...payment, categoryId: event.target.value })}
              options={paymentInvoice.items.map((item) => ({ value: item.categoryId, label: item.description }))}
              placeholder="Select a category"
            />
            <Input label="Amount (GHS)" type="number" min="0.01" max={paymentInvoice.balance} step="0.01" value={payment.amount} onChange={(event) => setPayment({ ...payment, amount: event.target.value })} required />
            <Select label="Payment method" value={payment.method} onChange={(event) => setPayment({ ...payment, method: event.target.value })} options={PAYMENT_METHODS} />
            <Input label="Reference (optional)" value={payment.reference} onChange={(event) => setPayment({ ...payment, reference: event.target.value })} />
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setPaymentInvoice(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Recording…' : 'Record payment'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal isOpen={Boolean(concessionInvoice)} onClose={() => setConcessionInvoice(null)} title="Apply fee concession">
        {concessionInvoice && (
          <form onSubmit={handleConcession} className="space-y-4">
            <p className="text-sm text-gray-600">{concessionInvoice.invoiceNumber} · Balance {money(concessionInvoice.balance)}</p>
            <Input label="Concession amount (GHS)" type="number" min="0.01" max={concessionInvoice.balance} step="0.01" value={concession.amount} onChange={(event) => setConcession({ ...concession, amount: event.target.value })} required />
            <Input label="Reason" value={concession.reason} onChange={(event) => setConcession({ ...concession, reason: event.target.value })} required />
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <Button type="button" variant="secondary" onClick={() => setConcessionInvoice(null)}>Cancel</Button>
              <Button type="submit" disabled={busy}>{busy ? 'Applying…' : 'Apply concession'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
