import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getLandingPageContent } from '../api/cmsApi';
import {
  MessageCircle, Calendar, Phone, Mail, ArrowUpRight, ClipboardCheck,
  CalendarCheck, FileText, GraduationCap, Play, Sparkle, Users,
} from 'lucide-react';

// ── Default landing page content ─────────────────────────────────────────
const C = {
  black: '#1A3C5E',
  primary: '#4F46E5',
  white: '#FFFFFF',
  paper: '#F8FAFC',
  beige: '#EEF2FF',
  lime: '#F59E0B',
  mute: '#64748B',
};
const glass = {
  background: 'rgba(255,255,255,.55)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,.8)',
  boxShadow: '0 24px 48px -16px rgba(0,0,0,.12)',
};
const heroButton = 'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-[15px] font-semibold transition-transform active:scale-[.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black';

const DEFAULT_THEME = {
  primaryColor: '#4F46E5',
  secondaryColor: '#1A3C5E',
  accentColor: '#F59E0B',
  fontFamily: 'Inter',
  borderRadius: '8px',
  buttonStyle: 'rounded',
  logoUrl: null,
  faviconUrl: null,
  customCss: ''
};

const DEFAULT_CONTENT = {
  heroHeadline: "Run your school.",
  heroHeadlineHighlight: "Not paperwork.",
  heroSubtitle: "Goreb gives school administrators, teachers, and parents one place to manage students, scores, attendance, and term reports — without the spreadsheets.",
  heroPrimaryBtn: "Book a Demo",
  heroTrustText: "Trusted by 200+ schools across Ghana, Nigeria & Kenya",
  heroImageUrl: null,
  stats: [
    { id: 'stat-1', number: "200+", label: "Schools registered" },
    { id: 'stat-2', number: "84K", label: "Students managed" },
    { id: 'stat-3', number: "1.2M", label: "Reports generated" },
    { id: 'stat-4', number: "99.9%", label: "Platform uptime" },
  ],
  schools: ["Divine International", "Buokrom MA", "St. Anthony Prep ", "St. Stephen's International School"],
  testimonials: [
    { id: 'testimonial-1', quote: "We used to spend three weeks compiling report cards. With Goreb, the whole process takes two days. Teachers submit scores, I approve, and parents get a PDF. That's it.", author: "Abena Owusu", role: "Headmistress, Holy Child School", initials: "AO", color: "#4F46E5" },
    { id: 'testimonial-2', quote: "The attendance analytics alone are worth it. I can see which classes have the worst absenteeism and act on it before the term ends — not after.", author: "Kwame Darko", role: "Deputy Head, Presec Legon", initials: "KD", color: "#10B981" },
    { id: 'testimonial-3', quote: "As a parent, I used to wait weeks to find out how my daughter was doing. Now I get her report on my phone the same day results are released. Genuinely impressive.", author: "Efua Boateng", role: "Parent, Achimota School", initials: "EB", color: "#F59E0B" },
  ],
  pricing: {
    ratePerStudentPerMonth: 4,
    currency: "GHS",
    headline: "GHS 4 per student, per month.",
    subheadline: "Every feature. Every school. One simple rate. Pay by MoMo or bank transfer once your school is approved.",
    bullets: [
      "No setup fees, no hidden charges",
      "Every feature unlocked from day one",
      "Pay by MoMo or bank transfer",
      "Cancel any time — no contract",
    ],
    examples: [
      { students: 50,  bill: "GHS 200 / month" },
      { students: 100, bill: "GHS 400 / month" },
      { students: 250, bill: "GHS 1,000 / month" },
      { students: 500, bill: "GHS 2,000 / month" },
    ],
  },
  footerTagline: "A school management platform built specifically for schools in Ghana and across West Africa.",
  footerLinks: [
    { label: 'Features', url: '#features' },
    { label: 'Pricing', url: '#plans' },
  ],
  socialLinks: [],
  footerCopyright: '© 2026 Goreb. All rights reserved.',
  theme: DEFAULT_THEME,
  // Legal documents will be fetched dynamically
  legalLinks: [
    { label: 'Privacy Policy', path: '/legal/privacy' },
    { label: 'Terms of Service', path: '/legal/terms' },
    { label: 'Cookie Policy', path: '/legal/cookie' },
    { label: 'GDPR Compliance', path: '/legal/gdpr' },
  ]
};

function useLandingContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await getLandingPageContent();
        
        if (response?.success && response?.content) {
          const mergedContent = { ...DEFAULT_CONTENT, ...response.content };
          mergedContent.theme = { ...DEFAULT_THEME, ...(response.content.theme || {}) };

          if (mergedContent.footerLinks && !Array.isArray(mergedContent.footerLinks)) {
            mergedContent.footerLinks = DEFAULT_CONTENT.footerLinks;
          }

          // Ensure pricing object exists and merges cleanly with defaults
          if (!mergedContent.pricing || typeof mergedContent.pricing !== 'object') {
            mergedContent.pricing = DEFAULT_CONTENT.pricing;
          } else {
            mergedContent.pricing = { ...DEFAULT_CONTENT.pricing, ...mergedContent.pricing };
            if (!Array.isArray(mergedContent.pricing.bullets)) {
              mergedContent.pricing.bullets = DEFAULT_CONTENT.pricing.bullets;
            }
            if (!Array.isArray(mergedContent.pricing.examples)) {
              mergedContent.pricing.examples = DEFAULT_CONTENT.pricing.examples;
            }
          }
          
          if (mergedContent.stats && Array.isArray(mergedContent.stats)) {
            mergedContent.stats = mergedContent.stats.map((item, index) => ({
              ...item,
              id: item.id || `stat-${index}`
            }));
          }
          
          if (mergedContent.testimonials && Array.isArray(mergedContent.testimonials)) {
            mergedContent.testimonials = mergedContent.testimonials.map((item, index) => ({
              ...item,
              id: item.id || `testimonial-${index}`
            }));
          }

          // Ensure legalLinks exists
          if (!mergedContent.legalLinks || !Array.isArray(mergedContent.legalLinks)) {
            mergedContent.legalLinks = DEFAULT_CONTENT.legalLinks;
          }
          
          setContent(mergedContent);
        } else {
          // Fallback to localStorage
          try {
            const saved = JSON.parse(localStorage.getItem('landingContent') || '{}');
            if (Object.keys(saved).length > 0) {
              setContent(prev => ({ ...prev, ...saved }));
            }
          } catch { /* ignore */ }
        }
      } catch (err) {
        console.error('Failed to fetch landing content:', err);
        setError(err);
        
        // Fallback to localStorage on error
        try {
          const saved = JSON.parse(localStorage.getItem('landingContent') || '{}');
          if (Object.keys(saved).length > 0) {
            setContent(prev => ({ ...prev, ...saved }));
          }
        } catch { /* ignore */ }
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return { content, loading, error };
}

