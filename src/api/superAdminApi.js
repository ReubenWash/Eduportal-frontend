import api, { unwrapItem, unwrapList } from './axios';

// ─── Subscription Plans ────────────────────────────────────────────
export const getSubscriptionPlans = async () => {
  const res = await api.get('/admin/plans');
  return unwrapList(res.data);
};

export const createSubscriptionPlan = async (data) => {
  const res = await api.post('/admin/plans', data);
  return unwrapItem(res.data);
};

export const updateSubscriptionPlan = async (id, data) => {
  const res = await api.patch(`/admin/plans/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteSubscriptionPlan = async (id) => {
  const res = await api.delete(`/admin/plans/${id}`);
  return unwrapItem(res.data);
};

// ─── Schools ──────────────────────────────────────────────────────
export const updateSchoolDetails = async (id, data) => {
  const res = await api.patch(`/schools/${id}`, data);
  return unwrapItem(res.data);
};

export const updateSchoolPlan = async (id, plan) => {
  const res = await api.patch(`/schools/${id}/plan`, { plan });
  return unwrapItem(res.data);
};

// ─── Announcements / Broadcast ────────────────────────────────────
export const sendBroadcast = async ({ title, message, audience, channels }) => {
  const res = await api.post('/admin/broadcasts', { title, message, audience, channels });
  return unwrapItem(res.data);
};

export const getBroadcastHistory = async () => {
  const res = await api.get('/admin/broadcasts');
  return unwrapList(res.data);
};

// ─── Email: Welcome / Transactional ───────────────────────────────
export const sendWelcomeEmail = async (schoolId) => {
  const res = await api.post(`/admin/emails/welcome`, { schoolId });
  return unwrapItem(res.data);
};

export const getEmailTemplates = async () => {
  const res = await api.get('/admin/email-templates');
  return unwrapList(res.data);
};

export const updateEmailTemplate = async (id, data) => {
  const res = await api.patch(`/admin/email-templates/${id}`, data);
  return unwrapItem(res.data);
};

// ─── In-App / Push Notifications ─────────────────────────────────
export const sendPushNotification = async ({ title, body, audience }) => {
  const res = await api.post('/admin/notifications/push', { title, body, audience });
  return unwrapItem(res.data);
};

// ─── System Configuration ─────────────────────────────────────────
export const updateEnvConfig = async (keys) => {
  const res = await api.post('/admin/config/env', { keys });
  return unwrapItem(res.data);
};

export const getGlobalSettings = async () => {
  const res = await api.get('/admin/config/settings');
  return unwrapItem(res.data);
};

export const updateGlobalSettings = async (settings) => {
  const res = await api.put('/admin/config/settings', { settings });
  return unwrapItem(res.data);
};

// ─── Users (Super Admin) ──────────────────────────────────────────
export const getAdminUsers = async () => {
  const res = await api.get('/admin/users');
  return unwrapList(res.data);
};

export const addAdminUser = async (data) => {
  const res = await api.post('/admin/users', data);
  return unwrapItem(res.data);
};

export const updateAdminUserStatus = async (id, status) => {
  const res = await api.patch(`/admin/users/${id}/status`, { status });
  return unwrapItem(res.data);
};

export const deleteAdminUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return unwrapItem(res.data);
};
