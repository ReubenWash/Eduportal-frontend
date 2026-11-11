import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isPushConfigured, subscribeToForegroundMessages } from './messaging';

export default function FcmRuntime() {
  const { accessToken, user } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    let active = true;
    let unsubscribe;

    const connect = async () => {
      if (!accessToken || !user || !isPushConfigured()
        || typeof Notification === 'undefined' || Notification.permission !== 'granted') {
        return;
      }

      try {
        const stopListening = await subscribeToForegroundMessages((payload) => {
          const title = payload.notification?.title || 'Goreb notification';
          const body = payload.notification?.body || payload.data?.body;
          if (body && active) addToast(`${title}: ${body}`, 'info');
        });
        if (active) unsubscribe = stopListening;
        else stopListening();
      } catch (error) {
        console.warn('Firebase push setup failed:', error.message);
      }
    };

    const reconnect = (event) => {
      unsubscribe?.();
      unsubscribe = undefined;
      if (event.detail?.enabled) connect();
    };

    connect();
    window.addEventListener('goreb-fcm-permission-changed', reconnect);
    return () => {
      active = false;
      unsubscribe?.();
      window.removeEventListener('goreb-fcm-permission-changed', reconnect);
    };
  }, [accessToken, user?.id, addToast]);

  return null;
}
