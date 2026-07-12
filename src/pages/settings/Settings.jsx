import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { getSchool, updateSchool } from '../../api/schoolApi';
import { Building2, Mail, Phone, MapPin, Upload, CheckCircle, ExternalLink, GraduationCap } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', logo: null, plan: '' });
  const [preview, setPreview] = useState('');
  
  // Grading config state
  const [gradingConfig, setGradingConfig] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('schoolGradingConfig')) || { caCount: 3, caMaxScore: 10, examMaxScore: 70 };
    } catch {
      return { caCount: 3, caMaxScore: 10, examMaxScore: 70 };
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    getSchool()
      .then((data) => {
        setForm({ name: data?.name || '', email: data?.email || '', phone: data?.phone || '', address: data?.address || '', logo: null, plan: data?.plan || '' });
        setPreview(data?.logoUrl || '');
        setLoadError(false);
      })
      .catch((err) => {
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, logo: file });
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSchool(form);
      // Save grading config locally
      localStorage.setItem('schoolGradingConfig', JSON.stringify(gradingConfig));
      addToast('School settings updated successfully', 'success');
    } catch (err) {
      addToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="School Settings"
        subtitle="Manage your school profile and preferences"
        breadcrumb="System"
      />

      {loadError && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-5">
          Couldn't load school settings from the server. Check the console for details.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {/* Logo & Plan card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">School Identity</h2>
            <div className="flex items-center gap-5">
              {/* Logo uploader */}
              <div className="relative">
                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 flex items-center justify-center">
                  {preview ? (
                    <img src={preview} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <GraduationCap className="h-8 w-8 text-gray-300" />
                  )}
                </div>
                <label className="absolute -bottom-1.5 -right-1.5 h-7 w-7 bg-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-700 transition-colors shadow-md">
                  <Upload className="h-3.5 w-3.5 text-white" />
                  <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">School Logo</p>
                <p className="text-xs text-gray-500 mt-0.5">PNG, JPG or SVG. Max 2MB. Recommended: 200×200px</p>
                {preview && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1 mt-1.5">
                    <CheckCircle className="h-3.5 w-3.5" /> Logo uploaded
                  </p>
                )}
              </div>
              {/* Plan badge */}
              <div className="text-right flex-shrink-0">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                  {form.plan || 'Plan'}
                </span>
                <a href="#" className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 mt-1.5 transition-colors justify-end">
                  Upgrade <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>

          {/* School Info form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-5">School Information</h2>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-11 bg-gray-100 rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Input
                    label="School Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    icon={Building2}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    icon={Mail}
                  />
                  <Input
                    label="Phone Number"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    icon={Phone}
                  />
                  <Input
                    label="Address"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    icon={MapPin}
                  />
                </div>
                <div className="flex items-center justify-end pt-2">
                  <Button type="submit" loading={saving} icon={saving ? undefined : CheckCircle}>
                    Save Changes
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Grading System Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Grading System Configuration</h2>
            <p className="text-xs text-gray-500 mb-5">Set the number of Continuous Assessments (CA) and max scores for teachers.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Number of CAs</label>
                <input 
                  type="number" min="1" max="5" 
                  value={gradingConfig.caCount} 
                  onChange={e => setGradingConfig({...gradingConfig, caCount: Number(e.target.value)})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Max Score per CA</label>
                <input 
                  type="number" min="1" max="100" 
                  value={gradingConfig.caMaxScore} 
                  onChange={e => setGradingConfig({...gradingConfig, caMaxScore: Number(e.target.value)})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Max Exam Score</label>
                <input 
                  type="number" min="1" max="100" 
                  value={gradingConfig.examMaxScore} 
                  onChange={e => setGradingConfig({...gradingConfig, examMaxScore: Number(e.target.value)})}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-end">
              <Button type="button" onClick={handleSubmit} loading={saving} icon={saving ? undefined : CheckCircle}>
                Save Grading Config
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Danger zone */}
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-5">
            <h3 className="text-sm font-semibold text-red-700 mb-1">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-4">These actions are irreversible. Proceed with caution.</p>
            <Button variant="danger" size="sm" className="w-full">
              Delete School Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}