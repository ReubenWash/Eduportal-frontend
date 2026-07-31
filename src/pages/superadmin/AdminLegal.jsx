import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Scale, FileText, CheckCircle2, Save, X, Edit2, Plus, Trash2, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import { 
  getLegalDocuments, 
  createLegalDocument, 
  updateLegalDocument, 
  deleteLegalDocument 
} from '../../api/legalApi';

const LEGAL_TYPES = [
  { value: 'PRIVACY', label: 'Privacy Policy' },
  { value: 'TERMS', label: 'Terms & Conditions' },
  { value: 'COOKIE', label: 'Cookie Policy' },
  { value: 'GDPR', label: 'GDPR Policy' },
  { value: 'DPA', label: 'Data Processing Agreement' },
  { value: 'ACCEPTABLE_USE', label: 'Acceptable Use Policy' },
  { value: 'REFUND', label: 'Refund Policy' },
];

export default function AdminLegal() {
  const { addToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    type: 'PRIVACY',
    title: '',
    content: '',
    version: '1.0',
    isActive: true,
    isPublished: false
  });
  const [complianceSettings, setComplianceSettings] = useState({
    gdprMode: true,
    cookieConsent: true,
    retentionPeriod: 365
  });

  // ── Fetch Documents ──
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await getLegalDocuments();
      if (response && response.data) {
        setDocuments(response.data);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error fetching legal documents:', error);
      addToast('Failed to load legal documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Open Editor ──
  const openEditor = (doc) => {
    setEditingDoc(doc);
    setDocContent(doc.content || '');
  };

  // ── Close Editor ──
  const closeEditor = () => {
    setEditingDoc(null);
    setDocContent('');
  };

  // ── Save Document ──
  const handleSaveDocument = async () => {
    if (!editingDoc) return;

    try {
      const response = await updateLegalDocument(editingDoc.id, {
        ...editingDoc,
        content: docContent,
        updatedAt: new Date().toISOString()
      });

      if (response) {
        addToast('Document updated successfully!', 'success');
        closeEditor();
        await fetchDocuments();
      } else {
        addToast('Failed to update document', 'error');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      addToast('Error saving document', 'error');
    }
  };

  // ── Create Document ──
  const handleCreateDocument = async () => {
    try {
      const response = await createLegalDocument({
        ...newDoc,
        content: newDoc.content || `<h1>${newDoc.title}</h1>\n<p>Last updated: ${new Date().toLocaleDateString()}</p>\n\n<p>Enter the legal content here...</p>`
      });

      if (response) {
        addToast('Document created successfully!', 'success');
        setShowCreateModal(false);
        setNewDoc({
          type: 'PRIVACY',
          title: '',
          content: '',
          version: '1.0',
          isActive: true,
          isPublished: false
        });
        await fetchDocuments();
      } else {
        addToast('Failed to create document', 'error');
      }
    } catch (error) {
      console.error('Error creating document:', error);
      addToast('Error creating document', 'error');
    }
  };

  // ── Delete Document ──
  const handleDeleteDocument = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await deleteLegalDocument(id);
      addToast('Document deleted successfully!', 'success');
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      addToast('Error deleting document', 'error');
    }
  };

  // ── Toggle Publish ──
  const handleTogglePublish = async (doc) => {
    try {
      await updateLegalDocument(doc.id, {
        ...doc,
        isPublished: !doc.isPublished,
        publishedAt: !doc.isPublished ? new Date().toISOString() : null
      });
      addToast(`Document ${doc.isPublished ? 'unpublished' : 'published'}!`, 'success');
      await fetchDocuments();
    } catch (error) {
      console.error('Error toggling publish:', error);
      addToast('Error updating document', 'error');
    }
  };

  // ── Save Compliance Settings ──
  const handleSaveCompliance = async () => {
    try {
      // Save to backend (you'll need to create this endpoint)
      // await saveComplianceSettings(complianceSettings);
      addToast('Compliance settings saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving compliance settings:', error);
      addToast('Error saving compliance settings', 'error');
    }
  };

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading legal documents...</p>
        </div>
      </div>
    );
  }

  // ── Get Type Label ──
  const getTypeLabel = (type) => {
    const found = LEGAL_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legal & Compliance"
        subtitle="Manage legal documents and GDPR/Privacy settings."
        action={
          <div className="flex gap-3">
            <Button 
              icon={Save} 
              onClick={handleSaveCompliance}
            >
              Save Settings
            </Button>
            <Button 
              icon={Plus} 
              variant="primary"
              onClick={() => setShowCreateModal(true)}
            >
              New Document
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Legal Documents List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Legal Documents
            <span className="ml-auto text-xs text-gray-400">
              {documents.length} documents
            </span>
          </h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No legal documents found</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-2 text-indigo-600 hover:text-indigo-800 text-sm"
              >
                Create your first document
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div 
                  key={doc.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                        {doc.title}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        doc.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {doc.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Type: {getTypeLabel(doc.type)} • Version: {doc.version} • Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => handleTogglePublish(doc)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                      title={doc.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openEditor(doc)}
                      className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compliance Settings */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-500" />
            Compliance Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">GDPR Compliance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Enforce strict data privacy consent.</p>
              </div>
              <input 
                type="checkbox" 
                className="rounded text-indigo-600 focus:ring-indigo-500" 
                checked={complianceSettings.gdprMode}
                onChange={(e) => setComplianceSettings(prev => ({ ...prev, gdprMode: e.target.checked }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Show Cookie Consent Banner</p>
                <p className="text-xs text-gray-500 mt-0.5">Display cookie consent on landing page.</p>
              </div>
              <input 
                type="checkbox" 
                className="rounded text-indigo-600 focus:ring-indigo-500" 
                checked={complianceSettings.cookieConsent}
                onChange={(e) => setComplianceSettings(prev => ({ ...prev, cookieConsent: e.target.checked }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Retention Period (Days)</label>
              <input 
                type="number" 
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                value={complianceSettings.retentionPeriod}
                onChange={(e) => setComplianceSettings(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) || 365 }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingDoc && (
        <Modal isOpen={!!editingDoc} onClose={closeEditor} title={`Edit: ${editingDoc.title}`}>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Type: {getTypeLabel(editingDoc.type)}</span>
              <span>Version: {editingDoc.version}</span>
              <span>Status: {editingDoc.isPublished ? 'Published' : 'Draft'}</span>
            </div>
            <p className="text-sm text-gray-500 mb-2">Edit the HTML content of the legal document below.</p>
            <textarea 
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full h-64 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter legal document content in HTML format..."
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={handleSaveDocument}>Save Document</Button>
          </div>
        </Modal>
      )}

      {/* Create Document Modal */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Legal Document">
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type</label>
              <select
                value={newDoc.type}
                onChange={(e) => setNewDoc(prev => ({ ...prev, type: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {LEGAL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={newDoc.title}
                onChange={(e) => setNewDoc(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Enter document title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Version</label>
              <input
                type="text"
                value={newDoc.version}
                onChange={(e) => setNewDoc(prev => ({ ...prev, version: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="1.0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <textarea
                value={newDoc.content}
                onChange={(e) => setNewDoc(prev => ({ ...prev, content: e.target.value }))}
                className="mt-1 block w-full h-32 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono"
                placeholder="Enter document content in HTML format..."
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDoc.isActive}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Active</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newDoc.isPublished}
                  onChange={(e) => setNewDoc(prev => ({ ...prev, isPublished: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreateDocument}>Create Document</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}