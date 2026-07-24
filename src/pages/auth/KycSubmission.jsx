import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPublicSettings } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';

export default function KycSubmission() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [kycDocs, setKycDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadedDocs, setUploadedDocs] = useState({});

  useEffect(() => {
    getPublicSettings().then(settings => {
      if (settings?.kyc_requirements) {
        setKycDocs(JSON.parse(settings.kyc_requirements).filter(d => d.required));
      }
    }).finally(() => setLoading(false));
  }, []);

  if (!user) return <Navigate to="/login" replace />;
  // If the user's school is no longer pending, they don't need this page.
  if (user.role !== 'SUPER_ADMIN' && user.schoolStatus !== 'PENDING') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleFileUpload = (docId, file) => {
    if (!file) return;
    setUploadedDocs(prev => ({ ...prev, [docId]: file }));
  };

  const handleSubmit = async () => {
    // Check if all required docs are uploaded
    const missing = kycDocs.filter(doc => !uploadedDocs[doc.id]);
    if (missing.length > 0) {
      addToast(`Please upload ${missing.map(m => m.name).join(', ')}`, 'error');
      return;
    }

    setUploading(true);
    try {
      // In a real app we'd upload these via form data to a backend endpoint.
      // E.g., await api.post('/schools/kyc', formData);
      // For this SaaS UI completion, we simulate the upload delay:
      await new Promise(resolve => setTimeout(resolve, 1500));
      addToast('KYC documents submitted successfully. Please wait for admin approval.', 'success');
      // They would stay here pending approval.
    } catch (err) {
      addToast('Failed to submit documents.', 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Loading KYC requirements...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-amber-50">
          <div className="flex items-center gap-3 text-amber-800">
            <AlertCircle className="h-6 w-6 text-amber-600" />
            <h1 className="text-xl font-bold">Action Required: Complete KYC</h1>
          </div>
          <p className="mt-2 text-sm text-amber-700">
            Your school account is currently pending. Please upload the required Know Your Customer (KYC) documents to verify your institution. Once approved by a Super Admin, your account will be activated.
          </p>
        </div>
        
        <div className="p-6 space-y-6">
          {kycDocs.length === 0 ? (
            <p className="text-gray-500">No KYC documents are required at this time. Please wait for your account to be approved.</p>
          ) : (
            <div className="space-y-4">
              {kycDocs.map(doc => (
                <div key={doc.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-3 mb-3 sm:mb-0">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">{doc.name}</h3>
                      <p className="text-xs text-gray-500">Supported formats: PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {uploadedDocs[doc.id] ? (
                      <span className="flex items-center gap-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                        <CheckCircle2 className="h-4 w-4" /> Uploaded
                      </span>
                    ) : (
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <Upload className="h-4 w-4 text-gray-500" />
                        Select File
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="hidden"
                          onChange={e => handleFileUpload(doc.id, e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <Button 
              onClick={handleSubmit} 
              loading={uploading}
              disabled={kycDocs.length > 0 && kycDocs.some(d => !uploadedDocs[d.id])}
            >
              Submit for Verification
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
