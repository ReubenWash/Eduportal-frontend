import PageHeader from '../../components/common/PageHeader';
import { Cpu, Key, Activity, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export default function AdminAIConfig() {
  const { addToast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Configuration"
        subtitle="Manage AI services and monitor token usage."
        action={
          <Button icon={Save} onClick={() => addToast('AI Configuration saved.', 'success')}>Save Settings</Button>
        }
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Key className="h-5 w-5 text-indigo-500" />
              API Providers
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <input type="password" placeholder="sk-..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Gemini API Key</label>
                <input type="password" placeholder="AIza..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Claude API Key</label>
                <input type="password" placeholder="sk-ant-..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Usage & Limits
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enable AI Assistant</span>
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" defaultChecked />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Monthly Usage Limit ($)</label>
                <input type="number" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" defaultValue={500} />
              </div>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-1">Current Month Cost</p>
                <p className="text-2xl font-bold text-gray-900">$124.50</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
