import { useState } from 'react';
import { Shield, Plus, Edit2, Trash2, CheckSquare, Square, ChevronDown, ChevronRight, Lock, Eye } from 'lucide-react';
import Modal from '../../components/ui/Modal';
import { useToast } from '../../context/ToastContext';

const PERMISSIONS = {
  'School Management':  ['view_schools', 'create_schools', 'edit_schools', 'delete_schools', 'approve_schools', 'suspend_schools'],
  'User Management':    ['view_users', 'create_users', 'edit_users', 'delete_users', 'suspend_users', 'reset_passwords'],
  'Academic':           ['view_classes', 'manage_classes', 'view_students', 'manage_students', 'view_scores', 'manage_scores', 'view_attendance', 'manage_attendance'],
  'Reports':            ['view_reports', 'generate_reports', 'download_reports', 'delete_reports'],
  'Billing':            ['view_subscriptions', 'manage_plans', 'view_payments', 'manage_payments'],
  'System':             ['manage_settings', 'manage_integrations', 'view_audit_logs', 'manage_backups', 'maintenance_mode'],
  'Support':            ['view_tickets', 'manage_tickets', 'view_feedback', 'manage_announcements'],
};

const ROLES = [
  { id: '1', name: 'Super Admin',    description: 'Full platform access', color: 'indigo', locked: true,  permissions: Object.values(PERMISSIONS).flat() },
  { id: '2', name: 'School Admin',   description: 'Manages their school only', color: 'violet', locked: false, permissions: ['view_schools', 'view_users', 'create_users', 'edit_users', 'view_classes', 'manage_classes', 'view_students', 'manage_students', 'view_scores', 'manage_scores', 'view_attendance', 'manage_attendance', 'view_reports', 'generate_reports', 'download_reports'] },
  { id: '3', name: 'Class Teacher',  description: 'Manages assigned classes', color: 'emerald', locked: false, permissions: ['view_students', 'view_scores', 'manage_scores', 'view_attendance', 'manage_attendance', 'view_reports'] },
  { id: '4', name: 'Subject Teacher',description: 'Scores and attendance only', color: 'amber', locked: false, permissions: ['view_students', 'view_scores', 'manage_scores', 'view_attendance', 'manage_attendance'] },
  { id: '5', name: 'Support Staff',  description: 'Platform support access', color: 'blue', locked: false,  permissions: ['view_tickets', 'manage_tickets', 'view_feedback'] },
];

const colorMap = {
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
};

function PermissionGroup({ group, perms, rolePerms, onToggle, locked }) {
  const [open, setOpen] = useState(false);
  const groupPerms = PERMISSIONS[group];
  const activeCount = groupPerms.filter(p => rolePerms.includes(p)).length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
          <span className="text-sm font-semibold text-gray-900">{group}</span>
        </div>
        <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">{activeCount}/{groupPerms.length}</span>
      </button>
      {open && (
        <div className="p-4 grid grid-cols-2 gap-2">
          {groupPerms.map(perm => {
            const active = rolePerms.includes(perm);
            return (
              <button key={perm} onClick={() => !locked && onToggle(perm)} disabled={locked}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${active ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-gray-50 text-gray-500 border border-gray-100'} ${locked ? 'cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}>
                {active ? <CheckSquare className="h-3.5 w-3.5 flex-shrink-0" /> : <Square className="h-3.5 w-3.5 flex-shrink-0" />}
                <span className="font-medium">{perm.replace(/_/g, ' ')}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AdminRoles() {
  const { addToast } = useToast();
  const [roles, setRoles] = useState(ROLES);
  const [selected, setSelected] = useState(null);
  const [newRoleModal, setNewRoleModal] = useState(false);
  const [newRole, setNewRole] = useState({ name: '', description: '', color: 'blue' });

  const selectedRole = roles.find(r => r.id === selected);

  const togglePerm = (roleId, perm) => {
    setRoles(prev => prev.map(r => r.id === roleId
      ? { ...r, permissions: r.permissions.includes(perm) ? r.permissions.filter(p => p !== perm) : [...r.permissions, perm] }
      : r
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Create custom roles and fine-tune permission access per module.</p>
        </div>
        <button onClick={() => setNewRoleModal(true)} className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus className="h-4 w-4" /> New Role
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role List */}
        <div className="space-y-2">
          {roles.map(role => (
            <button key={role.id} onClick={() => setSelected(role.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selected === role.id ? 'border-indigo-400 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-lg border flex items-center justify-center ${colorMap[role.color]}`}>
                    {role.locked ? <Lock className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{role.name}</p>
                    <p className="text-[11px] text-gray-500">{role.permissions.length} permissions</p>
                  </div>
                </div>
                {role.locked && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-semibold">SYSTEM</span>}
              </div>
              <p className="text-xs text-gray-400 mt-2">{role.description}</p>
            </button>
          ))}
        </div>

        {/* Permission Editor */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h2 className="text-base font-semibold text-gray-900">{selectedRole.name}</h2>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedRole.description}</p>
                </div>
                {selectedRole.locked && (
                  <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                    <Lock className="h-3 w-3" /> Read-only (System role)
                  </span>
                )}
              </div>
              <div className="p-5 space-y-3">
                {Object.keys(PERMISSIONS).map(group => (
                  <PermissionGroup key={group} group={group} perms={PERMISSIONS[group]} rolePerms={selectedRole.permissions}
                    onToggle={(perm) => togglePerm(selectedRole.id, perm)} locked={selectedRole.locked} />
                ))}
                {!selectedRole.locked && (
                  <div className="pt-3 flex justify-end">
                    <button onClick={() => addToast('Role permissions saved!', 'success')} className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors">Save Permissions</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-16 text-center">
              <Shield className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Select a role to view and edit its permissions</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={newRoleModal} onClose={() => setNewRoleModal(false)} title="Create Custom Role" subtitle="Define a new access role for the platform.">
        <div className="space-y-4 pt-2">
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Role Name</label>
            <input value={newRole.name} onChange={e => setNewRole(p => ({ ...p, name: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" placeholder="e.g. Finance Officer" /></div>
          <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
            <input value={newRole.description} onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))} className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400" placeholder="What does this role do?" /></div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setNewRoleModal(false)} className="flex-1 py-2 rounded-lg border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={() => { setRoles(p => [...p, { id: Date.now().toString(), ...newRole, locked: false, permissions: [] }]); setNewRoleModal(false); addToast('New role created!', 'success'); }} className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors">Create Role</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
