import api, { unwrapList, unwrapItem } from './axios';

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'MOMO', label: 'Mobile Money' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'OTHER', label: 'Other' },
];

// ── Categories (school admin: full control; accountant: read-only) ──
export const getFinanceCategories = async (includeInactive = false) => {
  const res = await api.get('/finance/categories', { params: { includeInactive } });
  return unwrapList(res.data);
};

export const createFinanceCategory = async (data) => {
  const res = await api.post('/finance/categories', data);
  return unwrapItem(res.data);
};

export const updateFinanceCategory = async (id, data) => {
  const res = await api.patch(`/finance/categories/${id}`, data);
  return unwrapItem(res.data);
};

export const deactivateFinanceCategory = async (id) => {
  const res = await api.delete(`/finance/categories/${id}`);
  return unwrapItem(res.data);
};

// ── Transactions (school admin + accountant) ──
export const getFinanceTransactions = async (params) => {
  const res = await api.get('/finance/transactions', { params });
  return unwrapList(res.data);
};

export const recordFinanceTransaction = async (data) => {
  const res = await api.post('/finance/transactions', data);
  return unwrapItem(res.data);
};

export const updateFinanceTransaction = async (id, data) => {
  const res = await api.patch(`/finance/transactions/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteFinanceTransaction = async (id) => {
  const res = await api.delete(`/finance/transactions/${id}`);
  return unwrapItem(res.data);
};

export const getStudentFinanceSummary = async (studentId) => {
  const res = await api.get(`/finance/students/${studentId}/summary`);
  return unwrapItem(res.data);
};

// ── Self-service (student/parent, read-only) ──
export const getMyFinance = async () => {
  const res = await api.get('/students/me/finance');
  return unwrapItem(res.data);
};

export const getChildFinance = async (studentId) => {
  const res = await api.get(`/guardians/me/children/${studentId}/finance`);
  return unwrapItem(res.data);
};

// ── Phase 2: fee structures, invoicing, concessions, and arrears ──
export const getFeeOptions = async () => {
  const res = await api.get('/finance/fee-options');
  return unwrapItem(res.data);
};

export const getFeeStructures = async () => {
  const res = await api.get('/finance/fee-structures');
  return unwrapList(res.data);
};

export const saveFeeStructure = async (data) => {
  const res = await api.put('/finance/fee-structures', data);
  return unwrapItem(res.data);
};

export const generateFeeInvoices = async (data) => {
  const res = await api.post('/finance/invoices/generate', data);
  return unwrapItem(res.data);
};

export const getFeeInvoices = async (params) => {
  const res = await api.get('/finance/invoices', { params });
  return unwrapList(res.data);
};

export const getFeeArrears = async (params) => {
  const res = await api.get('/finance/arrears', { params });
  return unwrapList(res.data);
};

export const addFeeConcession = async (invoiceId, data) => {
  const res = await api.post(`/finance/invoices/${invoiceId}/concessions`, data);
  return unwrapItem(res.data);
};

export const sendFeeReminders = async (invoiceIds) => {
  const res = await api.post('/finance/arrears/reminders', { invoiceIds });
  return unwrapItem(res.data);
};
