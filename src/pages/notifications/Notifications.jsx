import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { getNotifications } from '../../api/notificationsApi';
import { Bell, BellOff, CheckCheck, GraduationCap, Users, BarChart2, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, type: 'success', icon: GraduationCap, title: 'New student admitted', message: 'John Doe has been successfully admitted to JHS1 A.', time: '2 hours ago', read: false },
  { id: 2, type: 'warning', icon: AlertCircle, title: 'Low attendance alert', message: 'JHS3 A class attendance dropped to 68% this week — below the 75% threshold.', time: '4 hours ago', read: false },
  { id: 3, type: 'info', icon: BarChart2, title: 'Scores submitted', message: 'Mr. Kofi Adu submitted Mathematics scores for JHS2 B.', time: '6 hours ago', read: false },
  { id: 4, type: 'success', icon: CheckCircle2, title: 'Reports approved', message: 'Term 1 reports for SS2 A have been approved and are ready for release.', time: '1 day ago', read: true },
  { id: 5, type: 'info', icon: Users, title: 'New staff member added', message: 'Mrs. Abena Mensah has been added as a Subject Teacher.', time: '2 days ago', read: true },
  { id: 6, type: 'warning', icon: AlertCircle, title: 'Term ending soon', message: 'Term 1 ends in 12 days. Ensure all reports are submitted and approved before then.', time: '3 days ago', read: true },
  { id: 7, type: 'info', icon: Info, title: 'System maintenance', message: 'Scheduled maintenance on 25 Jun 2025 from 2:00 AM – 4:00 AM. The portal will be unavailable.', time: '5 days ago', read: true },
];

const typeConfig = {
  success: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', border: 'border-emerald-200' },
  warning: { bg: 'bg-amber-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', border: 'border-amber-200' },
  info: { bg: 'bg-blue-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', border: 'border-blue-200' },
  error: { bg: 'bg-red-50', iconBg: 'bg-red-100', iconColor: 'text-red-600', border: 'border-red-200' },
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    addToast('All notifications marked as read', 'success');
  };

  const unread = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div>
        <PageHeader title="Notifications" subtitle="Recent alerts and updates" />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-start gap-4 p-5 animate-pulse">
              <div className="h-10 w-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `You have ${unread} unread notification${unread !== 1 ? 's' : ''}` : 'All caught up'}
        action={
          unread > 0 && (
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={markAllRead}>
              Mark all read
            </Button>
          )
        }
      />

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="h-14 w-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BellOff className="h-7 w-7 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No notifications</h3>
          <p className="text-sm text-gray-500">You're all caught up. Check back later for updates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-3 border-b border-gray-200">
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 text-white">All</button>
            <button className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">Unread ({unread})</button>
          </div>

          <div className="divide-y divide-gray-100">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              return (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                >
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 h-10 w-10 rounded-full ${cfg.iconBg} flex items-center justify-center`}>
                    <n.icon className={`h-5 w-5 ${cfg.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-tight ${n.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="flex-shrink-0 h-2 w-2 rounded-full bg-indigo-600 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1.5">{n.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}