import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { resetPassword } from '../../api/authApi';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    try {
      await resetPassword(token, password);
      addToast('Password reset successfully', 'success');
      navigate('/login');
    } catch {
      addToast('Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7 w-full">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Set new password</h2>
          <p className="mt-2 text-sm text-slate-400">Enter your new password below to regain access.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">New password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter new password"
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
            disabled={loading || !password}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>

        <div className="pt-2">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}