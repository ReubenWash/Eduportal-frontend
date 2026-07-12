import { useState, useMemo } from 'react';
import { Search, Eye, Trash2, UserX, UserCheck, ShieldCheck, Shield, BookOpen, GraduationCap } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const MOCK_USERS = [
  { id: '1',  name: 'Dr. Kwame Boateng',   email: 'kwame@sunshine.edu.gh',    role: 'SCHOOL_ADMIN',    school: 'Sunshine Academy',    status: 'ACTIVE',    joinedAt: '2024-01-15' },
  { id: '2',  name: 'Mr. Kofi Mensah',      email: 'kofi@sunshine.edu.gh',     role: 'CLASS_TEACHER',   school: 'Sunshine Academy',    status: 'ACTIVE',    joinedAt: '2024-01-20' },
  { id: '3',  name: 'Ms. Ama Asante',       email: 'ama@sunshine.edu.gh',      role: 'SUBJECT_TEACHER', school: 'Sunshine Academy',    status: 'ACTIVE',    joinedAt: '2024-02-01' },
  { id: '4',  name: 'Mr. Emmanuel Darko',   email: 'edarko@riverside.edu.gh',  role: 'SCHOOL_ADMIN',    school: 'Riverside JHS',       status: 'ACTIVE',    joinedAt: '2024-03-01' },
  { id: '5',  name: 'Ms. Grace Ofori',      email: 'grace@riverside.edu.gh',   role: 'CLASS_TEACHER',   school: 'Riverside JHS',       status: 'SUSPENDED', joinedAt: '2024-03-10' },
  { id: '6',  name: 'Mr. Peter Acquah',     email: 'peter@golden.edu.gh',      role: 'SCHOOL_ADMIN',    school: 'Golden Gate School',  status: 'ACTIVE',    joinedAt: '2023-09-10' },
  { id: '7',  name: 'Ms. Janet Boakye',     email: 'janet@golden.edu.gh',      role: 'SUBJECT_TEACHER', school: 'Golden Gate School',  status: 'ACTIVE',    joinedAt: '2023-10-05' },
  { id: '8',  name: 'Mr. Isaac Tetteh',     email: 'isaac@startsea.edu.gh',    role: 'CLASS_TEACHER',   school: 'Star of the Sea',     status: 'ACTIVE',    joinedAt: '2024-02-14' },
  { id: '9',  name: 'Ms. Linda Owusu',      email: 'linda@startsea.edu.gh',    role: 'SUBJECT_TEACHER', school: 'Star of the Sea',     status: 'ACTIVE',    joinedAt: '2024-02-20' },
  { id: '10', name: 'Mr. Bright Amankwah',  email: 'bright@startsea.edu.gh',   role: 'SCHOOL_ADMIN',    school: 'Star of the Sea',     status: 'SUSPENDED', joinedAt: '2024-03-01' },
];

