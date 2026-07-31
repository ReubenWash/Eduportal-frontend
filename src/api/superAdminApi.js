/// frontend/src/api/superAdminApi.js
import api, { unwrapItem, unwrapList } from './axios';

// ─── AUTH & SECURITY ────────────────────────────────────────────
export const getSecuritySettings = async () => {
  const res = await api.get('/admin/security/settings');
  return unwrapItem(res.data);
};

export const updateSecuritySettings = async (settings) => {
  const res = await api.patch('/admin/security/settings', { settings });
  return unwrapItem(res.data);
};

export const get2FAStatus = async () => {
  const res = await api.get('/admin/security/2fa/status');
  return unwrapItem(res.data);
};

export const enable2FA = async (userId) => {
  const res = await api.post(`/admin/security/2fa/${userId}/enable`);
  return unwrapItem(res.data);
};

export const disable2FA = async (userId) => {
  const res = await api.post(`/admin/security/2fa/${userId}/disable`);
  return unwrapItem(res.data);
};

export const getIpWhitelist = async () => {
  const res = await api.get('/admin/security/ip-whitelist');
  return unwrapList(res.data);
};

export const addIpToWhitelist = async (ipAddress, label) => {
  const res = await api.post('/admin/security/ip-whitelist', { ipAddress, label });
  return unwrapItem(res.data);
};

export const removeIpFromWhitelist = async (id) => {
  const res = await api.delete(`/admin/security/ip-whitelist/${id}`);
  return unwrapItem(res.data);
};

export const getLoginAttempts = async (params) => {
  const res = await api.get('/admin/security/login-attempts', { params });
  return unwrapItem(res.data);
};

export const blockIp = async (ipAddress, reason) => {
  const res = await api.post('/admin/security/login-attempts/block-ip', { ipAddress, reason });
  return unwrapItem(res.data);
};

export const unblockIp = async (ipAddress) => {
  const res = await api.post('/admin/security/login-attempts/unblock-ip', { ipAddress });
  return unwrapItem(res.data);
};

export const toggleMaintenance = async (enabled, message) => {
  const res = await api.post('/admin/security/maintenance', { enabled, message });
  return unwrapItem(res.data);
};

// ─── AUDIT LOGS ──────────────────────────────────────────────────
export const getAuditLogs = async (params) => {
  const res = await api.get('/admin/audit', { params });
  return unwrapItem(res.data);
};

export const getAuditLog = async (id) => {
  const res = await api.get(`/admin/audit/${id}`);
  return unwrapItem(res.data);
};

export const exportAuditLogs = async (params) => {
  const res = await api.get('/admin/audit/export', { 
    params,
    responseType: 'blob' 
  });
  return res.data;
};

export const getAuditStats = async () => {
  const res = await api.get('/admin/audit/stats');
  return unwrapItem(res.data);
};

// ─── CMS ────────────────────────────────────────────────────────
export const getCmsPages = async (params) => {
  const res = await api.get('/admin/cms/pages', { params });
  return unwrapItem(res.data);
};

export const getCmsPage = async (id) => {
  const res = await api.get(`/admin/cms/pages/${id}`);
  return unwrapItem(res.data);
};

export const getCmsPageBySlug = async (slug) => {
  const res = await api.get(`/admin/cms/pages/slug/${slug}`);
  return unwrapItem(res.data);
};

export const getHomepage = async () => {
  const res = await api.get('/admin/cms/pages/homepage');
  return unwrapItem(res.data);
};

export const createCmsPage = async (data) => {
  const res = await api.post('/admin/cms/pages', data);
  return unwrapItem(res.data);
};

export const updateCmsPage = async (id, data) => {
  const res = await api.patch(`/admin/cms/pages/${id}`, data);
  return unwrapItem(res.data);
};

export const publishCmsPage = async (id) => {
  const res = await api.post(`/admin/cms/pages/${id}/publish`);
  return unwrapItem(res.data);
};

export const unpublishCmsPage = async (id) => {
  const res = await api.post(`/admin/cms/pages/${id}/unpublish`);
  return unwrapItem(res.data);
};

export const deleteCmsPage = async (id) => {
  const res = await api.delete(`/admin/cms/pages/${id}`);
  return unwrapItem(res.data);
};

// ─── CMS SECTIONS ──────────────────────────────────────────────
export const getCmsSections = async (params) => {
  const res = await api.get('/admin/cms/sections', { params });
  return unwrapList(res.data);
};

export const getCmsSection = async (id) => {
  const res = await api.get(`/admin/cms/sections/${id}`);
  return unwrapItem(res.data);
};

