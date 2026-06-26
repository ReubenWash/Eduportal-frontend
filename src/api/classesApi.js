import api from './axios';

// Mock data for offline/development fallback
const MOCK_CLASSES = [
  { id: 'c1', name: 'JHS1 A', academicYear: '2025', classTeacherId: 's1', classTeacher: { name: 'Mr. Kofi Mensah' }, _count: { enrollments: 25, subjects: 8 } },
  { id: 'c2', name: 'JHS2 B', academicYear: '2025', classTeacherId: 's4', classTeacher: { name: 'Mr. Kwame Boateng' }, _count: { enrollments: 22, subjects: 8 } },
  { id: 'c3', name: 'JHS3 A', academicYear: '2025', classTeacherId: null, classTeacher: null, _count: { enrollments: 20, subjects: 8 } },
];

export const getClasses = async (params) => {
  try { const res = await api.get('/classes', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_CLASSES), 300)); }
};
export const createClass = async (data) => {
  try { const res = await api.post('/classes', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'c_' + Date.now(), _count: { enrollments: 0, subjects: 0 } }), 300)); }
};
export const updateClass = async (id, data) => {
  try { const res = await api.patch(`/classes/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};
export const manageClassSubjects = async (id, data) => {
  try { const res = await api.post(`/classes/${id}/subjects`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};