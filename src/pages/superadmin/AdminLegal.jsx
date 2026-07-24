import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Scale, FileText, CheckCircle2, Save, X, Edit2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';

export default function AdminLegal() {
  const { addToast } = useToast();
  const [documents] = useState([
    { title: 'Privacy Policy', updated: 'Jan 15, 2025' },
    { title: 'Terms & Conditions', updated: 'Jan 15, 2025' },
    { title: 'Cookie Policy', updated: 'Dec 10, 2024' },
    { title: 'Data Retention Policy', updated: 'Nov 01, 2024' }
  ]);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docContent, setDocContent] = useState('');

  const openEditor = (doc) => {
    setEditingDoc(doc);
    setDocContent(`<h1>${doc.title}</h1>\n<p>Last updated: ${doc.updated}</p>\n\n<p>Enter the legal content here...</p>`);
  };

  const closeEditor = () => {
    setEditingDoc(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Legal & Compliance"
        subtitle="Manage legal documents and GDPR/Privacy settings."
        action={
          <Button icon={Save} onClick={() => addToast('Compliance settings saved.', 'success')}>Save Settings</Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />
            Legal Documents
          </h3>
          <div className="space-y-3">
            {documents.map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                <div>
                  <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">{doc.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Last updated: {doc.updated}</p>
                </div>
                <Button size="sm" variant="outline" icon={Edit2} onClick={() => openEditor(doc)}>Edit</Button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-indigo-500" />
            Compliance Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">GDPR Compliance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">Enforce strict data privacy consent.</p>
              </div>
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">Show Cookie Consent Banner</p>
                <p className="text-xs text-gray-500 mt-0.5">Display cookie consent on landing page.</p>
              </div>
              <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Data Retention Period (Days)</label>
              <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" defaultValue={365} />
            </div>
          </div>
        </div>
      </div>

      {editingDoc && (
        <Modal isOpen={!!editingDoc} onClose={closeEditor} title={`Edit: ${editingDoc.title}`}>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500 mb-2">Edit the HTML content of the legal document below.</p>
            <textarea 
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              className="w-full h-64 font-mono text-sm border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={() => { addToast('Document updated successfully', 'success'); closeEditor(); }}>Save Document</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