export const createCmsSection = async (data) => {
  const res = await api.post('/admin/cms/sections', data);
  return unwrapItem(res.data);
};

export const updateCmsSection = async (id, data) => {
  const res = await api.patch(`/admin/cms/sections/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteCmsSection = async (id) => {
  const res = await api.delete(`/admin/cms/sections/${id}`);
  return unwrapItem(res.data);
};

export const reorderCmsSections = async (data) => {
  const res = await api.post('/admin/cms/sections/reorder', data);
  return unwrapItem(res.data);
};

// ─── LEGAL DOCUMENTS ───────────────────────────────────────────
export const getLegalDocuments = async (params) => {
  const res = await api.get('/admin/cms/legal', { params });
  return unwrapList(res.data);
};

export const getLegalDocument = async (id) => {
  const res = await api.get(`/admin/cms/legal/${id}`);
  return unwrapItem(res.data);
};

export const createLegalDocument = async (data) => {
  const res = await api.post('/admin/cms/legal', data);
  return unwrapItem(res.data);
};

export const updateLegalDocument = async (id, data) => {
  const res = await api.patch(`/admin/cms/legal/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteLegalDocument = async (id) => {
  const res = await api.delete(`/admin/cms/legal/${id}`);
  return unwrapItem(res.data);
};

export const getConsentLogs = async (params) => {
  const res = await api.get('/admin/cms/legal/consent-logs', { params });
  return unwrapItem(res.data);
};

// ─── EMAIL TEMPLATES ───────────────────────────────────────────
export const getEmailTemplates = async (params) => {
  const res = await api.get('/admin/cms/email-templates', { params });
  return unwrapList(res.data);
};

export const getEmailTemplate = async (id) => {
  const res = await api.get(`/admin/cms/email-templates/${id}`);
  return unwrapItem(res.data);
};

export const createEmailTemplate = async (data) => {
  const res = await api.post('/admin/cms/email-templates', data);
  return unwrapItem(res.data);
};

export const updateEmailTemplate = async (id, data) => {
  const res = await api.patch(`/admin/cms/email-templates/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteEmailTemplate = async (id) => {
  const res = await api.delete(`/admin/cms/email-templates/${id}`);
  return unwrapItem(res.data);
};

export const sendTestEmail = async (id, email, variables) => {
  const res = await api.post(`/admin/cms/email-templates/${id}/test`, { email, variables });
  return unwrapItem(res.data);
};

export const seedEmailTemplates = async () => {
  const res = await api.post('/admin/cms/email-templates/seed');
  return unwrapItem(res.data);
};

// ─── INTEGRATIONS ──────────────────────────────────────────────
export const getIntegrations = async (params) => {
  const res = await api.get('/admin/integrations', { params });
  return unwrapList(res.data);
};

export const getIntegration = async (id) => {
  const res = await api.get(`/admin/integrations/${id}`);
  return unwrapItem(res.data);
};

export const createIntegration = async (data) => {
  const res = await api.post('/admin/integrations', data);
  return unwrapItem(res.data);
};

export const updateIntegration = async (id, data) => {
  const res = await api.patch(`/admin/integrations/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteIntegration = async (id) => {
  const res = await api.delete(`/admin/integrations/${id}`);
  return unwrapItem(res.data);
};

export const testIntegration = async (id) => {
  const res = await api.post(`/admin/integrations/${id}/test`);
  return unwrapItem(res.data);
};

// ─── WEBHOOKS ──────────────────────────────────────────────────
export const getWebhooks = async (params) => {
  const res = await api.get('/admin/integrations/webhooks', { params });
  return unwrapList(res.data);
};

export const getWebhook = async (id) => {
  const res = await api.get(`/admin/integrations/webhooks/${id}`);
  return unwrapItem(res.data);
};

export const createWebhook = async (data) => {
  const res = await api.post('/admin/integrations/webhooks', data);
  return unwrapItem(res.data);
};

export const updateWebhook = async (id, data) => {
  const res = await api.patch(`/admin/integrations/webhooks/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteWebhook = async (id) => {
  const res = await api.delete(`/admin/integrations/webhooks/${id}`);
  return unwrapItem(res.data);
};

export const getWebhookLogs = async (params) => {
  const res = await api.get('/admin/integrations/webhooks/logs', { params });
  return unwrapItem(res.data);
};

export const triggerWebhook = async (id, event, payload) => {
  const res = await api.post(`/admin/integrations/webhooks/${id}/trigger`, { event, payload });
  return unwrapItem(res.data);
};

// ─── API KEYS ───────────────────────────────────────────────────
export const getApiKeys = async (params) => {
  const res = await api.get('/admin/integrations/api-keys', { params });
  return unwrapItem(res.data);
};

export const getApiKey = async (id) => {
  const res = await api.get(`/admin/integrations/api-keys/${id}`);
  return unwrapItem(res.data);
};

export const createApiKey = async (data) => {
  const res = await api.post('/admin/integrations/api-keys', data);
  return unwrapItem(res.data);
};

export const updateApiKey = async (id, data) => {
  const res = await api.patch(`/admin/integrations/api-keys/${id}`, data);
  return unwrapItem(res.data);
};

export const revokeApiKey = async (id) => {
  const res = await api.post(`/admin/integrations/api-keys/${id}/revoke`);
  return unwrapItem(res.data);
};

export const deleteApiKey = async (id) => {
  const res = await api.delete(`/admin/integrations/api-keys/${id}`);
  return unwrapItem(res.data);
};

// ─── SUBSCRIPTIONS ──────────────────────────────────────────────
export const getSubscriptions = async (params) => {
  const res = await api.get('/admin/subscriptions/subscriptions', { params });
  return unwrapItem(res.data);
};

export const getSubscriptionById = async (id) => {
  const res = await api.get(`/admin/subscriptions/subscriptions/${id}`);
  return unwrapItem(res.data);
};

export const getSchoolSubscription = async (schoolId) => {
  const res = await api.get(`/admin/subscriptions/subscriptions/school/${schoolId}`);
  return unwrapItem(res.data);
};

export const createSubscription = async (data) => {
  const res = await api.post('/admin/subscriptions/subscriptions', data);
  return unwrapItem(res.data);
};

export const updateSubscription = async (id, data) => {
  const res = await api.patch(`/admin/subscriptions/subscriptions/${id}`, data);
  return unwrapItem(res.data);
};

export const cancelSubscription = async (id) => {
  const res = await api.post(`/admin/subscriptions/subscriptions/${id}/cancel`);
  return unwrapItem(res.data);
};

// ─── PAYMENTS ────────────────────────────────────────────────────
export const getPayments = async (params) => {
  const res = await api.get('/admin/subscriptions/payments', { params });
  return unwrapItem(res.data);
};

export const createPayment = async (data) => {
  const res = await api.post('/admin/subscriptions/payments', data);
  return unwrapItem(res.data);
};

// ─── INVOICES ────────────────────────────────────────────────────
export const createInvoice = async (data) => {
  const res = await api.post('/admin/subscriptions/invoices', data);
  return unwrapItem(res.data);
};

// ─── REVENUE ANALYTICS ──────────────────────────────────────────
export const getRevenueAnalytics = async (params) => {
  const res = await api.get('/admin/subscriptions/revenue', { params });
  return unwrapItem(res.data);
};

// ─── PLANS ──────────────────────────────────────────────────────
export const getSubscriptionPlans = async () => {
  const res = await api.get('/admin/subscriptions/plans');
  return unwrapList(res.data);
};

export const createSubscriptionPlan = async (data) => {
  const res = await api.post('/admin/subscriptions/plans', data);
  return unwrapItem(res.data);
};

export const updateSubscriptionPlan = async (id, data) => {
  const res = await api.patch(`/admin/subscriptions/plans/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteSubscriptionPlan = async (id) => {
  const res = await api.delete(`/admin/subscriptions/plans/${id}`);
  return unwrapItem(res.data);
};

// ─── SUPPORT TICKETS ───────────────────────────────────────────
export const getSupportTickets = async (params) => {
  const res = await api.get('/admin/support/tickets', { params });
  return unwrapItem(res.data);
};

export const getSupportTicket = async (id) => {
  const res = await api.get(`/admin/support/tickets/${id}`);
  return unwrapItem(res.data);
};

export const createSupportTicket = async (data) => {
  const res = await api.post('/admin/support/tickets', data);
  return unwrapItem(res.data);
};

export const updateSupportTicket = async (id, data) => {
  const res = await api.patch(`/admin/support/tickets/${id}`, data);
  return unwrapItem(res.data);
};

export const addTicketMessage = async (id, data) => {
  const res = await api.post(`/admin/support/tickets/${id}/messages`, data);
  return unwrapItem(res.data);
};

export const assignTicket = async (id, assigneeId) => {
  const res = await api.post(`/admin/support/tickets/${id}/assign`, { assigneeId });
  return unwrapItem(res.data);
};

export const resolveTicket = async (id, rating, ratingComment) => {
  const res = await api.post(`/admin/support/tickets/${id}/resolve`, { rating, ratingComment });
  return unwrapItem(res.data);
};

export const closeTicket = async (id) => {
  const res = await api.post(`/admin/support/tickets/${id}/close`);
  return unwrapItem(res.data);
};

// ─── FEEDBACK ──────────────────────────────────────────────────
export const getFeedback = async (params) => {
  const res = await api.get('/admin/support/feedback', { params });
  return unwrapItem(res.data);
};

export const createFeedback = async (data) => {
  const res = await api.post('/admin/support/feedback', data);
  return unwrapItem(res.data);
};

export const replyToFeedback = async (id, data) => {
  const res = await api.post(`/admin/support/feedback/${id}/reply`, data);
  return unwrapItem(res.data);
};

export const markFeedbackHelpful = async (id, helpful) => {
  const res = await api.post(`/admin/support/feedback/${id}/helpful`, { helpful });
  return unwrapItem(res.data);
};

// ─── KNOWLEDGE BASE ────────────────────────────────────────────
export const getKnowledgeArticles = async (params) => {
  const res = await api.get('/admin/support/knowledge', { params });
  return unwrapItem(res.data);
};

export const getKnowledgeArticle = async (slug) => {
  const res = await api.get(`/admin/support/knowledge/${slug}`);
  return unwrapItem(res.data);
};

export const createKnowledgeArticle = async (data) => {
  const res = await api.post('/admin/support/knowledge', data);
  return unwrapItem(res.data);
};

export const updateKnowledgeArticle = async (id, data) => {
  const res = await api.patch(`/admin/support/knowledge/${id}`, data);
  return unwrapItem(res.data);
};

export const deleteKnowledgeArticle = async (id) => {
  const res = await api.delete(`/admin/support/knowledge/${id}`);
  return unwrapItem(res.data);
};

export const markArticleHelpful = async (id, helpful) => {
  const res = await api.post(`/admin/support/knowledge/${id}/helpful`, { helpful });
  return unwrapItem(res.data);
};

// ─── SYSTEM MONITORING ─────────────────────────────────────────
export const getSystemMetrics = async () => {
  const res = await api.get('/admin/system/metrics/current');
  return unwrapItem(res.data);
};

export const getMetricHistory = async (params) => {
  const res = await api.get('/admin/system/metrics/history', { params });
  return unwrapList(res.data);
};

export const getServiceHealth = async () => {
  const res = await api.get('/admin/system/health');
  return unwrapList(res.data);
};

export const checkServiceHealth = async () => {
  const res = await api.post('/admin/system/health/check');
  return unwrapList(res.data);
};

// ─── BACKUPS ────────────────────────────────────────────────────
export const getBackups = async (params) => {
  const res = await api.get('/admin/system/backups', { params });
  return unwrapItem(res.data);
};

export const getBackup = async (id) => {
  const res = await api.get(`/admin/system/backups/${id}`);
  return unwrapItem(res.data);
};

export const createBackup = async (data) => {
  const res = await api.post('/admin/system/backups', data);
  return unwrapItem(res.data);
};

export const restoreBackup = async (id) => {
  const res = await api.post(`/admin/system/backups/${id}/restore`);
  return unwrapItem(res.data);
};

export const deleteBackup = async (id) => {
  const res = await api.delete(`/admin/system/backups/${id}`);
  return unwrapItem(res.data);
};

export const getBackupSchedule = async () => {
  const res = await api.get('/admin/system/backups/schedule');
  return unwrapList(res.data);
};

export const updateBackupSchedule = async (data) => {
  const res = await api.post('/admin/system/backups/schedule', data);
  return unwrapItem(res.data);
};

// ─── ERROR LOGS ────────────────────────────────────────────────
export const getErrorLogs = async (params) => {
  const res = await api.get('/admin/system/errors', { params });
  return unwrapItem(res.data);
};

export const resolveErrorLog = async (id, notes) => {
  const res = await api.post(`/admin/system/errors/${id}/resolve`, { notes });
  return unwrapItem(res.data);
};

// ─── CACHE ─────────────────────────────────────────────────────
export const getCacheEntries = async (params) => {
  const res = await api.get('/admin/system/cache', { params });
  return unwrapItem(res.data);
};

export const clearCache = async (key) => {
  const res = await api.post('/admin/system/cache/clear', { key });
  return unwrapItem(res.data);
};

// ─── DEVELOPER SETTINGS ────────────────────────────────────────
export const getDeveloperSettings = async () => {
  const res = await api.get('/admin/system/developer');
  return unwrapItem(res.data);
};

export const updateDeveloperSetting = async (key, value) => {
  const res = await api.post('/admin/system/developer', { key, value });
  return unwrapItem(res.data);
};

// ─── SUPER ADMIN DASHBOARD ─────────────────────────────────────
export const getSuperAdminDashboard = async () => {
  const res = await api.get('/schools/admin/dashboard');
  return unwrapItem(res.data);
};

// ─── SCHOOL MANAGEMENT (SUPER ADMIN) ───────────────────────────
export const getSchools = async (params) => {
  const res = await api.get('/admin/schools', { params });
  return unwrapList(res.data);
};

export const getSchoolById = async (id) => {
  const res = await api.get(`/admin/schools/${id}`);
  return unwrapItem(res.data);
};

export const updateSchoolStatus = async (id, status) => {
  const res = await api.patch(`/admin/schools/${id}/status`, { status });
  return unwrapItem(res.data);
};

export const updateSchoolDetails = async (id, data) => {
  const res = await api.patch(`/admin/schools/${id}`, data);
  return unwrapItem(res.data);
};

export const updateSchoolPlan = async (id, plan) => {
  const res = await api.patch(`/admin/schools/${id}/plan`, { plan });
  return unwrapItem(res.data);
};

export const deleteSchool = async (id) => {
  const res = await api.delete(`/admin/schools/${id}`);
  return unwrapItem(res.data);
};

export const restoreSchool = async (id) => {
  const res = await api.post(`/admin/schools/${id}/restore`);
  return unwrapItem(res.data);
};

export const downloadSchoolRegistrationPdf = async (id) => {
  const res = await api.get(`/admin/schools/${id}/registration-pdf`, {
    responseType: 'blob'
  });
  return res.data;
};

export const getSchoolStats = async () => {
  const res = await api.get('/admin/schools/stats/overview');
  return unwrapItem(res.data);
};

// ─── DEBUG ENDPOINTS ────────────────────────────────────────────
export const debugCheckSchool = async (id) => {
  const res = await api.get(`/admin/schools/debug/check/${id}`);
  return unwrapItem(res.data);
};

export const debugGetStatus = async (id) => {
  const res = await api.get(`/admin/schools/debug/status/${id}`);
  return unwrapItem(res.data);
};

export const debugGetAllSchools = async () => {
  const res = await api.get('/admin/schools/debug/all');
  return unwrapItem(res.data);
};

// ─── USER MANAGEMENT ────────────────────────────────────────────
export const getAdminUsers = async (params) => {
  const res = await api.get('/admin/users', { params });
  return unwrapList(res.data);
};

export const getUserById = async (id) => {
  const res = await api.get(`/admin/users/${id}`);
  return unwrapItem(res.data);
};

export const createAdminUser = async (data) => {
  const res = await api.post('/admin/users', data);
  return unwrapItem(res.data);
};

export const updateAdminUser = async (id, data) => {
  const res = await api.patch(`/admin/users/${id}`, data);
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

// ─── USER VERIFICATION ──────────────────────────────────────────
export const verifyUser = async (userId) => {
  const res = await api.patch(`/admin/users/${userId}/verify`);
  return unwrapItem(res.data);
};

export const verifyAllUsersBySchool = async (schoolId) => {
  const res = await api.post(`/admin/users/school/${schoolId}/verify-all`);
  return unwrapItem(res.data);
};

// ─── SCHOOL ADMIN FUNCTIONS (Legacy - keep for backward compatibility) ──
export const getAllSchools = async (params) => {
  // This is the old endpoint - keep for backward compatibility
  const res = await api.get('/schools', { params });
  return unwrapList(res.data);
};

export const sendWelcomeEmail = async (schoolId) => {
  const res = await api.post(`/admin/emails/welcome`, { schoolId });
  return unwrapItem(res.data);
};

// ─── BROADCAST NOTIFICATIONS ────────────────────────────────────
export const sendBroadcast = async ({ title, message, audience, channels }) => {
  const res = await api.post('/notifications/mass-broadcast', { title, message, audience, channels });
  return unwrapItem(res.data);
};

export const broadcastNotification = async (data) => {
  const res = await api.post('/notifications/mass-broadcast', data);
  return unwrapItem(res.data);
};

export const sendPushNotification = async ({ title, body, audience }) => {
  const res = await api.post('/admin/notifications/push', { title, body, audience });
  return unwrapItem(res.data);
};

// ─── CONFIG ──────────────────────────────────────────────────────
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

// ─── ANALYTICS ──────────────────────────────────────────────────
export const getPlatformAnalytics = async () => {
  const res = await api.get('/admin/analytics');
  return unwrapItem(res.data);
};

export const exportAnalytics = async (params) => {
  const res = await api.get('/analytics/export', {
    params,
    responseType: 'blob',
  });
  return res.data;
};