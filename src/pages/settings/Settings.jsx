import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Input from '../../components/ui/Input';
import PhoneInput from '../../components/ui/PhoneInput';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { isValidE164Phone, normalizePhoneForApi } from '../../utils/phone';
import { getSchool, updateSchool, updateSchoolWithLogo } from '../../api/schoolApi';
import { Building2, Mail, Phone, MapPin, Upload, CheckCircle, GraduationCap, Hash } from 'lucide-react';

const defaultGradingConfig = {
  caCount: 3,
  caMaxScore: 10,
  examMaxScore: 70,
  boundaries: { A1: 90, B2: 80, B3: 75, C4: 70, C5: 65, C6: 60, D7: 55, E8: 50 }
};

const defaultReportConfig = {
  primaryColor: '#1E2A78',
  title: "LEARNER'S TERMINAL REPORT",
  footerText: 'This is a computer-generated report card. No signature is required.',
  motto: '',
  showLogo: true,
  showSchoolName: true,
  showStudentPhoto: true,
  showPrincipalSignature: true,
  showClassTeacherSignature: true
};

const getStoredGradingConfig = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('schoolGradingConfig'));
    if (stored) {
      return {
        ...defaultGradingConfig,
        ...stored,
        boundaries: { ...defaultGradingConfig.boundaries, ...(stored.boundaries || {}) }
      };
    }
    return defaultGradingConfig;
  } catch {
    return defaultGradingConfig;
  }
};

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ 
    name: '', email: '', phone: '', address: '', logo: null, plan: '',
    studentIdPrefix: '',
    scoreLabels: { ca1: 'C/A 1', ca2: 'C/A 2', ca3: 'C/A 3', examScore: 'Exam Score' },
    reportConfig: defaultReportConfig
  });
  const [preview, setPreview] = useState('');
  
  // Grading config state
  const [gradingConfig, setGradingConfig] = useState(() => getStoredGradingConfig());

  const { addToast } = useToast();

  useEffect(() => {
    loadSchoolData();
  }, []);

  const loadSchoolData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const data = await getSchool();
      setForm({ 
        name: data?.name || '', 
        email: data?.email || '', 
        phone: data?.phone || '', 
        address: data?.address || '', 
        logo: null, 
        plan: data?.plan || '',
        studentIdPrefix: data?.studentIdPrefix || '',
        scoreLabels: data?.scoreLabels || { ca1: 'C/A 1', ca2: 'C/A 2', ca3: 'C/A 3', examScore: 'Exam Score' },
        motto: data?.motto || '',
        reportConfig: {
          ...defaultReportConfig,
          ...(data?.reportConfig || {}),
          showLogo: true,
          showSchoolName: true,
          showStudentPhoto: true,
          showPrincipalSignature: true,
          showClassTeacherSignature: true,
        }
      });

      const nextGradingConfig = data?.gradingConfig
        ? { ...defaultGradingConfig, ...data.gradingConfig, boundaries: { ...defaultGradingConfig.boundaries, ...(data.gradingConfig.boundaries || {}) } }
        : getStoredGradingConfig();
      setGradingConfig(nextGradingConfig);
      localStorage.setItem('schoolGradingConfig', JSON.stringify(nextGradingConfig));
      setPreview(data?.logoUrl || '');
    } catch (err) {
      console.error('Failed to load school data:', err);
      setLoadError(true);
      addToast('Failed to load school settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleScoreLabelChange = (e) => {
    setForm({
      ...form,
      scoreLabels: { ...form.scoreLabels, [e.target.name]: e.target.value }
    });
  };

  const handleReportConfigChange = (field, value) => {
    setForm({
      ...form,
      reportConfig: {
        ...form.reportConfig,
        [field]: value
      }
    });
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({ ...form, logo: file });
    setPreview(URL.createObjectURL(file));
  };

  // ✅ Main submit handler - properly handles both with and without logo
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone && !isValidE164Phone(normalizePhoneForApi(form.phone))) {
      addToast('Enter a valid phone number with its country calling code.', 'error');
      return;
    }
    setSaving(true);
    
    try {
      // ✅ Build clean data object - only include fields that have values
      const updateData = {};
      
      // Only include fields if they have values
      if (form.name && form.name.trim()) {
        updateData.name = form.name.trim();
      }
      if (form.email && form.email.trim()) {
        updateData.email = form.email.trim();
      }
      if (form.phone && form.phone.trim()) {
        updateData.phone = normalizePhoneForApi(form.phone);
      }
      if (form.address && form.address.trim()) {
        updateData.address = form.address.trim();
      }
      if (form.studentIdPrefix && form.studentIdPrefix.trim()) {
        updateData.studentIdPrefix = form.studentIdPrefix.trim().toUpperCase();
      }
      
      // Handle scoreLabels - only if it's an object with values
      if (form.scoreLabels && typeof form.scoreLabels === 'object') {
        const hasValues = Object.values(form.scoreLabels).some(v => v && v.trim());
        if (hasValues) {
          updateData.scoreLabels = form.scoreLabels;
        }
      }

      if (form.reportConfig && typeof form.reportConfig === 'object') {
        updateData.reportConfig = form.reportConfig;
      }

      if (gradingConfig && typeof gradingConfig === 'object') {
        updateData.gradingConfig = gradingConfig;
      }
      
      console.log('📤 Sending clean data:', updateData);
      console.log('📤 Has logo file?', !!form.logo);
      
      // ✅ Check if there's a logo file to upload
      const hasLogo = form.logo && form.logo instanceof File;
      
      if (hasLogo) {
        // ✅ Use FormData for logo upload
        const formData = new FormData();
        
        // Append all the data fields as strings
        Object.keys(updateData).forEach(key => {
          const value = updateData[key];
          // If value is an object, stringify it
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        });
        
        // Append the logo file
        formData.append('logo', form.logo);
        
        console.log('📤 Uploading with logo, formData entries:', [...formData.entries()]);
        
        // ✅ Use updateSchoolWithLogo with FormData
        await updateSchoolWithLogo(formData);
      } else {
        // ✅ No logo - use regular updateSchool with JSON
        if (Object.keys(updateData).length === 0) {
          addToast('No changes to save', 'info');
          setSaving(false);
          return;
        }
        console.log('📤 No logo, using regular updateSchool');
        await updateSchool(updateData);
      }
      
      // ✅ Save grading config locally
      localStorage.setItem('schoolGradingConfig', JSON.stringify(gradingConfig));
      
      addToast('School settings updated successfully', 'success');
      
      // ✅ Reload school data to reflect changes
      await loadSchoolData();
      
    } catch (err) {
      console.error('❌ Update error:', err);
      
      // ✅ Show detailed error message
      if (err.response?.data?.errors) {
        const errorMessages = err.response.data.errors
          .map(e => `${e.field}: ${e.message}`)
          .join(', ');
        addToast(`Validation failed: ${errorMessages}`, 'error');
      } else if (err.response?.data?.message) {
        addToast(err.response.data.message, 'error');
      } else {
        addToast('Failed to update settings. Please try again.', 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ✅ Separate function for saving grading config
  const handleSaveGradingConfig = async () => {
    setSaving(true);
    try {
      const payload = { gradingConfig };
      localStorage.setItem('schoolGradingConfig', JSON.stringify(gradingConfig));
      await updateSchool(payload);
      addToast('Grading configuration saved successfully', 'success');
      await loadSchoolData();
    } catch (err) {
      console.error('❌ Error saving grading config:', err);
      addToast('Failed to save grading configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Separate function for saving score labels
  const handleSaveScoreLabels = async () => {
    setSaving(true);
    try {
      const updateData = {
        scoreLabels: form.scoreLabels
      };
      await updateSchool(updateData);
      addToast('Score labels updated successfully', 'success');
      await loadSchoolData();
    } catch (err) {
      console.error('❌ Error saving score labels:', err);
      addToast('Failed to save score labels', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveReportTheme = async () => {
    setSaving(true);
    try {
      await updateSchool({
        motto: form.motto.trim() || null,
        reportConfig: {
          ...form.reportConfig,
          motto: form.motto.trim(),
        },
      });

      addToast('Report template saved successfully', 'success');
      await loadSchoolData();
    } catch (err) {
      console.error('❌ Error saving report branding:', err);
      addToast('Failed to save report branding', 'error');
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
                  <PhoneInput
                    label="Phone Number"
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
                  <Input
                    label="Student ID Prefix"
                    name="studentIdPrefix"
                    value={form.studentIdPrefix}
                    onChange={e => setForm({ ...form, studentIdPrefix: e.target.value.toUpperCase().slice(0, 3) })}
                    icon={Hash}
                    placeholder="e.g. DIS"
                    maxLength={3}
                  />
                  <p className="text-xs text-gray-500 -mt-3 col-span-full">
                    3 letters used for new student IDs, e.g. "DIS" → DIS-{new Date().getFullYear()}-0001. Only affects students admitted after you set this — existing student numbers don't change.
                  </p>
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
            
            <div className="mt-6 border-t border-gray-100 pt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Grade Boundaries (Minimum Score)</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8'].map(grade => (
                  <div key={grade} className="flex items-center gap-2">
                    <label className="text-xs font-bold text-gray-700 w-6">{grade}</label>
                    <input 
                      type="number" min="0" max="100" 
                      value={gradingConfig.boundaries?.[grade] ?? ''}
                      onChange={e => setGradingConfig({
                        ...gradingConfig, 
                        boundaries: { ...gradingConfig.boundaries, [grade]: Number(e.target.value) }
                      })}
                      className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <Button 
                type="button" 
                onClick={handleSaveGradingConfig} 
                loading={saving} 
                icon={saving ? undefined : CheckCircle}
              >
                Save Grading Config
              </Button>
            </div>
          </div>

          {/* Report Card Branding */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900">Terminal Report Template</h2>
            <p className="mt-1 text-xs text-gray-500">
              School identity, learner details, scores, and signature lines use the existing report layout.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="report-title">
                  Report title
                </label>
                <input
                  id="report-title"
                  type="text"
                  value={form.reportConfig.title || ''}
                  onChange={(e) => handleReportConfigChange('title', e.target.value)}
                  placeholder="Learner's Terminal Report"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="school-motto">
                  School motto
                </label>
                <input
                  id="school-motto"
                  type="text"
                  value={form.motto}
                  onChange={(e) => setForm({ ...form, motto: e.target.value })}
                  placeholder="Optional"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="report-color">
                  Heading color
                </label>
                <input
                  id="report-color"
                  type="color"
                  value={form.reportConfig.primaryColor || '#1E2A78'}
                  onChange={(e) => handleReportConfigChange('primaryColor', e.target.value)}
                  className="h-10 w-16 rounded border border-gray-200 bg-white p-1"
                  aria-label="Report heading color"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1" htmlFor="report-footer">
                  Footer note
                </label>
                <input
                  id="report-footer"
                  type="text"
                  value={form.reportConfig.footerText || ''}
                  onChange={(e) => handleReportConfigChange('footerText', e.target.value)}
                  placeholder="Optional note printed at the bottom of reports"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              {preview && (
                <img src={preview} alt="" className="h-12 w-12 rounded-lg bg-white object-contain p-1" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-gray-900">{form.name || 'Your school name'}</p>
                {form.motto && <p className="mt-1 truncate text-xs italic text-gray-500">{form.motto}</p>}
                <p className="mt-1 text-xs font-medium uppercase tracking-wide" style={{ color: form.reportConfig.primaryColor || '#1E2A78' }}>
                  {form.reportConfig.title || "LEARNER'S TERMINAL REPORT"}
                </p>
                <p className="mt-1 text-xs text-gray-500">Standard terminal report layout</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                onClick={handleSaveReportTheme}
                loading={saving}
                icon={saving ? undefined : CheckCircle}
              >
                Save template
              </Button>
            </div>
          </div>

          {/* Score Labels Configuration */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Score Category Labels</h2>
            <p className="text-xs text-gray-500 mb-5">Customize the names of the score categories displayed on report cards and entry forms.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">C/A 1 Label</label>
                <input 
                  type="text" 
                  name="ca1"
                  value={form.scoreLabels.ca1} 
                  onChange={handleScoreLabelChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">C/A 2 Label</label>
                <input 
                  type="text" 
                  name="ca2"
                  value={form.scoreLabels.ca2} 
                  onChange={handleScoreLabelChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">C/A 3 Label</label>
                <input 
                  type="text" 
                  name="ca3"
                  value={form.scoreLabels.ca3} 
                  onChange={handleScoreLabelChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Exam Score Label</label>
                <input 
                  type="text" 
                  name="examScore"
                  value={form.scoreLabels.examScore} 
                  onChange={handleScoreLabelChange}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end">
              <Button 
                type="button" 
                onClick={handleSaveScoreLabels} 
                loading={saving} 
                icon={saving ? undefined : CheckCircle}
              >
                Save Score Labels
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
            <Button 
              variant="danger" 
              size="sm" 
              className="w-full"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete your school account? This action cannot be undone.')) {
                  addToast('This feature is disabled in demo mode', 'warning');
                }
              }}
            >
              Delete School Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}