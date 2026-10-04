import api, { unwrapItem } from './axios';

export const formatGHS = (n) =>
  `GHS ${Number(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// List endpoints reply { data: { data: [...], pagination } }
const toList = (body) => ({ rows: body?.data?.data ?? [], pagination: body?.data?.pagination ?? null });

// Open a protected proof file (needs the auth header, so fetch it as a blob).
// The tab is opened first so the browser does not treat it as a blocked popup.
export const openProof = async (proofUrl) => {
  const tab = window.open('', '_blank');
  try {
    const res = await api.get(proofUrl, { responseType: 'blob' });
    const blobUrl = URL.createObjectURL(res.data);
    if (tab) tab.location.href = blobUrl;
    setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
  } catch (e) {
    if (tab) tab.close();
    throw e;
  }
};

export const fetchProofBlob = async (proofUrl) => (await api.get(proofUrl, { responseType: 'blob' })).data;

// ── School admin ───────────────────────────────────────────────
export const getBillingSummary = async () => unwrapItem((await api.get('/billing/summary')).data);

export const getMyPayments = async (params = {}) => toList((await api.get('/billing/payments', { params })).data);

export const submitPaymentProof = async (formData) =>
  unwrapItem((await api.post('/billing/payments', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data);

// ── Super admin ────────────────────────────────────────────────
export const getBillingOverview = async () => unwrapItem((await api.get('/admin/billing/overview')).data);

export const getBillingSettings = async () => unwrapItem((await api.get('/admin/billing/settings')).data);

export const saveBillingSettings = async (body) => unwrapItem((await api.put('/admin/billing/settings', body)).data);

export const listAdminPayments = async (params = {}) => toList((await api.get('/admin/billing/payments', { params })).data);

export const approvePayment = async (id, body = {}) => unwrapItem((await api.post(`/admin/billing/payments/${id}/approve`, body)).data);

export const rejectPayment = async (id, reason) => unwrapItem((await api.post(`/admin/billing/payments/${id}/reject`, { reason })).data);