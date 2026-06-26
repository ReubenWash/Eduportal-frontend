import { useState } from 'react';
import { Key, Eye, EyeOff, RefreshCw, CheckCircle, XCircle, Copy, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

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

function IntegrationCard({ item, onToggle, onTest, onCopy }) {
  const [expanded, setExpanded] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState(item.keys.reduce((acc, k) => ({ ...acc, [k.label]: k.value }), {}));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => { setSaving(false); onTest(item.id, 'save'); }, 800);
  };

  return (
    <div className={`bg-white rounded-xl border transition-all ${item.enabled ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-200 opacity-70'}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{item.icon}</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              {item.enabled
                ? <><CheckCircle className="h-3 w-3 text-emerald-500" /><span className="text-[11px] text-emerald-600 font-medium">Active</span></>
                : <><XCircle className="h-3 w-3 text-gray-400" /><span className="text-[11px] text-gray-400">Disabled</span></>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => onToggle(item.id)} title={item.enabled ? 'Disable' : 'Enable'} className={`transition-colors ${item.enabled ? 'text-emerald-500 hover:text-gray-400' : 'text-gray-300 hover:text-emerald-500'}`}>
            {item.enabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md transition-colors">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-gray-100 p-4 space-y-3">
          {item.keys.map(k => (
            <div key={k.label}>
              <label className="block text-xs font-semibold text-gray-500 mb-1">{k.label}</label>
              <div className="flex gap-2">
                <input
                  type={k.type === 'password' && !revealed[k.label] ? 'password' : 'text'}
                  value={values[k.label]}
                  onChange={e => setValues(prev => ({ ...prev, [k.label]: e.target.value }))}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-gray-50 transition-all"
                  placeholder={`Enter ${k.label.toLowerCase()}...`}
                />
                {k.type === 'password' && (
                  <button onClick={() => setRevealed(p => ({ ...p, [k.label]: !p[k.label] }))} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-colors">
                    {revealed[k.label] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                )}
                <button onClick={() => onCopy(values[k.label])} className="p-2 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg transition-colors">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <button onClick={() => onTest(item.id, 'test')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
              <RefreshCw className="h-3.5 w-3.5" /> Test Connection
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors disabled:opacity-60">
              {saving ? 'Saving...' : 'Save Keys'}
            </button>
          </div>
        </div>
      )}
    </div>
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
    else addToast('API keys saved.', 'success');
  };

  const handleCopy = (value) => {
    navigator.clipboard.writeText(value).then(() => addToast('Copied to clipboard!', 'success'));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">API & Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all third-party service credentials, enable/disable integrations, and test connections.</p>
      </div>
      {integrations.map(group => (
        <div key={group.group} className="space-y-3">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider border-b border-gray-100 pb-2">{group.group}</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {group.items.map(item => (
              <IntegrationCard key={item.id} item={item} onToggle={toggle} onTest={handleTest} onCopy={handleCopy} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}