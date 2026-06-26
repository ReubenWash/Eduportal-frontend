import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { getSchool, updateSchool } from '../../api/schoolApi';
import { Building2, Mail, Phone, MapPin, Upload, CheckCircle, ExternalLink, GraduationCap } from 'lucide-react';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '', logo: null });
  const [preview, setPreview] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    getSchool()
      .then((data) => {
        setForm({ name: data.name || '', email: data.email || '', phone: data.phone || '', address: data.address || '', logo: null });
        setPreview(data.logo || '');
        setLoading(false);
      })
      .catch(() => {
        // Use mock data if API fails
        setForm({ name: 'Greenfield Academy', email: 'admin@greenfield.edu.gh', phone: '+233 20 000 0000', address: 'P.O. Box 123, Accra, Ghana', logo: null });
        setLoading(false);
      });
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
      addToast('School settings updated successfully', 'success');
    } catch {
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
                  Pro Plan
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
        </div>

        {/* Right sidebar */}
        <div className="space-y-5">
          {/* Quick stats */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Account Overview</h3>
            <div className="space-y-3">
              {[
                { label: 'Plan', value: 'Pro', pill: true },
                { label: 'Students', value: '1,234' },
                { label: 'Staff', value: '45' },
                { label: 'Storage', value: '2.4 GB / 10 GB' },
                { label: 'Member since', value: 'Jan 2024' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">{s.label}</span>
                  {s.pill ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">{s.value}</span>
                  ) : (
                    <span className="font-medium text-gray-900">{s.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

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