export default function LandingPage() {
  // `content` already starts as DEFAULT_CONTENT (below) and the real CMS
  // content silently replaces it once the fetch resolves — the page never
  // needs to block on `loading` at all, it just re-renders in place.
  const { content: c, error } = useLandingContent();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);
  const [showTalkToTeam, setShowTalkToTeam] = useState(false);
  const theme = c.theme || DEFAULT_THEME;
  const testimonials = c.testimonials || [];

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', theme.primaryColor || '#4F46E5');
    root.style.setProperty('--brand-secondary', theme.secondaryColor || '#1A3C5E');
    root.style.setProperty('--brand-accent', theme.accentColor || '#F59E0B');
    root.style.setProperty('--brand-font', theme.fontFamily || 'Inter');
    if (theme.logoUrl) {
      root.style.setProperty('--brand-logo-url', `url('${theme.logoUrl}')`);
    }
  }, [theme]);

  // Detect platform
  const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandaloneMode = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  useEffect(() => {
    if (isInStandaloneMode()) { setIsInstalled(true); return; }
    const handleBefore = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handleBefore);
    window.addEventListener('appinstalled', () => setIsInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handleBefore);
  }, []);

  // Scroll-triggered reveal for below-fold elements
  useEffect(() => {
    const els = document.querySelectorAll('.lp-reveal');
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [testimonials.length]);

  const handleInstallClick = async () => {
    if (isInstalled) return;
    if (isIos()) { setShowIosInstructions(true); return; }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else { setShowIosInstructions(true); }
  };

  // Show error state but still render with defaults
  if (error) {
    console.warn('Using default content due to error:', error);
  }

  // Ensure we have arrays with unique keys
  const stats = c.stats || [];
  const schools = c.schools || [];
  const legalLinks = c.legalLinks || [
    { label: 'Privacy Policy', path: '/legal/privacy' },
    { label: 'Terms of Service', path: '/legal/terms' },
    { label: 'Cookie Policy', path: '/legal/cookie' },
    { label: 'GDPR Compliance', path: '/legal/gdpr' },
  ];
  const footerLinks = c.footerLinks || DEFAULT_CONTENT.footerLinks;
  const socialLinks = c.socialLinks || [];
  const footerCopyright =  '© 2026 Goreb. All rights reserved.';
  const pricing = c.pricing || DEFAULT_CONTENT.pricing;

  return (
    <div className="landing-page min-h-screen bg-white">
      <div className="gl-top" style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: C.paper, color: C.black }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap');
          .gl-top h1 { font-family: 'Instrument Serif', Georgia, serif; font-weight: 400; letter-spacing: -.025em; }
          .gl-spin { animation: gl-rot 28s linear infinite; }
          @keyframes gl-rot { to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { .gl-top *, .gl-spin { animation: none !important; transition: none !important; } }
        `}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 px-5 pt-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <GraduationCap size={22} strokeWidth={2} />
            <span className="text-xl font-semibold tracking-tight">Goreb</span>
          </Link>
          <div className="hidden items-center gap-1 rounded-full p-1 md:flex" style={glass} role="navigation" aria-label="Main">
            {[
              ['Features', '#features'],
              ['How it works', '#how'],
              ['Pricing', '#plans'],
              ['Reviews', '#testimonials'],
            ].map(([label, href]) => (
              <a key={href} href={href} className="rounded-full px-4 py-2 text-sm hover:bg-white/80">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden text-sm sm:block">Sign in</Link>
            <Link to="/register" className={`${heroButton} !py-2.5 !text-sm`} style={{ background: C.primary, color: C.white }}>
              {c.heroPrimaryBtn || 'Book a Demo'} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-16 pt-14 text-center md:pt-16">
        <svg className="gl-spin absolute right-6 top-10 hidden h-28 w-28 md:block" viewBox="0 0 120 120" aria-hidden="true">
          <defs><path id="gl-circ" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
          <text fontSize="9.5" letterSpacing="3.2" fill={C.black}><textPath href="#gl-circ">A MORE ORGANISED SCHOOL · EVERY TERM ·</textPath></text>
        </svg>
        <Sparkle className="absolute right-[3.75rem] top-[4.75rem] hidden md:block" size={22} fill={C.black} aria-hidden="true" />

        <h1 className="mx-auto max-w-4xl text-[56px] leading-[.95] sm:text-7xl md:text-[104px]">
          {c.heroHeadline}<br /><em>{c.heroHeadlineHighlight}</em>
        </h1>
        <p className="mx-auto mt-6 max-w-md text-[17px] leading-relaxed" style={{ color: C.mute }}>{c.heroSubtitle}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/register" className={heroButton} style={{ background: C.primary, color: C.white }}>
            {c.heroPrimaryBtn || 'Book a Demo'} <ArrowUpRight size={16} />
          </Link>
          <a href="#features" className={`${heroButton} border border-black/10`} style={{ background: C.white }}>
            <span className="grid h-6 w-6 place-items-center rounded-full" style={{ background: C.black }}>
              <Play size={11} color="#fff" fill="#fff" />
            </span>
            See how it works
          </a>
        </div>

        <div className="relative mx-auto mt-10 h-[500px] max-w-5xl md:h-[560px]">
          <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 1000 560" fill="none" aria-hidden="true">
            <path d="M200 120 C 210 330, 330 430, 440 440" stroke="#0003" />
            <path d="M800 190 C 790 330, 700 420, 600 440" stroke="#0003" />
          </svg>

          {c.heroImageUrl ? (
            <img src={c.heroImageUrl} alt="" className="absolute bottom-0 left-1/2 h-full -translate-x-1/2 object-contain object-bottom" />
          ) : (
            <div className="absolute bottom-0 left-1/2 grid h-[420px] w-[270px] -translate-x-1/2 place-items-center rounded-t-[999px] md:h-[500px] md:w-[360px]"
              style={{ background: 'linear-gradient(180deg,#4F46E5 0%,#1A3C5E 85%)' }}>
              <GraduationCap size={96} color="#fff" strokeWidth={1} style={{ opacity: .35 }} />
            </div>
          )}

          {[
            { title: 'Scores', description: 'Totals and grades, automatic.', Icon: ClipboardCheck, background: C.lime, position: 'left-2 top-[34%] md:left-[22%]', rotation: '-6deg' },
            { title: 'Attendance', description: 'Marked daily, per class.', Icon: CalendarCheck, background: '#C7D2FE', position: 'right-2 top-[48%] md:right-[18%] md:top-[44%]', rotation: '5deg' },
            { title: 'Reports', description: 'PDFs out to parents.', Icon: FileText, background: '#FDE68A', position: 'left-6 top-[66%] md:left-[30%] md:top-[62%]', rotation: '-3deg' },
          ].map(({ title, description, Icon, background, position, rotation }) => (
            <div key={title} className={`absolute flex items-center gap-3 rounded-2xl px-4 py-3 text-left ${position}`} style={{ ...glass, transform: `rotate(${rotation})` }}>
              <span className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: background }}><Icon size={18} /></span>
              <span>
                <span className="block text-[15px] font-medium">{title}</span>
                <span className="block text-xs" style={{ color: C.mute }}>{description}</span>
              </span>
            </div>
          ))}

          <div className="absolute left-0 top-4 hidden w-56 rounded-3xl p-5 text-left md:block" style={{ ...glass, transform: 'rotate(-5deg)' }}>
            <Users size={18} />
            <p className="mt-4 text-lg font-medium leading-tight">Turn marks into report cards.</p>
            <p className="mt-1 text-sm" style={{ color: C.mute }}>Enter scores once. Reports build themselves.</p>
          </div>
          <div className="absolute right-0 top-14 hidden w-56 rounded-3xl p-5 text-left md:block" style={{ ...glass, transform: 'rotate(5deg)' }}>
            <div className="flex -space-x-2" aria-hidden="true">
              {['AK', 'PM', 'ES'].map((initials) => (
                <span key={initials} className="grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-medium" style={{ background: C.beige }}>{initials}</span>
              ))}
            </div>
            <p className="mt-4 text-lg font-medium leading-tight">Parents informed, same day.</p>
            <p className="mt-1 text-sm" style={{ color: C.mute }}>Reports open on any phone.</p>
          </div>

          <div className="absolute bottom-2 left-0 hidden text-left text-sm md:block" style={{ color: C.mute }}>
            <span className="mb-3 block h-px w-8 bg-black/30" />{c.heroTrustText}
          </div>
          <div className="absolute bottom-6 right-0 hidden text-left text-sm md:block" style={{ color: C.mute }}>
            <Sparkle size={16} fill={C.black} color={C.black} className="mb-2" />Less chaos.<br />More clarity.
          </div>
        </div>
      </section>
      </div>

      {/* LOGOS */}
      <div className="logos-section">
        <div className="logos-inner">
          <p className="logos-label">Schools that run on Goreb</p>
          <div className="marquee-wrapper">
            <div className="marquee-track">
              {[...schools, ...schools].map((s, index) => (
                <div key={`school-${index}`} className="school-name-pill" style={{flexShrink:0}}>
                  <span className="dot"></span>{s}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-label lp-reveal">Platform capabilities</div>
        <h2 className="section-h2 lp-reveal" style={{animationDelay:'0.05s'}}>Everything a school needs. Nothing it doesn't.</h2>
        <p className="section-sub lp-reveal" style={{animationDelay:'0.1s'}}>From student admission to end-of-term report cards — every workflow is connected, every role has the right access.</p>
        <div className="features-grid">
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.05s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feature-title">Student management</div>
            <div className="feature-desc">Admit students with photos, bulk-import via CSV, track transfers and withdrawals. Full academic history per student.</div>
          </div>
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.12s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="feature-title">Scores & grading</div>
            <div className="feature-desc">Teachers enter CA1, CA2, CA3, and exam scores. Totals and letter grades compute automatically with one click.</div>
          </div>
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.19s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="feature-title">Daily attendance</div>
            <div className="feature-desc">Mark present, absent, or late for every student per class per day. Bulk mark, summary charts, and analytics all included.</div>
          </div>
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.26s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="feature-title">Term report cards</div>
            <div className="feature-desc">Generate PDF report cards automatically. Approve, release, and email them to parents — or download the full class as a ZIP.</div>
          </div>
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.33s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1-4 10z"/>
              </svg>
            </div>
            <div className="feature-title">Multi-role access</div>
            <div className="feature-desc">School admins, class teachers, subject teachers, parents, and students each see only what they need. Role-based from the ground up.</div>
          </div>
          <div className="feature-card lp-reveal" style={{transitionDelay:'0.40s'}}>
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
                <line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/>
              </svg>
            </div>
            <div className="feature-title">Analytics dashboard</div>
            <div className="feature-desc">Enrollment trends, attendance rates, score distributions, and gender breakdowns — all visualised in real time for administrators.</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <div className="how-inner">
          <div className="section-label lp-reveal">How it works</div>
          <h2 className="section-h2 lp-reveal" style={{transitionDelay:'0.05s'}}>Up and running in under a day.</h2>
          <p className="section-sub lp-reveal" style={{transitionDelay:'0.1s'}}>No lengthy onboarding. No IT department required. Book a demo to set up your school and start the term.</p>
          <div className="steps-grid">
            <div className="step lp-reveal" data-n="1" style={{transitionDelay:'0.05s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div className="step-title">Book a demo & onboard</div>
              <div className="step-desc">Set up your school profile, upload a logo, and configure your first academic term.</div>
            </div>
            <div className="step lp-reveal" data-n="2" style={{transitionDelay:'0.15s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="step-title">Add staff & students</div>
              <div className="step-desc">Create teacher accounts, bulk-import students from a spreadsheet, and link guardians.</div>
            </div>
            <div className="step lp-reveal" data-n="3" style={{transitionDelay:'0.25s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="step-title">Record scores & attendance</div>
              <div className="step-desc">Teachers enter CA scores and mark attendance daily. Grades compute automatically at term end.</div>
            </div>
            <div className="step lp-reveal" data-n="4" style={{transitionDelay:'0.35s'}}>
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div className="step-title">Release report cards</div>
              <div className="step-desc">Generate, approve, and email PDF reports to parents — or download the full class in one ZIP file.</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="stats-band">
        <div className="stats-band-inner">
          {stats.map((s, index) => (
            <div key={s.id || `stat-${index}`} className="lp-count-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="stat-number">{s.number}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-inner">
          <div style={{textAlign:'center', marginBottom:'56px'}}>
            <div className="section-label lp-reveal" style={{textAlign:'center'}}>What schools say</div>
            <h2 className="section-h2 lp-reveal" style={{maxWidth:'500px', margin:'0 auto', transitionDelay:'0.05s'}}>Real feedback from real administrators</h2>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, index) => (
              <div key={t.id || `testimonial-${index}`} className="testimonial-card lp-reveal" style={{transitionDelay:`${0.08 * index}s`}}>
                <div className="testimonial-stars">
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{background: t.color || '#4F46E5'}}>{t.initials || t.author?.charAt(0) || 'U'}</div>
                  <div>
                    <div className="author-name">{t.author}</div>
                    <div className="author-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="plans-section" id="plans">
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <div className="section-label lp-reveal" style={{textAlign:'center'}}>Pricing</div>
          <h2 className="section-h2 lp-reveal" style={{maxWidth:'520px', margin:'0 auto', transitionDelay:'0.05s'}}>
            {pricing.headline}
          </h2>
          <p className="section-sub lp-reveal" style={{maxWidth:'440px', margin:'16px auto 0', transitionDelay:'0.1s'}}>
            {pricing.subheadline}
          </p>
        </div>

        <div className="plans-grid lp-reveal" style={{gridTemplateColumns: '1fr', maxWidth: '640px', margin: '0 auto', transitionDelay:'0.15s'}}>
          <div className="plan-card featured" style={{textAlign: 'center'}}>
            <div className="plan-badge">Simple pricing</div>
            <div className="plan-price" style={{fontSize:'56px', lineHeight:1}}>
              {pricing.currency} {pricing.ratePerStudentPerMonth}
              <span style={{fontSize:'18px', opacity:0.7}}> / student / month</span>
            </div>
            <div className="plan-desc" style={{marginTop:'12px'}}>
              Every feature included. No tiers. No upsells.
            </div>

            <ul className="plan-features" style={{textAlign:'left', marginTop:'24px'}}>
              {pricing.bullets.map((b, i) => (
                <li key={`pricing-bullet-${i}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {b}
                </li>
              ))}
            </ul>

            <Link
              to="/register"
              className="btn-plan btn-plan-solid"
              style={{textDecoration:'none', display:'block', textAlign:'center', marginTop:'20px'}}
            >
              Book a Demo
            </Link>
          </div>
        </div>

        {/* Example bills */}
        {pricing.examples && pricing.examples.length > 0 && (
          <div style={{maxWidth:'640px', margin:'40px auto 0', textAlign:'center'}}>
            <p style={{
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#94A3B8',
              marginBottom: '16px'
            }}>
              What that looks like
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px'
            }}>
              {pricing.examples.map((ex, i) => (
                <div
                  key={`pricing-example-${i}`}
                  style={{
                    border: '1px solid #E2E8F0',
                    borderRadius: '12px',
                    padding: '16px 12px',
                    background: '#F8FAFC'
                  }}
                >
                  <div style={{fontSize: '12px', color: '#64748B'}}>{ex.students} students</div>
                  <div style={{fontSize: '14px', fontWeight: 600, color: '#0F172A', marginTop: '4px'}}>{ex.bill}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-slate-500" style={{marginTop: '32px', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto'}}>
          Register free. Add your students. Pay by MoMo or bank transfer — we verify your payment within 24 hours.
        </p>
      </section>

      {/* CTA STRIP */}
      <section style={{background:'var(--bg)', padding:'1px 0'}}>
        <div className="cta-strip">
          <div className="section-label" style={{textAlign:'center'}}>Get started today</div>
          <h2 className="section-h2">Your school deserves better than spreadsheets.</h2>
          <p className="section-sub">Register in five minutes. No card required — pay by MoMo or bank transfer when you're ready.</p>
          <div className="cta-buttons">
            <Link to="/register" className="btn-hero-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
              {c.heroPrimaryBtn || "Book a Demo"}
            </Link>
            <button type="button" onClick={() => setShowTalkToTeam(true)} className="btn-hero-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Talk to the team
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <Link to="/" className="logo">
                <div className="logo-mark">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                </div>
                <span className="logo-name">Goreb</span>
              </Link>
              <p className="footer-tagline">{c.footerTagline}</p>
              {socialLinks.length > 0 && (
                <div className="mt-4 flex gap-3 text-sm text-gray-500">
                  {socialLinks.map((link, index) => (
                    <a key={`${link.platform || 'social'}-${index}`} href={link.url || '#'} target="_blank" rel="noreferrer" className="hover:text-indigo-600">
                      {link.platform || 'Link'}
                    </a>
                  ))}
                </div>
              )}
              <button 
                onClick={handleInstallClick}
                disabled={isInstalled}
                className="mt-6 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors px-4 py-2 rounded-lg font-medium text-sm w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ border: '1px solid #e0e7ff', cursor: isInstalled ? 'not-allowed' : 'pointer' }}
              >
                {isInstalled ? (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    App Installed
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    {isIos() ? 'Add to Home Screen' : 'Install Web App'}
                  </>
                )}
              </button>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                {footerLinks.map((link, index) => (
                  <li key={`footer-link-${index}`}>
                    {link.url?.startsWith('#') ? <a href={link.url}>{link.label}</a> : <Link to={link.url || '/'}>{link.label}</Link>}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-links">
                <li><Link to="/docs">Documentation</Link></li>
                <li>
                  <button
                    type="button"
                    onClick={() => setShowTalkToTeam(true)}
                    className="bg-transparent border-none p-0 cursor-pointer text-left"
                    style={{ fontSize: '13px', color: '#475569', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#94A3B8'}
                    onMouseLeave={e => e.currentTarget.style.color = '#475569'}
                  >
                    Contact us
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                {legalLinks.map((link, index) => (
                  <li key={`legal-${index}`}>
                    <Link to={link.path}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>{footerCopyright}</span>
            <span>Made with care for African schools.</span>
          </div>
        </div>
      </footer>

      {/* iOS Install Instructions Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0" onClick={() => setShowIosInstructions(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="h-4 w-4"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
                </div>
                <span className="font-bold text-gray-900">Install Goreb</span>
              </div>
              <button onClick={() => setShowIosInstructions(false)} className="text-gray-400 hover:text-gray-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            {isIos() ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 font-medium">To install on your iPhone or iPad:</p>
                <div className="space-y-2">
                  {[
                    { step: '1', text: 'Open this page in Safari (not Chrome)' },
                    { step: '2', text: 'Tap the Share button at the bottom of the screen' },
                    { step: '3', text: 'Scroll down and tap "Add to Home Screen"' },
                    { step: '4', text: 'Tap "Add" to confirm' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="h-6 w-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                      <p className="text-sm text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">The app is either already installed or your browser doesn't support automatic installation.</p>
                <p className="text-sm text-gray-600">To install manually in Chrome:</p>
                <div className="space-y-2">
                  {[
                    { step: '1', text: 'Click the menu (⋮) in the top-right of Chrome' },
                    { step: '2', text: 'Select "Install Goreb" or "Add to Home Screen"' },
                    { step: '3', text: 'Click "Install" to confirm' },
                  ].map(({ step, text }) => (
                    <div key={step} className="flex items-start gap-3">
                      <span className="h-6 w-6 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{step}</span>
                      <p className="text-sm text-gray-700">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={() => setShowIosInstructions(false)} className="mt-5 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Got it
            </button>
          </div>
        </div>
      )}

           {/* Talk to the Team Modal */}
      {showTalkToTeam && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowTalkToTeam(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto overscroll-contain p-5 sm:p-7 relative"
            style={{ maxHeight: '85dvh' }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTalkToTeam(false)}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-white/90 backdrop-blur rounded-full p-1 text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>

            <h3 className="text-lg font-bold text-gray-900 pr-6">Talk to the Goreb Team</h3>
            <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">
              Have questions, want a demo, or want to see how Goreb can work for your school? Our team is ready to help.
            </p>

            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-5 mb-3">How would you like to reach us?</p>

            <div className="space-y-3">
              <ContactOption
                icon={MessageCircle}
                title="Chat on WhatsApp"
                desc="Get a quick response from our team directly on WhatsApp."
                cta="Chat on WhatsApp"
                href="https://wa.me/233504686941?text=Hi%2C%20I%27d%20like%20to%20know%20more%20about%20Goreb"
              />
              <ContactOption
                icon={Calendar}
                title="Book a Demo"
                desc="Schedule a live walkthrough of Goreb with our team via WhatsApp."
                cta="Book a Demo"
                href="https://wa.me/233504686941?text=Hi%20Goreb%20team%2C%20I%27d%20like%20to%20book%20a%20demo%20for%20my%20school."
              />
              <ContactOption
                icon={Phone}
                title="Call the Team"
                desc="Speak directly with someone from Goreb (0504686941)."
                cta="Call Us"
                href="tel:0504686941"
              />
              <ContactOption
                icon={Mail}
                title="Send us an Email"
                desc="Send us your questions or requirements."
                cta="Email Us"
                href="mailto:support@eduportal.com?subject=Inquiry%20about%20Goreb"
              />
            </div>

            <p className="text-xs text-gray-500 text-center mt-5">
              We'll be happy to answer your questions and help you get started.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactOption({ icon: Icon, title, desc, cta, href }) {
  return (
    <div className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <Icon className="h-5 w-5 text-indigo-600" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
      </div>
      <a
        href={href}
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        className="flex-shrink-0 text-center text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
      >
        {cta}
      </a>
    </div>
  );
}