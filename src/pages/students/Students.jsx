import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import FileUpload from '../../components/common/FileUpload';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../api/studentsApi';
import { getClasses } from '../../api/classesApi';
import api from '../../api/axios';
import { Search, UserPlus, FileDown, Eye, Edit2, Trash2, Loader2 } from 'lucide-react';

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' }
];

const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'GRADUATED', label: 'Graduated' },
  { value: 'TRANSFERRED', label: 'Transferred' },
  { value: 'WITHDRAWN', label: 'Withdrawn' }
];

const statusVariant = {
  ACTIVE: 'success',
  GRADUATED: 'info',
  TRANSFERRED: 'warning',
  WITHDRAWN: 'danger',
  REPEATED: 'default'
};

// ─── Photo Upload Function ───
const uploadPhoto = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', 'students');
  
  const res = await api.post('/upload/photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  if (res.data && res.data.data && res.data.data.url) {
    return res.data.data.url;
  }
  if (res.data && res.data.url) {
    return res.data.url;
  }
  throw new Error('Failed to get photo URL from response');
};

export default function Students() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canAdmitOrDelete = user?.role === 'SCHOOL_ADMIN' || user?.role === 'SUPER_ADMIN';
  const canEdit = canAdmitOrDelete || user?.role === 'CLASS_TEACHER';

  const [data, setData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(null);
  const [editing, setEditing] = useState(null);
  const [keyword, setKeyword] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [showTempPasswordModal, setShowTempPasswordModal] = useState(false);
  const [tempPasswordData, setTempPasswordData] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    otherNames: '',
    studentNumber: '',
    classId: '',
    gender: 'MALE',
    dateOfBirth: '',
    status: 'ACTIVE',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    relationship: 'Father'
  });
  const [preview, setPreview] = useState('');
  const [photoUrl, setPhotoUrl] = useState(null);
  const { addToast } = useToast();

  const load = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        getStudents(),
        getClasses()
      ]);
      setData(Array.isArray(studentsRes) ? studentsRes : []);
      setClasses(Array.isArray(classesRes) ? classesRes : []);
    } catch (error) {
      console.error('Error loading data:', error);
      addToast('Failed to load students', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const generateStudentNumber = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `STU/${year}/${random}`;
  };

  const filtered = useMemo(() => {
    return data.filter(s => {
      const nameMatch = !keyword ||
        (s.firstName || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (s.lastName || '').toLowerCase().includes(keyword.toLowerCase()) ||
        (s.studentNumber || '').toLowerCase().includes(keyword.toLowerCase());
      const classMatch = !classFilter || s.classId === classFilter;
      return nameMatch && classMatch;
    });
  }, [data, keyword, classFilter]);

  const openCreate = () => {
    setEditing(null);
    setFormErrors({});
    setForm({
      firstName: '',
      lastName: '',
      otherNames: '',
      studentNumber: generateStudentNumber(),
      classId: '',
      gender: 'MALE',
      dateOfBirth: '',
      status: 'ACTIVE',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      relationship: 'Father'
    });
    setPhotoUrl(null);
    setPreview('');
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setFormErrors({});
    setForm({
      firstName: row.firstName || '',
      lastName: row.lastName || '',
      otherNames: row.otherNames || '',
      studentNumber: row.studentNumber || '',
      classId: row.classId || '',
      gender: row.gender || 'MALE',
      dateOfBirth: row.dateOfBirth ? new Date(row.dateOfBirth).toISOString().split('T')[0] : '',
      status: row.status || 'ACTIVE',
      guardianName: row.guardianName || '',
      guardianPhone: row.guardianPhone || '',
      guardianEmail: row.guardianEmail || '',
      relationship: row.relationship || 'Father'
    });
    setPhotoUrl(null);
    setPreview(row.photoUrl || '');
    setDrawerOpen(true);
  };

  const handleFile = async (file) => {
    if (!file) return;
    
    setPreview(URL.createObjectURL(file));
    setUploadingPhoto(true);
    
    try {
      const url = await uploadPhoto(file);
      setPhotoUrl(url);
      setPreview(url);
      addToast('Photo uploaded successfully', 'success');
    } catch (error) {
      console.error('Photo upload error:', error);
      addToast('Failed to upload photo', 'error');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    let hasError = false;
    
    if (!form.firstName || !form.firstName.trim()) {
      errors.firstName = 'First name is required';
      hasError = true;
    }
    if (!form.lastName || !form.lastName.trim()) {
      errors.lastName = 'Last name is required';
      hasError = true;
    }
    if (!form.gender) {
      errors.gender = 'Gender is required';
      hasError = true;
    }
    if (!form.dateOfBirth) {
      errors.dateOfBirth = 'Date of birth is required';
      hasError = true;
    }
    if (!form.studentNumber || !form.studentNumber.trim()) {
      errors.studentNumber = 'Student number is required';
      hasError = true;
    }
    if (!form.classId) {
      errors.classId = 'Class is required';
      hasError = true;
    }
    
    setFormErrors(errors);
    return !hasError;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    console.log('=== FORM DATA ===');
    console.log('firstName:', form.firstName);
    console.log('lastName:', form.lastName);
    console.log('gender:', form.gender);
    console.log('dateOfBirth:', form.dateOfBirth);
    console.log('studentNumber:', form.studentNumber);
    console.log('classId:', form.classId);
    console.log('photoUrl:', photoUrl);
    console.log('isEditing:', !!editing);
    
    if (!validateForm()) {
      addToast('Please fix the validation errors', 'error');
      Object.values(formErrors).forEach(msg => addToast(msg, 'error'));
      return;
    }

    setSaving(true);

    try {
      // Build the payload
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        otherNames: form.otherNames?.trim() || null,
        gender: form.gender,
        dateOfBirth: new Date(form.dateOfBirth).toISOString(),
        studentNumber: form.studentNumber.trim(),
        status: form.status || 'ACTIVE',
        guardianName: form.guardianName?.trim() || null,
        guardianPhone: form.guardianPhone?.trim() || null,
        guardianEmail: form.guardianEmail?.trim() || null,
        relationship: form.relationship || null,
        photoUrl: photoUrl || null
      };

      // Only include classId if it's changed or it's a new student
      if (!editing || (editing && form.classId !== editing.classId)) {
        payload.classId = form.classId;
        console.log('Class ID included in payload:', payload.classId);
      }

      console.log('=== PAYLOAD SENT TO BACKEND ===');
      console.log(JSON.stringify(payload, null, 2));

      let response;
      if (editing) {
        response = await updateStudent(editing.id, payload);
        addToast('Student updated successfully', 'success');
      } else {
        response = await createStudent(payload);
        
        // ─── Show temporary password modal ───
        if (response?.tempPassword) {
          setTempPasswordData({
            password: response.tempPassword,
            studentNumber: response.studentNumber || form.studentNumber,
            studentName: `${form.firstName} ${form.lastName}`
          });
          setShowTempPasswordModal(true);
        }
        
        addToast('Student admitted successfully!', 'success');
      }
      
      console.log('Response from server:', response);
      
      setDrawerOpen(false);
      await load();
    } catch (error) {
      console.error('Error saving student:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        backendErrors.forEach(err => {
          addToast(`${err.param || 'Field'}: ${err.msg || err.message}`, 'error');
        });
        
        const fieldErrors = {};
        backendErrors.forEach(e => {
          if (e.param) {
            fieldErrors[e.param] = e.msg || e.message;
          }
        });
        setFormErrors(fieldErrors);
      } else {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to save student';
        addToast(errorMsg, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteStudent(deleteDialog.id);
      addToast('Student removed from system', 'success');
      setDeleteDialog(null);
      await load();
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete student', 'error');
    }
  };

  const getFullName = (student) => {
    if (!student) return 'Unknown';
    return `${student.firstName || ''} ${student.lastName || ''}`.trim();
  };

  const getClassLabel = (classId) => {
    const cls = classes.find(c => c.id === classId);
    return cls ? `${cls.level} ${cls.section}` : 'Not Assigned';
  };

  const columns = [
    {
      header: 'Student',
      key: 'name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <Avatar src={row.photoUrl} name={getFullName(row)} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
              {getFullName(row)}
            </p>
            <p className="text-[11px] text-gray-500">{row.studentNumber}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Class', 
      key: 'classId', 
      render: (v) => <span className="text-gray-600">{getClassLabel(v)}</span> 
    },
    { 
      header: 'Gender', 
      key: 'gender', 
      render: (v) => <span className="text-gray-600 capitalize">{v?.toLowerCase()}</span> 
    },
    { 
      header: 'Status', 
      key: 'status', 
      render: (v) => <Badge variant={statusVariant[v] || 'default'} dot>{v}</Badge> 
    },
  ];

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle="Manage student records, enrollments, and profiles"
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={FileDown} className="hidden sm:flex">Export</Button>
            {canAdmitOrDelete && <Button onClick={openCreate} icon={UserPlus}>Admit Student</Button>}
          </div>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            className="w-full sm:w-48"
            options={classes.map(c => ({ value: c.id, label: `${c.level} ${c.section}` }))}
            value={classFilter}
            onChange={e => setClassFilter(e.target.value)}
            placeholder="All Classes"
          />
          <div className="sm:ml-auto text-sm text-gray-500 font-medium">
            {filtered.length} student{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Data Table */}
        <Table
          loading={loading}
          data={filtered}
          columns={columns}
          onRowClick={(row) => navigate(`/students/${row.id}`)}
          emptyMessage="No students found"
          rowActions={(row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/students/${row.id}`); }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                title="View Profile"
              >
                <Eye className="h-4 w-4" />
              </button>
              {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); openEdit(row); }}
                  className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                  title="Edit Student"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
              {canAdmitOrDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteDialog(row); }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete Student"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        />
      </div>

      {/* SlideOver Form */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editing ? 'Edit Student Details' : 'Admit New Student'}
        subtitle={editing ? `Updating record for ${getFullName(editing)}` : 'Enter the details of the new student below.'}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <FileUpload 
            label="Passport Photo" 
            onFileSelect={handleFile} 
            preview={preview} 
            accept="image/*"
            uploading={uploadingPhoto}
          />

          <div className="space-y-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  label="First Name *" 
                  value={form.firstName} 
                  onChange={e => setForm({ ...form, firstName: e.target.value })} 
                  required 
                  placeholder="e.g. Ama"
                  error={formErrors.firstName}
                />
              </div>
              <div>
                <Input 
                  label="Last Name *" 
                  value={form.lastName} 
                  onChange={e => setForm({ ...form, lastName: e.target.value })} 
                  required 
                  placeholder="e.g. Mensah"
                  error={formErrors.lastName}
                />
              </div>
            </div>
            <Input 
              label="Other Names" 
              value={form.otherNames} 
              onChange={e => setForm({ ...form, otherNames: e.target.value })} 
              placeholder="e.g. Akua" 
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input 
                  label="Student Number *" 
                  value={form.studentNumber} 
                  onChange={e => setForm({ ...form, studentNumber: e.target.value })} 
                  required 
                  placeholder="STU/2024/0001"
                  error={formErrors.studentNumber}
                />
              </div>
              <div>
                <Select 
                  label="Gender *" 
                  value={form.gender} 
                  onChange={e => setForm({ ...form, gender: e.target.value })} 
                  options={GENDER_OPTIONS} 
                  required 
                  error={formErrors.gender}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Select 
                  label="Class *" 
                  value={form.classId} 
                  onChange={e => setForm({ ...form, classId: e.target.value })} 
                  options={classes.map(c => ({ value: c.id, label: `${c.level} ${c.section}` }))} 
                  required 
                  placeholder="Select class..."
                  error={formErrors.classId}
                />
              </div>
              <div>
                <Input 
                  label="Date of Birth *" 
                  type="date" 
                  value={form.dateOfBirth} 
                  onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} 
                  required 
                  error={formErrors.dateOfBirth}
                />
              </div>
            </div>

            {editing && canAdmitOrDelete && (
              <Select
                label="Status"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
                options={STATUS_OPTIONS}
              />
            )}

            {/* Guardian Information */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">Guardian Information (Optional)</p>
              <div className="space-y-4">
                <Input 
                  label="Guardian Name" 
                  value={form.guardianName} 
                  onChange={e => setForm({ ...form, guardianName: e.target.value })} 
                  placeholder="e.g. Kwame Mensah" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Guardian Phone" 
                    value={form.guardianPhone} 
                    onChange={e => setForm({ ...form, guardianPhone: e.target.value })} 
                    placeholder="+233 24 000 0000" 
                  />
                  <Input 
                    label="Guardian Email" 
                    type="email" 
                    value={form.guardianEmail} 
                    onChange={e => setForm({ ...form, guardianEmail: e.target.value })} 
                    placeholder="guardian@email.com" 
                  />
                </div>
                <Select
                  label="Relationship"
                  value={form.relationship}
                  onChange={e => setForm({ ...form, relationship: e.target.value })}
                  options={[
                    { value: 'Father', label: 'Father' },
                    { value: 'Mother', label: 'Mother' },
                    { value: 'Guardian', label: 'Guardian' },
                    { value: 'Uncle', label: 'Uncle' },
                    { value: 'Aunt', label: 'Aunt' },
                    { value: 'Other', label: 'Other' }
                  ]}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-gray-100 flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || uploadingPhoto}>
              {saving || uploadingPhoto ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {saving ? 'Saving...' : uploadingPhoto ? 'Uploading Photo...' : editing ? 'Save Changes' : 'Admit Student'}
            </Button>
          </div>
        </form>
      </SlideOver>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteDialog}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialog(null)}
        title="Remove Student"
        message={`Are you sure you want to completely remove ${getFullName(deleteDialog)} from the system? This action cannot be undone.`}
        confirmText="Remove Student"
        isDanger={true}
      />

      {/* Temporary Password Modal */}
      {showTempPasswordModal && tempPasswordData && (
        <Modal
          isOpen={showTempPasswordModal}
          onClose={() => setShowTempPasswordModal(false)}
          title="🎓 Student Account Created"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-3">
                Student account created successfully! Please share these credentials:
              </p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {tempPasswordData.studentName}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">Student Number (Username)</p>
                  <p className="text-sm font-mono font-bold text-gray-900">
                    {tempPasswordData.studentNumber}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">Temporary Password</p>
                  <p className="text-sm font-mono font-bold text-indigo-600">
                    {tempPasswordData.password}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  ⚠️ Student must change password on first login.
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Login URL: <span className="font-mono">{window.location.origin}/login</span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowTempPasswordModal(false);
                  // Copy credentials to clipboard
                  const credentials = `Student: ${tempPasswordData.studentName}\nStudent Number: ${tempPasswordData.studentNumber}\nTemporary Password: ${tempPasswordData.password}`;
                  navigator.clipboard?.writeText(credentials).catch(() => {});
                }}
                variant="secondary"
                className="flex-1"
              >
                📋 Copy Credentials
              </Button>
              <Button 
                onClick={() => setShowTempPasswordModal(false)} 
                className="flex-1"
              >
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}