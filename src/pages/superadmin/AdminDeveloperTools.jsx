import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Code, Terminal, Webhook, Bug, RefreshCw, X, Play, StopCircle, Key, Activity, List } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';

export default function AdminDeveloperTools() {
  const { addToast } = useToast();
  const [activeTool, setActiveTool] = useState(null); // 'webhooks' | 'logs' | 'apikeys' | 'docs' | 'queue'
  const [debugMode, setDebugMode] = useState(false);

  const openTool = (tool) => {
    setActiveTool(tool);
  };

  const closeTool = () => {
    setActiveTool(null);
  };

  const handleClearCache = () => {
    addToast('System cache cleared successfully.', 'success');
  };

  const handleDebugToggle = (e) => {
    setDebugMode(e.target.checked);
    addToast(e.target.checked ? 'Debug mode enabled' : 'Debug mode disabled', 'success');
  };

  const renderToolContent = () => {
    switch (activeTool) {
      case 'webhooks':
        return (
          <div className="space-y-4 pt-2">
            <div className="flex justify-end"><Button size="sm" onClick={() => addToast('Feature coming soon.', 'info')}>Add Webhook</Button></div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Endpoint</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Actions</th></tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr><td className="px-4 py-3 font-mono">https://api.school.com/hook</td><td className="px-4 py-3 text-green-600">Active</td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => addToast('Edit feature coming soon.', 'info')}>Edit</Button></td></tr>
                    <tr><td className="px-4 py-3 font-mono">https://payments.school.com/v1</td><td className="px-4 py-3 text-red-600">Failing</td><td className="px-4 py-3 text-right"><Button variant="outline" size="sm" onClick={() => addToast('Edit feature coming soon.', 'info')}>Edit</Button></td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="space-y-4 pt-2">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[300px]">
              <p>[2026-07-10 12:00:01] INFO: Webhook delivered to https://api.school.com/hook</p>
              <p>[2026-07-10 12:05:22] ERROR: Webhook failed (500) for https://payments.school.com/v1</p>
              <p>[2026-07-10 12:10:05] INFO: Retrying payment webhook (Attempt 2)...</p>
              <p className="animate-pulse">_</p>
            </div>
          </div>
        );
      case 'apikeys':
        return (
          <div className="space-y-4 pt-2">
            <div className="flex justify-end"><Button size="sm" onClick={() => addToast('Key generation coming soon.', 'info')}>Generate New Key</Button></div>
            <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Production Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="password" value="sk_live_abc123def456" readOnly className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm font-mono" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('sk_live_abc123def456'); addToast('Copied to clipboard', 'success'); }}>Copy</Button>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase">Test Key</label>
                <div className="flex items-center gap-2 mt-1">
                  <input type="password" value="sk_test_xyz987" readOnly className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm font-mono" />
                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText('sk_test_xyz987'); addToast('Copied to clipboard', 'success'); }}>Copy</Button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'docs':
        return (
          <div className="space-y-4 pt-2">
            <div className="border-b border-gray-200 pb-3">
              <h3 className="font-bold text-lg">EduPortal API v1.0</h3>
              <p className="text-sm text-gray-500">Base URL: <code className="bg-gray-100 px-1 rounded">https://api.eduportal.com/v1</code></p>
            </div>
            <div className="space-y-3">
              <div className="border border-gray-200 rounded p-3">
                <p className="font-mono text-sm text-indigo-600 font-bold mb-1">GET /schools</p>
                <p className="text-sm text-gray-700">List all schools registered on the platform.</p>
              </div>
              <div className="border border-gray-200 rounded p-3">
                <p className="font-mono text-sm text-green-600 font-bold mb-1">POST /students</p>
                <p className="text-sm text-gray-700">Create a new student record.</p>
              </div>
            </div>
          </div>
        );
      case 'queue':
        return (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-indigo-50 text-indigo-700 p-3 rounded-lg text-center"><p className="text-2xl font-bold">12</p><p className="text-xs font-medium">Pending</p></div>
              <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-center"><p className="text-2xl font-bold">845</p><p className="text-xs font-medium">Processed</p></div>
              <div className="bg-red-50 text-red-700 p-3 rounded-lg text-center"><p className="text-2xl font-bold">3</p><p className="text-xs font-medium">Failed</p></div>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr><th className="px-4 py-2 text-left">Job Type</th><th className="px-4 py-2 text-left">Status</th></tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr><td className="px-4 py-3">SendReportCardsEmail</td><td className="px-4 py-3 text-amber-600">Processing...</td></tr>
                    <tr><td className="px-4 py-3">GenerateDailyBackup</td><td className="px-4 py-3 text-red-600">Failed</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const modalTitles = {
    webhooks: 'Manage Webhooks',
    logs: 'Webhook Delivery Logs',
    apikeys: 'API Access Keys',
    docs: 'API Documentation',
    queue: 'Job Queue Dashboard'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Tools"
        subtitle="Advanced platform management for developers."
        action={
          <Button variant="outline" icon={RefreshCw} onClick={handleClearCache}>Clear Cache</Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Webhook className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900">Webhooks</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage outgoing webhooks and view delivery logs.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openTool('webhooks')}>Manage Webhooks</Button>
            <Button size="sm" variant="outline" onClick={() => openTool('logs')}>View Logs</Button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Code className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900">API Access</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Manage API keys and view API documentation.</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openTool('apikeys')}>API Keys</Button>
            <Button size="sm" variant="outline" onClick={() => openTool('docs')}>View Docs</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Terminal className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900">Cron & Queues</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Monitor background jobs, queues, and scheduled tasks.</p>
          <Button size="sm" variant="outline" onClick={() => openTool('queue')}>Queue Dashboard</Button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Bug className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-medium text-gray-900">Diagnostics</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">View error logs, database status, and toggle debug mode.</p>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
            <span className="text-sm font-medium text-gray-700">Debug Mode</span>
            <input type="checkbox" checked={debugMode} className="rounded text-indigo-600 focus:ring-indigo-500" onChange={handleDebugToggle} />
          </div>
        </div>
      </div>

      {activeTool && (
        <Modal isOpen={!!activeTool} onClose={closeTool} title={modalTitles[activeTool]}>
          {renderToolContent()}
          <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={closeTool}>Close</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
