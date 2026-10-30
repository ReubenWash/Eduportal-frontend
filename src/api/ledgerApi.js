import api, { unwrapList, unwrapItem } from './axios';

export const getLedgerAccounts = async (includeInactive = false) => {
  const res = await api.get('/ledger/accounts', { params: { includeInactive } });
  return unwrapList(res.data);
};
export const getAccountBalances = async () => {
  const res = await api.get('/ledger/balances');
  return unwrapList(res.data);
};
export const getTrialBalance = async () => {
  const res = await api.get('/ledger/trial-balance');
  return unwrapItem(res.data);
};
export const getDaybook = async (params) => {
  const res = await api.get('/ledger/daybook', { params });
  return unwrapList(res.data);
};
export const exportDaybook = async (params) => {
  const res = await api.get('/ledger/daybook/export', { params, responseType: 'blob' });
  return res.data;
};