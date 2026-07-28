import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { useSocket } from '../../context/SocketContext';
import { getNotifications, markNotificationRead } from '../../api/notificationsApi';
import { Bell, BellOff, CheckCheck, AlertCircle, Info, CheckCircle2, XCircle } from 'lucide-react';

const typeConfig = {
  success: { iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', icon: CheckCircle2 },
  warning: { iconBg: 'bg-amber-100', iconColor: 'text-amber-600', icon: AlertCircle },
  info: { iconBg: 'bg-blue-100', iconColor: 'text-blue-600', icon: Info },
  error: { iconBg: 'bg-red-100', iconColor: 'text-red-600', icon: XCircle },
};

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const { addToast } = useToast();
  const { unreadCount, setUnreadCount, markAsRead: socketMarkAsRead, markAllAsRead } = useSocket();

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
      setLoadError(false);
    } catch (err) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications via Socket.IO
    const handleNewNotification = (event) => {
      const notification = event.detail;
      setNotifications(prev => [notification, ...prev]);
      if (setUnreadCount) {
        setUnreadCount(prev => (prev || 0) + 1);
      }
    };

    window.addEventListener('new-notification', handleNewNotification);

    return () => {
      window.removeEventListener('new-notification', handleNewNotification);
    };
  }, []);

  const handleMarkAsRead = async (id) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    
    // Update unread count via Socket
    if (socketMarkAsRead) {
      socketMarkAsRead(id);
    }
    
    // Also call API
    try {
      await markNotificationRead(id);
    } catch (err) {
      // Revert on error
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    
    // Optimistic update
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    
    // Update unread count via Socket
    if (markAllAsRead) {
      markAllAsRead();
    }
    
    addToast('All notifications marked as read', 'success');
    
    // Also call API
    try {
      await Promise.all(unreadIds.map(id => markNotificationRead(id)));
    } catch (err) {
      // Revert on error - refetch
      fetchNotifications();
    }
  };

  // Use Socket unread count if available, otherwise calculate locally
  const unread = unreadCount !== undefined ? unreadCount : notifications.filter(n => !n.read).length;

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
            <Button variant="secondary" size="sm" icon={CheckCheck} onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )
        }
      />

      {loadError && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 mb-5">
          Couldn't reach the server to load notifications. Check the console for details.
        </div>
      )}

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
          <div className="divide-y divide-gray-100">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.info;
              const Icon = cfg.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n.id)}
                  className={`flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors group ${!n.read ? 'bg-indigo-50/30' : ''}`}
                >
                  <div className={`flex-shrink-0 mt-0.5 h-10 w-10 rounded-full ${cfg.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${cfg.iconColor}`} />
                  </div>

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
                    <p className="text-xs text-gray-400 mt-1.5">{timeAgo(n.createdAt)}</p>
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