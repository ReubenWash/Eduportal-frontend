import { Link } from 'react-router-dom';
import { GraduationCap, ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        {/* Logo + back to home */}
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">EduPortal</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
        </div>

        {/* Main quote / feature block */}
        <div className="relative space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight tracking-tight">
              Your school,<br />
              <span className="text-indigo-400">brilliantly managed.</span>
            </h1>
            <p className="mt-4 text-slate-400 text-base leading-relaxed">
              EduPortal brings together everything your school needs — students, staff, grades, attendance, and reports — in one elegant platform.
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {[
              'Role-based access for every staff member',
              'Automated report card generation',
              'Real-time attendance tracking',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                </span>
                {feat}
              </li>
            ))}
          </ul>

          {/* Stats row */}
          <div className="flex gap-8 pt-2">
            {[{ val: '500+', label: 'Schools' }, { val: '120K', label: 'Students' }, { val: '99.9%', label: 'Uptime' }].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-bold text-white">{s.val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-slate-600">
          © {new Date().getFullYear()} EduPortal. All rights reserved.
        </p>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12">
        {/* Mobile: logo + back button in a row */}
        <div className="lg:hidden w-full max-w-[420px] flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">EduPortal</span>
          </div>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-full"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Home
          </Link>
        </div>

        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </div>
    </div>
  );
}