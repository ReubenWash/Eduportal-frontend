const STORAGE_PREFIX = 'eduportal:offline:v1';

const currentScope = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    return `${user?.schoolId || 'no-school'}:${user?.id || 'anonymous'}`;
  } catch {
    return 'no-school:anonymous';
  }
};

const storageKey = (kind, suffix = '') => `${STORAGE_PREFIX}:${currentScope()}:${kind}:${suffix}`;
const readJson = (key, fallback) => {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
};
const writeJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};
const stableParams = (params = {}) => JSON.stringify(Object.keys(params).sort().reduce((result, key) => {
  if (params[key] !== undefined) result[key] = params[key];
  return result;
}, {}));

export const cacheData = (name, params, value) => writeJson(storageKey('cache', `${name}:${stableParams(params)}`), value);
export const readCachedData = (name, params) => readJson(storageKey('cache', `${name}:${stableParams(params)}`), null);

export const cachedRequest = async (name, params, request) => {
  try {
    const value = await request();
    cacheData(name, params, value);
    return value;
  } catch (error) {
    const offline = typeof navigator !== 'undefined' && !navigator.onLine;
    const cached = (!error?.response || offline) ? readCachedData(name, params) : null;
    if (cached !== null) return cached;
    throw error;
  }
};

export const getQueue = () => readJson(storageKey('queue'), []);

export const saveQueue = (queue) => writeJson(storageKey('queue'), queue);

export const enqueueMutation = (mutation) => {
  const queue = getQueue();
  const index = queue.findIndex(item => item.dedupeKey === mutation.dedupeKey);
  const now = new Date().toISOString();
  let queued;

  if (index >= 0) {
    const previous = queue[index];
    queued = {
      ...previous,
      data: { ...previous.data, ...mutation.data },
      status: 'queued',
      error: null,
      updatedAt: now,
    };
    queue[index] = queued;
  } else {
    queued = {
      ...mutation,
      id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      status: 'queued',
      attempts: 0,
      createdAt: now,
      updatedAt: now,
      error: null,
    };
    queue.push(queued);
  }

  if (!saveQueue(queue)) throw new Error('This device could not store offline changes. Free up browser storage and try again.');
  return queued;
};

export const updateQueuedMutation = (id, updates) => {
  const queue = getQueue().map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item);
  saveQueue(queue);
  return queue;
};

export const removeQueuedMutation = (id) => {
  const queue = getQueue().filter(item => item.id !== id);
  saveQueue(queue);
  return queue;
};

export const getOfflineCounts = () => {
  const queue = getQueue();
  return {
    pending: queue.filter(item => item.status === 'queued').length,
    failed: queue.filter(item => item.status === 'failed').length,
  };
};

export const getCurrentScope = currentScope;
