import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { roleHome } from '../../routes/ProtectedRoute';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

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
      setError(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sanitizedEmail = email.trim().toLowerCase();
    if (!sanitizedEmail || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    await doLogin({ email: sanitizedEmail, password });
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-6 w-full">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sign in</h2>
          <p className="mt-2 text-sm text-slate-400">Access your EduPortal dashboard.</p>
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
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Email or Student ID</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.com or JHS-..."
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
            disabled={loading}
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