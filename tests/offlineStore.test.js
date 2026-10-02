import test from 'node:test';
import assert from 'node:assert/strict';
import { cacheData, cachedRequest, enqueueMutation, getOfflineCounts, getQueue, readCachedData } from '../src/utils/offlineStore.js';

class MemoryStorage {
  values = new Map();
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
}

globalThis.localStorage = new MemoryStorage();
localStorage.setItem('user', JSON.stringify({ id: 'teacher-1', schoolId: 'school-1' }));

test('cached requests serve the most recent successful data during network failure', async () => {
  const params = { classId: 'class-1', date: '2026-10-02' };
  assert.deepEqual(await cachedRequest('attendance', params, async () => [{ studentId: 'student-1', status: 'PRESENT' }]), [
    { studentId: 'student-1', status: 'PRESENT' },
  ]);
  assert.deepEqual(await cachedRequest('attendance', params, async () => { throw new Error('offline'); }), [
    { studentId: 'student-1', status: 'PRESENT' },
  ]);
});

test('offline mutations coalesce by entity and remain scoped to the signed-in user', () => {
  const first = enqueueMutation({ dedupeKey: 'score:student:subject:term', method: 'post', url: '/scores', data: { ca1: 8 } });
  const second = enqueueMutation({ dedupeKey: 'score:student:subject:term', method: 'post', url: '/scores', data: { examScore: 74 } });
  assert.equal(first.id, second.id);
  assert.equal(getQueue().length, 1);
  assert.deepEqual(getQueue()[0].data, { ca1: 8, examScore: 74 });
  assert.deepEqual(getOfflineCounts(), { pending: 1, failed: 0 });

  localStorage.setItem('user', JSON.stringify({ id: 'teacher-2', schoolId: 'school-1' }));
  assert.equal(getQueue().length, 0);
  assert.equal(readCachedData('attendance', { classId: 'class-1', date: '2026-10-02' }), null);
});
