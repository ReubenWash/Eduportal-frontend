import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { 
  Monitor, Layout, Image as ImageIcon, Settings, Plus, Save, 
  Edit3, X, Eye, Trash2, PlusCircle, ChevronUp, ChevronDown,
  Quote, HelpCircle, CreditCard, Palette, Globe, Link, Mail, 
  Facebook, Twitter, Instagram, Youtube, Github, Menu as MenuIcon
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import api from '../../api/axios';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];

export default function AdminCMS() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [sectionIds, setSectionIds] = useState({});
  
  // ─── State ────────────────────────────────────────────────────
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

  const [testimonials, setTestimonials] = useState([
    {
      quote: "We used to spend three weeks compiling report cards. With EduPortal, the whole process takes two days.",
      author: "Abena Owusu",
      role: "Headmistress, Holy Child School",
      initials: "AO",
      color: "#4F46E5"
    },
    {
      quote: "The attendance analytics alone are worth it. I can see which classes have the worst absenteeism and act on it before the term ends.",
      author: "Kwame Darko",
      role: "Deputy Head, Presec Legon",
      initials: "KD",
      color: "#10B981"
    },
    {
      quote: "As a parent, I used to wait weeks to find out how my daughter was doing. Now I get her report on my phone the same day results are released.",
      author: "Efua Boateng",
      role: "Parent, Achimota School",
      initials: "EB",
      color: "#F59E0B"
    }
  ]);

  const [faqs, setFaqs] = useState([
    { question: "How long does it take to set up my school?", answer: "You can set up your school in under 15 minutes. Register, add your staff, and start entering data immediately." },
    { question: "Can I import existing student data?", answer: "Yes, you can bulk import students, staff, and guardians using Excel/CSV files." },
    { question: "Is my data secure?", answer: "All data is encrypted at rest and in transit. We use industry-standard security practices." }
  ]);

  const [plans, setPlans] = useState([
    {
      name: "Basic",
      price: "Free",
      period: "/ term",
      desc: "For small schools getting started. Up to 150 students.",
      popular: false,
      features: ["Up to 150 students", "Scores & grading", "Attendance tracking", "PDF report cards"],
      disabled: ["Analytics dashboard", "Email reports to parents"]
    },
    {
      name: "Standard",
      price: "GHS 299",
      period: "/ term",
      desc: "For growing schools. Up to 800 students, full feature set.",
      popular: true,
      features: ["Up to 800 students", "Scores & grading", "Attendance tracking", "PDF report cards", "Analytics dashboard", "Email reports to parents"],
      disabled: []
    },
    {
      name: "Premium",
      price: "GHS 599",
      period: "/ term",
      desc: "For large institutions. Unlimited students, priority support.",
      popular: false,
      features: ["Unlimited students", "Everything in Standard", "Bulk import & export", "Priority email support", "Custom report branding", "Dedicated account manager"],
      disabled: []
    }
  ]);

  const [footerData, setFooterData] = useState({
    tagline: "A school management platform built specifically for schools in Ghana and across West Africa.",
    links: [
      { label: "Features", url: "#features" },
      { label: "Pricing", url: "#plans" },
      { label: "Changelog", url: "/changelog" },
      { label: "Roadmap", url: "/roadmap" },
      { label: "Team", url: "/team" }
    ],
    socialLinks: [
      { platform: "Twitter", url: "https://twitter.com/eduportal" },
      { platform: "LinkedIn", url: "https://linkedin.com/company/eduportal" },
      { platform: "Facebook", url: "https://facebook.com/eduportal" },
      { platform: "YouTube", url: "https://youtube.com/eduportal" },
      { platform: "GitHub", url: "https://github.com/eduportal" }
    ],
    copyright: `© ${new Date().getFullYear()} EduPortal. All rights reserved.`
  });

  const [theme, setTheme] = useState({
    primaryColor: '#4F46E5',
    secondaryColor: '#1A3C5E',
    fontFamily: 'Inter',
    buttonStyle: 'rounded',
    logoUrl: null,
    faviconUrl: null
  });

  // ─── Load Data ─────────────────────────────────────────────────
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load landing content
      const landingRes = await api.get('/admin/cms/landing');
      if (landingRes.data?.data) {
        const data = landingRes.data.data;
        if (data.heroHeadline) setHeroForm(prev => ({ ...prev, ...data }));
        if (data.stats) setStatsForm(data.stats);
        if (data.testimonials) setTestimonials(data.testimonials);
        if (data.faqs) setFaqs(data.faqs);
        if (data.plans) setPlans(data.plans);
        if (data.footerTagline) setFooterData(prev => ({ ...prev, tagline: data.footerTagline }));
      }

      // Load sections to get their IDs
      const sectionsRes = await api.get('/admin/cms/sections');
      if (sectionsRes.data?.data) {
        const sections = sectionsRes.data.data;
        const ids = {};
        sections.forEach(section => {
          ids[section.type.toLowerCase()] = section.id;
        });
        setSectionIds(ids);
      }

      // Load theme
      const themeRes = await api.get('/admin/cms/theme');
      if (themeRes.data?.data) {
        setTheme(prev => ({ ...prev, ...themeRes.data.data }));
      }

    } catch (err) {
      console.error('Failed to load CMS data:', err);
      addToast('Failed to load CMS content', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ─── Save Functions ────────────────────────────────────────────
  const getSectionId = (type) => {
    const id = sectionIds[type];
    if (!id) {
      addToast(`${type.charAt(0).toUpperCase() + type.slice(1)} section not found. Please create it first.`, 'error');
      return null;
    }
    return id;
  };

  const saveHeroSection = async () => {
    setSaving(true);
    try {
      const sectionId = getSectionId('hero');
      if (!sectionId) { setSaving(false); return; }
      
      await api.patch(`/admin/cms/sections/${sectionId}/content`, { 
        content: {
          heading: heroForm.heroHeadline,
          highlight: heroForm.heroHeadlineHighlight,
          subtitle: heroForm.heroSubtitle,
          trustBadge: heroForm.heroTrustText
        }
      });
      addToast('Hero section updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save hero error:', err);
      addToast('Failed to save hero section', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveStats = async () => {
    setSaving(true);
    try {
      const sectionId = getSectionId('stats');
      if (!sectionId) { setSaving(false); return; }
      
      await api.patch(`/admin/cms/sections/${sectionId}/content`, { 
        content: { stats: statsForm }
      });
      addToast('Stats updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save stats error:', err);
      addToast('Failed to save stats', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveTestimonials = async () => {
    setSaving(true);
    try {
      const sectionId = getSectionId('testimonials');
      if (!sectionId) { setSaving(false); return; }
      
      await api.patch(`/admin/cms/sections/${sectionId}/content`, { 
        content: { testimonials }
      });
      addToast('Testimonials updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save testimonials error:', err);
      addToast('Failed to save testimonials', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveFaqs = async () => {
    setSaving(true);
    try {
      const sectionId = getSectionId('faq');
      if (!sectionId) { setSaving(false); return; }
      
      await api.patch(`/admin/cms/sections/${sectionId}/content`, { 
        content: { faqs }
      });
      addToast('FAQ updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save FAQ error:', err);
      addToast('Failed to save FAQ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const savePlans = async () => {
    setSaving(true);
    try {
      const sectionId = getSectionId('pricing');
      if (!sectionId) { setSaving(false); return; }
      
      await api.patch(`/admin/cms/sections/${sectionId}/content`, { 
        content: { plans }
      });
      addToast('Pricing plans updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save pricing error:', err);
      addToast('Failed to save pricing plans', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/cms/footer', footerData);
      addToast('Footer updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save footer error:', err);
      addToast('Failed to save footer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveTheme = async () => {
    setSaving(true);
    try {
      await api.patch('/admin/cms/theme', theme);
      addToast('Theme updated successfully', 'success');
      setActiveSection(null);
    } catch (err) {
      console.error('Save theme error:', err);
      addToast('Failed to save theme', 'error');
    } finally {
      setSaving(false);
    }
  };

  const createDefaultSections = async () => {
    try {
      // Get or create homepage
      const homepageRes = await api.get('/admin/cms/pages/homepage');
      let homepageId = homepageRes.data?.data?.id;
      
      if (!homepageId) {
        const createRes = await api.post('/admin/cms/pages', {
          title: 'Homepage',
          slug: 'home',
          isHomepage: true,
          status: 'PUBLISHED'
        });
        homepageId = createRes.data.data.id;
      }

      // Create sections if they don't exist
      const sectionsToCreate = [
        { type: 'HERO', title: 'Hero Section', content: { heading: 'Run your school.', highlight: 'Not paperwork.' }, order: 1 },
        { type: 'STATS', title: 'Statistics', content: { stats: statsForm }, order: 2 },
        { type: 'TESTIMONIALS', title: 'Testimonials', content: { testimonials }, order: 3 },
        { type: 'PRICING', title: 'Pricing Plans', content: { plans }, order: 4 },
        { type: 'FOOTER', title: 'Footer', content: { tagline: footerData.tagline }, order: 5 }
      ];

      for (const section of sectionsToCreate) {
        try {
          await api.post('/admin/cms/sections', {
            pageId: homepageId,
            type: section.type,
            title: section.title,
            content: section.content,
            order: section.order,
            isActive: true
          });
        } catch (err) {
          // Section might already exist
          console.log(`Section ${section.type} may already exist`);
        }
      }

      addToast('Default sections created successfully', 'success');
      await loadData();
    } catch (err) {
      console.error('Create sections error:', err);
      addToast('Failed to create default sections', 'error');
    }
  };

  // ─── Render Editors ────────────────────────────────────────────
  const renderEditorContent = () => {
    switch (activeSection) {
      case 'Hero Section':
        return renderHeroEditor();
      case 'Stats / Numbers':
        return renderStatsEditor();
      case 'Testimonials & FAQ':
        return renderTestimonialsEditor();
      case 'Pricing Section':
        return renderPricingEditor();
      case 'Footer & Theme':
        return renderFooterThemeEditor();
      default:
        return <div className="py-8 text-center text-gray-500">Select a section to edit</div>;
    }
  };

  // ─── Hero Editor ──────────────────────────────────────────────
  const renderHeroEditor = () => (
    <div className="space-y-4 pt-2">
      <Input label="Main Headline" value={heroForm.heroHeadline} onChange={e => setHeroForm(f => ({...f, heroHeadline: e.target.value}))} />
      <Input label="Headline Highlight (coloured part)" value={heroForm.heroHeadlineHighlight} onChange={e => setHeroForm(f => ({...f, heroHeadlineHighlight: e.target.value}))} />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Subtitle Text</label>
        <textarea
          rows={3}
          value={heroForm.heroSubtitle}
          onChange={e => setHeroForm(f => ({...f, heroSubtitle: e.target.value}))}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
        />
      </div>
      <Input label="Trust Badge Text" value={heroForm.heroTrustText} onChange={e => setHeroForm(f => ({...f, heroTrustText: e.target.value}))} />
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => setActiveSection(null)}>Cancel</Button>
        <Button onClick={saveHeroSection} loading={saving}>Save Hero</Button>
      </div>
    </div>
  );

  // ─── Stats Editor ─────────────────────────────────────────────
  const renderStatsEditor = () => (
    <div className="space-y-4 pt-2">
      <p className="text-sm text-gray-500">Edit the 4 stat numbers shown on the landing page.</p>
      {statsForm.map((stat, i) => (
        <div key={i} className="grid grid-cols-2 gap-3">
          <Input label="Number / Value" value={stat.number} onChange={e => setStatsForm(s => s.map((x, j) => j === i ? {...x, number: e.target.value} : x))} />
          <Input label="Label" value={stat.label} onChange={e => setStatsForm(s => s.map((x, j) => j === i ? {...x, label: e.target.value} : x))} />
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => setActiveSection(null)}>Cancel</Button>
        <Button onClick={saveStats} loading={saving}>Save Stats</Button>
      </div>
    </div>
  );

  // ─── Testimonials Editor ──────────────────────────────────────
  const renderTestimonialsEditor = () => {
    const addTestimonial = () => {
      setTestimonials([...testimonials, { quote: 'New testimonial...', author: 'Author Name', role: 'Role, School', initials: 'AN', color: '#4F46E5' }]);
    };

    const updateTestimonial = (index, field, value) => {
      const updated = [...testimonials];
      updated[index][field] = value;
      setTestimonials(updated);
    };

    const removeTestimonial = (index) => {
      setTestimonials(testimonials.filter((_, i) => i !== index));
    };

    return (
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Manage testimonials shown on the landing page.</p>
          <Button size="sm" icon={Plus} onClick={addTestimonial}>Add Testimonial</Button>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {testimonials.map((t, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">Testimonial #{i + 1}</span>
                <button onClick={() => removeTestimonial(i)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Quote</label>
                  <textarea
                    rows={2}
                    value={t.quote}
                    onChange={e => updateTestimonial(i, 'quote', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input label="Author" value={t.author} onChange={e => updateTestimonial(i, 'author', e.target.value)} />
                  <Input label="Role" value={t.role} onChange={e => updateTestimonial(i, 'role', e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <Input label="Initials" value={t.initials} onChange={e => updateTestimonial(i, 'initials', e.target.value)} className="w-24" />
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Color</label>
                    <div className="flex gap-1 flex-wrap">
                      {COLORS.map(c => (
                        <button key={c} className={`h-6 w-6 rounded-full border-2 ${t.color === c ? 'border-indigo-600' : 'border-transparent'}`} style={{ background: c }} onClick={() => updateTestimonial(i, 'color', c)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setActiveSection(null)}>Cancel</Button>
          <Button onClick={saveTestimonials} loading={saving}>Save Testimonials</Button>
        </div>
      </div>
    );
  };

  // ─── Pricing Editor ────────────────────────────────────────────
  const renderPricingEditor = () => {
    const addPlan = () => {
      setPlans([...plans, { name: 'New Plan', price: 'Free', period: '/ term', desc: 'Plan description', popular: false, features: [], disabled: [] }]);
    };

    const updatePlan = (index, field, value) => {
      const updated = [...plans];
      updated[index][field] = value;
      setPlans(updated);
    };

    const removePlan = (index) => {
      setPlans(plans.filter((_, i) => i !== index));
    };

    const addFeature = (planIndex, type) => {
      const updated = [...plans];
      updated[planIndex][type].push('');
      setPlans(updated);
    };

    const updateFeature = (planIndex, type, featureIndex, value) => {
      const updated = [...plans];
      updated[planIndex][type][featureIndex] = value;
      setPlans(updated);
    };

    const removeFeature = (planIndex, type, featureIndex) => {
      const updated = [...plans];
      updated[planIndex][type] = updated[planIndex][type].filter((_, i) => i !== featureIndex);
      setPlans(updated);
    };

    return (
      <div className="space-y-4 pt-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-500">Manage subscription plans shown on the landing page.</p>
          <Button size="sm" icon={Plus} onClick={addPlan}>Add Plan</Button>
        </div>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {plans.map((plan, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold text-gray-700">{plan.name}</span>
                <button onClick={() => removePlan(i)} className="text-red-500 hover:text-red-600"><X className="h-4 w-4" /></button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Input label="Plan Name" value={plan.name} onChange={e => updatePlan(i, 'name', e.target.value)} />
                <Input label="Price" value={plan.price} onChange={e => updatePlan(i, 'price', e.target.value)} />
                <Input label="Period" value={plan.period} onChange={e => updatePlan(i, 'period', e.target.value)} />
              </div>
              <Input label="Description" value={plan.desc} onChange={e => updatePlan(i, 'desc', e.target.value)} />
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" checked={plan.popular} onChange={e => updatePlan(i, 'popular', e.target.checked)} className="rounded text-indigo-600" />
                <label className="text-sm text-gray-700">Popular plan (highlighted)</label>
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-700">Features</label>
                  <Button size="sm" variant="outline" onClick={() => addFeature(i, 'features')}>+ Add Feature</Button>
                </div>
                {plan.features.map((f, fi) => (
                  <div key={fi} className="flex gap-2 mb-1">
                    <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" value={f} onChange={e => updateFeature(i, 'features', fi, e.target.value)} placeholder="Feature" />
                    <button onClick={() => removeFeature(i, 'features', fi)} className="text-red-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-medium text-gray-700">Disabled Features (show as unavailable)</label>
                  <Button size="sm" variant="outline" onClick={() => addFeature(i, 'disabled')}>+ Add Disabled</Button>
                </div>
                {plan.disabled.map((f, fi) => (
                  <div key={fi} className="flex gap-2 mb-1">
                    <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" value={f} onChange={e => updateFeature(i, 'disabled', fi, e.target.value)} placeholder="Disabled feature" />
                    <button onClick={() => removeFeature(i, 'disabled', fi)} className="text-red-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setActiveSection(null)}>Cancel</Button>
          <Button onClick={savePlans} loading={saving}>Save Plans</Button>
        </div>
      </div>
    );
  };

  // ─── Footer & Theme Editor ────────────────────────────────────
  const renderFooterThemeEditor = () => {
    return (
      <div className="space-y-4 pt-2 max-h-96 overflow-y-auto pr-2">
        <h3 className="font-semibold text-gray-900">Footer Settings</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Footer Tagline</label>
          <textarea
            rows={2}
            value={footerData.tagline}
            onChange={e => setFooterData(f => ({...f, tagline: e.target.value}))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
          />
        </div>
        
        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-700 mb-2">Footer Links</label>
          {footerData.links.map((link, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" value={link.label} onChange={e => setFooterData(f => ({...f, links: f.links.map((l, j) => j === i ? {...l, label: e.target.value} : l)}))} placeholder="Label" />
              <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" value={link.url} onChange={e => setFooterData(f => ({...f, links: f.links.map((l, j) => j === i ? {...l, url: e.target.value} : l)}))} placeholder="URL" />
              <button onClick={() => setFooterData(f => ({...f, links: f.links.filter((_, j) => j !== i)}))} className="text-red-400 hover:text-red-500"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <Button size="sm" variant="outline" onClick={() => setFooterData(f => ({...f, links: [...f.links, { label: '', url: '' }]}))}>+ Add Link</Button>
        </div>

        <div className="mt-4">
          <h3 className="font-semibold text-gray-900 mt-4">Theme Settings</h3>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex gap-1 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} className={`h-6 w-6 rounded-full border-2 ${theme.primaryColor === c ? 'border-indigo-600' : 'border-transparent'}`} style={{ background: c }} onClick={() => setTheme(t => ({...t, primaryColor: c}))} />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Secondary Color</label>
              <div className="flex gap-1 flex-wrap">
                {['#1A3C5E', '#2D3748', '#1A202C', '#0D1117'].map(c => (
                  <button key={c} className={`h-6 w-6 rounded-full border-2 ${theme.secondaryColor === c ? 'border-indigo-600' : 'border-transparent'}`} style={{ background: c }} onClick={() => setTheme(t => ({...t, secondaryColor: c}))} />
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Input label="Logo URL" value={theme.logoUrl || ''} onChange={e => setTheme(t => ({...t, logoUrl: e.target.value}))} placeholder="https://example.com/logo.png" />
            <Input label="Favicon URL" value={theme.faviconUrl || ''} onChange={e => setTheme(t => ({...t, faviconUrl: e.target.value}))} placeholder="https://example.com/favicon.ico" />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => setActiveSection(null)}>Cancel</Button>
          <Button onClick={saveTheme} loading={saving}>Save Theme</Button>
        </div>
      </div>
    );
  };

  // ─── Main Render ──────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <span className="ml-3 text-sm text-gray-500">Loading CMS...</span>
      </div>
    );
  }

  const hasSections = Object.keys(sectionIds).length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Website CMS"
        subtitle="Manage landing page content and layout without touching code."
        action={
          <div className="flex gap-2">
            {!hasSections && (
              <Button variant="secondary" onClick={createDefaultSections}>
                Create Default Sections
              </Button>
            )}
            <Button variant="outline" icon={Eye} onClick={() => window.open('/', '_blank')}>Preview Site</Button>
          </div>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Landing Page Sections</h2>
        {!hasSections && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
            No sections found. Click the "Create Default Sections" button above to set up your landing page.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: 'Hero Section', desc: 'Edit main heading, subtitle, and the trust badge text.', icon: Layout },
            { id: 'Stats / Numbers', desc: 'Update the 4 statistics shown in the indigo band.', icon: Monitor },
            { id: 'Testimonials & FAQ', desc: 'Add or remove testimonials and frequently asked questions.', icon: Quote },
            { id: 'Pricing Section', desc: 'Edit pricing cards, add new plans, and manage feature lists.', icon: CreditCard },
            { id: 'Footer & Theme', desc: 'Manage footer links, social links, brand colors, and fonts.', icon: Palette },
          ].map(section => {
            const Icon = section.icon;
            return (
              <div 
                key={section.id} 
                className={`border border-gray-200 rounded-lg p-5 transition-all group relative flex flex-col justify-between ${hasSections ? 'cursor-pointer hover:border-indigo-400 hover:shadow-md' : 'opacity-60 cursor-not-allowed'}`}
                onClick={() => hasSections && setActiveSection(section.id)}
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-indigo-50 rounded-lg">
                      <Icon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{section.id}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{section.desc}</p>
                </div>
                <div className="mt-4 flex justify-end">
                  <span className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 className="h-3.5 w-3.5" /> Edit
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeSection && (
        <Modal isOpen={!!activeSection} onClose={() => setActiveSection(null)} title={`Editing: ${activeSection}`}>
          {renderEditorContent()}
        </Modal>
      )}
    </div>
  );
}