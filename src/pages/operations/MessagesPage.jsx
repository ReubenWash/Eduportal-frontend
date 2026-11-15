import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Search, Send, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { getSchoolAnnouncements } from '../../api/schoolOperationsApi';
import { broadcastNotification } from '../../api/notificationsApi';

const EMPTY_FORM = { title: '', message: '', audience: 'ALL' };

export default function MessagesPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [sending, setSending] = useState(false);
  const { addToast } = useToast();

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setAnnouncements(await getSchoolAnnouncements());
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load school announcements.';
      setLoadError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadAnnouncements(); }, [loadAnnouncements]);

  const filteredAnnouncements = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return announcements;
    return announcements.filter((announcement) =>
      [announcement.title, announcement.body, announcement.audience]
        .some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [announcements, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const result = await broadcastNotification({
        ...form,
        type: 'info',
        channels: { inApp: true, push: true },
      });
      setFormOpen(false);
      setForm(EMPTY_FORM);
      addToast(`Announcement sent to ${result?.sent || 0} school account(s).`, 'success');
      await loadAnnouncements();
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to send announcement.', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="School Announcements" subtitle="Send in-app announcements and view the school's saved broadcast history." />
        <Button variant="primary" className="gap-2" onClick={() => setFormOpen(true)}>
          <Send className="h-4 w-4" /> Compose Announcement
        </Button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search announcements..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Compose Announcement</h2>
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <Input required maxLength={160} placeholder="Announcement title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          <textarea
            required
            maxLength={5000}
            rows={4}
            placeholder="Write the announcement..."
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-sm font-medium text-gray-700">
              Audience
              <select className="ml-3 rounded-lg border border-gray-300 bg-white px-3 py-2" value={form.audience} onChange={(event) => setForm({ ...form, audience: event.target.value })}>
                <option value="ALL">All school users</option>
                <option value="TEACHERS">Teachers</option>
                <option value="PARENTS">Parents & guardians</option>
                <option value="STUDENTS">Students</option>
              </select>
            </label>
            <Button type="submit" variant="primary" disabled={sending}>{sending ? 'Sending...' : 'Send Announcement'}</Button>
          </div>
          <p className="text-xs text-gray-500">The backend creates an in-app notification for each matching active account. Push delivery depends on registered devices.</p>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Audience</th>
              <th className="px-4 py-3 text-left">Announcement</th>
              <th className="px-4 py-3 text-left">Sent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={3}>Loading announcements...</td></tr>
            ) : loadError ? (
              <tr><td className="px-4 py-10 text-center text-red-600" colSpan={3}>{loadError}</td></tr>
            ) : filteredAnnouncements.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-gray-500" colSpan={3}>
                  <Bell className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  {announcements.length ? 'No announcements match your search.' : 'No school announcements have been sent.'}
                </td>
              </tr>
            ) : filteredAnnouncements.map((announcement) => (
              <tr key={announcement.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3"><Badge variant="info">{announcement.audience}</Badge></td>
                <td className="max-w-2xl px-4 py-3">
                  <p className="font-semibold text-gray-900">{announcement.title}</p>
                  <p className="mt-1 whitespace-pre-wrap text-xs text-gray-600">{announcement.body}</p>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">{new Date(announcement.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
