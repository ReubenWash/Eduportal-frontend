import { useState } from 'react';
import { Send, Bell, Mail, MessageSquare, Clock, Users, Plus, Trash2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const CHANNELS = [
  { id: 'push',  label: 'Push Notification', icon: Bell,          color: 'text-indigo-600', bg: 'bg-indigo-50', enabled: true  },
  { id: 'email', label: 'Email',              icon: Mail,          color: 'text-violet-600', bg: 'bg-violet-50', enabled: true  },
  { id: 'sms',   label: 'SMS',                icon: MessageSquare, color: 'text-emerald-600',bg: 'bg-emerald-50',enabled: false },
];
const AUDIENCE = ['All Users', 'School Admins Only', 'Teachers Only', 'Active Schools', 'Pending Schools'];
const TEMPLATES = [
  { id: '1', name: 'Welcome New School', type: 'email', subject: 'Welcome to EduPortal!', preview: 'Your school account has been approved...' },
  { id: '2', name: 'Subscription Reminder', type: 'email', subject: 'Your subscription is due', preview: 'This is a reminder that your subscription...' },
  { id: '3', name: 'System Maintenance', type: 'push', subject: 'Scheduled Maintenance', preview: 'EduPortal will be offline for maintenance...' },
  { id: '4', name: 'New Feature Alert', type: 'push', subject: 'New feature available!', preview: 'Check out our new reporting module...' },
];

export default function AdminNotifications() {
  const { addToast } = useToast();
  const [channels, setChannels] = useState(CHANNELS);
  const [audience, setAudience] = useState('All Users');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const toggleChannel = (id) => setChannels(p => p.map(c => c.id === id ? { ...c, enabled: !c.enabled } : c));

  const handleSend = () => {
    if (!subject || !body) { addToast('Please fill in subject and message.', 'error'); return; }
    addToast(`Notification sent to ${audience}!`, 'success');
    setSubject(''); setBody('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications Center</h1>
        <p className="text-sm text-gray-500 mt-1">Send platform-wide announcements via push, email, or SMS to any audience group.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Compose */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-900">Compose Notification</h2>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Send To</label>
              <select value={audience} onChange={e => setAudience(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 bg-white">
                {AUDIENCE.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Channels</label>
              <div className="flex gap-2">
                {channels.map(c => {
                  const Icon = c.icon;
                  return (
                    <button key={c.id} onClick={() => toggleChannel(c.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-semibold transition-all ${c.enabled ? `${c.bg} ${c.color} border-current/20` : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      <Icon className="h-3.5 w-3.5" /> {c.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Subject / Title</label>
              <input value={subject} onChange={e => setSubject(e.target.value)} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" placeholder="e.g. Important Platform Update" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message</label>
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={5} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 resize-none" placeholder="Write your notification message..." />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600">
                <input type="checkbox" checked={scheduled} onChange={e => setScheduled(e.target.checked)} className="rounded border-gray-300 text-indigo-600" />
                <Clock className="h-4 w-4 text-gray-400" /> Schedule for later
              </label>
              {scheduled && <input type="datetime-local" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" />}
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-100">
              <button className="px-4 py-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Save as Draft</button>
              <button onClick={handleSend} className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors shadow-sm">
                <Send className="h-4 w-4" /> {scheduled ? 'Schedule Send' : 'Send Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Templates */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-fit">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Templates</h2>
            <button className="text-indigo-600 hover:text-indigo-700"><Plus className="h-4 w-4" /></button>
          </div>
          <div className="divide-y divide-gray-100">
            {TEMPLATES.map(t => (
              <div key={t.id} className="flex items-start justify-between px-5 py-3 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => { setSubject(t.subject); setBody(t.preview); }}>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900">{t.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{t.type.toUpperCase()} · {t.subject}</p>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 ml-2"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
