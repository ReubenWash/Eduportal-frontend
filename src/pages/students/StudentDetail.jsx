import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Tabs from '../../components/ui/Tabs';
import Badge from '../../components/ui/Badge';
import Table from '../../components/ui/Table';
import Avatar from '../../components/ui/Avatar';
import { formatDate } from '../../utils/helpers';

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setStudent({
        id,
        name: 'John Doe',
        studentNo: 'STU/2024/001',
        dob: '2008-05-12',
        gender: 'MALE',
        status: 'ACTIVE',
        photo: '',
        guardian: { name: 'Jane Doe', email: 'jane@example.com', phone: '0244000000' },
        class: { name: 'JHS1 A' },
        enrollmentDate: '2024-09-01',
      });
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Student Profile" subtitle="Loading..." />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  const tabs = [
    { label: 'Overview', content: <Overview student={student} /> },
    { label: 'Scores', content: <div className="p-6 text-sm text-gray-500">Scores data will load here.</div> },
    { label: 'Attendance', content: <div className="p-6 text-sm text-gray-500">Attendance data will load here.</div> },
    { label: 'Reports', content: <div className="p-6 text-sm text-gray-500">Reports data will load here.</div> },
  ];

  return (
    <div>
      <PageHeader title="Student Profile" subtitle={student.name} action={<Button variant="secondary" onClick={() => navigate('/students')} icon={ArrowLeft}>Back to Students</Button>} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-6">
            <Avatar src={student.photo} name={student.name} size="lg" />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900">{student.name}</h2>
                <Badge variant={student.status === 'ACTIVE' ? 'success' : 'default'}>{student.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">{student.studentNo} • {student.class?.name}</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="p-6 border-b lg:border-b-0 lg:border-r border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Profile Information</h3>
            <div className="space-y-3">
              <ProfileItem label="Full Name" value={student.name} />
              <ProfileItem label="Student Number" value={student.studentNo} />
              <ProfileItem label="Date of Birth" value={formatDate(student.dob)} />
              <ProfileItem label="Gender" value={student.gender} />
              <ProfileItem label="Enrollment Date" value={formatDate(student.enrollmentDate)} />
              <ProfileItem label="Class" value={student.class?.name} />
            </div>
          </div>
          <div className="lg:col-span-2 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Guardian Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ProfileItem label="Guardian Name" value={student.guardian?.name} />
              <ProfileItem label="Email" value={student.guardian?.email} />
              <ProfileItem label="Phone" value={student.guardian?.phone} />
            </div>
            <div className="mt-6">
              <Tabs tabs={tabs} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Overview({ student }) {
  return (
    <div className="p-6">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">Overview content for {student.name}</h4>
      <p className="text-sm text-gray-500">Placeholder for overview.</p>
    </div>
  );
}

function ProfileItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 font-medium">{value || '-'}</p>
    </div>
  );
}