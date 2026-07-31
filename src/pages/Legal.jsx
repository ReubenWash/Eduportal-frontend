import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Scale, Shield, Lock, Cookie } from 'lucide-react';
import { getLegalDocumentByType } from '../api/legalApi';

const LEGAL_PAGES = [
  { type: 'PRIVACY', label: 'Privacy Policy', icon: Shield },
  { type: 'TERMS', label: 'Terms & Conditions', icon: Scale },
  { type: 'COOKIE', label: 'Cookie Policy', icon: Cookie },
  { type: 'GDPR', label: 'GDPR Compliance', icon: Lock },
];

export default function LegalPage() {
  const [selectedType, setSelectedType] = useState('PRIVACY');
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument(selectedType);
  }, [selectedType]);

  const fetchDocument = async (type) => {
    try {
      setLoading(true);
      const response = await getLegalDocumentByType(type);
      if (response) {
        setDocument(response);
      } else {
        setDocument(null);
      }
    } catch (error) {
      console.error('Error fetching legal document:', error);
      setDocument(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-2 mb-4">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Legal & Compliance</h1>
          <p className="text-gray-600 mt-2">Review our legal documents and compliance policies</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 sticky top-24">
              <h3 className="font-medium text-gray-900 mb-3">Documents</h3>
              <nav className="space-y-1">
                {LEGAL_PAGES.map((page) => {
                  const Icon = page.icon;
                  return (
                    <button
                      key={page.type}
                      onClick={() => setSelectedType(page.type)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        selectedType === page.type
                          ? 'bg-indigo-50 text-indigo-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {page.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {document ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{document.title}</h2>
                  <span className="text-sm text-gray-500">
                    Version {document.version} • Updated {new Date(document.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="prose prose-indigo max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: document.content }} />
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Last updated: {new Date(document.updatedAt).toLocaleDateString()} • 
                    Version: {document.version}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Document Not Found</h3>
                <p className="text-gray-500 mt-2">The requested legal document is not available.</p>
                <button
                  onClick={() => setSelectedType('PRIVACY')}
                  className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                  View Privacy Policy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}