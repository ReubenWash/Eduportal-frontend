import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Bug,
  Code,
  Key,
  RefreshCw,
  Webhook,
} from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  checkServiceHealth,
  clearCache,
  createApiKey,
  createWebhook,
  deleteWebhook,
  getApiKeys,
  getCacheEntries,
  getDeveloperSettings,
  getErrorLogs,
  getServiceHealth,
  getWebhookLogs,
  getWebhooks,
  resolveErrorLog,
  revokeApiKey,
  updateDeveloperSetting,
  updateWebhook,
} from '../../api/superAdminApi';

const fieldClass = 'w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500';

const messageFromError = (error) => error?.response?.data?.message || error?.message || 'Request failed.';

const formatDate = (date) => {
  if (!date) return 'Never';
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? 'Unknown' : parsed.toLocaleString();
};

const getRows = (result) => (Array.isArray(result?.data) ? result.data : []);

export default function AdminDeveloperTools() {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [activeTool, setActiveTool] = useState(null);
  const [toolData, setToolData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [webhookForm, setWebhookForm] = useState({ name: '', url: '', events: '', secret: '' });
  const [apiKeyForm, setApiKeyForm] = useState({ name: '', scopes: '' });
  const [createdWebhookSecret, setCreatedWebhookSecret] = useState('');
  const [createdApiKey, setCreatedApiKey] = useState('');

  const loadTool = useCallback(async (tool) => {
    setLoading(true);
    setLoadError('');
    try {
      let result;
      if (tool === 'webhooks') {
        result = await getWebhooks();
      } else if (tool === 'logs') {
        result = await getWebhookLogs({ limit: 50 });
      } else if (tool === 'apikeys') {
        result = await getApiKeys({ limit: 50 });
      } else if (tool === 'cache') {
        result = await getCacheEntries({ limit: 50 });
      } else if (tool === 'diagnostics') {
        const [settings, health, errors] = await Promise.all([
          getDeveloperSettings(),
          getServiceHealth(),
          getErrorLogs({ resolved: false, limit: 20 }),
        ]);
        result = { settings, health, errors };
      }
      setToolData(result);
    } catch (error) {
      setLoadError(messageFromError(error));
      setToolData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTool) loadTool(activeTool);
  }, [activeTool, loadTool]);

  const closeTool = () => {
    setActiveTool(null);
    setLoadError('');
    setCreatedWebhookSecret('');
    setCreatedApiKey('');
  };

  const handleCreateWebhook = async (event) => {
    event.preventDefault();
    const events = webhookForm.events.split(',').map((value) => value.trim()).filter(Boolean);
    if (!events.length) {
      addToast('Enter at least one webhook event.', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await createWebhook({
        name: webhookForm.name.trim(),
        url: webhookForm.url.trim(),
        events,
        ...(webhookForm.secret.trim() ? { secret: webhookForm.secret.trim() } : {}),
      });
      setCreatedWebhookSecret(created?.secret || '');
      setWebhookForm({ name: '', url: '', events: '', secret: '' });
      addToast('Webhook created.', 'success');
      await loadTool('webhooks');
    } catch (error) {
      addToast(`Could not create webhook: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleWebhookStatus = async (webhook) => {
    setSaving(true);
    try {
      await updateWebhook(webhook.id, { status: webhook.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' });
      addToast('Webhook status updated.', 'success');
      await loadTool('webhooks');
    } catch (error) {
      addToast(`Could not update webhook: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteWebhook = async (webhook) => {
    if (!window.confirm(`Delete webhook "${webhook.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      await deleteWebhook(webhook.id);
      addToast('Webhook deleted.', 'success');
      await loadTool('webhooks');
    } catch (error) {
      addToast(`Could not delete webhook: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateApiKey = async (event) => {
    event.preventDefault();
    if (!user?.id) {
      addToast('Your account could not be identified. Sign in again and retry.', 'error');
      return;
    }
    const scopes = apiKeyForm.scopes.split(',').map((value) => value.trim()).filter(Boolean);
    if (!scopes.length) {
      addToast('Enter at least one API scope.', 'error');
      return;
    }

    setSaving(true);
    try {
      const created = await createApiKey({
        userId: user.id,
        name: apiKeyForm.name.trim(),
        scopes,
      });
      setCreatedApiKey(created?.rawKey || '');
      setApiKeyForm({ name: '', scopes: '' });
      addToast('API key created. Copy it now; it will not be shown again.', 'success');
      await loadTool('apikeys');
    } catch (error) {
      addToast(`Could not create API key: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeApiKey = async (apiKey) => {
    if (!window.confirm(`Revoke API key "${apiKey.name}"? Applications using it will lose access.`)) return;
    setSaving(true);
    try {
      await revokeApiKey(apiKey.id);
      addToast('API key revoked.', 'success');
      await loadTool('apikeys');
    } catch (error) {
      addToast(`Could not revoke API key: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleClearCache = async (key) => {
    const confirmation = key
      ? `Clear cache entry "${key}"?`
      : 'Clear all cache entries?';
    if (!window.confirm(confirmation)) return;
    setSaving(true);
    try {
      await clearCache(key);
      addToast(key ? 'Cache entry cleared.' : 'All cache entries cleared.', 'success');
      await loadTool('cache');
    } catch (error) {
      addToast(`Could not clear cache: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDebugToggle = async (event) => {
    const value = event.target.checked ? 'ON' : 'OFF';
    setSaving(true);
    try {
      await updateDeveloperSetting('debugMode', value);
      addToast(`Debug mode ${value === 'ON' ? 'enabled' : 'disabled'}.`, 'success');
      await loadTool('diagnostics');
    } catch (error) {
      addToast(`Could not update debug mode: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleHealthCheck = async () => {
    setSaving(true);
    try {
      await checkServiceHealth();
      addToast('Service health check completed.', 'success');
      await loadTool('diagnostics');
    } catch (error) {
      addToast(`Health check failed: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResolveError = async (log) => {
    setSaving(true);
    try {
      await resolveErrorLog(log.id, 'Resolved from Developer Tools.');
      addToast('Error log marked as resolved.', 'success');
      await loadTool('diagnostics');
    } catch (error) {
      addToast(`Could not resolve error log: ${messageFromError(error)}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = async (value, label) => {
    try {
      await navigator.clipboard.writeText(value);
      addToast(`${label} copied.`, 'success');
    } catch (error) {
      addToast(`Could not copy to clipboard: ${messageFromError(error)}`, 'error');
    }
  };

  const renderToolContent = () => {
    if (loading) return <p className="py-8 text-center text-sm text-gray-500">Loading live data...</p>;
    if (loadError) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-red-700">{loadError}</p>
          <Button variant="secondary" size="sm" onClick={() => loadTool(activeTool)}>Retry</Button>
        </div>
      );
    }

    switch (activeTool) {
      case 'webhooks': {
        const webhooks = Array.isArray(toolData) ? toolData : [];
        return (
          <div className="space-y-6">
            {createdWebhookSecret && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Copy the webhook secret now</p>
                <p className="mt-1 break-all font-mono text-xs text-amber-800">{createdWebhookSecret}</p>
                <Button className="mt-3" size="sm" variant="secondary" onClick={() => copyToClipboard(createdWebhookSecret, 'Webhook secret')}>Copy secret</Button>
              </div>
            )}
            <form onSubmit={handleCreateWebhook} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Add webhook</h3>
              <label className="block text-sm text-gray-700">Name<input required className={`${fieldClass} mt-1`} value={webhookForm.name} onChange={(event) => setWebhookForm({ ...webhookForm, name: event.target.value })} /></label>
              <label className="block text-sm text-gray-700">Endpoint URL<input required type="url" className={`${fieldClass} mt-1`} value={webhookForm.url} onChange={(event) => setWebhookForm({ ...webhookForm, url: event.target.value })} /></label>
              <label className="block text-sm text-gray-700">Events <span className="text-gray-500">(comma-separated)</span><input required className={`${fieldClass} mt-1`} placeholder="student.created, payment.received" value={webhookForm.events} onChange={(event) => setWebhookForm({ ...webhookForm, events: event.target.value })} /></label>
              <label className="block text-sm text-gray-700">Secret <span className="text-gray-500">(optional; generated if blank)</span><input type="password" autoComplete="new-password" className={`${fieldClass} mt-1`} value={webhookForm.secret} onChange={(event) => setWebhookForm({ ...webhookForm, secret: event.target.value })} /></label>
              <Button type="submit" size="sm" loading={saving}>Create webhook</Button>
            </form>
            <div>
              <h3 className="mb-3 font-medium text-gray-900">Configured webhooks</h3>
              {webhooks.length ? (
                <div className="space-y-3">
                  {webhooks.map((webhook) => (
                    <div key={webhook.id} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">{webhook.name}</p>
                          <p className="mt-1 break-all font-mono text-xs text-gray-500">{webhook.url}</p>
                          <p className="mt-2 text-xs text-gray-500">{(webhook.events || []).join(', ') || 'No events configured'}</p>
                        </div>
                        <span className={`rounded-full px-2 py-1 text-xs font-medium ${webhook.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{webhook.status || 'UNKNOWN'}</span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button variant="secondary" size="sm" loading={saving} onClick={() => handleWebhookStatus(webhook)}>{webhook.status === 'ACTIVE' ? 'Disable' : 'Enable'}</Button>
                        <Button variant="danger" size="sm" loading={saving} onClick={() => handleDeleteWebhook(webhook)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">No webhooks have been configured.</p>}
            </div>
          </div>
        );
      }
      case 'logs': {
        const logs = getRows(toolData);
        return (
          <div className="space-y-3">
            {logs.length ? logs.map((log) => (
              <article key={log.id} className="rounded-lg border border-gray-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-gray-900">{log.webhook?.name || 'Webhook'} · {log.event || 'Unknown event'}</p>
                  <span className={`text-xs font-medium ${log.success ? 'text-green-700' : 'text-red-700'}`}>{log.success ? 'Delivered' : 'Failed'}</span>
                </div>
                <p className="mt-1 break-all font-mono text-xs text-gray-500">{log.webhook?.url || ''}</p>
                <p className="mt-2 text-xs text-gray-500">{formatDate(log.createdAt)}{log.responseStatus ? ` · HTTP ${log.responseStatus}` : ''}</p>
                {log.error && <p className="mt-2 text-sm text-red-700">{log.error}</p>}
              </article>
            )) : <p className="text-sm text-gray-500">No webhook delivery logs found.</p>}
          </div>
        );
      }
      case 'apikeys': {
        const keys = getRows(toolData);
        return (
          <div className="space-y-6">
            {createdApiKey && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-900">Copy the API key now; it will not be shown again</p>
                <p className="mt-1 break-all font-mono text-xs text-amber-800">{createdApiKey}</p>
                <Button className="mt-3" size="sm" variant="secondary" onClick={() => copyToClipboard(createdApiKey, 'API key')}>Copy key</Button>
              </div>
            )}
            <form onSubmit={handleCreateApiKey} className="space-y-3 rounded-lg border border-gray-200 p-4">
              <h3 className="font-medium text-gray-900">Generate API key</h3>
              <label className="block text-sm text-gray-700">Key name<input required className={`${fieldClass} mt-1`} value={apiKeyForm.name} onChange={(event) => setApiKeyForm({ ...apiKeyForm, name: event.target.value })} /></label>
              <label className="block text-sm text-gray-700">Scopes <span className="text-gray-500">(comma-separated)</span><input required className={`${fieldClass} mt-1`} placeholder="Enter the exact scopes this key needs" value={apiKeyForm.scopes} onChange={(event) => setApiKeyForm({ ...apiKeyForm, scopes: event.target.value })} /></label>
              <Button type="submit" size="sm" loading={saving}>Generate key</Button>
            </form>
            <div>
              <h3 className="mb-3 font-medium text-gray-900">API keys</h3>
              {keys.length ? (
                <div className="space-y-3">
                  {keys.map((apiKey) => (
                    <div key={apiKey.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
                      <div>
                        <p className="font-medium text-gray-900">{apiKey.name}</p>
                        <p className="mt-1 font-mono text-xs text-gray-500">{apiKey.key || apiKey.keyPrefix || 'Key prefix unavailable'}</p>
                        <p className="mt-1 text-xs text-gray-500">Created {formatDate(apiKey.createdAt)} · Expires {formatDate(apiKey.expiresAt)}</p>
                        <p className="mt-1 text-xs text-gray-500">Scopes: {(apiKey.scopes || []).join(', ') || 'None'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium ${apiKey.isActive ? 'text-green-700' : 'text-gray-500'}`}>{apiKey.isActive ? 'Active' : 'Revoked'}</span>
                        {apiKey.isActive && <Button variant="danger" size="sm" loading={saving} onClick={() => handleRevokeApiKey(apiKey)}>Revoke</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">No API keys have been created.</p>}
            </div>
          </div>
        );
      }
      case 'docs':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">These routes are part of the authenticated admin API. They require a signed-in Super Admin session; they are not public API endpoints.</p>
            {[
              ['GET /admin/integrations/webhooks', 'List configured webhooks'],
              ['POST /admin/integrations/webhooks', 'Create a webhook'],
              ['GET /admin/integrations/webhooks/logs', 'Review delivery attempts'],
              ['GET /admin/integrations/api-keys', 'List API keys (only key prefixes are returned)'],
              ['POST /admin/integrations/api-keys', 'Create an API key (raw key is returned once)'],
              ['GET /admin/system/health', 'Read service health checks'],
              ['GET /admin/system/errors', 'Review system error logs'],
            ].map(([route, description]) => (
              <div key={route} className="rounded-lg border border-gray-200 p-3">
                <p className="font-mono text-sm font-semibold text-indigo-700">{route}</p>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </div>
            ))}
          </div>
        );
      case 'cache': {
        const entries = getRows(toolData);
        return (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-gray-600">{entries.length} cache entries on this page.</p>
              <Button variant="danger" size="sm" loading={saving} onClick={() => handleClearCache()}>Clear all cache</Button>
            </div>
            {entries.length ? entries.map((entry) => (
              <div key={entry.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-3">
                <div className="min-w-0">
                  <p className="break-all font-mono text-sm text-gray-900">{entry.key}</p>
                  <p className="mt-1 text-xs text-gray-500">Created {formatDate(entry.createdAt)} · Expires {formatDate(entry.expiresAt)}</p>
                </div>
                <Button variant="secondary" size="sm" loading={saving} onClick={() => handleClearCache(entry.key)}>Clear</Button>
              </div>
            )) : <p className="text-sm text-gray-500">No cache entries found.</p>}
          </div>
        );
      }
      case 'diagnostics': {
        const settings = toolData?.settings || {};
        const health = Array.isArray(toolData?.health) ? toolData.health : [];
        const errors = getRows(toolData?.errors);
        const debugEnabled = settings.debugMode === 'ON' || settings.debugMode === true;
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 p-4">
              <div>
                <p className="font-medium text-gray-900">Debug mode</p>
                <p className="text-sm text-gray-500">Persisted platform setting; do not enable on production without a need.</p>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" checked={debugEnabled} disabled={saving} onChange={handleDebugToggle} />
                {debugEnabled ? 'Enabled' : 'Disabled'}
              </label>
            </div>
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium text-gray-900">Service health</h3>
                <Button size="sm" variant="secondary" icon={RefreshCw} loading={saving} onClick={handleHealthCheck}>Run check</Button>
              </div>
              {health.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {health.map((service) => (
                    <div key={service.id || service.type} className="rounded-lg border border-gray-200 p-3">
                      <p className="font-medium text-gray-900">{service.name || service.type}</p>
                      <p className="mt-1 text-xs text-gray-500">Status: {service.status || 'Unknown'} · Last checked {formatDate(service.lastCheckAt)}</p>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">No service health data is available.</p>}
            </section>
            <section>
              <h3 className="mb-3 font-medium text-gray-900">Unresolved errors</h3>
              {errors.length ? (
                <div className="space-y-3">
                  {errors.map((log) => (
                    <div key={log.id} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-red-700">{log.level || 'Error'} · {log.statusCode || 'No status code'}</p>
                          <p className="mt-1 text-sm text-gray-800">{log.message}</p>
                          {log.endpoint && <p className="mt-1 break-all font-mono text-xs text-gray-500">{log.endpoint}</p>}
                          <p className="mt-1 text-xs text-gray-500">{formatDate(log.createdAt)}</p>
                        </div>
                        <Button size="sm" variant="secondary" loading={saving} onClick={() => handleResolveError(log)}>Resolve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-gray-500">No unresolved errors found.</p>}
            </section>
          </div>
        );
      }
      default:
        return null;
    }
  };

  const modalTitles = {
    webhooks: 'Manage Webhooks',
    logs: 'Webhook Delivery Logs',
    apikeys: 'API Access Keys',
    docs: 'API Documentation',
    cache: 'System Cache',
    diagnostics: 'System Diagnostics',
  };

  const openTool = (tool) => setActiveTool(tool);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Developer Tools"
        subtitle="Manage integrations and inspect live platform diagnostics."
        action={<Button variant="secondary" icon={RefreshCw} onClick={() => openTool('cache')}>Manage Cache</Button>}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2"><Webhook className="h-5 w-5 text-indigo-600" /></div>
            <h3 className="font-medium text-gray-900">Webhooks</h3>
          </div>
          <p className="mb-4 text-sm text-gray-500">Create endpoints and review actual delivery logs.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => openTool('webhooks')}>Manage Webhooks</Button>
            <Button size="sm" variant="secondary" onClick={() => openTool('logs')}>View Logs</Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2"><Code className="h-5 w-5 text-indigo-600" /></div>
            <h3 className="font-medium text-gray-900">API Access</h3>
          </div>
          <p className="mb-4 text-sm text-gray-500">Create and revoke keys, and review supported admin API routes.</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={() => openTool('apikeys')}>API Keys</Button>
            <Button size="sm" variant="secondary" onClick={() => openTool('docs')}>View Docs</Button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2"><Key className="h-5 w-5 text-indigo-600" /></div>
            <h3 className="font-medium text-gray-900">System Cache</h3>
          </div>
          <p className="mb-4 text-sm text-gray-500">Inspect cache entries and clear one or all entries.</p>
          <Button size="sm" variant="secondary" onClick={() => openTool('cache')}>Manage Cache</Button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2"><Bug className="h-5 w-5 text-indigo-600" /></div>
            <h3 className="font-medium text-gray-900">Diagnostics</h3>
          </div>
          <p className="mb-4 text-sm text-gray-500">Check service health, configure debug mode, and resolve real error logs.</p>
          <Button size="sm" variant="secondary" onClick={() => openTool('diagnostics')}>Open Diagnostics</Button>
        </div>

        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 md:col-span-2">
          <div className="flex items-start gap-3">
            <Activity className="mt-0.5 h-5 w-5 text-gray-500" />
            <div>
              <h3 className="font-medium text-gray-900">Background jobs</h3>
              <p className="mt-1 text-sm text-gray-600">Queue monitoring is not connected to a backend queue API yet, so no job counts or statuses are shown here.</p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={!!activeTool} onClose={closeTool} title={modalTitles[activeTool]} size="xl">
        {renderToolContent()}
      </Modal>
    </div>
  );
}
