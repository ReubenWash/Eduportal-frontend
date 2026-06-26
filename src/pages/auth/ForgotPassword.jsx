import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { forgotPassword } from '../../api/authApi';
import AuthLayout from '../../layouts/AuthLayout';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPassword() {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      addToast('Reset link sent to your email', 'success');
    } catch {
      addToast('Failed to send reset link', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7 w-full">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Reset your password</h2>
          <p className="mt-2 text-sm text-slate-400">Enter your email below and we'll send you a reset link.</p>
        </div>

        {/* Form */}
        {sent ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-6 text-center">
            <div className="mx-auto h-12 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Check your email</h3>
            <p className="text-sm text-emerald-200">
              We've sent a password reset link to <strong>{email}</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@school.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        )}

        <div className="pt-2">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to login
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}