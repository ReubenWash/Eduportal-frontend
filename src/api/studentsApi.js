import api from './axios';

// Mock data for offline/development fallback
const MOCK_STUDENTS = [
  { id: 'stu1', name: 'Ama Mensah', studentNo: 'STU/001', classId: 'c1', className: 'JHS1 A', gender: 'FEMALE', dob: '2008-05-12', status: 'ACTIVE', photo: '', guardian: { name: 'Jane Doe', email: 'jane@example.com', phone: '0244000000' } },
  { id: 'stu2', name: 'Kofi Boateng', studentNo: 'STU/002', classId: 'c1', className: 'JHS1 A', gender: 'MALE', dob: '2009-01-20', status: 'ACTIVE', photo: '' },
  { id: 'stu3', name: 'Akua Sarpong', studentNo: 'STU/003', classId: 'c1', className: 'JHS1 A', gender: 'FEMALE', dob: '2008-11-15', status: 'ACTIVE', photo: '' },
  { id: 'stu4', name: 'Kwame Asante', studentNo: 'STU/004', classId: 'c2', className: 'JHS2 B', gender: 'MALE', dob: '2007-03-08', status: 'ACTIVE', photo: '' },
  { id: 'stu5', name: 'Abena Osei', studentNo: 'STU/005', classId: 'c2', className: 'JHS2 B', gender: 'FEMALE', dob: '2007-07-22', status: 'ACTIVE', photo: '' },
];

export const getStudents = async (params) => {
  try { const res = await api.get('/students', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_STUDENTS), 300)); }
};
export const createStudent = async (data) => {
  try { const res = await api.post('/students', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'stu_' + Date.now() }), 300)); }
};
export const updateStudent = async (id, data) => {
  try { const res = await api.patch(`/students/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};
export const deleteStudent = async (id) => {
  try { const res = await api.delete(`/students/${id}`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};
export const bulkImportStudents = async (formData) => {
  try { const res = await api.post('/students/bulk-import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true, imported: 0 }), 300)); }
};
export const transferStudent = async (id, data) => {
  try { const res = await api.post(`/students/${id}/transfer`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};