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
  getExpenseCategories,
  createExpenseCategory,
  deactivateExpenseCategory,
  getExpenses,
  recordExpense,
  deleteExpense,
} from '../../api/expenseApi';
import api from '../../api/axios';
import { PAYMENT_METHODS } from '../../api/financeApi';
import { Plus, Tag, Trash2, Receipt, Search } from 'lucide-react';

const EMPTY_EXPENSE_FORM = {
  expenseCategoryId: '', vendor: '', amount: '', method: 'CASH',
  notes: '', receiptUrl: '',
};
const EMPTY_CATEGORY_FORM = { name: '' };

export default function Expenses() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';

  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_EXPENSE_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [catModalOpen, setCatModalOpen] = useState(false);
  const [catForm, setCatForm] = useState(EMPTY_CATEGORY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const [cats, exps] = await Promise.all([
        getExpenseCategories(),
        getExpenses(categoryFilter ? { expenseCategoryId: categoryFilter } : undefined),
      ]);
      setCategories(cats);
      setExpenses(exps);
    } catch {
      addToast('Failed to load expenses', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [categoryFilter]);

  const openRecord = () => {
    setForm(EMPTY_EXPENSE_FORM);
    setDrawerOpen(true);
  };

  // Upload receipt to your existing upload endpoint. Adjust the URL to
  // whatever your Documents module uses (assumed POST /upload with a
  // field named "file", returning { url, originalName, mimeType, size }).
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data?.data || res.data;
      setForm((f) => ({ ...f, receiptUrl: uploaded.url }));
      addToast('Receipt uploaded', 'success');
    } catch (err) {
      addToast(err?.response?.data?.message || 'Receipt upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRecord = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await recordExpense({ ...form, amount: Number(form.amount) });
      addToast('Expense recorded', 'success');
      setDrawerOpen(false);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to record expense', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      await createExpenseCategory(catForm);
      addToast('Category created', 'success');
      setCatForm(EMPTY_CATEGORY_FORM);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to save category', 'error');
    }
  };

  const handleDeactivateCategory = async (cat) => {
    try {
      await deactivateExpenseCategory(cat.id);
      addToast('Category deactivated', 'success');
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to deactivate', 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteExpense(deleteTarget.id);
      addToast('Expense deleted', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      addToast(err?.response?.data?.message || 'Delete failed', 'error');
      setDeleteTarget(null);
    }
  };

  const filtered = expenses.filter((e) => {
    if (!keyword) return true;
    const k = keyword.toLowerCase();
    return (
      e.vendor?.toLowerCase().includes(k) ||
      e.expenseNumber?.toLowerCase().includes(k)
    );
  });

  return (
    <div>
      <PageHeader
        title="Expenses"
        subtitle="Record and track school expenses — utilities, salaries, supplies, maintenance."
        action={
          <>
            {isAdmin && (
              <Button variant="secondary" onClick={() => setCatModalOpen(true)} icon={Tag}>
                Manage Categories
              </Button>
            )}
            <Button onClick={openRecord} icon={Plus}>Record Expense</Button>
          </>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by vendor or expense number..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="All categories"
            className="w-full sm:w-56"
          />
        </div>

        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No expenses recorded yet"
          columns={[
            { header: 'Number', key: 'expenseNumber', render: (v) => (
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-mono text-gray-700">{v}</span>
              </div>
            )},
            { header: 'Category', key: '_cat', render: (_, row) => <Badge variant="info">{row.expenseCategory?.name}</Badge> },
            { header: 'Vendor', key: 'vendor', render: (v) => <span className="text-sm text-gray-700">{v || '—'}</span> },
            { header: 'Amount', key: 'amount', render: (v) => <span className="text-sm font-semibold text-gray-900">GHS {Number(v).toFixed(2)}</span> },
            { header: 'Method', key: 'method', render: (v) => <span className="text-sm text-gray-600">{PAYMENT_METHODS.find((m) => m.value === v)?.label || v}</span> },
            { header: 'Date', key: 'createdAt', render: (v) => <span className="text-sm text-gray-500">{v ? new Date(v).toLocaleDateString() : '—'}</span> },
          ]}
          rowActions={(row) => isAdmin ? (
            <button
              onClick={() => setDeleteTarget(row)}
              className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          ) : null}
        />
      </div>

      {/* Record Expense */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Record Expense"
        subtitle="Log money paid out by the school."
      >
        <form onSubmit={handleRecord} className="space-y-4">
          <Select
            label="Category"
            value={form.expenseCategoryId}
            onChange={(e) => setForm({ ...form, expenseCategoryId: e.target.value })}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Select a category..."
            required
          />
          {categories.length === 0 && (
            <p className="text-xs text-amber-600">No expense categories yet — use "Manage Categories" above to add one first.</p>
          )}
          <Input label="Vendor (optional)" value={form.vendor} onChange={(e) => setForm({ ...form, vendor: e.target.value })} />
          <Input
            label="Amount (GHS)"
            type="number" min="0.01" step="0.01"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
            required
          />
          <Select
            label="Payment Method"
            value={form.method}
            onChange={(e) => setForm({ ...form, method: e.target.value })}
            options={PAYMENT_METHODS}
          />
          <Input label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt (optional)</label>
            <input type="file" onChange={handleReceiptUpload} disabled={uploading} />
            {form.receiptUrl && <p className="text-xs text-green-600 mt-1">Uploaded ✓</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || categories.length === 0 || uploading}>
              {saving ? 'Recording…' : 'Record Expense'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Manage Categories */}
      <Modal isOpen={catModalOpen} onClose={() => setCatModalOpen(false)} title="Expense Categories">
        <div className="space-y-4 pt-2">
          {categories.length > 0 && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between border border-gray-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <button onClick={() => handleDeactivateCategory(cat)} className="text-xs text-red-600 hover:text-red-700">Deactivate</button>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleSaveCategory} className="space-y-3 pt-3 border-t border-gray-100">
            <Input
              label="Name"
              value={catForm.name}
              onChange={(e) => setCatForm({ name: e.target.value })}
              placeholder="e.g. Utilities, Salaries, Supplies"
              required
            />
            <div className="flex justify-end">
              <Button type="submit">Add Category</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete */}
      {deleteTarget && (
        <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Expense">
          <div className="pt-2">
            <p className="text-sm text-gray-600">
              Delete {deleteTarget.expenseNumber} (GHS {Number(deleteTarget.amount).toFixed(2)})? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}