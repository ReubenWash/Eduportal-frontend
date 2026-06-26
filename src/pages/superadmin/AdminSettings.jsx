import { useState } from 'react';
import { Save, Globe, Mail, Shield, ShieldAlert, Palette, Image } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  
  // Platform Brand settings
  const [platformName, setPlatformName] = useState('EduPortal');
  const [theme, setTheme] = useState('indigo');
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  
  // SMTP settings
  const [smtpHost, setSmtpHost] = useState('smtp.sendgrid.net');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('apikey');
  const [smtpPass, setSmtpPass] = useState('SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

  // Regional settings
  const [timeZone, setTimeZone] = useState('UTC');
  const [language, setLanguage] = useState('en');

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

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
                <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
                  Upload Logo File
                </button>
              </div>
            </div>
          </div>

          {/* SMTP Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 lg:col-span-2">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
              <Mail className="h-4 w-4 text-emerald-500" /> SMTP Configuration (Outgoing Mail)
            </h2>
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
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" className="px-5 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Discard Changes
          </button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm">
            <Save className="h-4 w-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
}
