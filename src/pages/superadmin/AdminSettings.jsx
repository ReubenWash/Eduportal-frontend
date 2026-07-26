import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Shield, ShieldAlert, Palette, Image, FileText } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { 
  getGlobalSettings, 
  updateGlobalSettings, 
  updateEnvConfig, 
  updateIntegration, 
  createIntegration, 
  getIntegrations 
} from '../../api/superAdminApi';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Platform Brand settings
  const [platformName, setPlatformName] = useState('EduPortal');
  const [theme, setTheme] = useState('indigo');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // SMTP settings
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('apikey');
  const [smtpPass, setSmtpPass] = useState('SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
  const [smtpIntegrationId, setSmtpIntegrationId] = useState(null);

  // Regional settings
  const [timeZone, setTimeZone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  // KYC Settings
  const [kycDocs, setKycDocs] = useState([
    { id: 'cert', name: 'School Registration Certificate', required: true },
    { id: 'id', name: 'Headmaster Valid ID', required: true },
    { id: 'tax', name: 'Tax Clearance Certificate', required: false },
  ]);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Load global settings
        const settings = await getGlobalSettings();
        if (settings) {
          applySettings(settings);
        }
      } catch (err) {
        console.error('Failed to load global settings:', err);
        addToast('Failed to load general settings from server', 'error');
      }

      try {
        // Load integrations to get SMTP config
        const integrations = await getIntegrations();
        if (Array.isArray(integrations)) {
          const sendgrid = integrations.find(i => i.key === 'sendgrid' || i.key === 'smtp');
          if (sendgrid) {
            setSmtpIntegrationId(sendgrid.id);
            if (sendgrid.config) {
              if (sendgrid.config.host) setSmtpHost(sendgrid.config.host);
              if (sendgrid.config.port) setSmtpPort(String(sendgrid.config.port));
              if (sendgrid.config.username) setSmtpUser(sendgrid.config.username);
              if (sendgrid.config.password) setSmtpPass(sendgrid.config.password);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load integrations:', err);
        // Don't show toast for integrations failure - it's not critical for UI
      }

      setLoading(false);
    };

    loadSettings();
  }, []);

  const applySettings = (settings) => {
    // Platform settings
    if (settings?.platformName) setPlatformName(settings.platformName);
    if (settings?.theme) setTheme(settings.theme);
    if (settings?.language) setLanguage(settings.language);
    if (settings?.timeZone) setTimeZone(settings.timeZone);
    
    // SMTP settings (if stored in global settings as fallback)
    if (settings?.smtpHost) setSmtpHost(settings.smtpHost);
    if (settings?.smtpPort) setSmtpPort(String(settings.smtpPort));
    if (settings?.smtpUser) setSmtpUser(settings.smtpUser);
    if (settings?.smtpPass) setSmtpPass(settings.smtpPass);
    
    // KYC requirements
    if (settings?.kyc_requirements) {
      try {
        const parsed = typeof settings.kyc_requirements === 'string' 
          ? JSON.parse(settings.kyc_requirements) 
          : settings.kyc_requirements;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setKycDocs(parsed);
        }
      } catch (err) {
        console.error('Failed to parse KYC requirements:', err);
      }
    }
  };

  const toggleKycDoc = (id) => {
    setKycDocs(prev => prev.map(doc => 
      doc.id === id ? { ...doc, required: !doc.required } : doc
    ));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    let hasError = false;
    let errorMessages = [];

    try {
      // 1. Save general settings
      const settingsPayload = {
        platformName,
        theme,
        language,
        timeZone,
        kyc_requirements: JSON.stringify(kycDocs),
      };
      
      await updateGlobalSettings(settingsPayload);
    } catch (err) {
      hasError = true;
      const msg = err?.response?.data?.message || err?.message || 'Failed to save general settings';
      errorMessages.push(msg);
      console.error('updateGlobalSettings error:', err);
    }

    try {
      // 2. Save SMTP settings via Integrations API
      const integrationData = {
        name: 'SendGrid Email',
        description: 'Email delivery service',
        isEnabled: true,
        config: {
          host: smtpHost,
          port: parseInt(smtpPort, 10) || 587,
          username: smtpUser,
          password: smtpPass,
        },
      };

      if (smtpIntegrationId) {
        // Update existing integration
        await updateIntegration(smtpIntegrationId, integrationData);
      } else {
        // Create new integration
        const newIntegration = await createIntegration({
          key: 'sendgrid',
          type: 'EMAIL',
          ...integrationData,
        });
        setSmtpIntegrationId(newIntegration.id);
      }
    } catch (err) {
      hasError = true;
      const msg = err?.response?.data?.message || err?.message || 'Failed to save SMTP settings';
      errorMessages.push(msg);
      console.error('Integration save error:', err);
    }

    try {
      // 3. Sync to ENV (optional - for backward compatibility)
      await updateEnvConfig({
        SMTP_HOST: smtpHost,
        SMTP_PORT: smtpPort,
        SMTP_USER: smtpUser,
        SMTP_PASS: smtpPass,
      });
    } catch (err) {
      // Non-critical - don't mark as error if this fails
      console.warn('updateEnvConfig warning:', err);
    }

    if (!hasError) {
      addToast('System settings saved successfully!', 'success');
    } else {
      // Show combined error message
      const combinedMsg = errorMessages.length > 1 
        ? `${errorMessages[0]} (and ${errorMessages.length - 1} more errors)`
        : errorMessages[0];
      addToast(`Failed to save: ${combinedMsg}`, 'error');
    }
    
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        <span className="ml-3 text-sm text-gray-500">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global platform metadata, SMTP mail service, brand customization, and localized defaults.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Platform Settings */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Globe className="h-4 w-4 text-indigo-500" /> Platform Configuration
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Platform Name</label>
              <input 
                type="text" 
                value={platformName}
                onChange={e => setPlatformName(e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Language</label>
                <select 
                  value={language}
                  onChange={e => setLanguage(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="en">English (US)</option>
                  <option value="en-gb">English (UK)</option>
                  <option value="fr">French</option>
                  <option value="es">Spanish</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Time Zone</label>
                <select 
                  value={timeZone}
                  onChange={e => setTimeZone(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
                >
                  <option value="UTC">UTC (GMT+0)</option>
                  <option value="EST">EST (GMT-5)</option>
                  <option value="WAT">WAT (GMT+1)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Theme & Branding */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Palette className="h-4 w-4 text-violet-500" /> Branding & Theme
            </h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Primary Theme Accent</label>
              <div className="flex gap-3">
                {['indigo', 'violet', 'emerald', 'sky'].map(color => (
                  <button 
                    type="button"
                    key={color}
                    onClick={() => setTheme(color)}
                    className={`h-8 px-4 rounded-lg text-xs font-semibold capitalize border transition-all ${
                      theme === color ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Platform Logo</label>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Image className="h-5 w-5 text-indigo-600" />
                </div>
                <button 
                  type="button" 
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  onClick={() => addToast('Logo upload feature coming soon!', 'info')}
                >
                  Upload Logo File
                </button>
              </div>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Mail className="h-4 w-4 text-emerald-500" /> SMTP Configuration (Gmail Supported)
            </h2>
            <p className="text-xs text-gray-500 mb-3">If using Gmail, use `smtp.gmail.com` on port `587` or `465`, and generate an App Password in your Google Account security settings.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Host</label>
                <input 
                  type="text" 
                  value={smtpHost}
                  onChange={e => setSmtpHost(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Port</label>
                <input 
                  type="text" 
                  value={smtpPort}
                  onChange={e => setSmtpPort(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Username</label>
                <input 
                  type="text" 
                  value={smtpUser}
                  onChange={e => setSmtpUser(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">SMTP Password</label>
                <input 
                  type="password" 
                  value={smtpPass}
                  onChange={e => setSmtpPass(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* KYC Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <FileText className="h-4 w-4 text-amber-500" /> KYC Requirements Configuration
            </h2>
            <p className="text-xs text-gray-500 mb-3">Select which documents are mandatory for a school to complete their registration.</p>
            <div className="space-y-3">
              {kycDocs.map(doc => (
                <label key={doc.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={doc.required}
                    onChange={() => toggleKycDoc(doc.id)}
                    className="h-4 w-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm font-medium text-gray-800">{doc.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button 
            type="button" 
            className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => {
              // Reload settings to discard changes
              window.location.reload();
            }}
          >
            Discard Changes
          </button>
          <button 
            type="submit" 
            disabled={saving} 
            className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm disabled:opacity-60"
          >
            {saving ? (
              <span className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"/>
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}