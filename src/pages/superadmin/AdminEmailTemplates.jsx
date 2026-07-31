import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Mail, Edit, Plus, X, Code, Monitor, Trash2, Send, Copy, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import { 
  getEmailTemplates, 
  createEmailTemplate, 
  updateEmailTemplate, 
  deleteEmailTemplate,
  sendTestEmail,
  seedEmailTemplates
} from '../../api/cmsApi';

// ── Toast System ──
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg max-w-md`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// ── Main Component ──
export default function AdminEmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editMode, setEditMode] = useState('visual');
  const [content, setContent] = useState('');
  const [toasts, setToasts] = useState([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    subject: '',
    htmlContent: '',
    textContent: '',
    description: '',
    isActive: true,
    variables: []
  });

  // ── Toast Functions ──
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // ── Fetch Templates ──
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await getEmailTemplates();
      if (response?.success) {
        setTemplates(response.data || []);
      } else {
        addToast('Failed to fetch email templates', 'error');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      addToast('Error loading templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── CRUD Operations ──
  const handleCreateTemplate = async () => {
    try {
      const response = await createEmailTemplate(formData);
      if (response?.success) {
        addToast('Template created successfully!', 'success');
        setShowNewTemplate(false);
        setFormData({
          key: '',
          name: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          description: '',
          isActive: true,
          variables: []
        });
        fetchTemplates();
      } else {
        addToast(response?.error || 'Failed to create template', 'error');
      }
    } catch (error) {
      console.error('Error creating template:', error);
      addToast('Error creating template', 'error');
    }
  };

  const handleUpdateTemplate = async () => {
    try {
      const response = await updateEmailTemplate(editingTemplate.id, {
        ...formData,
        htmlContent: content
      });
      if (response?.success) {
        addToast('Template updated successfully!', 'success');
        setEditingTemplate(null);
        setContent('');
        setFormData({
          key: '',
          name: '',
          subject: '',
          htmlContent: '',
          textContent: '',
          description: '',
          isActive: true,
          variables: []
        });
        fetchTemplates();
      } else {
        addToast(response?.error || 'Failed to update template', 'error');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      addToast('Error updating template', 'error');
    }
  };

  const handleDeleteTemplate = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    try {
      const response = await deleteEmailTemplate(id);
      if (response?.success) {
        addToast('Template deleted successfully!', 'success');
        fetchTemplates();
      } else {
        addToast(response?.error || 'Failed to delete template', 'error');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      addToast('Error deleting template', 'error');
    }
  };

  const handleSendTest = async (id) => {
    const testEmail = prompt('Enter email address to send test:');
    if (!testEmail) return;

    try {
      const response = await sendTestEmail(id, testEmail);
      if (response?.success) {
        addToast(`Test email sent to ${testEmail}!`, 'success');
      } else {
        addToast(response?.error || 'Failed to send test email', 'error');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      addToast('Error sending test email', 'error');
    }
  };

  const handleSeedDefaults = async () => {
    if (!window.confirm('This will create default email templates. Continue?')) return;
    
    try {
      const response = await seedEmailTemplates();
      if (response?.success) {
        addToast('Default templates seeded successfully!', 'success');
        fetchTemplates();
      } else {
        addToast(response?.error || 'Failed to seed templates', 'error');
      }
    } catch (error) {
      console.error('Error seeding templates:', error);
      addToast('Error seeding templates', 'error');
    }
  };

  // ── Edit Handlers ──
  const handleEdit = (template) => {
    setEditingTemplate(template);
    setContent(template.htmlContent || '');
    setFormData({
      key: template.key,
      name: template.name,
      subject: template.subject,
      htmlContent: template.htmlContent || '',
      textContent: template.textContent || '',
      description: template.description || '',
      isActive: template.isActive,
      variables: template.variables || []
    });
    setEditMode('visual');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleVariablesChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      variables: value.split(',').map(v => v.trim()).filter(v => v)
    }));
  };

  const closeModal = () => {
    setEditingTemplate(null);
    setShowNewTemplate(false);
    setContent('');
    setFormData({
      key: '',
      name: '',
      subject: '',
      htmlContent: '',
      textContent: '',
      description: '',
      isActive: true,
      variables: []
    });
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading email templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Container */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}

      {/* Header */}
      <PageHeader
        title="Email Template Manager"
        subtitle="Edit system emails and transactional notifications."
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleSeedDefaults}>
              Seed Defaults
            </Button>
            <Button icon={Plus} onClick={() => setShowNewTemplate(true)}>
              New Template
            </Button>
          </div>
        }
      />

      {/* Templates Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                    <Mail className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                    <p>No email templates found</p>
                    <button 
                      onClick={handleSeedDefaults}
                      className="mt-2 text-indigo-600 hover:text-indigo-800"
                    >
                      Seed default templates
                    </button>
                  </td>
                </tr>
              ) : (
                templates.map(t => (
                  <tr key={t.id || t.key}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      {t.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <code className="px-2 py-1 bg-gray-100 rounded text-xs">{t.key}</code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        t.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleSendTest(t.id)} 
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Send test"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEdit(t)} 
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTemplate(t.id, t.name)} 
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Editing: {editingTemplate.name}</h2>
                <p className="text-sm text-gray-500">Key: {editingTemplate.key}</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 px-6">
              <button 
                onClick={() => setEditMode('visual')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                  editMode === 'visual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Monitor className="h-4 w-4" /> Visual Editor
              </button>
              <button 
                onClick={() => setEditMode('html')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${
                  editMode === 'html' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="h-4 w-4" /> HTML Code
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {/* Template Details */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {editMode === 'html' ? (
                <textarea 
                  className="w-full h-full min-h-[300px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <div 
                  className="w-full h-full min-h-[300px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
                  dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400">No content to preview</p>' }}
                />
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleUpdateTemplate}>Save Template</Button>
            </div>
          </div>
        </div>
      )}

      {/* New Template Modal */}
      {showNewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Create New Template</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key *</label>
                  <input
                    type="text"
                    name="key"
                    value={formData.key}
                    onChange={handleFormChange}
                    placeholder="e.g., welcome_email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Welcome Email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleFormChange}
                  placeholder="Email subject line"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleFormChange}
                  placeholder="Brief description of this template"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Variables (comma separated)</label>
                <input
                  type="text"
                  value={formData.variables.join(', ')}
                  onChange={handleVariablesChange}
                  placeholder="e.g., user_name, school_name, year"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content *</label>
                <textarea
                  name="htmlContent"
                  value={formData.htmlContent}
                  onChange={handleFormChange}
                  rows="8"
                  placeholder="<h1>Hello {{user_name}}</h1>"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Content</label>
                <textarea
                  name="textContent"
                  value={formData.textContent}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Plain text version of the email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white rounded-b-2xl">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}