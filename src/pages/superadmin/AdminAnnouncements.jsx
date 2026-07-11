import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Bell, Send, Mail, Users, CheckCircle2, FileText, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function AdminAnnouncements() {
  const { addToast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState('ALL_SCHOOLS');
  const [template, setTemplate] = useState('none');
  const [channels, setChannels] = useState({ inApp: true, email: true, push: false, sms: false });
  const [isSending, setIsSending] = useState(false);

  const templates = {
    none: { name: 'Custom Message', content: '' },
    maintenance: { name: 'Scheduled Maintenance', content: 'Dear [School Name],\n\nWe will be performing scheduled maintenance on [Date] at [Time]. During this window, the platform will be unavailable.\n\nThank you,\nThe EduPortal Team' },
    update: { name: 'Product Update', content: 'Hello [Name],\n\nWe are excited to announce a new feature: [Feature Name]! Log in now to explore how it can help you.\n\nBest,\nThe EduPortal Team' },
    billing: { name: 'Billing Reminder', content: 'Dear Admin,\n\nThis is a friendly reminder that your subscription for [School Name] is due for renewal on [Date].\n\nThank you for choosing EduPortal.' }
  };

  const handleTemplateChange = (e) => {
    const key = e.target.value;
    setTemplate(key);
    if (key !== 'none') {
      setTitle(templates[key].name);
      setMessage(templates[key].content);
    } else {
      setTitle('');
      setMessage('');
    }
  };

  const handleChannelToggle = (channel) => {
    setChannels(prev => ({ ...prev, [channel]: !prev[channel] }));
  };

  const handleSend = () => {
    if (!title || !message) {
      addToast('Title and message are required.', 'error');
      return;
    }
    if (!channels.inApp && !channels.email && !channels.push && !channels.sms) {
      addToast('Please select at least one delivery channel.', 'error');
      return;
    }

    setIsSending(true);
    
    // Simulate SMTP / Broadcast delay
    setTimeout(() => {
      addToast('Broadcast successfully queued for delivery.', 'success');
      setIsSending(false);
      setTitle('');
      setMessage('');
      setTemplate('none');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcasts & Announcements"
        subtitle="Configure SMTP broadcasts, push notifications, and in-app alerts."
        action={
          <Button icon={Send} onClick={handleSend} disabled={isSending}>
            {isSending ? 'Sending...' : 'Send Broadcast'}
          </Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-500" />
              Compose Broadcast
            </h3>
            <div className="space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                  <select value={template} onChange={handleTemplateChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    {Object.entries(templates).map(([key, tpl]) => (
                      <option key={key} value={key}>{tpl.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                    <option value="ALL_SCHOOLS">All Active Schools</option>
                    <option value="PREMIUM_ONLY">Premium Schools Only</option>
                    <option value="BASIC_ONLY">Basic Schools Only</option>
                    <option value="ALL_TEACHERS">All Teachers (Global)</option>
                    <option value="ALL_PARENTS">All Parents (Global)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject / Title</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" 
                  placeholder="E.g., Important Platform Update" 
                />
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Message Content</label>
                  {template !== 'none' && <span className="text-xs text-indigo-600 flex items-center gap-1"><FileText className="h-3 w-3" /> Using Template</span>}
                </div>
                <textarea 
                  rows={8} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm font-mono text-sm" 
                  placeholder="Write your message here. You can use variables like [School Name], [Date]..."
                ></textarea>
                <p className="mt-2 text-xs text-gray-500">Supports HTML formatting for email delivery.</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-sm font-semibold text-gray-900 mb-3">Delivery Channels</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${channels.email ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="sr-only" checked={channels.email} onChange={() => handleChannelToggle('email')} />
                    <Mail className={`h-5 w-5 mb-1 ${channels.email ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${channels.email ? 'text-indigo-900' : 'text-gray-600'}`}>SMTP Email</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${channels.inApp ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="sr-only" checked={channels.inApp} onChange={() => handleChannelToggle('inApp')} />
                    <Bell className={`h-5 w-5 mb-1 ${channels.inApp ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${channels.inApp ? 'text-indigo-900' : 'text-gray-600'}`}>In-App</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${channels.push ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="sr-only" checked={channels.push} onChange={() => handleChannelToggle('push')} />
                    <AlertCircle className={`h-5 w-5 mb-1 ${channels.push ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${channels.push ? 'text-indigo-900' : 'text-gray-600'}`}>Push (App)</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${channels.sms ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                    <input type="checkbox" className="sr-only" checked={channels.sms} onChange={() => handleChannelToggle('sms')} />
                    <Users className={`h-5 w-5 mb-1 ${channels.sms ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <span className={`text-xs font-medium ${channels.sms ? 'text-indigo-900' : 'text-gray-600'}`}>SMS</span>
                  </label>
                </div>
              </div>

            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              Delivery History
            </h3>
            <div className="space-y-4">
              <div className="border-l-2 border-indigo-500 pl-3">
                <p className="text-sm font-medium text-gray-900">Scheduled Maintenance</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">EMAIL</span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">IN-APP</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sent to All Schools · 2 days ago</p>
              </div>
              <div className="border-l-2 border-emerald-500 pl-3">
                <p className="text-sm font-medium text-gray-900">New Feature: AI Assistant</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">EMAIL</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sent to Premium Schools · 1 week ago</p>
              </div>
              <div className="border-l-2 border-gray-300 pl-3">
                <p className="text-sm font-medium text-gray-900">Welcome to Term 2</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">EMAIL</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">SMS</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Sent to All Schools · 3 weeks ago</p>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-4">View Full History</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
