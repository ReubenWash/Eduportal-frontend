import { registerDeviceToken, removeDeviceToken } from '../api/notificationsApi';

const FIREBASE_SDK_VERSION = '10.14.1';
let firebaseSdkPromise;

const firebaseConfig = Object.fromEntries(Object.entries({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}).filter(([, value]) => value));

const isConfigured = () => ['apiKey', 'projectId', 'messagingSenderId', 'appId']
  .every((key) => Boolean(firebaseConfig[key]))
  && Boolean(import.meta.env.VITE_FIREBASE_VAPID_KEY);

const loadFirebaseSdk = () => {
  if (firebaseSdkPromise) return firebaseSdkPromise;
  firebaseSdkPromise = (async () => {
    const scripts = [
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-app-compat.js`,
      `https://www.gstatic.com/firebasejs/${FIREBASE_SDK_VERSION}/firebase-messaging-compat.js`,
    ];
    for (const src of scripts) {
      if (src.endsWith('firebase-app-compat.js') && window.firebase?.initializeApp) continue;
      if (src.endsWith('firebase-messaging-compat.js') && window.firebase?.messaging) continue;
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = resolve;
        script.onerror = () => reject(new Error('Firebase SDK could not be loaded.'));
        document.head.appendChild(script);
      });
    }
    if (!window.firebase?.messaging) throw new Error('Firebase Messaging SDK is unavailable.');
    return window.firebase;
  })().catch((error) => {
    firebaseSdkPromise = undefined;
    throw error;
  });
  return firebaseSdkPromise;
};

const getMessagingInstance = async () => {
  if (!isConfigured()) {
    throw new Error('Push notifications are not configured for this app.');
  }
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    throw new Error('This browser does not support web push notifications.');
  }
  const firebase = await loadFirebaseSdk();
  if (!await firebase.messaging.isSupported()) {
    throw new Error('Firebase push notifications are not supported in this browser.');
  }

  const app = firebase.apps.find((firebaseApp) => firebaseApp.name === 'goreb-messaging')
    || firebase.initializeApp(firebaseConfig, 'goreb-messaging');
  return firebase.messaging(app);
};

const getMessagingServiceWorker = async () => {
  const workerUrl = new URL('/fcm/firebase-messaging-sw.js', window.location.origin);
  workerUrl.searchParams.set('config', JSON.stringify(firebaseConfig));
  const registration = await navigator.serviceWorker.register(workerUrl.toString(), { scope: '/fcm/' });
  const worker = registration.installing || registration.waiting;

  if (!registration.active && worker) {
    await new Promise((resolve, reject) => {
      const handleStateChange = () => {
        if (worker.state === 'activated') resolve();
        if (worker.state === 'redundant') reject(new Error('Firebase notification service worker failed to install.'));
      };
      worker.addEventListener('statechange', handleStateChange);
      handleStateChange();
    });
  }
  if (!registration.active) {
    throw new Error('Firebase notification service worker is not active.');
  }
  return registration;
};

export const isPushConfigured = isConfigured;

export const enablePushNotifications = async () => {
  if (!isConfigured()) {
    throw new Error('Push notifications are not configured for this app.');
  }
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    throw new Error(permission === 'denied'
      ? 'Notifications are blocked in browser settings.'
      : 'Notification permission was not granted.');
  }

  const [messaging, serviceWorkerRegistration] = await Promise.all([
    getMessagingInstance(),
    getMessagingServiceWorker(),
  ]);
  const token = await messaging.getToken({
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });
  if (!token) throw new Error('Firebase did not return a device token.');

  await registerDeviceToken(token, 'web');
  localStorage.setItem('fcmDeviceToken', token);
  localStorage.removeItem('fcmPushDisabled');
  return { messaging, token };
};

export const syncGrantedPushToken = async () => {
  if (!isConfigured() || !('Notification' in window) || Notification.permission !== 'granted'
    || localStorage.getItem('fcmPushDisabled') === 'true') {
    return null;
  }
  const messaging = await getMessagingInstance();
  const serviceWorkerRegistration = await getMessagingServiceWorker();
  const token = await messaging.getToken({
    vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration,
  });
  if (token) {
    await registerDeviceToken(token, 'web');
    localStorage.setItem('fcmDeviceToken', token);
  }
  return messaging;
};

export const disablePushNotifications = async (messaging, { forgetPreference = true } = {}) => {
  const registeredToken = localStorage.getItem('fcmDeviceToken');
  if (registeredToken) {
    await removeDeviceToken(registeredToken);
    localStorage.removeItem('fcmDeviceToken');
  }
  if (forgetPreference) localStorage.setItem('fcmPushDisabled', 'true');
  else localStorage.removeItem('fcmPushDisabled');
  if (!messaging) {
    const firebase = await loadFirebaseSdk();
    const app = firebase.apps.find((firebaseApp) => firebaseApp.name === 'goreb-messaging');
    if (!app) return;
    messaging = firebase.messaging(app);
  }
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    const token = await messaging.getToken({
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: await getMessagingServiceWorker(),
    });
    if (token && token !== registeredToken) await removeDeviceToken(token);
    if (token) localStorage.removeItem('fcmDeviceToken');
  }
  await messaging.deleteToken();
};

export const subscribeToForegroundMessages = async (handler) => {
  if (localStorage.getItem('fcmPushDisabled') === 'true') return () => {};
  const messaging = await syncGrantedPushToken();
  if (!messaging) return () => {};
  return messaging.onMessage(handler);
};
