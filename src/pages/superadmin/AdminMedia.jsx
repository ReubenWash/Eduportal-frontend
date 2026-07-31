import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Image, Upload, Folder, Search, Trash2, Download, File, FileImage, FileVideo, FileAudio, X, RefreshCw, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { getDocuments, uploadDocument, deleteDocument } from '../../api/documentsApi';

// ── Toast System ──
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : 
                  type === 'error' ? 'bg-red-500' : 
                  type === 'warning' ? 'bg-yellow-500' : 
                  type === 'info' ? 'bg-blue-500' : 'bg-gray-500';

  return (
    <div className={`fixed top-4 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg max-w-md animate-slide-in`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default function AdminMedia() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [toasts, setToasts] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  // ── Toast Functions ──
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // ── Fetch Documents ──
  useEffect(() => {
    fetchDocuments();
  }, [currentCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = currentCategory !== 'all' ? { category: currentCategory } : {};
      const response = await getDocuments(params);
      
      if (response && response.data) {
        // Transform document data to match our media format
        const formattedFiles = response.data.map(doc => ({
          id: doc.id,
          name: doc.originalName || doc.name || 'Unnamed',
          url: doc.url,
          type: getFileTypeFromMime(doc.mimeType),
          size: doc.size || 0,
          uploadedAt: doc.createdAt || new Date().toISOString(),
          uploadedBy: doc.uploadedBy?.name || doc.uploadedBy || 'Unknown',
          category: doc.category || 'General',
          mimeType: doc.mimeType
        }));
        setMediaFiles(formattedFiles);
      } else {
        setMediaFiles([]);
        if (response?.message) {
          addToast(response.message, 'info');
        }
      }
    } catch (err) {
      console.error('Error fetching documents:', err);
      
      // Handle 403 specifically
      if (err.response?.status === 403) {
        setError('You don\'t have permission to access documents. Please contact your administrator.');
        addToast('Permission denied. Please contact your administrator.', 'error');
      } else if (err.response?.status === 401) {
        setError('Please log in to access documents.');
        addToast('Please log in to access documents.', 'error');
      } else {
        setError('Failed to load documents. Please try again.');
        addToast('Error loading documents', 'error');
      }
      setMediaFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // ── Helper: Get File Type from MIME ──
  const getFileTypeFromMime = (mimeType) => {
    if (!mimeType) return 'document';
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'document';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'spreadsheet';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'presentation';
    return 'document';
  };

  // ── Helper: Get File Icon ──
  const getFileIcon = (type) => {
    switch (type) {
      case 'image':
        return <FileImage className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <FileVideo className="h-8 w-8 text-purple-500" />;
      case 'audio':
        return <FileAudio className="h-8 w-8 text-green-500" />;
      case 'pdf':
        return <File className="h-8 w-8 text-red-500" />;
      case 'spreadsheet':
        return <File className="h-8 w-8 text-green-600" />;
      case 'presentation':
        return <File className="h-8 w-8 text-orange-500" />;
      default:
        return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  // ── Helper: Get File Size Display ──
  const getFileSize = (size) => {
    if (!size || size === 0) return 'Unknown';
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // ── Helper: Format Date ──
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // ── Upload Handler ──
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', currentCategory !== 'all' ? currentCategory : 'General');

        const response = await uploadDocument(formData);
        if (response) {
          addToast(`Uploaded ${file.name} successfully!`, 'success');
        } else {
          addToast(`Failed to upload ${file.name}`, 'error');
        }
        setUploadProgress(((i + 1) / files.length) * 100);
      }
      
      // Refresh the document list
      await fetchDocuments();
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error uploading files:', error);
      if (error.response?.status === 403) {
        addToast('You don\'t have permission to upload files.', 'error');
      } else {
        addToast('Error uploading files', 'error');
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  // ── Delete Handler ──
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteDocument(id);
      addToast(`Deleted "${name}" successfully!`, 'success');
      await fetchDocuments();
      // Remove from selection if selected
      setSelectedFiles(prev => prev.filter(fid => fid !== id));
    } catch (error) {
      console.error('Error deleting file:', error);
      if (error.response?.status === 403) {
        addToast('You don\'t have permission to delete files.', 'error');
      } else {
        addToast(`Failed to delete "${name}"`, 'error');
      }
    }
  };

  // ── Download Handler ──
  const handleDownload = async (file) => {
    try {
      if (file.url) {
        // If URL is available, open in new tab
        window.open(file.url, '_blank');
      } else {
        addToast('Download URL not available', 'error');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      addToast('Error downloading file', 'error');
    }
  };

  // ── Bulk Delete ──
  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!window.confirm(`Delete ${selectedFiles.length} selected files?`)) return;

    try {
      for (const id of selectedFiles) {
        await deleteDocument(id);
      }
      addToast(`Deleted ${selectedFiles.length} files successfully!`, 'success');
      setSelectedFiles([]);
      await fetchDocuments();
    } catch (error) {
      console.error('Error deleting files:', error);
      if (error.response?.status === 403) {
        addToast('You don\'t have permission to delete files.', 'error');
      } else {
        addToast('Error deleting files', 'error');
      }
    }
  };

  // ── Toggle Selection ──
  const toggleSelect = (id) => {
    setSelectedFiles(prev => 
      prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
    );
  };

  // ── Filter Media by Search ──
  const filteredMedia = mediaFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Loading State ──
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading media files...</p>
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
        title="File & Media Manager"
        subtitle="Manage all uploaded assets across the platform."
        action={
          <div className="flex gap-3 flex-wrap">
            {selectedFiles.length > 0 && (
              <Button variant="outline" onClick={handleBulkDelete}>
                Delete Selected ({selectedFiles.length})
              </Button>
            )}
            <Button 
              icon={RefreshCw} 
              variant="outline"
              onClick={fetchDocuments}
            >
              Refresh
            </Button>
            <Button 
              icon={Upload} 
              onClick={() => setShowUploadModal(true)}
            >
              Upload File
            </Button>
          </div>
        }
      />

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Permission Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchDocuments}
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Media Browser */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Folder className="h-5 w-5 text-indigo-500" />
            <span>Documents</span>
            {currentCategory !== 'all' && (
              <>
                <span className="text-gray-300">/</span>
                <span className="capitalize">{currentCategory}</span>
              </>
            )}
            <span className="ml-4 text-xs text-gray-400">
              {mediaFiles.length} files
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Category Filter */}
            <select
              value={currentCategory}
              onChange={(e) => setCurrentCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="General">General</option>
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="Reports">Reports</option>
              <option value="School">School</option>
            </select>

            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-full sm:w-48 md:w-64"
              />
            </div>

            {selectedFiles.length > 0 && (
              <span className="text-xs text-indigo-600 whitespace-nowrap">
                {selectedFiles.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Media Grid */}
        {mediaFiles.length === 0 && !error ? (
          <div className="text-center py-12">
            <Image className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'No files match your search' : 'No media files found'}
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Upload your first file
            </button>
          </div>
        ) : mediaFiles.length > 0 && !error ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredMedia.map((file) => (
              <div
                key={file.id}
                className={`border-2 rounded-lg p-2 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-all relative ${
                  selectedFiles.includes(file.id)
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleSelect(file.id)}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={selectedFiles.includes(file.id)}
                    onChange={() => toggleSelect(file.id)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* File Preview */}
                <div className="h-24 w-full bg-gray-50 rounded flex items-center justify-center text-gray-400 relative overflow-hidden">
                  {file.url && file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-full w-full object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        const parent = e.target.parentElement;
                        parent.innerHTML = '<svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>';
                      }}
                    />
                  ) : (
                    getFileIcon(file.type)
                  )}
                </div>

                {/* File Name */}
                <span className="text-xs text-gray-600 truncate w-full text-center" title={file.name}>
                  {file.name}
                </span>

                {/* File Size & Date */}
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-xs text-gray-400">
                    {getFileSize(file.size)}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {formatDate(file.uploadedAt)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-1">
                  {file.url && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(file);
                      }}
                      className="text-gray-400 hover:text-indigo-600 transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file.id, file.name);
                    }}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {/* Upload Info */}
        {mediaFiles.length > 0 && !error && (
          <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-400">
            <span>Total: {mediaFiles.length} files</span>
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Upload Files</h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {uploading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
                  <p className="mt-4 text-gray-600">Uploading...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-4">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">{Math.round(uploadProgress)}%</p>
                </div>
              ) : (
                <>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer"
                    onClick={() => document.getElementById('fileInput').click()}
                  >
                    <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Supported: Images, PDFs, Documents, Videos (Max 10MB)
                    </p>
                    <input
                      id="fileInput"
                      type="file"
                      multiple
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>

                  {/* Category Selection */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={currentCategory}
                      onChange={(e) => setCurrentCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="General">General</option>
                      <option value="Student">Student</option>
                      <option value="Staff">Staff</option>
                      <option value="Reports">Reports</option>
                      <option value="School">School</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white rounded-b-2xl">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}