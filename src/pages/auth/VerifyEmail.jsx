import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { verifyEmail } from '../../api/authApi';
import AuthLayout from '../../layouts/AuthLayout';
import { ArrowLeft, MailCheck } from 'lucide-react';

export default function VerifyEmailPage() {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [code, setCode] = useState('');

  const handleVerify = async () => {
    if (!code) {
      addToast('Please enter the verification code', 'error');
      return;
    }
    setLoading(true);
    try {
      await verifyEmail(code);
      setVerified(true);
      addToast('Email verified successfully', 'success');
    } catch {
      addToast('Verification failed or expired', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-7 w-full text-center">
        {/* Header */}
        <div className="mx-auto h-16 w-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-4">
          <MailCheck className="h-8 w-8 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {verified ? 'Email verified!' : 'Verify your email'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {verified 
              ? 'Thank you for verifying your email address. You can now log in.'
              : 'Click the button below to verify your email address and activate your account.'}
          </p>
        </div>

        {/* Action */}
        {!verified ? (
          <div className="space-y-4">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-2 border border-slate-600 bg-slate-800/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={6}
            />
            <button
              onClick={handleVerify}
              disabled={loading || !code}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading ? 'Verifying…' : 'Verify Email'}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20"
          >
            Continue to Login
          </Link>
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