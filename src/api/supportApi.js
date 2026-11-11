import api, { unwrapItem } from './axios';

export const getSupportTickets = async (params) => {
  const res = await api.get('/admin/support/tickets', { params });
  return unwrapItem(res.data);
};

export const getSupportTicket = async (id) => {
  const res = await api.get(`/admin/support/tickets/${id}`);
  return unwrapItem(res.data);
};

export const updateSupportTicket = async (id, data) => {
  const res = await api.patch(`/admin/support/tickets/${id}`, data);
  return unwrapItem(res.data);
};

export const addSupportTicketMessage = async (id, data) => {
  const res = await api.post(`/admin/support/tickets/${id}/messages`, data);
  return unwrapItem(res.data);
};

export const resolveSupportTicket = async (id) => {
  const res = await api.post(`/admin/support/tickets/${id}/resolve`);
  return unwrapItem(res.data);
};

export const closeSupportTicket = async (id) => {
  const res = await api.post(`/admin/support/tickets/${id}/close`);
  return unwrapItem(res.data);
};

export const getSupportFeedback = async (params) => {
  const res = await api.get('/admin/support/feedback', { params });
  return unwrapItem(res.data);
};

export const markSupportFeedbackHelpful = async (id, helpful) => {
  const res = await api.post(`/admin/support/feedback/${id}/helpful`, { helpful });
  return unwrapItem(res.data);
};
