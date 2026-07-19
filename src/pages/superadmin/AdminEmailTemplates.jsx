import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Mail, Edit, Plus, X, Code, Monitor } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function AdminEmailTemplates() {
  const [templates] = useState([
    'Welcome Email', 'School Approved', 'Password Reset', 'Payment Receipt', 'Subscription Expiry', 'Ticket Reply'
  ]);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editMode, setEditMode] = useState('visual'); // 'visual' | 'html'
  const [content, setContent] = useState('<h1>Hello there!</h1><p>Welcome to our platform.</p>');

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setEditMode('visual');
  };

  const closeModal = () => {
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Email Template Manager"
        subtitle="Edit system emails and transactional notifications."
        action={
          <Button icon={Plus}>New Template</Button>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Template Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map(t => (
                <tr key={t}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {t}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEdit(t)} className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 ml-auto">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Editing: {editingTemplate}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex border-b border-gray-200 px-6">
              <button 
                onClick={() => setEditMode('visual')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${editMode === 'visual' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Monitor className="h-4 w-4" /> Visual Editor
              </button>
              <button 
                onClick={() => setEditMode('html')}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 ${editMode === 'html' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <Code className="h-4 w-4" /> HTML Code
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {editMode === 'html' ? (
                <textarea 
                  className="w-full h-full min-h-[300px] p-4 font-mono text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              ) : (
                <div 
                  className="w-full h-full min-h-[300px] p-6 bg-white border border-gray-200 rounded-lg shadow-sm"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              )}
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3 bg-white">
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button onClick={() => { addToast('Template saved successfully!', 'success'); closeModal(); }}>Save Template</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
