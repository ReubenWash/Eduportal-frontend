import { useCallback, useEffect, useState } from 'react';
import { Eye, Search, Star, ThumbsDown, ThumbsUp } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  addSupportTicketMessage,
  closeSupportTicket,
  getSupportFeedback,
  getSupportTicket,
  getSupportTickets,
  markSupportFeedbackHelpful,
  resolveSupportTicket,
  updateSupportTicket,
} from '../../api/supportApi';

const TABS = ['tickets', 'feedback', 'announcements'];
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
const priorityVariant = { URGENT: 'danger', HIGH: 'danger', MEDIUM: 'warning', LOW: 'default' };
const statusVariant = { OPEN: 'warning', IN_PROGRESS: 'info', RESOLVED: 'success', CLOSED: 'default' };
const statusLabels = { OPEN: 'Open', IN_PROGRESS: 'In progress', RESOLVED: 'Resolved', CLOSED: 'Closed' };

const formatDate = (date) => date ? new Date(date).toLocaleString() : '—';
const getUserName = (user) => {
  const staff = user?.staff;
  return staff ? `${staff.firstName} ${staff.lastName}`.trim() : user?.email || 'Unknown user';
};

export default function AdminSupport() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('tickets');
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tickets, setTickets] = useState([]);
  const [ticketStats, setTicketStats] = useState({ open: 0, inProgress: 0, resolved: 0, closed: 0, urgent: 0, high: 0 });
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [internalNote, setInternalNote] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSupportTickets({
        page: 1,
        limit: 100,
        ...(statusFilter && { status: statusFilter }),
        ...(keyword.trim() && { search: keyword.trim() }),
      });
      setTickets(result?.data || []);
      setTicketStats(result?.stats || { open: 0, inProgress: 0, resolved: 0, closed: 0, urgent: 0, high: 0 });
      setLoadError('');
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load support tickets.');
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  const loadFeedback = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getSupportFeedback({ page: 1, limit: 50 });
      setFeedback(result?.data || []);
      setLoadError('');
    } catch (error) {
      setLoadError(error.response?.data?.message || 'Could not load school feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'tickets') loadTickets();
    if (activeTab === 'feedback') loadFeedback();
  }, [activeTab, loadTickets, loadFeedback]);

  const openTicket = async (id) => {
    setSelectedTicket(null);
    setTicketLoading(true);
    try {
      setSelectedTicket(await getSupportTicket(id));
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not load ticket details.', 'error');
    } finally {
      setTicketLoading(false);
    }
  };

  const refreshSelectedTicket = async () => {
    if (!selectedTicket) return;
    const refreshed = await getSupportTicket(selectedTicket.id);
    setSelectedTicket(refreshed);
  };

  const handleStatusChange = async (status) => {
    if (!selectedTicket) return;
    setSaving(true);
    try {
      if (status === 'RESOLVED') await resolveSupportTicket(selectedTicket.id);
      else if (status === 'CLOSED') await closeSupportTicket(selectedTicket.id);
      else await updateSupportTicket(selectedTicket.id, { status });
      await Promise.all([loadTickets(), refreshSelectedTicket()]);
      addToast(`Ticket marked ${statusLabels[status].toLowerCase()}.`, 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not update ticket status.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReply = async (event) => {
    event.preventDefault();
    if (!selectedTicket || !reply.trim() || !user?.id) return;
    setSaving(true);
    try {
      await addSupportTicketMessage(selectedTicket.id, {
        userId: user.id,
        message: reply.trim(),
        isInternal: internalNote,
      });
      setReply('');
      await Promise.all([loadTickets(), refreshSelectedTicket()]);
      addToast(internalNote ? 'Internal note added.' : 'Reply added to ticket.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not send ticket reply.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleFeedbackHelpful = async (id, helpful) => {
    try {
      const updated = await markSupportFeedbackHelpful(id, helpful);
      setFeedback((previous) => previous.map((item) => item.id === id ? { ...item, ...updated } : item));
    } catch (error) {
      addToast(error.response?.data?.message || 'Could not update feedback.', 'error');
    }
  };

  const stats = [
    { label: 'Open', count: ticketStats.open, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'In Progress', count: ticketStats.inProgress, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Resolved', count: ticketStats.resolved, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Closed', count: ticketStats.closed, color: 'text-gray-600', bg: 'bg-gray-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Support & Help Desk</h1>
        <p className="mt-1 text-sm text-gray-500">Manage live support tickets, school feedback, and platform announcements.</p>
      </div>

      <div className="flex w-fit gap-1 rounded-xl bg-gray-100 p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loadError && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{loadError}</div>
      )}

      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-xl border border-white p-3 text-center`}>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>

          {(ticketStats.urgent > 0 || ticketStats.high > 0) && (
            <p className="text-xs font-medium text-red-700">
              {ticketStats.urgent} urgent and {ticketStats.high} high-priority tickets need attention.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Search tickets..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
              aria-label="Filter tickets by status"
            >
              <option value="">All statuses</option>
              {STATUSES.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    {['Ticket', 'School', 'Priority', 'Status', 'Updated', ''].map((heading) => (
                      <th key={heading} className="whitespace-nowrap px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {!loading && tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-indigo-600">{ticket.ticketNumber}</p>
                        <p className="mt-0.5 text-sm font-medium text-gray-900">{ticket.subject}</p>
                        <p className="text-[11px] text-gray-400">{getUserName(ticket.user)}{ticket._count?.messages ? ` · ${ticket._count.messages} messages` : ''}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">{ticket.school?.name || 'Platform'}</td>
                      <td className="whitespace-nowrap px-5 py-4"><Badge variant={priorityVariant[ticket.priority]}>{ticket.priority}</Badge></td>
                      <td className="whitespace-nowrap px-5 py-4"><Badge variant={statusVariant[ticket.status]} dot>{statusLabels[ticket.status] || ticket.status}</Badge></td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-gray-400">{formatDate(ticket.updatedAt)}</td>
                      <td className="px-5 py-4">
                        <button onClick={() => openTicket(ticket.id)} className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600" aria-label={`View ${ticket.ticketNumber}`}>
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && tickets.length === 0 && (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-gray-500">No support tickets found.</td></tr>
                  )}
                  {loading && (
                    <tr><td colSpan="6" className="px-5 py-12 text-center text-sm text-gray-500">Loading tickets…</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <div className="space-y-4">
          {loading && <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">Loading feedback…</div>}
          {!loading && feedback.length === 0 && <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-sm text-gray-500">No school feedback has been submitted.</div>}
          {!loading && feedback.map((item) => (
            <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={item.school?.name || 'School'} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{item.school?.name || 'Unknown school'}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(item.createdAt)}{item.category ? ` · ${item.category}` : ''}</p>
                  </div>
                </div>
                <div className="flex shrink-0 gap-0.5" aria-label={`${item.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((star) => <Star key={star} className={`h-4 w-4 ${star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />)}
                </div>
              </div>
              <p className="text-sm leading-relaxed text-gray-700">{item.comment || 'No written comment.'}</p>
              <div className="mt-3 flex gap-4 border-t border-gray-100 pt-3">
                <button onClick={() => handleFeedbackHelpful(item.id, true)} className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-emerald-600">
                  <ThumbsUp className="h-3.5 w-3.5" /> Helpful ({item.helpfulCount || 0})
                </button>
                <button onClick={() => handleFeedbackHelpful(item.id, false)} className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-red-500">
                  <ThumbsDown className="h-3.5 w-3.5" /> Not helpful ({item.notHelpfulCount || 0})
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <p className="py-8 text-center text-sm text-gray-500">Use the Notifications Center to publish announcements to schools and users.</p>
        </div>
      )}

      {(ticketLoading || selectedTicket) && (
        <Modal
          isOpen={ticketLoading || Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          title={selectedTicket?.ticketNumber || 'Support ticket'}
          subtitle={selectedTicket?.school?.name || 'Platform support'}
          size="xl"
        >
          {ticketLoading && <p className="text-sm text-gray-500">Loading ticket…</p>}
          {selectedTicket && (
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTicket.subject}</h3>
                  <p className="mt-1 text-xs text-gray-500">{getUserName(selectedTicket.user)} · {selectedTicket.user?.email} · {formatDate(selectedTicket.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={priorityVariant[selectedTicket.priority]}>{selectedTicket.priority}</Badge>
                  <Badge variant={statusVariant[selectedTicket.status]} dot>{statusLabels[selectedTicket.status]}</Badge>
                </div>
              </div>
              <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">{selectedTicket.description}</p>

              <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
                {STATUSES.filter((status) => status !== selectedTicket.status).map((status) => (
                  <Button key={status} size="sm" variant="secondary" disabled={saving} onClick={() => handleStatusChange(status)}>
                    Mark {statusLabels[status].toLowerCase()}
                  </Button>
                ))}
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Conversation</h4>
                {selectedTicket.messages?.map((message) => (
                  <div key={message.id} className={`rounded-lg border p-3 ${message.isInternal ? 'border-amber-200 bg-amber-50' : 'border-gray-100 bg-white'}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-800">{getUserName(message.user)}{message.isInternal ? ' · Internal note' : ''}</p>
                      <p className="text-[11px] text-gray-400">{formatDate(message.createdAt)}</p>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">{message.message}</p>
                  </div>
                ))}
                {selectedTicket.messages?.length === 0 && <p className="text-sm text-gray-500">No replies yet.</p>}
              </div>

              {selectedTicket.status !== 'CLOSED' && (
                <form onSubmit={handleReply} className="space-y-3 border-t border-gray-100 pt-4">
                  <label className="block text-xs font-medium text-gray-700" htmlFor="support-reply">Reply</label>
                  <textarea id="support-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={3} required className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20" placeholder="Write a reply to the school..." />
                  <label className="flex items-center gap-2 text-xs text-gray-600">
                    <input type="checkbox" checked={internalNote} onChange={(event) => setInternalNote(event.target.checked)} />
                    Internal note (not visible to the school)
                  </label>
                  <div className="flex justify-end">
                    <Button type="submit" disabled={saving || !reply.trim()} loading={saving}>Send reply</Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
