// src/api/cmsApi.js
import axios from 'axios';

// Use the same base URL as your other API calls
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Try multiple possible token storage keys
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('authToken') || 
                  localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('token') ||
                  sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      // Clear invalid tokens
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('authToken');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// ── Helper to get auth token ──
export const getAuthToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('authToken') || 
         localStorage.getItem('accessToken') ||
         sessionStorage.getItem('token') ||
         sessionStorage.getItem('authToken');
};

// ── CMS API Functions ──

// Fetch landing page content from CMS
export const getLandingPageContent = async () => {
  try {
    const response = await apiClient.get('/cms/landing');
    return response;
  } catch (error) {
    console.error('Failed to fetch landing page content:', error);
    return null;
  }
};

// Save landing page content to CMS
export const saveLandingPageContent = async (content) => {
  try {
    const response = await apiClient.put('/admin/cms/landing', { content });
    return response;
  } catch (error) {
    console.error('Failed to save landing page content:', error);
    throw error;
  }
};

// Update a specific landing section
export const updateLandingSection = async (type, content) => {
  try {
    const response = await apiClient.patch(`/admin/cms/landing/section/${type}`, { content });
    return response;
  } catch (error) {
    console.error(`Failed to update ${type} section:`, error);
    throw error;
  }
};

// Fetch all CMS pages
export const getCmsPages = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/cms/pages', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch CMS pages:', error);
    return null;
  }
};

// Get a specific CMS page by slug
export const getCmsPageBySlug = async (slug) => {
  try {
    const response = await apiClient.get(`/cms/pages/${slug}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch CMS page ${slug}:`, error);
    return null;
  }
};

// Get a specific CMS page by ID
export const getCmsPageById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/cms/pages/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch CMS page ${id}:`, error);
    return null;
  }
};

// Create a new CMS page
export const createCmsPage = async (data) => {
  try {
    const response = await apiClient.post('/admin/cms/pages', data);
    return response;
  } catch (error) {
    console.error('Failed to create CMS page:', error);
    throw error;
  }
};

// Update a CMS page
export const updateCmsPage = async (id, data) => {
  try {
    const response = await apiClient.patch(`/admin/cms/pages/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Failed to update CMS page ${id}:`, error);
    throw error;
  }
};

// Publish a CMS page
export const publishCmsPage = async (id) => {
  try {
    const response = await apiClient.post(`/admin/cms/pages/${id}/publish`);
    return response;
  } catch (error) {
    console.error(`Failed to publish CMS page ${id}:`, error);
    throw error;
  }
};

// Unpublish a CMS page
export const unpublishCmsPage = async (id) => {
  try {
    const response = await apiClient.post(`/admin/cms/pages/${id}/unpublish`);
    return response;
  } catch (error) {
    console.error(`Failed to unpublish CMS page ${id}:`, error);
    throw error;
  }
};

// Delete a CMS page
export const deleteCmsPage = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/cms/pages/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete CMS page ${id}:`, error);
    throw error;
  }
};

// ── CMS Sections ──

// Get sections
export const getCmsSections = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/cms/sections', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch CMS sections:', error);
    return null;
  }
};

// Get a specific section
export const getCmsSectionById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/cms/sections/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch CMS section ${id}:`, error);
    return null;
  }
};

// Create a section
export const createCmsSection = async (data) => {
  try {
    const response = await apiClient.post('/admin/cms/sections', data);
    return response;
  } catch (error) {
    console.error('Failed to create CMS section:', error);
    throw error;
  }
};

// Update a section
export const updateCmsSection = async (id, data) => {
  try {
    const response = await apiClient.patch(`/admin/cms/sections/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Failed to update CMS section ${id}:`, error);
    throw error;
  }
};

// Update section content
export const updateCmsSectionContent = async (id, content) => {
  try {
    const response = await apiClient.patch(`/admin/cms/sections/${id}/content`, { content });
    return response;
  } catch (error) {
    console.error(`Failed to update CMS section content ${id}:`, error);
    throw error;
  }
};

// Delete a section
export const deleteCmsSection = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/cms/sections/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete CMS section ${id}:`, error);
    throw error;
  }
};

// Reorder sections
export const reorderCmsSections = async (pageId, sectionOrders) => {
  try {
    const response = await apiClient.post('/admin/cms/sections/reorder', { pageId, sectionOrders });
    return response;
  } catch (error) {
    console.error('Failed to reorder sections:', error);
    throw error;
  }
};

// ── Footer ──

// Get footer
export const getFooter = async () => {
  try {
    const response = await apiClient.get('/admin/cms/footer');
    return response;
  } catch (error) {
    console.error('Failed to fetch footer:', error);
    return null;
  }
};