const roleConfig = {
  SCHOOL_ADMIN:    { label: 'School Admin',    icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', variant: 'primary'  },
  CLASS_TEACHER:   { label: 'Class Teacher',   icon: BookOpen,    color: 'text-emerald-600',bg: 'bg-emerald-50',variant: 'success'  },
  SUBJECT_TEACHER: { label: 'Subject Teacher', icon: GraduationCap,color:'text-violet-600', bg: 'bg-violet-50', variant: 'default'  },
};

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState(MOCK_USERS);
  const [schools] = useState(['Sunshine Academy', 'Riverside JHS', 'Golden Gate School', 'Star of the Sea']);
  const [selectedSchool, setSelectedSchool] = useState('');
  
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [addUserModal, setAddUserModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', email: '', role: 'CLASS_TEACHER' });

  const filtered = useMemo(() => users.filter(u => {
    // If Super Admin hasn't selected a school, they don't see any users (per requirements)
    if (!selectedSchool) return false;
    if (u.school !== selectedSchool) return false;
    
    if (keyword && !u.name.toLowerCase().includes(keyword.toLowerCase()) && !u.email.toLowerCase().includes(keyword.toLowerCase())) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    return true;
  }), [users, keyword, roleFilter, selectedSchool]);

  const toggleSuspend = (user) => {
    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    addToast(newStatus === 'SUSPENDED' ? `${user.name} suspended` : `${user.name} re-activated`, newStatus === 'SUSPENDED' ? 'error' : 'success');
    setViewUser(null);
  };

  const deleteUser = (user) => {
    setUsers(prev => prev.filter(u => u.id !== user.id));
    addToast(`${user.name} removed from platform`, 'success');
    setViewUser(null);
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!selectedSchool) return addToast("Please select a school first", "error");
    
    const newUser = {
      id: Math.random().toString(),
      name: addForm.name,
      email: addForm.email,
      role: addForm.role,
      school: selectedSchool,
      status: 'ACTIVE',
      joinedAt: new Date().toISOString()
    };
    
    setUsers([...users, newUser]);
    addToast(`${addForm.name} added to ${selectedSchool}`, 'success');
    setAddUserModal(false);
    setAddForm({ name: '', email: '', role: 'CLASS_TEACHER' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Select a school to view, add, or remove its users.</p>
        </div>
        
        {/* School Selector & Add Button */}
        <div className="flex items-center gap-3">
          <select 
            value={selectedSchool} 
            onChange={(e) => setSelectedSchool(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">-- Select a School --</option>
            {schools.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          
          <button 
            onClick={() => {
              if(!selectedSchool) return addToast("Please select a school first", "error");
              setAddUserModal(true);
            }}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            disabled={!selectedSchool}
          >
            <UserCheck className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {/* Summary Pills */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'All Users',       count: users.length,                             filter: '',                color: 'bg-gray-100 text-gray-700 border-gray-200' },
          { label: 'School Admins',   count: users.filter(u=>u.role==='SCHOOL_ADMIN').length,   filter: 'SCHOOL_ADMIN',   color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          { label: 'Class Teachers',  count: users.filter(u=>u.role==='CLASS_TEACHER').length,  filter: 'CLASS_TEACHER',  color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
          { label: 'Subject Teachers',count: users.filter(u=>u.role==='SUBJECT_TEACHER').length,filter: 'SUBJECT_TEACHER',color: 'bg-violet-50 text-violet-700 border-violet-200' },
          { label: 'Suspended',       count: users.filter(u=>u.status==='SUSPENDED').length,    filter: '__SUSPENDED__',  color: 'bg-red-50 text-red-700 border-red-200' },
        ].map(p => (
          <button
            key={p.label}
            onClick={() => setRoleFilter(p.filter === '__SUSPENDED__' ? '' : p.filter)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-[13px] font-medium transition-all ${p.color} ${(roleFilter === p.filter || (p.filter === '' && !roleFilter)) ? 'ring-2 ring-offset-1 ring-indigo-400' : 'opacity-70 hover:opacity-100'}`}
          >
            {p.label}
            <span className="text-xs font-bold">{p.count}</span>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, email, or school..."
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
        />
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                {['User', 'School', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!selectedSchool ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-500 font-medium">Please select a school from the dropdown above to view and manage its users.</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-sm text-gray-400">No users found for {selectedSchool}.</td></tr>
              ) : filtered.map(user => {
                const role = roleConfig[user.role] || {};
                const RoleIcon = role.icon || Shield;
                return (
                  <tr key={user.id} className={`hover:bg-gray-50/60 transition-colors ${user.status === 'SUSPENDED' ? 'opacity-60' : ''}`}>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <Avatar name={user.name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <p className="text-[11px] text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{user.school}</td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${role.bg}`}>
                        <RoleIcon className={`h-3.5 w-3.5 ${role.color}`} />
                        <span className={`text-[11px] font-semibold ${role.color}`}>{role.label}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant={user.status === 'ACTIVE' ? 'success' : 'danger'} dot>{user.status}</Badge>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewUser(user)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => toggleSuspend(user)} className={`p-1.5 rounded-md transition-colors ${user.status === 'SUSPENDED' ? 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:text-amber-600 hover:bg-amber-50'}`} title={user.status === 'SUSPENDED' ? 'Reactivate' : 'Suspend'}>
                          {user.status === 'SUSPENDED' ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                        </button>
                        <button onClick={() => deleteUser(user)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      {viewUser && (
        <Modal isOpen={!!viewUser} onClose={() => setViewUser(null)} title={viewUser.name} subtitle={viewUser.email}>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">School</p>
                <p className="text-sm font-semibold text-gray-900">{viewUser.school}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Role</p>
                <p className="text-sm font-semibold text-gray-900">{roleConfig[viewUser.role]?.label || viewUser.role}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Status</p>
                <Badge variant={viewUser.status === 'ACTIVE' ? 'success' : 'danger'} dot>{viewUser.status}</Badge>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1">Joined</p>
                <p className="text-sm text-gray-900">{new Date(viewUser.joinedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-3 border-t border-gray-100">
              <button onClick={() => toggleSuspend(viewUser)} className={`flex-1 py-2 rounded-lg border text-sm font-semibold transition-colors ${viewUser.status === 'SUSPENDED' ? 'border-emerald-200 text-emerald-600 hover:bg-emerald-50' : 'border-amber-200 text-amber-600 hover:bg-amber-50'}`}>
                {viewUser.status === 'SUSPENDED' ? 'Reactivate User' : 'Suspend User'}
              </button>
              <button onClick={() => deleteUser(viewUser)} className="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors">
                Delete User
              </button>
            </div>
          </div>
        </Modal>
      )}
      {/* Add User Modal */}
      {addUserModal && (
        <Modal isOpen={addUserModal} onClose={() => setAddUserModal(false)} title="Add User" subtitle={`Adding a new user to ${selectedSchool}`}>
          <form onSubmit={handleAddUser} className="space-y-4 pt-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
              <input required className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
              <input required type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={addForm.email} onChange={e => setAddForm(f => ({ ...f, email: e.target.value }))} placeholder="e.g. john@school.edu" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
              <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-300 outline-none" value={addForm.role} onChange={e => setAddForm(f => ({ ...f, role: e.target.value }))}>
                <option value="SCHOOL_ADMIN">School Admin</option>
                <option value="CLASS_TEACHER">Class Teacher</option>
                <option value="SUBJECT_TEACHER">Subject Teacher</option>
              </select>
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setAddUserModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">Add User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
