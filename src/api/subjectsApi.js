import api from './axios';

// Mock data for offline/development fallback
const MOCK_SUBJECTS = [
  { id: 'sub1', name: 'Mathematics', code: 'MATH01', type: 'CORE', teachers: [{ id: 's1', name: 'Mr. Kofi Mensah' }] },
  { id: 'sub2', name: 'English Language', code: 'ENG01', type: 'CORE', teachers: [{ id: 's2', name: 'Ms. Ama Asante' }] },
  { id: 'sub3', name: 'Science', code: 'SCI01', type: 'CORE', teachers: [{ id: 's3', name: 'Mrs. Abena Mensah' }] },
  { id: 'sub4', name: 'Social Studies', code: 'SOS01', type: 'CORE', teachers: [{ id: 's4', name: 'Mr. Kwame Boateng' }] },
  { id: 'sub5', name: 'Information Technology', code: 'ICT01', type: 'ELECTIVE', teachers: [] },
  { id: 'sub6', name: 'French', code: 'FR01', type: 'ELECTIVE', teachers: [] },
];

export const getSubjects = async (params) => {
  try { const res = await api.get('/subjects', { params }); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve(MOCK_SUBJECTS), 300)); }
};
export const createSubject = async (data) => {
  try { const res = await api.post('/subjects', data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id: 'sub_' + Date.now(), teachers: [] }), 300)); }
};
export const updateSubject = async (id, data) => {
  try { const res = await api.patch(`/subjects/${id}`, data); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ ...data, id }), 300)); }
};
export const deleteSubject = async (id) => {
  try { const res = await api.delete(`/subjects/${id}`); return res.data; }
  catch { return new Promise(resolve => setTimeout(() => resolve({ success: true }), 300)); }
};