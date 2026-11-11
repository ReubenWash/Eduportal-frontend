import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { roleHome } from '../../routes/ProtectedRoute';
import LandingAuthLayout from '../../layouts/LandingAuthLayout';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
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
    await doLogin({
      email: sanitizedIdentifier,
      identifier: sanitizedIdentifier,
      password,
    });
    setLoading(false);
  };

  return (
    <LandingAuthLayout page="login">
      <div className="w-full space-y-6">
        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Sign in with your credentials to access your account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email or Student ID
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. admin@school.edu or JHS-2026-0001"
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-700">Password</label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-700 transition-colors hover:text-indigo-600"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-500 transition-colors hover:text-slate-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Student Reset Link */}
        <p className="text-center text-xs text-slate-600">
          Student?{' '}
          <Link
            to="/student-reset-password"
            className="font-medium text-indigo-700 transition-colors hover:text-indigo-600"
          >
            Reset your password here
          </Link>
        </p>

        {/* Book a Demo */}
        <div className="space-y-2 border-t border-slate-200 pt-5 text-center">
          <p className="text-sm text-slate-600">New school wanting to join?</p>
          <Link
            to="/register"
            className="inline-block text-sm font-semibold text-indigo-700 transition-colors hover:text-indigo-600"
          >
            Book a Demo →
          </Link>
        </div>
      </div>
    </LandingAuthLayout>
  );
}
