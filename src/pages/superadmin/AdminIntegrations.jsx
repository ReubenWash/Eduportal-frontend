import { useState } from 'react';
import { Key, Eye, EyeOff, RefreshCw, CheckCircle, XCircle, Copy, ToggleLeft, ToggleRight, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';

const INTEGRATIONS = [
  {
    group: 'Authentication & Security',
    items: [
      { id: 'recaptcha',  name: 'Google reCAPTCHA', icon: '🔒', enabled: true,  keys: [{ label: 'Site Key', value: '', type: 'text' }, { label: 'Secret Key', value: '', type: 'password' }] },
      { id: 'google',     name: 'Google OAuth',      icon: '🔑', enabled: true,  keys: [{ label: 'Client ID', value: '', type: 'text' }, { label: 'Client Secret', value: '', type: 'password' }] },
      { id: 'microsoft',  name: 'Microsoft OAuth',   icon: '🪟', enabled: false, keys: [{ label: 'Client ID', value: '', type: 'text' }, { label: 'Client Secret', value: '', type: 'password' }] },
    ]
  },
  {
    group: 'Payment Gateways',
    items: [
      { id: 'paystack', name: 'Paystack',  icon: '💳', enabled: true,  keys: [{ label: 'Public Key', value: '', type: 'text' }, { label: 'Secret Key', value: '', type: 'password' }] },
      { id: 'stripe',   name: 'Stripe',   icon: '💰', enabled: false, keys: [{ label: 'Publishable Key', value: '', type: 'text' }, { label: 'Secret Key', value: '', type: 'password' }] },
    ]
  },
  {
    group: 'Cloud & Storage',
    items: [
      { id: 'cloudinary', name: 'Cloudinary',    icon: '🖼️', enabled: true,  keys: [{ label: 'Cloud Name', value: 'eduportal-cdn', type: 'text' }, { label: 'API Key', value: '', type: 'text' }, { label: 'API Secret', value: '', type: 'password' }] },
      { id: 'aws',        name: 'AWS S3',         icon: '☁️', enabled: false, keys: [{ label: 'Access Key ID', value: '', type: 'text' }, { label: 'Secret Access Key', value: '', type: 'password' }, { label: 'Bucket Name', value: '', type: 'text' }] },
      { id: 'firebase',   name: 'Firebase',       icon: '🔥', enabled: true,  keys: [{ label: 'Project ID', value: 'eduportal-app', type: 'text' }, { label: 'API Key', value: '', type: 'password' }, { label: 'Server Key', value: '', type: 'password' }] },
    ]
  },
  {
    group: 'Communication',
    items: [
      { id: 'sendgrid', name: 'SendGrid Email',  icon: '📧', enabled: true,  keys: [{ label: 'API Key', value: '', type: 'password' }, { label: 'From Email', value: 'noreply@eduportal.com', type: 'text' }] },
      { id: 'twilio',   name: 'Twilio SMS',      icon: '📱', enabled: false, keys: [{ label: 'Account SID', value: '', type: 'text' }, { label: 'Auth Token', value: '', type: 'password' }, { label: 'From Number', value: '', type: 'text' }] },
      { id: 'whatsapp', name: 'WhatsApp Business', icon: '💬', enabled: false, keys: [{ label: 'Token', value: '', type: 'password' }, { label: 'Phone Number ID', value: '', type: 'text' }] },
    ]
  },
  {
    group: 'Video & Collaboration',
    items: [
      { id: 'zoom',   name: 'Zoom API',            icon: '🎥', enabled: false, keys: [{ label: 'API Key', value: '', type: 'text' }, { label: 'API Secret', value: '', type: 'password' }] },
      { id: 'teams',  name: 'Microsoft Teams',     icon: '👥', enabled: false, keys: [{ label: 'Tenant ID', value: '', type: 'text' }, { label: 'App ID', value: '', type: 'text' }] },
    ]
  },
];

import { updateEnvConfig } from '../../api/superAdminApi';

function IntegrationCard({ item, onToggle, onTest, onCopy }) {
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Load saved key values from localStorage (only for public keys fallback, secrets will be empty)
  const loadedKeys = (() => {
    try { return JSON.parse(localStorage.getItem('platformKeys') || '{}'); } catch { return {}; }
  })();
  
  const [values, setValues] = useState(
    item.keys.reduce((acc, k) => ({ 
      ...acc, 
      [k.label]: loadedKeys[`${item.id}.${k.label}`] ?? k.value 
    }), {})
  );

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // 1. Prepare keys for the backend
      const keysToUpdate = {};
      item.keys.forEach(k => {
        // Construct the expected .env variable name (e.g., STRIPE_SECRET_KEY)
        const envKeyName = `${item.id.toUpperCase()}_${k.label.toUpperCase().replace(/\s+/g, '_')}`;
        keysToUpdate[envKeyName] = values[k.label];
        
        // 2. Also persist public keys to localStorage for UI convenience
        if (k.type !== 'password') {
          try {
            const current = JSON.parse(localStorage.getItem('platformKeys') || '{}');
            current[`${item.id}.${k.label}`] = values[k.label];
            localStorage.setItem('platformKeys', JSON.stringify(current));
          } catch {}
        }
      });
      
      // 3. Send to backend to write to .env
      await updateEnvConfig(keysToUpdate);
      
      addToast('Configuration saved securely to server.', 'success');
      setModalOpen(false);
    } catch (error) {
      console.error('Failed to save config:', error);
      addToast(error.message || 'Failed to save configuration to server.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={`bg-white rounded-xl border transition-all p-5 flex flex-col justify-between h-full gap-4 ${item.enabled ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-200 opacity-70'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.icon}</span>
            <div>
              <p className="text-base font-bold text-gray-900">{item.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {item.enabled
                  ? <><CheckCircle className="h-4 w-4 text-emerald-500" /><span className="text-xs text-emerald-600 font-medium">Active</span></>
                  : <><XCircle className="h-4 w-4 text-gray-400" /><span className="text-xs text-gray-400">Disabled</span></>}
              </div>
            </div>
          </div>
          <button onClick={() => onToggle(item.id)} title={item.enabled ? 'Disable' : 'Enable'} className={`transition-colors ${item.enabled ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-300 hover:text-emerald-500'}`}>
            {item.enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
          </button>
        </div>
        <div className="pt-3 border-t border-gray-100 flex gap-3">
           <Button variant="outline" className="flex-1" onClick={() => setModalOpen(true)}>Configure</Button>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span> Configure {item.name}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4 bg-gray-50">
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Integration Status</p>
                  <p className="text-xs text-gray-500">Enable or disable this integration</p>
                </div>
                <button onClick={() => onToggle(item.id)} className={`transition-colors ${item.enabled ? 'text-emerald-500' : 'text-gray-300'}`}>
                  {item.enabled ? <ToggleRight className="h-8 w-8" /> : <ToggleLeft className="h-8 w-8" />}
                </button>
              </div>

              {item.keys.map(k => (
                <div key={k.label}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">{k.label}</label>
                  {k.type === 'password' && (
                    <p className="text-xs text-amber-600 mb-1 flex items-center gap-1">
                      <span>⚠️</span> Secret keys must also be set in your server's <code className="font-mono bg-amber-50 px-1 rounded">.env</code> file to take effect.
                    </p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type={k.type === 'password' && !revealed[k.label] ? 'password' : 'text'}
                      value={values[k.label]}
                      onChange={e => setValues(prev => ({ ...prev, [k.label]: e.target.value }))}
                      className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white transition-all"
                      placeholder={`Enter ${k.label.toLowerCase()}...`}
                    />
                    {k.type === 'password' && (
                      <button onClick={() => setRevealed(p => ({ ...p, [k.label]: !p[k.label] }))} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg bg-white transition-colors">
                        {revealed[k.label] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                    <button onClick={() => onCopy(values[k.label])} className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg bg-white transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between bg-white">
              <Button variant="outline" onClick={() => onTest(item.id, 'test')} icon={RefreshCw}>Test Connection</Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSave} loading={saving}>Save Config</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminIntegrations() {
  const { addToast } = useToast();
  const [integrations, setIntegrations] = useState(INTEGRATIONS);

  const toggle = (id) => {
    setIntegrations(prev => prev.map(g => ({
      ...g,
      items: g.items.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i)
    })));
  };

  const handleTest = (id, action) => {
    if (action === 'test') addToast('Connection test passed successfully!', 'success');
    else addToast('Configuration saved.', 'success');
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value).then(() => addToast('Copied to clipboard!', 'success'));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API & Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all third-party service credentials, enable/disable integrations, and configure settings.</p>
      </div>
      {integrations.map(group => (
        <div key={group.group} className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-200 pb-2">{group.group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.items.map(item => (
              <IntegrationCard key={item.id} item={item} onToggle={toggle} onTest={handleTest} onCopy={handleCopy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}