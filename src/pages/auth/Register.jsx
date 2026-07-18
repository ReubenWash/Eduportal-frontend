import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthLayout from '../../layouts/AuthLayout';
import { Eye, EyeOff, AlertCircle, CheckCircle, MapPin, Building, CreditCard, Clock } from 'lucide-react';

const REGIONS = [
  "Greater Accra", "Ashanti", "Western", "Eastern", "Central", 
  "Northern", "Volta", "Bono", "Bono East", "Ahafo", 
  "Savannah", "North East", "Upper East", "Upper West", "Oti", "Western North"
];

export default function RegisterPage() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolName: '',
    region: '',
    district: '',
    address: '',
    plan: 'BASIC'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePlanSelect = (plan) => {
    setFormData({ ...formData, plan });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.region) {
      setError('Please select a region');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        schoolName: formData.schoolName,
        region: formData.region,
        district: formData.district,
        address: formData.address,
        plan: formData.plan
      });
      setIsSubmitted(true);
      addToast('Registration submitted successfully!', 'success');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <AuthLayout>
        <div className="w-full text-center space-y-6">
          <div className="mx-auto h-20 w-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
            <Clock className="h-10 w-10 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Registration Under Review</h2>
            <p className="mt-4 text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
              Thank you for registering <strong>{formData.schoolName}</strong>. Your application has been successfully submitted and is currently pending review by our administration team.
            </p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left max-w-md mx-auto">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-emerald-400" /> What happens next?
            </h3>
            <ul className="text-sm text-slate-400 space-y-2 list-disc pl-5">
              <li>A verification link has been sent to <strong>{formData.email}</strong>. Please check your inbox and verify your email.</li>
              <li>Our team will review your school details shortly.</li>
              <li>You will receive an email notification as soon as your account is approved and activated.</li>
            </ul>
          </div>
          <div className="pt-4">
            <Link
              to="/verify-email"
              className="w-full sm:w-auto inline-flex bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-8 rounded-lg text-sm transition-all items-center justify-center shadow-lg shadow-indigo-500/20"
            >
              Verify Email
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="space-y-7 w-full max-w-md lg:max-w-xl mx-auto">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Register your school</h2>
          <p className="mt-2 text-sm text-slate-400">Join EduPortal and manage your school with ease.</p>
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section: School Basics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Building className="h-3.5 w-3.5" /> School Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">School name</label>
                <input
                  type="text"
                  name="schoolName"
                  value={formData.schoolName}
                  onChange={handleChange}
                  required
                  placeholder="Greenfield Academy"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Full name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section: Location */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Location Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Region</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  <option value="" disabled>Select Region...</option>
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">District</label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Ayawaso West"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Specific Location / Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Street address, landmark, P.O. Box..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Section: Subscription Plan */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="h-3.5 w-3.5" /> Subscription Plan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Free Plan */}
              <button
                type="button"
                onClick={() => handlePlanSelect('BASIC')}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  formData.plan === 'BASIC' 
                    ? 'bg-indigo-500/10 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-semibold text-white text-sm">Free Starter</span>
                  {formData.plan === 'BASIC' && <CheckCircle className="h-4 w-4 text-indigo-400" />}
                </div>
                <span className="text-xs text-slate-400">Essential features for small schools. Upgrade later.</span>
              </button>

              {/* Premium Plan */}
              <button
                type="button"
                onClick={() => handlePlanSelect('PREMIUM')}
                className={`flex flex-col text-left p-4 rounded-xl border transition-all ${
                  formData.plan === 'PREMIUM' 
                    ? 'bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500 shadow-lg shadow-emerald-500/10' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-semibold text-white text-sm">Premium Pro</span>
                  {formData.plan === 'PREMIUM' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                </div>
                <span className="text-xs text-slate-400">Full access, analytics, & advanced reports.</span>
              </button>
            </div>
          </div>

          {/* Section: Account Credentials */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@school.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Strong password"
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
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Confirm password"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 mt-4"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {loading ? 'Submitting Application…' : 'Submit Registration'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 pb-4">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}