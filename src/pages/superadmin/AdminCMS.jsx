import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Monitor, Layout, Image as ImageIcon, Settings, Plus, Save, Edit3, X, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';

export default function AdminCMS() {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState(null);

  const openEditor = (section) => setActiveSection(section);
  const closeEditor = () => setActiveSection(null);

  const renderEditorContent = () => {
    switch (activeSection) {
      case 'Hero Section':
        return (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Headline</label>
              <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="Empowering Education Through Technology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle Text</label>
              <textarea rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="A complete SaaS platform for schools, teachers, students, and parents to streamline learning and management." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Button Text</label>
                <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="Get Started" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Primary Button Link</label>
                <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" defaultValue="/register" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Image</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer">
                <ImageIcon className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm font-medium">Click to upload or drag and drop</span>
                <span className="text-xs mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</span>
              </div>
            </div>
          </div>
        );
      case 'Features Section':
        return (
          <div className="space-y-4 pt-2">
             <div className="flex justify-end"><Button size="sm" icon={Plus}>Add Feature</Button></div>
             <div className="space-y-3">
               {[
                 { title: 'Role-based Access', desc: 'Secure portals for Admins, Teachers, Students.' },
                 { title: 'Instant Report Cards', desc: 'Automated grading and transcript generation.' },
                 { title: 'Parent Engagement', desc: 'Keep parents informed with real-time updates.' },
               ].map((f, i) => (
                 <div key={i} className="flex gap-3 border border-gray-200 p-3 rounded-lg bg-gray-50 items-start">
                   <div className="p-2 bg-indigo-100 rounded text-indigo-600"><Layout className="h-4 w-4" /></div>
                   <div className="flex-1">
                     <input type="text" className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none text-sm font-semibold text-gray-900 mb-1 pb-1" defaultValue={f.title} />
                     <textarea className="w-full bg-transparent border-b border-gray-300 focus:border-indigo-500 focus:outline-none text-sm text-gray-600 resize-none" rows={2} defaultValue={f.desc} />
                   </div>
                 </div>
               ))}
             </div>
          </div>
        );
      case 'Pricing Section':
        return (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500 mb-4">Edit subscription plans displayed on the landing page.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {['Basic', 'Standard', 'Premium'].map(plan => (
                <div key={plan} className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-gray-900">{plan}</p>
                    <input type="text" className="mt-2 w-full border border-gray-200 rounded px-2 py-1 text-sm font-bold" defaultValue={plan === 'Basic' ? '$0' : plan === 'Standard' ? '$49' : '$99'} />
                    <p className="text-xs text-gray-500 mt-1">per month</p>
                  </div>
                  <Button variant="outline" size="sm" className="mt-4 w-full">Edit Features</Button>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Testimonials & FAQ':
      case 'Footer & Theme':
        return (
          <div className="py-8 text-center text-gray-500">
            <Settings className="h-10 w-10 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Configuration options for {activeSection} will appear here.</p>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website CMS"
        subtitle="Manage landing page content and layout without touching code."
        action={
          <div className="flex gap-2">
            <Button variant="outline" icon={Eye} onClick={() => window.open('/', '_blank')}>Preview Site</Button>
            <Button icon={Save} onClick={() => addToast('Changes published successfully.', 'success')}>Publish Changes</Button>
          </div>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Landing Page Sections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'Hero Section', desc: 'Edit main heading, subtitle, buttons, and background.' },
            { id: 'Features Section', desc: 'Manage platform features, icons, and descriptions.' },
            { id: 'Pricing Section', desc: 'Edit pricing cards, add new plans, and manage feature lists.' },
            { id: 'Testimonials & FAQ', desc: 'Add or remove testimonials and frequently asked questions.' },
            { id: 'Footer & Theme', desc: 'Manage social links, brand colors, fonts, and button styles.' },
          ].map(section => (
            <div 
              key={section.id} 
              className="border border-gray-200 rounded-lg p-5 cursor-pointer hover:border-indigo-400 hover:shadow-md transition-all group relative flex flex-col justify-between"
              onClick={() => openEditor(section.id)}
            >
              <div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{section.id}</h3>
                <p className="text-sm text-gray-500">{section.desc}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit3 className="h-3.5 w-3.5" /> Edit
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {activeSection && (
        <Modal isOpen={!!activeSection} onClose={closeEditor} title={`Editing: ${activeSection}`}>
          {renderEditorContent()}
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
            <Button onClick={() => { addToast('Section updated successfully', 'success'); closeEditor(); }}>Save Section</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
