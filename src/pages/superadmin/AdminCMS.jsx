import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Monitor, Layout, Image as ImageIcon, Settings, Plus, Save, Edit3, X, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';
import { getGlobalSettings, updateGlobalSettings } from '../../api/superAdminApi';

export default function AdminCMS() {
  const { addToast } = useToast();
  const [activeSection, setActiveSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Default states
  const [heroForm, setHeroForm] = useState({
    heroHeadline: 'Run your school.',
    heroHeadlineHighlight: 'Not paperwork.',
    heroSubtitle: 'EduPortal gives school administrators, teachers, and parents one place to manage students, scores, attendance, and term reports — without the spreadsheets.',
    heroTrustText: 'Trusted by 200+ schools across Ghana, Nigeria & Kenya',
  });

  const [statsForm, setStatsForm] = useState([
    { number: '200+', label: 'Schools registered' },
    { number: '84K',  label: 'Students managed' },
    { number: '1.2M', label: 'Reports generated' },
    { number: '99.9%', label: 'Platform uptime' },
  ]);

  const defaultPages = {
    'Team': { title: 'Our Team', subtitle: 'Meet the people building EduPortal.', content: '<h3>Founders</h3><p>EduPortal was built by a group of passionate educators and engineers...</p>' },
    'Changelog': { title: 'Changelog', subtitle: 'See what\'s new in EduPortal.', content: '<h3>v1.0.0</h3><ul><li>Initial release of the school management dashboard.</li><li>Added core modules for Enrollments, Scores, and Attendance.</li></ul>' },
    'Roadmap': { title: 'Roadmap', subtitle: 'Our planned features and upcoming releases.', content: '<h3>Q3 2026</h3><ul><li>Mobile Application for Parents</li><li>AI-driven student performance predictions</li></ul>' },
    'Documentation': { title: 'Documentation', subtitle: 'Guides and tutorials for using EduPortal.', content: '<h3>Getting Started</h3><p>Welcome to the EduPortal docs. Here you will find step-by-step guides for onboarding your school...</p>' },
    'Contact Us': { title: 'Contact Us', subtitle: 'Get in touch with our support team.', content: '<p><strong>Email:</strong> support@eduportal.com</p><p><strong>Phone:</strong> +233 24 000 0000</p><p><strong>Office:</strong> Accra, Ghana</p><p>We aim to respond to all inquiries within 24 hours.</p>' },
    'System Status': { title: 'System Status', subtitle: 'All systems are fully operational.', content: '<ul><li><strong>Database:</strong> Operational (99.99% uptime)</li><li><strong>API:</strong> Operational (99.98% uptime)</li><li><strong>Email Delivery:</strong> Operational</li></ul>' },
    'Community': { title: 'Community', subtitle: 'Join the EduPortal administrator community.', content: '<p>Join thousands of other school administrators in our private forum to share tips, configurations, and best practices.</p><button style="background: #4F46E5; color: white; padding: 8px 16px; border-radius: 6px; border: none; margin-top: 12px; cursor: pointer;">Join the Slack Channel</button>' },
    'Privacy Policy': { title: 'Privacy Policy', subtitle: 'How we collect, use, and protect your data.', content: '<h3>Data Collection</h3><p>We only collect data necessary for operating the school platform...</p>' },
    'Terms of Service': { title: 'Terms of Service', subtitle: 'The rules and guidelines for using our platform.', content: '<h3>1. Acceptance of Terms</h3><p>By registering a school on EduPortal, you agree to...</p>' },
    'Data Processing': { title: 'Data Processing', subtitle: 'Information on data handling and GDPR compliance.', content: '<h3>Security</h3><p>All student records are encrypted at rest using industry-standard protocols...</p>' },
  };
  
  const [publicPages, setPublicPages] = useState(defaultPages);

  useEffect(() => {
    getGlobalSettings().then((settings) => {
      const cmsLanding = settings?.cms_landing ? JSON.parse(settings.cms_landing) : {};
      const cmsPages = settings?.cms_pages ? JSON.parse(settings.cms_pages) : {};
      
      if (cmsLanding.heroHeadline) {
        setHeroForm({
          heroHeadline: cmsLanding.heroHeadline,
          heroHeadlineHighlight: cmsLanding.heroHeadlineHighlight,
          heroSubtitle: cmsLanding.heroSubtitle,
          heroTrustText: cmsLanding.heroTrustText,
        });
      }
      if (cmsLanding.stats) {
        setStatsForm(cmsLanding.stats);
      }
      if (Object.keys(cmsPages).length > 0) {
        setPublicPages({ ...defaultPages, ...cmsPages });
      }
    }).catch(err => {
      console.error('Failed to load CMS settings:', err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const updatePublicPage = (pageKey, field, value) => {
    setPublicPages(prev => ({ ...prev, [pageKey]: { ...prev[pageKey], [field]: value } }));
  };

  const handleSaveCMS = async () => {
    setSaving(true);
    try {
      const payload = {};
      if (activeSection === 'Hero Section' || activeSection === 'Stats / Numbers') {
        const landingContent = {
          ...heroForm,
          stats: statsForm,
        };
        payload.cms_landing = JSON.stringify(landingContent);
      } else if (activeSection === 'Public Pages') {
        payload.cms_pages = JSON.stringify(publicPages);
      }
      
      if (Object.keys(payload).length > 0) {
        await updateGlobalSettings(payload);
      }
      addToast('Section updated successfully', 'success');
      closeEditor();
    } catch (err) {
      addToast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEditor = (section) => setActiveSection(section);
  const closeEditor = () => setActiveSection(null);

  const renderEditorContent = () => {
    switch (activeSection) {
      case 'Hero Section':
        return (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Main Headline</label>
              <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={heroForm.heroHeadline} onChange={e => setHeroForm(f => ({...f, heroHeadline: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Headline Highlight (coloured part)</label>
              <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={heroForm.heroHeadlineHighlight} onChange={e => setHeroForm(f => ({...f, heroHeadlineHighlight: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subtitle Text</label>
              <textarea rows={3} className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={heroForm.heroSubtitle} onChange={e => setHeroForm(f => ({...f, heroSubtitle: e.target.value}))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trust Badge Text</label>
              <input type="text" className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={heroForm.heroTrustText} onChange={e => setHeroForm(f => ({...f, heroTrustText: e.target.value}))} />
            </div>
          </div>
        );
      case 'Stats / Numbers':
        return (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">Edit the 4 stat numbers shown in the indigo banner on the landing page.</p>
            {statsForm.map((stat, i) => (
              <div key={i} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Number / Value</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={stat.number} onChange={e => setStatsForm(s => s.map((x, j) => j === i ? {...x, number: e.target.value} : x))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Label</label>
                  <input type="text" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" value={stat.label} onChange={e => setStatsForm(s => s.map((x, j) => j === i ? {...x, label: e.target.value} : x))} />
                </div>
              </div>
            ))}
          </div>
        );
      case 'Features Section':
        return (
          <div className="space-y-4 pt-2">
             <div className="flex justify-end"><Button size="sm" icon={Plus} onClick={() => addToast('Feature creation coming soon.', 'info')}>Add Feature</Button></div>
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
                  <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => addToast('Pricing editor coming soon.', 'info')}>Edit Features</Button>
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
      case 'Public Pages':
        return (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500 mb-4">Edit the content of the generic public pages linked in the footer.</p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {Object.entries(publicPages).map(([pageKey, pageData]) => (
                <div key={pageKey} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">{pageKey}</h4>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">/{pageKey.toLowerCase().replace(/ /g, '-')}</span>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Page Title</label>
                      <input type="text" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" value={pageData.title} onChange={e => updatePublicPage(pageKey, 'title', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Page Subtitle</label>
                      <input type="text" className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm" value={pageData.subtitle} onChange={e => updatePublicPage(pageKey, 'subtitle', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Page Content (HTML)</label>
                      <textarea className="w-full border border-gray-200 rounded px-3 py-2 text-sm font-mono h-24" value={pageData.content} onChange={e => updatePublicPage(pageKey, 'content', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
            { id: 'Hero Section', desc: 'Edit main heading, subtitle, and the trust badge text.' },
            { id: 'Stats / Numbers', desc: 'Update the 4 statistics shown in the indigo band.' },
            { id: 'Features Section', desc: 'Manage platform features, icons, and descriptions.' },
            { id: 'Pricing Section', desc: 'Edit pricing cards, add new plans, and manage feature lists.' },
            { id: 'Testimonials & FAQ', desc: 'Add or remove testimonials and frequently asked questions.' },
            { id: 'Footer & Theme', desc: 'Manage social links, brand colors, fonts, and button styles.' },
            { id: 'Public Pages', desc: 'Edit the content for Team, Privacy, Roadmap, and other text-heavy pages.' },
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
            <Button onClick={handleSaveCMS} loading={saving}>Save Section</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
