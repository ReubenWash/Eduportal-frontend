import api, { unwrapList, unwrapItem } from './axios';

// Categories
export const getExpenseCategories = async (includeInactive = false) => {
  const res = await api.get('/expenses/categories', { params: { includeInactive } });
  return unwrapList(res.data);
};
export const createExpenseCategory = async (data) => {
  const res = await api.post('/expenses/categories', data);
  return unwrapItem(res.data);
};
export const updateExpenseCategory = async (id, data) => {
  const res = await api.patch(`/expenses/categories/${id}`, data);
  return unwrapItem(res.data);
};
export const deactivateExpenseCategory = async (id) => {
  const res = await api.delete(`/expenses/categories/${id}`);
  return unwrapItem(res.data);
};

// Expenses
export const getExpenses = async (params) => {
  const res = await api.get('/expenses', { params });
  return unwrapList(res.data);
};
export const recordExpense = async (data) => {
  const res = await api.post('/expenses', data);
  return unwrapItem(res.data);
};
export const updateExpense = async (id, data) => {
  const res = await api.patch(`/expenses/${id}`, data);
  return unwrapItem(res.data);
};
export const deleteExpense = async (id) => {
  const res = await api.delete(`/expenses/${id}`);
  return unwrapItem(res.data);
};