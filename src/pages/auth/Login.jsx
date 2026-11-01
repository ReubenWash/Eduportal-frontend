import { useState } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { roleHome } from '../../routes/ProtectedRoute';
import AuthLayout from '../../layouts/AuthLayout';
import {
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  Building2,
  BriefcaseBusiness,
  Users,
  GraduationCap,
  ShieldCheck,
  BadgeCheck,
} from 'lucide-react';

const PORTALS = {
  'school-administration': {
    key: 'school-administration',
    label: 'School Administration',
    badge: 'Admins and Accountants',
    description: 'Secure access for school leaders, finance staff, and administrators.',
    helper: 'Use your official school email or staff login details.',
    placeholder: 'admin@school.edu or payroll@school.edu',
    icon: Building2,
    accent: 'from-indigo-500 to-blue-600',
    highlight: 'border-indigo-400/60 bg-indigo-500/10',
    roleHint: 'Accountants, school admin, and finance operators',
  },
  'teaching-staff': {
    key: 'teaching-staff',
    label: 'Teaching Staff',
    badge: 'Class and Subject Teachers',
    description: 'Access attendance, scores, class records, and lesson planning tools.',
    helper: 'Use your staff email address and password.',
    placeholder: 'teacher@school.edu',
    icon: BriefcaseBusiness,
    accent: 'from-violet-500 to-fuchsia-600',
    highlight: 'border-violet-400/60 bg-violet-500/10',
    roleHint: 'Class teachers and subject teachers',
  },
  'parents-guardians': {
    key: 'parents-guardians',
    label: 'Parents and Guardians',
    badge: 'Parent Portal',
    description: 'Track child performance, attendance, fees, and academic progress.',
    helper: 'Use the email linked to your parent account.',
    placeholder: 'parent@email.com',
    icon: Users,
    accent: 'from-emerald-500 to-teal-600',
    highlight: 'border-emerald-400/60 bg-emerald-500/10',
    roleHint: 'Parents and guardians',
  },
  students: {
    key: 'students',
    label: 'Students',
    badge: 'Student Portal',
    description: 'Review grades, attendance records, and your academic dashboard.',
    helper: 'Use your student number and school-issued password.',
    placeholder: 'JHS-2026-0001',
    icon: GraduationCap,
    accent: 'from-amber-500 to-orange-600',
    highlight: 'border-amber-400/60 bg-amber-500/10',
    roleHint: 'Students and school learners',
  },
};

function PortalGrid() {
  const navigate = useNavigate();

  return (
    <div className="space-y-7 w-full">
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Secure access
        </span>
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Choose your portal</h2>
          <p className="mt-2 text-sm text-slate-400">
            Sign in as the role assigned to you by your school.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {Object.values(PORTALS).map((portal) => {
          const Icon = portal.icon;
          return (
            <button
              key={portal.key}
              type="button"
              onClick={() => navigate(`/login/${portal.key}`)}
              className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 ${portal.highlight}`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${portal.accent}`} />
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${portal.accent} text-white shadow-lg shadow-slate-950/30`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em] text-slate-300">
                  {portal.badge}
                </span>
              </div>

              <div className="mt-5">
                <h3 className="text-lg font-semibold text-white">{portal.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{portal.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-slate-300">
                <span>{portal.roleHint}</span>
                <span className="inline-flex items-center gap-1 font-medium text-white">
                  Open portal
                  <ArrowLeft className="h-3.5 w-3.5 rotate-180" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-center text-sm text-slate-400">
        Need an account? <Link to="/register" className="font-medium text-indigo-300 hover:text-indigo-200">Register your school</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { portal } = useParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const activePortal = portal ? PORTALS[portal] : null;
  const isSelection = !activePortal;
  const from = location.state?.from?.pathname || '';

  const doLogin = async (creds) => {
    setError('');
    try {
      await login(creds, (user) => {
        addToast(`Signed in as ${user.name}`, 'success');
        const home = roleHome(user.role);
        const destination = from && from !== '/login' ? from : home;

        if (user.mustChangePassword) {
          navigate('/change-password', { state: { from: destination }, replace: true });
        } else {
          navigate(destination, { replace: true });
        }
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Invalid email or password.';
      setError(errorMsg);

      if (errorMsg.includes('pending approval') || errorMsg.includes('school is not verified')) {
        addToast('Your school is pending verification. Please wait for admin approval.', 'warning');
      } else if (errorMsg.includes('Invalid email') || errorMsg.includes('Invalid student')) {
        addToast('Invalid email/student number or password. Please try again.', 'error');
      } else if (errorMsg.includes('verify your email')) {
        addToast('Please verify your email address first. Check your inbox.', 'warning');
      } else {
        addToast(errorMsg, 'error');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedIdentifier = identifier.trim();
    if (!sanitizedIdentifier || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    await doLogin({ email: sanitizedIdentifier, password });
    setLoading(false);
  };

  if (isSelection) {
    return (
      <AuthLayout>
        <PortalGrid />
      </AuthLayout>
    );
  }

  const Icon = activePortal.icon;

  return (
    <AuthLayout>
      <div className="space-y-6 w-full">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Portal selection
          </button>
          <span className="rounded-full border border-indigo-400/30 bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-200">
            {activePortal.badge}
          </span>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${activePortal.accent} text-white shadow-lg shadow-slate-950/30`}>
            <Icon className="h-5 w-5" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{activePortal.label}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-400">{activePortal.description}</p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">
              {activePortal.key === 'students' ? 'Student Number' : 'Email address'}
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={activePortal.placeholder}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
            <p className="mt-1 text-xs text-slate-500">{activePortal.helper}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              {activePortal.key !== 'students' && (
                <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                  Forgot password?
                </Link>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {activePortal.key === 'students' && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-3.5 w-3.5" />
                Student self-service reset available
              </span>
              <Link to="/student-reset-password" className="font-medium text-amber-200 hover:text-white">
                Reset password
              </Link>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Signing in…' : `Continue to ${activePortal.label}`}
          </button>
        </form>

        <div className="space-y-2 text-center text-sm text-slate-500">
          <p>
            Need another portal? <button type="button" onClick={() => navigate('/login')} className="font-medium text-indigo-400 hover:text-indigo-300">Choose portal</button>
          </p>
          <p className="text-xs text-slate-600">
            {activePortal.key === 'students'
              ? 'Students can use their student number and temporary password from the school.'
              : 'Use the credentials assigned to your school account. Contact the school office if you need access.'}
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