// Update footer
export const updateFooter = async (footerData) => {
  try {
    const response = await apiClient.patch('/admin/cms/footer', footerData);
    return response;
  } catch (error) {
    console.error('Failed to update footer:', error);
    throw error;
  }
};

// ── Theme ──

// Get theme
export const getTheme = async () => {
  try {
    const response = await apiClient.get('/admin/cms/theme');
    return response;
  } catch (error) {
    console.error('Failed to fetch theme:', error);
    return null;
  }
};

// Update theme
export const updateTheme = async (themeData) => {
  try {
    const response = await apiClient.patch('/admin/cms/theme', themeData);
    return response;
  } catch (error) {
    console.error('Failed to update theme:', error);
    throw error;
  }
};

// ── CMS Settings ──

// Get CMS settings
export const getCmsSettings = async () => {
  try {
    const response = await apiClient.get('/admin/cms/settings');
    return response;
  } catch (error) {
    console.error('Failed to fetch CMS settings:', error);
    return null;
  }
};

// Update CMS settings
export const updateCmsSettings = async (settings) => {
  try {
    const response = await apiClient.patch('/admin/cms/settings', { settings });
    return response;
  } catch (error) {
    console.error('Failed to update CMS settings:', error);
    throw error;
  }
};

// ── Email Templates ──

export const getEmailTemplates = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/cms/email-templates', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch email templates:', error);
    throw error;
  }
};

export const getEmailTemplateById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/cms/email-templates/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch email template ${id}:`, error);
    throw error;
  }
};

export const createEmailTemplate = async (data) => {
  try {
    const response = await apiClient.post('/admin/cms/email-templates', data);
    return response;
  } catch (error) {
    console.error('Failed to create email template:', error);
    throw error;
  }
};

export const updateEmailTemplate = async (id, data) => {
  try {
    const response = await apiClient.patch(`/admin/cms/email-templates/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Failed to update email template ${id}:`, error);
    throw error;
  }
};

export const deleteEmailTemplate = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/cms/email-templates/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete email template ${id}:`, error);
    throw error;
  }
};

export const sendTestEmail = async (id, email, variables = {}) => {
  try {
    const response = await apiClient.post(`/admin/cms/email-templates/${id}/test`, { email, variables });
    return response;
  } catch (error) {
    console.error(`Failed to send test email for template ${id}:`, error);
    throw error;
  }
};

export const seedEmailTemplates = async () => {
  try {
    const response = await apiClient.post('/admin/cms/email-templates/seed');
    return response;
  } catch (error) {
    console.error('Failed to seed email templates:', error);
    throw error;
  }
};

// ── Legal Documents ──

export const getLegalDocuments = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/cms/legal', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch legal documents:', error);
    return null;
  }
};

export const getLegalDocumentById = async (id) => {
  try {
    const response = await apiClient.get(`/admin/cms/legal/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to fetch legal document ${id}:`, error);
    return null;
  }
};

export const createLegalDocument = async (data) => {
  try {
    const response = await apiClient.post('/admin/cms/legal', data);
    return response;
  } catch (error) {
    console.error('Failed to create legal document:', error);
    throw error;
  }
};

export const updateLegalDocument = async (id, data) => {
  try {
    const response = await apiClient.patch(`/admin/cms/legal/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Failed to update legal document ${id}:`, error);
    throw error;
  }
};

export const deleteLegalDocument = async (id) => {
  try {
    const response = await apiClient.delete(`/admin/cms/legal/${id}`);
    return response;
  } catch (error) {
    console.error(`Failed to delete legal document ${id}:`, error);
    throw error;
  }
};

export const getConsentLogs = async (params = {}) => {
  try {
    const response = await apiClient.get('/admin/cms/legal/consent-logs', { params });
    return response;
  } catch (error) {
    console.error('Failed to fetch consent logs:', error);
    return null;
  }
};

// Default export for convenience
export default {
  getLandingPageContent,
  saveLandingPageContent,
  updateLandingSection,
  getCmsPages,
  getCmsPageBySlug,
  getCmsPageById,
  createCmsPage,
  updateCmsPage,
  publishCmsPage,
  unpublishCmsPage,
  deleteCmsPage,
  getCmsSections,
  getCmsSectionById,
  createCmsSection,
  updateCmsSection,
  updateCmsSectionContent,
  deleteCmsSection,
  reorderCmsSections,
  getFooter,
  updateFooter,
  getTheme,
  updateTheme,
  getCmsSettings,
  updateCmsSettings,
  getEmailTemplates,
  getEmailTemplateById,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  sendTestEmail,
  seedEmailTemplates,
  getLegalDocuments,
  getLegalDocumentById,
  createLegalDocument,
  updateLegalDocument,
  deleteLegalDocument,
  getConsentLogs,
  getAuthToken,
};