import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import Modal from '../../components/ui/Modal';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  getFinanceCategories,
  createFinanceCategory,
  updateFinanceCategory,
  deactivateFinanceCategory,
  getFinanceTransactions,
  getFeeInvoices,
  recordFinanceTransaction,
  updateFinanceTransaction,
  deleteFinanceTransaction,
  PAYMENT_METHODS,
} from '../../api/financeApi';
import { getStudents } from '../../api/studentsApi';
import { Plus, Tag, Trash2, Receipt, Search } from 'lucide-react';

const EMPTY_TXN_FORM = { studentId: '', categoryId: '', feeInvoiceId: '', amount: '', method: 'CASH', reference: '', notes: '' };
const EMPTY_CATEGORY_FORM = { name: '', description: '', expectedAmount: '' };

export default function Finance() {
  const { user } = useAuth();
  // Only the school admin defines categories — the backend enforces this
  // too (manage_finance_categories isn't in the Accountant role's default
  // permissions), this just hides the controls an accountant can't use anyway.
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [studentInvoices, setStudentInvoices] = useState([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [txnDrawerOpen, setTxnDrawerOpen] = useState(false);
  const [txnForm, setTxnForm] = useState(EMPTY_TXN_FORM);
  const [saving, setSaving] = useState(false);

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [reconcileTarget, setReconcileTarget] = useState(null);
  const [reconcileInvoices, setReconcileInvoices] = useState([]);
  const [reconcileInvoiceId, setReconcileInvoiceId] = useState('');
  const [reconcileLoading, setReconcileLoading] = useState(false);
  const [reconciling, setReconciling] = useState(false);

  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [cats, txns] = await Promise.all([
        getFinanceCategories(),
        getFinanceTransactions(categoryFilter ? { categoryId: categoryFilter } : undefined),
      ]);
      setCategories(cats);
      setTransactions(txns);
    } catch {
      addToast('Failed to load finance data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [categoryFilter]);

  useEffect(() => {
    if (!txnForm.studentId) {
      setStudentInvoices([]);
      return undefined;
    }

    let active = true;
    setStudentInvoices([]);
    setInvoicesLoading(true);
    getFeeInvoices({ studentId: txnForm.studentId })
      .then((result) => {
        if (active) setStudentInvoices(result);
      })
      .catch(() => {
        if (active) addToast('Failed to load this student’s fee invoices', 'error');
      })
      .finally(() => {
        if (active) setInvoicesLoading(false);
      });

    return () => { active = false; };
  }, [txnForm.studentId, addToast]);

  const matchingInvoices = studentInvoices.filter((invoice) => (
    invoice.balance > 0 && Number(invoice.categoryTotals?.[txnForm.categoryId]?.outstanding || 0) > 0
  ));
  const selectedInvoice = matchingInvoices.find((invoice) => invoice.id === txnForm.feeInvoiceId);
  const selectedInvoiceCategoryBalance = Number(selectedInvoice?.categoryTotals?.[txnForm.categoryId]?.outstanding || 0);

  const openRecordPayment = async () => {
    setTxnForm(EMPTY_TXN_FORM);
    setStudentInvoices([]);
    setTxnDrawerOpen(true);
    if (students.length === 0) {
      try {
        const s = await getStudents();
        setStudents(s.filter(st => st.status === 'ACTIVE'));
      } catch {
        addToast('Failed to load students', 'error');
      }
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (matchingInvoices.length > 0 && !txnForm.feeInvoiceId) {
      addToast('Select the outstanding invoice this payment should reduce.', 'error');
      return;
    }
    if (selectedInvoice && Number(txnForm.amount) > selectedInvoiceCategoryBalance) {
      addToast('The payment amount exceeds the remaining balance for this invoice category.', 'error');
      return;
    }
    setSaving(true);
    try {
      await recordFinanceTransaction({
        ...txnForm,
        amount: Number(txnForm.amount),
      });
      addToast('Payment recorded successfully', 'success');
      setTxnDrawerOpen(false);
      load();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to record payment';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openCreateCategory = () => {
    setEditingCategoryId(null);
    setCategoryForm(EMPTY_CATEGORY_FORM);
    setCategoryModalOpen(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({ name: cat.name, description: cat.description || '', expectedAmount: cat.expectedAmount ?? '' });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingCategoryId) {
        await updateFinanceCategory(editingCategoryId, categoryForm);
        addToast('Category updated', 'success');
      } else {
        await createFinanceCategory(categoryForm);
        addToast('Category created', 'success');
      }
      setCategoryModalOpen(false);
      load();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to save category';
      addToast(message, 'error');
    }
  };

  const handleDeactivateCategory = async (cat) => {
    try {
      await deactivateFinanceCategory(cat.id);
      addToast('Category deactivated', 'success');
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to deactivate category', 'error');
    }
  };

  const confirmDeleteTransaction = async () => {
    try {
      await deleteFinanceTransaction(deleteTarget.id);
      addToast('Transaction deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to delete transaction', 'error');
      setDeleteTarget(null);
    }
  };

  const openReconcileTransaction = async (transaction) => {
    setReconcileTarget(transaction);
    setReconcileInvoices([]);
    setReconcileInvoiceId('');
    setReconcileLoading(true);
    try {
      const invoices = await getFeeInvoices({ studentId: transaction.studentId });
      const eligibleInvoices = invoices.filter((invoice) => (
        invoice.balance >= Number(transaction.amount)
        && Number(invoice.categoryTotals?.[transaction.category?.id]?.outstanding || 0) >= Number(transaction.amount)
      ));
      if (eligibleInvoices.length === 0) {
        addToast('No matching invoice has enough outstanding balance for this payment.', 'error');
        setReconcileTarget(null);
        return;
      }
      setReconcileInvoices(eligibleInvoices);
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to load eligible invoices', 'error');
      setReconcileTarget(null);
    } finally {
      setReconcileLoading(false);
    }
  };

  const confirmReconcileTransaction = async () => {
    if (!reconcileTarget || !reconcileInvoiceId) return;
    setReconciling(true);
    try {
      await updateFinanceTransaction(reconcileTarget.id, { feeInvoiceId: reconcileInvoiceId });
      addToast('Payment applied to invoice', 'success');
      setReconcileTarget(null);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to apply payment to invoice', 'error');
    } finally {
      setReconciling(false);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (!keyword) return true;
    const studentName = `${t.student?.firstName || ''} ${t.student?.lastName || ''}`.toLowerCase();
    return studentName.includes(keyword.toLowerCase()) || t.receiptNumber?.toLowerCase().includes(keyword.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title="Finance"
        subtitle="Record and track payments from students and parents — fees, feeding, PTA dues, or anything else your school collects."
        action={
          <>
            {isAdmin && (
              <Button variant="secondary" onClick={openCreateCategory} icon={Tag}>
                Manage Categories
              </Button>
            )}
            <Button onClick={openRecordPayment} icon={Plus}>
              Record Payment
            </Button>
          </>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student or receipt number..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="All categories"
            className="w-full sm:w-56"
          />
        </div>

        <Table
          loading={loading}
          data={filteredTransactions}
          emptyMessage="No payments recorded yet"
          columns={[
            {
              header: 'Receipt',
              key: 'receiptNumber',
              render: (v) => (
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-mono text-gray-700">{v}</span>
                </div>
              ),
            },
            {
              header: 'Student',
              key: '_student',
              render: (_, row) => (
                <div>
                  <p className="text-sm font-medium text-gray-900">{row.student?.firstName} {row.student?.lastName}</p>
                  <p className="text-[11px] text-gray-500">{row.student?.studentNumber}</p>
                </div>
              ),
            },
            {
              header: 'Category',
              key: '_category',
              render: (_, row) => <Badge variant="info">{row.category?.name}</Badge>,
            },
            {
              header: 'Invoice',
              key: 'feeInvoice',
              render: (invoice) => invoice?.invoiceNumber
                ? <span className="text-xs font-mono text-gray-700">{invoice.invoiceNumber}</span>
                : <span className="text-xs text-amber-700">Unallocated</span>,
            },
            {
              header: 'Amount',
              key: 'amount',
              render: (v) => <span className="text-sm font-semibold text-gray-900">GHS {Number(v).toFixed(2)}</span>,
            },
            {
              header: 'Method',
              key: 'method',
              render: (v) => <span className="text-gray-600 text-sm">{PAYMENT_METHODS.find(m => m.value === v)?.label || v}</span>,
            },
            {
              header: 'Date',
              key: 'createdAt',
              render: (v) => <span className="text-gray-500 text-sm">{v ? new Date(v).toLocaleDateString() : '—'}</span>,
            },
          ]}
          rowActions={(row) => (
            <div className="flex items-center gap-2">
              {!row.feeInvoiceId && (
                <button
                  onClick={() => openReconcileTransaction(row)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  Apply to invoice
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={() => setDeleteTarget(row)}
                  className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* Record Payment */}
      <SlideOver
        isOpen={txnDrawerOpen}
        onClose={() => setTxnDrawerOpen(false)}
        title="Record Payment"
        subtitle="Log a payment received from a student or parent."
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <Select
            label="Student"
            value={txnForm.studentId}
            onChange={e => setTxnForm({ ...txnForm, studentId: e.target.value, categoryId: '', feeInvoiceId: '' })}
            options={students.map(s => ({ value: s.id, label: `${s.name} (${s.studentNo})` }))}
            placeholder="Select a student..."
            required
          />
          <Select
            label="Category"
            value={txnForm.categoryId}
            onChange={e => setTxnForm({ ...txnForm, categoryId: e.target.value, feeInvoiceId: '' })}
            options={categories.map(c => ({ value: c.id, label: c.name }))}
            placeholder="Select a category..."
            required
          />
          {categories.length === 0 && (
            <p className="text-xs text-amber-600">No categories yet — {isAdmin ? 'use "Manage Categories" above to add one first.' : 'ask your school admin to set one up first.'}</p>
          )}
          {txnForm.studentId && txnForm.categoryId && invoicesLoading && (
            <p className="text-xs text-gray-500">Checking outstanding invoices…</p>
          )}
          {txnForm.studentId && txnForm.categoryId && !invoicesLoading && matchingInvoices.length > 0 && (
            <>
              <Select
                label="Apply payment to invoice"
                value={txnForm.feeInvoiceId}
                onChange={e => setTxnForm({ ...txnForm, feeInvoiceId: e.target.value })}
                options={matchingInvoices.map((invoice) => ({
                  value: invoice.id,
                  label: `${invoice.invoiceNumber} · ${invoice.term.termNumber.replace('TERM', 'Term ')} ${invoice.term.academicYear} · Balance GHS ${Number(invoice.categoryTotals[txnForm.categoryId].outstanding).toFixed(2)}`,
                }))}
                placeholder="Select an invoice"
              />
              <p className="text-xs text-indigo-700">
                This category has an outstanding invoice. Apply the payment to an invoice so its balance and the parent portal update together.
                {selectedInvoice && ` Remaining for this category: GHS ${selectedInvoiceCategoryBalance.toFixed(2)}.`}
              </p>
            </>
          )}
          {txnForm.studentId && txnForm.categoryId && !invoicesLoading && matchingInvoices.length === 0 && (
            <p className="text-xs text-gray-500">No outstanding invoice for this category. This payment will be recorded as an unallocated collection.</p>
          )}
          <Input
            label="Amount (GHS)"
            type="number"
            min="0.01"
            step="0.01"
            value={txnForm.amount}
            onChange={e => setTxnForm({ ...txnForm, amount: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            value={txnForm.method}
            onChange={e => setTxnForm({ ...txnForm, method: e.target.value })}
            options={PAYMENT_METHODS}
          />
          <Input
            label="Reference (optional)"
            value={txnForm.reference}
            onChange={e => setTxnForm({ ...txnForm, reference: e.target.value })}
            placeholder="MoMo transaction ID, cheque number, etc."
          />
          <Input
            label="Notes (optional)"
            value={txnForm.notes}
            onChange={e => setTxnForm({ ...txnForm, notes: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setTxnDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || invoicesLoading || categories.length === 0 || (matchingInvoices.length > 0 && !txnForm.feeInvoiceId)}>{saving ? 'Recording…' : 'Record Payment'}</Button>
          </div>
        </form>
      </SlideOver>

      {/* Manage Categories (admin only) */}
      <Modal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} title={editingCategoryId ? 'Edit Category' : 'Financial Categories'}>
        <div className="space-y-4 pt-2">
          {!editingCategoryId && categories.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    {cat.expectedAmount && <p className="text-xs text-gray-500">Expected: GHS {Number(cat.expectedAmount).toFixed(2)}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditCategory(cat)} className="text-xs text-indigo-600 hover:text-indigo-700">Edit</button>
                    <button onClick={() => handleDeactivateCategory(cat)} className="text-xs text-red-600 hover:text-red-700">Deactivate</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSaveCategory} className="space-y-4 pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pt-3">
              {editingCategoryId ? 'Edit this category' : 'Add a new category'}
            </p>
            <Input
              label="Name"
              value={categoryForm.name}
              onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g. School Fees, Feeding, PTA Dues, Transport"
              required
            />
            <Input
              label="Description (optional)"
              value={categoryForm.description}
              onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
            />
            <Input
              label="Expected Amount — GHS (optional)"
              type="number"
              min="0"
              step="0.01"
              value={categoryForm.expectedAmount}
              onChange={e => setCategoryForm({ ...categoryForm, expectedAmount: e.target.value })}
              placeholder="Leave blank if there's no fixed amount"
            />
            <div className="flex justify-end gap-3 pt-2">
              {editingCategoryId && (
                <Button type="button" variant="secondary" onClick={() => { setEditingCategoryId(null); setCategoryForm(EMPTY_CATEGORY_FORM); }}>
                  Cancel Edit
                </Button>
              )}
              <Button type="submit">{editingCategoryId ? 'Save Changes' : 'Add Category'}</Button>
            </div>
          </form>
        </div>
      </Modal>

      {deleteTarget && (
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Transaction">
          <div className="pt-2">
            <p className="text-sm text-gray-600">
              Delete the {deleteTarget.receiptNumber} receipt for {deleteTarget.student?.firstName} {deleteTarget.student?.lastName} (GHS {Number(deleteTarget.amount).toFixed(2)})? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDeleteTransaction}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      {reconcileTarget && (
        <Modal
          isOpen={!!reconcileTarget}
          onClose={() => setReconcileTarget(null)}
          title="Apply Payment to Invoice"
        >
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-600">
              Apply receipt {reconcileTarget.receiptNumber} (GHS {Number(reconcileTarget.amount).toFixed(2)}) for {reconcileTarget.student?.firstName} {reconcileTarget.student?.lastName} to an outstanding invoice. The receipt amount and ledger entry will not change.
            </p>
            {reconcileLoading ? (
              <p className="text-sm text-gray-500">Loading eligible invoices…</p>
            ) : (
              <Select
                label="Invoice"
                value={reconcileInvoiceId}
                onChange={(event) => setReconcileInvoiceId(event.target.value)}
                options={reconcileInvoices.map((invoice) => ({
                  value: invoice.id,
                  label: `${invoice.invoiceNumber} · ${invoice.term?.termNumber?.replace('TERM', 'Term ') || 'Term'} ${invoice.term?.academicYear || ''} · Category balance GHS ${Number(invoice.categoryTotals[reconcileTarget.category?.id]?.outstanding || 0).toFixed(2)}`,
                }))}
                placeholder="Select an invoice"
              />
            )}
            <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
              <Button variant="secondary" onClick={() => setReconcileTarget(null)}>Cancel</Button>
              <Button
                onClick={confirmReconcileTransaction}
                disabled={reconcileLoading || reconciling || !reconcileInvoiceId}
              >
                {reconciling ? 'Applying…' : 'Apply Payment'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
