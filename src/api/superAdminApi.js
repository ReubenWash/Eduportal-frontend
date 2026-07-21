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

const buildSuperAdminDashboardFallbackPayload = ({ schools = [], users = [] }) => {
  const normalizedSchools = Array.isArray(schools) ? schools : [];
  const normalizedUsers = Array.isArray(users) ? users : [];

  const activeSchools = normalizedSchools.filter((school) => (school?.status || '').toUpperCase() === 'ACTIVE').length;
  const pendingSchools = normalizedSchools.filter((school) => (school?.status || '').toUpperCase() === 'PENDING').length;
  const activeUsers = normalizedUsers.filter((user) => (user?.status || '').toUpperCase() === 'ACTIVE').length;
  const suspendedUsers = normalizedUsers.filter((user) => (user?.status || '').toUpperCase() === 'SUSPENDED').length;

  return {
    stats: [
      { label: 'Total Schools', value: normalizedSchools.length, icon: 'School', bg: 'bg-indigo-50', text: 'text-indigo-600', change: `${activeSchools} active` },
      { label: 'Active Schools', value: activeSchools, icon: 'School', bg: 'bg-emerald-50', text: 'text-emerald-600', change: `${pendingSchools} pending` },
      { label: 'Total Users', value: normalizedUsers.length, icon: 'Users', bg: 'bg-violet-50', text: 'text-violet-600', change: `${activeUsers} active` },
      { label: 'Active Users', value: activeUsers, icon: 'Users', bg: 'bg-sky-50', text: 'text-sky-600', change: `${suspendedUsers} suspended` },
      { label: 'Pending Schools', value: pendingSchools, icon: 'Clock', bg: 'bg-amber-50', text: 'text-amber-600', change: 'Awaiting review' },
      { label: 'Suspended Accounts', value: suspendedUsers, icon: 'ShieldCheck', bg: 'bg-rose-50', text: 'text-rose-600', change: 'Needs attention' },
    ],
    registrationTrend: normalizedSchools.slice(0, 6).map((school, index) => ({
      month: school?.createdAt ? new Date(school.createdAt).toLocaleString('en', { month: 'short' }) : `M${index + 1}`,
      schools: 1,
    })),
    recentActivity: [
      ...normalizedSchools.slice(0, 3).map((school) => ({
        id: `school-${school.id}`,
        type: 'approved',
        text: `${school.name || 'A school'} was added to the platform`,
        time: school.createdAt ? new Date(school.createdAt).toLocaleDateString('en-GB') : 'Recently added',
      })),
      ...normalizedUsers.slice(0, 3).map((user) => ({
        id: `user-${user.id}`,
        type: 'user',
        text: `${user.name || user.email || 'A user'} was updated in the system`,
        time: user.joinedAt ? new Date(user.joinedAt).toLocaleDateString('en-GB') : 'Recently updated',
      })),
    ].slice(0, 6),
  };
};

export const getSuperAdminDashboard = async () => {
  try {
    const res = await api.get('/schools/admin/dashboard');
    return unwrapItem(res.data);
  } catch (error) {
    if (error?.response?.status !== 404) {
      throw error;
    }

    const schoolsResponse = await api.get('/schools').catch(() => ({ data: { data: [] } }));
    const usersResponse = await api.get('/admin/users').catch(() => ({ data: { data: [] } }));

    return buildSuperAdminDashboardFallbackPayload({
      schools: unwrapList(schoolsResponse.data),
      users: unwrapList(usersResponse.data),
    });
  }
};

// ─── Users (Super Admin) ──────────────────────────────────────────
export const getAdminUsers = async () => {
  try {
    const res = await api.get('/admin/users');
    return unwrapList(res.data);
  } catch (error) {
    if (error?.response?.status === 404) return [];
    throw error;
  }
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

// ─── Phase 1: Security & Audit ────────────────────────────────────
export const getAuditLogs = async (params) => {
  const res = await api.get('/admin/audit', { params });
  return unwrapItem(res.data);
};

export const getSecuritySettings = async () => {
  const res = await api.get('/admin/security/settings');
  return unwrapItem(res.data);
};

export const updateSecuritySettings = async (settings) => {
  const res = await api.patch('/admin/security/settings', { settings });
  return unwrapItem(res.data);
};

export const getLoginAttempts = async (params) => {
  const res = await api.get('/admin/security/login-attempts', { params });
  return unwrapItem(res.data);
};

export const toggleMaintenanceMode = async (enabled, message) => {
  const res = await api.post('/admin/security/maintenance', { enabled, message });
  return unwrapItem(res.data);
};

// ─── Phase 2: Subscriptions & Billing ─────────────────────────────
export const getSubscriptions = async (params) => {
  const res = await api.get('/admin/subscriptions', { params });
  return unwrapItem(res.data);
};

export const getRevenueAnalytics = async (params) => {
  const res = await api.get('/admin/revenue', { params });
  return unwrapItem(res.data);
};

// ─── Phase 3: Support System ──────────────────────────────────────
export const getSupportTickets = async (params) => {
  const res = await api.get('/admin/support/tickets', { params });
  return unwrapItem(res.data);
};

// ─── Phase 4: CMS & Content ───────────────────────────────────────
export const getCmsPages = async (params) => {
  const res = await api.get('/admin/cms/pages', { params });
  return unwrapItem(res.data);
};

export const getLegalDocuments = async (params) => {
  const res = await api.get('/admin/cms/legal', { params });
  return unwrapList(res.data);
};

// ─── Phase 5: Integrations & API Keys ─────────────────────────────
export const getIntegrations = async (params) => {
  const res = await api.get('/admin/integrations', { params });
  return unwrapList(res.data);
};

export const updateIntegration = async (id, data) => {
  const res = await api.patch(`/admin/integrations/${id}`, data);
  return unwrapItem(res.data);
};

export const getApiKeys = async (params) => {
  const res = await api.get('/admin/integrations/api-keys', { params });
  return unwrapItem(res.data);
};

export const createApiKey = async (data) => {
  const res = await api.post('/admin/integrations/api-keys', data);
  return unwrapItem(res.data);
};

// ─── Phase 6: System & Monitoring ─────────────────────────────────
export const getSystemMetrics = async () => {
  const res = await api.get('/admin/system/metrics/current');
  return unwrapItem(res.data);
};

export const getServiceHealth = async () => {
  const res = await api.get('/admin/system/health');
  return unwrapList(res.data);
};

export const getSystemBackups = async (params) => {
  const res = await api.get('/admin/system/backups', { params });
  return unwrapItem(res.data);
};

export const getDeveloperSettings = async () => {
  const res = await api.get('/admin/system/developer');
  return unwrapItem(res.data);
};

export const updateDeveloperSetting = async (key, value) => {
  const res = await api.post('/admin/system/developer', { key, value });
  return unwrapItem(res.data);
};
