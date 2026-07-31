import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Calendar, BookOpen, Users, Award, Key, Copy } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import { formatDate } from '../../utils/helpers';
import { getStudentById } from '../../api/studentsApi';
import { adminResetStudentPassword } from '../../api/authApi';
import { useToast } from '../../context/ToastContext';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);

  useEffect(() => {
    loadStudent();
  }, [id]);

  const loadStudent = () => {
    setLoading(true);
    getStudentById(id)
      .then((data) => {
        console.log('Student data:', data);
        setStudent(data);
        setLoadError(false);
      })
      .catch((err) => {
        console.error('Error loading student:', err);
        setLoadError(true);
      })
      .finally(() => setLoading(false));
  };

  const handleResetPassword = async () => {
    if (!window.confirm('Reset password for this student? They will need to change it on next login.')) return;
    
    setResetting(true);
    try {
      const response = await adminResetStudentPassword(id);
      if (response?.tempPassword) {
        setTempPassword({
          password: response.tempPassword,
          studentNumber: response.studentNumber || student?.studentNumber,
          studentName: response.studentName || fullName
        });
        setShowPasswordModal(true);
        addToast('Password reset successfully!', 'success');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      addToast('Failed to reset password', 'error');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Student Profile" subtitle="Loading..." />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-gray-200 rounded-full animate-pulse" />
            <div className="flex-1">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loadError || !student) {
    return (
      <div>
        <PageHeader 
          title="Student Profile" 
          subtitle="Unable to load student" 
          action={
            <Button variant="secondary" onClick={() => navigate('/students')} icon={ArrowLeft}>
              Back to Students
            </Button>
          } 
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
          <p className="text-sm text-gray-500">Couldn't load this student's profile. Please try again.</p>
          <Button 
            variant="primary" 
            onClick={() => window.location.reload()} 
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Get full name
  const fullName = `${student.firstName || ''} ${student.lastName || ''}`.trim();
  
  // Get class name
  const className = student.enrollments?.[0]?.class 
    ? `${student.enrollments[0].class.level} ${student.enrollments[0].class.section}`
    : 'Not Assigned';
  
  // Get primary guardian
  const primaryGuardian = student.guardians?.find(g => g.isPrimary)?.guardian || 
                          student.guardians?.[0]?.guardian || 
                          null;

  // Get photo URL with fallback
  const photoUrl = student.photoUrl || null;

  const tabs = [
    { 
      label: 'Overview', 
      content: <OverviewTab student={student} fullName={fullName} className={className} /> 
    },
    { 
      label: 'Scores', 
      content: <ScoresTab student={student} /> 
    },
    { 
      label: 'Attendance', 
      content: <AttendanceTab student={student} /> 
    },
    { 
      label: 'Reports', 
      content: <ReportsTab student={student} /> 
    },
  ];

  return (
    <div>
      <PageHeader
        title="Student Profile"
        subtitle={fullName}
        action={
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/students')} 
              icon={ArrowLeft}
            >
              Back
            </Button>
            <Button 
              variant="outline" 
              onClick={handleResetPassword}
              disabled={resetting}
              icon={Key}
              className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
            >
              {resetting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </div>
        }
      />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header with Photo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              {photoUrl ? (
                <img 
                  src={photoUrl} 
                  alt={fullName}
                  className="h-24 w-24 rounded-full object-cover border-4 border-indigo-100"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                    const parent = e.target.parentElement;
                    const avatar = document.createElement('div');
                    avatar.innerHTML = `<svg class="h-24 w-24 text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
                    parent.appendChild(avatar);
                  }}
                />
              ) : (
                <Avatar 
                  name={fullName} 
                  size="lg"
                  className="h-24 w-24 text-3xl"
                />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
                <Badge variant={student.status === 'ACTIVE' ? 'success' : 'default'}>
                  {student.status || 'Active'}
                </Badge>
                <Badge variant="info">{student.gender || 'N/A'}</Badge>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <p className="text-sm text-gray-500">{student.studentNumber}</p>
                <span className="text-gray-300">•</span>
                <p className="text-sm text-gray-500">{className}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Sidebar - Profile Info */}
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-3">
              <ProfileItem icon={User} label="Full Name" value={fullName} />
              <ProfileItem icon={User} label="Student Number" value={student.studentNumber} />
              <ProfileItem icon={Calendar} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
              <ProfileItem icon={User} label="Gender" value={student.gender} />
              <ProfileItem icon={Calendar} label="Admission Date" value={formatDate(student.admissionDate)} />
              <ProfileItem icon={BookOpen} label="Class" value={className} />
              <ProfileItem icon={Award} label="Status" value={student.status || 'Active'} />
            </div>

            {/* Guardian Information */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Guardian Information</h3>
              {primaryGuardian ? (
                <div className="space-y-3">
                  <ProfileItem 
                    icon={User} 
                    label="Guardian Name" 
                    value={`${primaryGuardian.firstName || ''} ${primaryGuardian.lastName || ''}`.trim()} 
                  />
                  <ProfileItem icon={Mail} label="Email" value={primaryGuardian.email} />
                  <ProfileItem icon={Phone} label="Phone" value={primaryGuardian.phone} />
                  <ProfileItem label="Relationship" value={primaryGuardian.relationship || 'Guardian'} />
                </div>
              ) : (
                <p className="text-sm text-gray-400">No guardian linked to this student yet.</p>
              )}
            </div>
          </div>

          {/* Main Content - Tabs */}
          <div className="lg:col-span-2 p-6">
            <Tabs tabs={tabs} />
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordModal && tempPassword && (
        <Modal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          title="🔑 Password Reset"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 font-medium mb-3">
                Password reset successfully! Share these new credentials with the student:
              </p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">Student Name</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {tempPassword.studentName}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">Student Number</p>
                  <p className="text-sm font-mono font-bold text-gray-900">
                    {tempPassword.studentNumber}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-yellow-100">
                  <p className="text-xs text-gray-500">New Temporary Password</p>
                  <p className="text-sm font-mono font-bold text-indigo-600">
                    {tempPassword.password}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs text-blue-700">
                  ⚠️ Student must change password on first login.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  const credentials = `Student: ${tempPassword.studentName}\nStudent Number: ${tempPassword.studentNumber}\nTemporary Password: ${tempPassword.password}`;
                  navigator.clipboard?.writeText(credentials).catch(() => {});
                  addToast('Credentials copied to clipboard!', 'success');
                }}
                variant="secondary"
                className="flex-1"
                icon={Copy}
              >
                Copy Credentials
              </Button>
              <Button 
                onClick={() => setShowPasswordModal(false)} 
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

// ─── Tab Components ───

function OverviewTab({ student, fullName, className }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-semibold text-gray-900">Overview</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">Student Name</p>
          <p className="text-sm font-medium text-gray-900">{fullName}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">Class</p>
          <p className="text-sm font-medium text-gray-900">{className}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">Student Number</p>
          <p className="text-sm font-medium text-gray-900">{student.studentNumber}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">Status</p>
          <Badge variant={student.status === 'ACTIVE' ? 'success' : 'default'}>
            {student.status || 'Active'}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function ScoresTab({ student }) {
  return (
    <div className="p-6 text-sm text-gray-500">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Scores</h4>
      {student.scores && student.scores.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CA1</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CA2</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">CA3</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {student.scores.map((score, index) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm text-gray-900">{score.subject?.name || 'N/A'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{score.ca1 || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{score.ca2 || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{score.ca3 || '-'}</td>
                  <td className="px-3 py-2 text-sm text-gray-600">{score.examScore || '-'}</td>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">{score.total || '-'}</td>
                  <td className="px-3 py-2 text-sm">
                    <Badge variant={score.grade === 'A' ? 'success' : 'default'}>
                      {score.grade || '-'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No scores recorded yet.</p>
      )}
    </div>
  );
}

function AttendanceTab({ student }) {
  return (
    <div className="p-6 text-sm text-gray-500">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Attendance</h4>
      <p className="text-gray-400">Attendance data will be displayed here.</p>
    </div>
  );
}

function ReportsTab({ student }) {
  return (
    <div className="p-6 text-sm text-gray-500">
      <h4 className="text-sm font-semibold text-gray-900 mb-4">Reports</h4>
      <p className="text-gray-400">Report cards will be displayed here.</p>
    </div>
  );
}

// ─── Profile Item Component ───
function ProfileItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />}
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm text-gray-900 font-medium">{value || '-'}</p>
      </div>
    </div>
  );
}