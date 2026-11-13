import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardCheck,
  FileText,
  GraduationCap,
} from 'lucide-react';
import { useTenantBranding } from '../context/TenantBrandingContext';

const glass = {
  background: 'rgba(255,255,255,.72)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,.9)',
  boxShadow: '0 24px 48px -16px rgba(0,0,0,.12)',
};

const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-700';

export default function LandingAuthLayout({ children, page }) {
  const { school } = useTenantBranding();
  const brandName = school?.name || 'Goreb';
  const isRegister = page === 'register';

  return (
    <div className="gl-auth min-h-screen bg-slate-50 text-slate-900">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');
        .gl-auth { font-family: 'DM Sans', system-ui, sans-serif; }
        .gl-auth h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -.025em; }
        .gl-auth-spin { animation: gl-auth-rot 28s linear infinite; }
        @keyframes gl-auth-rot { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) {
          .gl-auth *, .gl-auth-spin { animation: none !important; transition: none !important; }
        }
      `}</style>

      <header className="sticky top-0 z-30 px-5 pt-4 safe-top-inset">
        <div className="mx-auto flex max-w-6xl items-center justify-between rounded-full border border-white/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-xl sm:px-6">
          <Link to="/" className="flex items-center gap-2" aria-label={`${brandName} home`}>
            {school?.logoUrl ? (
              <img src={school.logoUrl} alt="" className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <GraduationCap size={23} strokeWidth={2} />
            )}
            <span className="text-lg font-semibold tracking-tight">{brandName}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {[
              ['Features', '/#features'],
              ['How it works', '/#how'],
              ['Pricing', '/#plans'],
              ['Reviews', '/#testimonials'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-white hover:text-slate-950">
                {label}
              </a>
            ))}
          </nav>

          <Link
            to={isRegister ? '/login' : '/register'}
            className={buttonClass}
            style={{ background: '#4F46E5', color: '#fff' }}
          >
            {isRegister ? 'Sign in' : 'Book a Demo'} <ArrowUpRight size={15} />
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-12 pt-10 sm:pt-14">
        <div className="mx-auto grid max-w-5xl items-center gap-8 md:grid-cols-[1fr_420px] md:gap-12">
          <section className="relative hidden min-h-[430px] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-8 md:block" aria-label="Goreb platform features">
            <div className="absolute inset-x-0 bottom-0 mx-auto h-64 w-64 rounded-t-full bg-gradient-to-b from-indigo-500 to-[#1A3C5E] opacity-95" />
            <div className="absolute left-1/2 top-1/2 grid h-48 w-48 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/10">
              <GraduationCap size={76} color="#fff" strokeWidth={1.2} />
            </div>

            <div className="absolute left-5 top-8 w-52 rounded-2xl p-4" style={{ ...glass, transform: 'rotate(-4deg)' }}>
              <ClipboardCheck size={19} className="text-indigo-600" />
              <p className="mt-3 text-base font-semibold">Scores, sorted.</p>
              <p className="mt-1 text-xs text-slate-500">Grades calculate as teachers enter marks.</p>
            </div>
            <div className="absolute right-5 top-20 w-52 rounded-2xl p-4" style={{ ...glass, transform: 'rotate(4deg)' }}>
              <CalendarCheck size={19} className="text-indigo-600" />
              <p className="mt-3 text-base font-semibold">Attendance, clear.</p>
              <p className="mt-1 text-xs text-slate-500">See daily attendance across every class.</p>
            </div>
            <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-2xl px-4 py-3" style={glass}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100">
                <FileText size={18} className="text-slate-800" />
              </span>
              <span>
                <span className="block text-sm font-semibold">Reports ready to share</span>
                <span className="block text-xs text-slate-500">PDFs for families, in just a few clicks</span>
              </span>
            </div>
            <svg className="gl-auth-spin absolute right-8 top-7 text-indigo-900" width="56" height="56" viewBox="0 0 120 120" aria-hidden="true">
              <defs><path id="gl-auth-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <text fontSize="10" letterSpacing="3" fill="currentColor"><textPath href="#gl-auth-circle">LESS CHAOS · MORE CLARITY ·</textPath></text>
            </svg>
          </section>

          <section className="w-full rounded-3xl border border-white bg-white p-6 shadow-[0_24px_64px_-32px_rgba(15,23,42,.28)] sm:p-8">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
