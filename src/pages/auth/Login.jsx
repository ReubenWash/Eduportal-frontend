import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff, AlertCircle, Zap, Shield, BookOpen, GraduationCap, Heart } from 'lucide-react';

const DEMO_ACCOUNTS = [
  {
    label: 'Super Admin',
    email: 'superadmin@school.com',
    password: 'demo123',
    role: 'Full system access',
    icon: Shield,
    color: 'indigo',
  },
  {
    label: 'School Admin',
    email: 'admin@school.com',
    password: 'demo123',
    role: 'School management',
    icon: GraduationCap,
    color: 'violet',
  },
  {
    label: 'Class Teacher',
    email: 'teacher@school.com',
    password: 'demo123',
    role: 'Class & assessments',
    icon: BookOpen,
    color: 'emerald',
  },
  {
    label: 'Subject Teacher',
    email: 'subject@school.com',
    password: 'demo123',
    role: 'Scores & attendance',
    icon: Zap,
    color: 'amber',
  },
  {
    label: 'Parent / Guardian',
    email: 'guardian@school.com',
    password: 'demo123',
    role: 'Student progress view',
    icon: Heart,
    color: 'rose',
  },
];

const colorMap = {
  indigo: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-400/40',
  violet: 'bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/40',
  emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/40',
  amber: 'bg-amber-500/10 border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-400/40',
  rose: 'bg-rose-500/10 border-rose-500/20 text-rose-300 hover:bg-rose-500/20 hover:border-rose-400/40',
};

const iconColorMap = {
  indigo: 'text-indigo-400',
  violet: 'text-violet-400',
  emerald: 'text-emerald-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
};

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickLoading, setQuickLoading] = useState(null);

  const from = location.state?.from?.pathname || '/dashboard';

  const doLogin = async (creds) => {
    setError('');
    try {
      await login(creds, (user) => {
        addToast(`Signed in as ${user.name}`, 'success');
        const destination = user.role === 'SUPER_ADMIN' ? '/admin' : (from === '/login' ? '/dashboard' : from);
        navigate(destination, { replace: true });
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    await doLogin({ email, password });
    setLoading(false);
  };

  const handleQuickLogin = async (account) => {
    setQuickLoading(account.email);
    await doLogin({ email: account.email, password: account.password });
    setQuickLoading(null);
  };

  return (
    <AuthLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Access your EduPortal dashboard.</p>
        </div>

        {/* Quick Role Login */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick demo login</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((account) => {
              const Icon = account.icon;
              const isThisLoading = quickLoading === account.email;
              return (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => handleQuickLogin(account)}
                  disabled={!!quickLoading || loading}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[account.color]}`}
                >
                  {isThisLoading ? (
                    <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <Icon className={`h-4 w-4 flex-shrink-0 ${iconColorMap[account.color]}`} />
                  )}
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold leading-none truncate">{account.label}</p>
                    <p className="text-[10px] opacity-70 mt-0.5 truncate">{account.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-600 font-medium">or sign in manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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

          <button
            type="submit"
            disabled={loading || !!quickLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Create one now
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}