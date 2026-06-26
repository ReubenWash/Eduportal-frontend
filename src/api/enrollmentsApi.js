import api from './axios';

// Mock data for offline/development fallback
const MOCK_ENROLLMENTS = [
  { id: 'e1', studentId: 'stu1', studentName: 'Ama Mensah', classId: 'c1', className: 'JHS1 A', termName: 'Term 1, 2025', status: 'ACTIVE', enrollmentDate: '2024-09-01' },
  { id: 'e2', studentId: 'stu2', studentName: 'Kofi Boateng', classId: 'c1', className: 'JHS1 A', termName: 'Term 1, 2025', status: 'ACTIVE', enrollmentDate: '2024-09-01' },
  { id: 'e3', studentId: 'stu3', studentName: 'Akua Sarpong', classId: 'c1', className: 'JHS1 A', termName: 'Term 1, 2025', status: 'ACTIVE', enrollmentDate: '2024-09-05' },
  { id: 'e4', studentId: 'stu4', studentName: 'Kwame Asante', classId: 'c2', className: 'JHS2 B', termName: 'Term 1, 2025', status: 'ACTIVE', enrollmentDate: '2024-09-01' },
  { id: 'e5', studentId: 'stu5', studentName: 'Abena Osei', classId: 'c2', className: 'JHS2 B', termName: 'Term 1, 2025', status: 'ACTIVE', enrollmentDate: '2024-09-02' },
];

export const getEnrollments = async (params) => {
  try { const res = await api.get('/enrollments', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_ENROLLMENTS), 300)); }
};
export const createEnrollment = async (data) => {
  try { const res = await api.post('/enrollments', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'e_' + Date.now(), status: 'ACTIVE', enrollmentDate: new Date().toISOString() }), 300)); }
};
export const bulkEnroll = async (data) => {
  try { const res = await api.post('/enrollments/bulk', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true, enrolled: 0 }), 300)); }
};
export const deleteEnrollment = async (id) => {
  try { const res = await api.delete(`/enrollments/${id}`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};