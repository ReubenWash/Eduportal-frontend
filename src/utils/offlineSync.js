import api from '../api/axios';
import {
  enqueueMutation,
  getOfflineCounts,
  getQueue,
  removeQueuedMutation,
  saveQueue,
  updateQueuedMutation,
} from './offlineStore';

const listeners = new Set();
let flushing = false;
let syncing = false;

const emitChange = () => listeners.forEach(listener => listener());

export const getOfflineStatus = () => ({
  online: typeof navigator === 'undefined' ? true : navigator.onLine,
  ...getOfflineCounts(),
  syncing,
});

export const subscribeOfflineStatus = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const isNetworkFailure = (error) => !error?.response && (
  typeof navigator === 'undefined'
  || !navigator.onLine
  || ['ERR_NETWORK', 'ECONNABORTED', 'ECONNREFUSED'].includes(error?.code)
);

export const queueOfflineMutation = (mutation) => {
  const item = enqueueMutation(mutation);
  emitChange();
  return { offlineQueued: true, queueId: item.id };
};

export const retryOfflineQueue = async () => {
  const queue = getQueue().map(item => item.status === 'failed' ? { ...item, status: 'queued', error: null } : item);
  saveQueue(queue);
  emitChange();
  return flushOfflineQueue();
};

export const flushOfflineQueue = async () => {
  if (flushing || typeof navigator !== 'undefined' && !navigator.onLine) return;
  flushing = true;
  syncing = true;
  emitChange();
  try {
    const queue = getQueue();
    for (const item of queue) {
      if (item.status !== 'queued') continue;
      try {
        await api.request({ method: item.method, url: item.url, data: item.data });
        removeQueuedMutation(item.id);
        emitChange();
      } catch (error) {
        const current = getQueue().find(entry => entry.id === item.id);
        if (isNetworkFailure(error)) break;
        if (current) updateQueuedMutation(item.id, {
          status: 'failed',
          attempts: (current.attempts || 0) + 1,
          error: error.response?.data?.message || error.message || 'Sync failed',
        });
        emitChange();
      }
    }
  } finally {
    syncing = false;
    flushing = false;
    emitChange();
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', flushOfflineQueue);
  window.addEventListener('storage', emitChange);
  if (navigator.onLine) flushOfflineQueue();
}
