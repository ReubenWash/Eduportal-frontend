import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

// ── Default landing page content ─────────────────────────────────────────
// AdminCMS (Super Admin → Website CMS) writes to localStorage under 'landingContent'.
// If no overrides exist, these defaults are used.
const DEFAULT_CONTENT = {
  heroHeadline: "Run your school.",
  heroHeadlineHighlight: "Not paperwork.",
  heroSubtitle: "EduPortal gives school administrators, teachers, and parents one place to manage students, scores, attendance, and term reports — without the spreadsheets.",
  heroPrimaryBtn: "Register your school",
  heroTrustText: "Trusted by 200+ schools across Ghana, Nigeria & Kenya",
  stats: [
    { number: "200+", label: "Schools registered" },
    { number: "84K",  label: "Students managed" },
    { number: "1.2M", label: "Reports generated" },
    { number: "99.9%", label: "Platform uptime" },
  ],
  schools: ["Accra Academy", "Presec Legon", "Wesley Girls", "Achimota School", "Aburi Girls", "Holy Child"],
  testimonials: [
    { quote: "We used to spend three weeks compiling report cards. With EduPortal, the whole process takes two days. Teachers submit scores, I approve, and parents get a PDF. That's it.", author: "Abena Owusu", role: "Headmistress, Holy Child School", initials: "AO", color: "#4F46E5" },
    { quote: "The attendance analytics alone are worth it. I can see which classes have the worst absenteeism and act on it before the term ends — not after.", author: "Kwame Darko", role: "Deputy Head, Presec Legon", initials: "KD", color: "#10B981" },
    { quote: "As a parent, I used to wait weeks to find out how my daughter was doing. Now I get her report on my phone the same day results are released. Genuinely impressive.", author: "Efua Boateng", role: "Parent, Achimota School", initials: "EB", color: "#F59E0B" },
  ],
  plans: [
    { name: "Basic",    price: "Free",     period: "/ term", desc: "For small schools getting started. Up to 150 students.", popular: false, features: ["Up to 150 students", "Scores & grading", "Attendance tracking", "PDF report cards"], disabled: ["Analytics dashboard", "Email reports to parents"] },
    { name: "Standard", price: "GHS 299",  period: "/ term", desc: "For growing schools. Up to 800 students, full feature set.", popular: true, features: ["Up to 800 students", "Scores & grading", "Attendance tracking", "PDF report cards", "Analytics dashboard", "Email reports to parents"], disabled: [] },
    { name: "Premium",  price: "GHS 599",  period: "/ term", desc: "For large institutions. Unlimited students, priority support.", popular: false, features: ["Unlimited students", "Everything in Standard", "Bulk import & export", "Priority email support", "Custom report branding", "Dedicated account manager"], disabled: [] },
  ],
  footerTagline: "A school management platform built specifically for schools in Ghana and across West Africa.",
};

function useLandingContent() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('landingContent') || '{}');
      setContent(prev => ({ ...prev, ...saved }));
    } catch { /* ignore parse errors */ }
  }, []);
  return content;
}

export default function LandingPage() {
  const c = useLandingContent();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosInstructions, setShowIosInstructions] = useState(false);

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

  const handleInstallClick = async () => {
    if (isInstalled) return;
    if (isIos()) { setShowIosInstructions(true); return; }
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else { setShowIosInstructions(true); }
  };

  return (
    <div className="landing-page min-h-screen bg-white">
      {/* NAV */}
      <nav>
        <div className="nav-inner">
          <Link to="/" className="logo">
            <div className="logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span className="logo-name">EduPortal</span>
          </Link>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#plans">Pricing</a></li>
            <li><a href="#testimonials">Reviews</a></li>
          </ul>
          <div className="nav-actions">
            <Link to="/login"><button className="btn-ghost">Sign in</button></Link>
            <Link to="/login" className="btn-primary">
              Get started
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section>
        <div className="hero">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              Built for African schools
            </div>
            <h1 className="hero-h1">{c.heroHeadline}<br /><span>{c.heroHeadlineHighlight}</span></h1>
            <p className="hero-sub">{c.heroSubtitle}</p>
            <div className="hero-cta">
              <Link to="/login" className="btn-hero-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                Register your school
              </Link>
              <a href="#features" className="btn-hero-secondary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
                See how it works
              </a>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                <div className="trust-avatar" style={{background:'#4F46E5'}}>AK</div>
                <div className="trust-avatar" style={{background:'#10B981'}}>PM</div>
                <div className="trust-avatar" style={{background:'#F59E0B'}}>ES</div>
                <div className="trust-avatar" style={{background:'#EF4444'}}>NB</div>
              </div>
              {c.heroTrustText}
            </div>
          </div>
          <div className="hero-visual">
            <div style={{position: 'relative', padding: '24px'}}>
              <div className="dashboard-card">
                <div className="dash-header">
                  <div className="dash-dot" style={{background:'#EF4444'}}></div>
                  <div className="dash-dot" style={{background:'#F59E0B'}}></div>
                  <div className="dash-dot" style={{background:'#10B981'}}></div>
                  <span>Term 2 · 2024/2025</span>
                </div>
                <div className="dash-body">
                  <div className="dash-stats">
                    <div className="dash-stat">
                      <div className="dash-stat-label">Students</div>
                      <div className="dash-stat-value">847</div>
                      <div className="dash-stat-sub">+12 this term</div>
                    </div>
                    <div className="dash-stat">
                      <div className="dash-stat-label">Attendance</div>
                      <div className="dash-stat-value">94%</div>
                      <div className="dash-stat-sub">Above target</div>
                    </div>
                    <div className="dash-stat">
                      <div className="dash-stat-label">Reports</div>
                      <div className="dash-stat-value">312</div>
                      <div className="dash-stat-sub">86 pending</div>
                    </div>
                  </div>
                  <div className="dash-section-label">Recent submissions</div>
                  <table className="dash-table">
                    <tbody>
                      <tr>
                        <td>Kofi Mensah — JHS2A</td>
                        <td><span className="dash-badge badge-green">Approved</span></td>
                      </tr>
                      <tr>
                        <td>Ama Osei — JHS1B</td>
                        <td><span className="dash-badge badge-amber">Pending</span></td>
                      </tr>
                      <tr>
                        <td>Kweku Asante — JHS3A</td>
                        <td><span className="dash-badge badge-blue">Released</span></td>
                      </tr>
                      <tr>
                        <td>Efua Boateng — JHS1A</td>
                        <td><span className="dash-badge badge-green">Approved</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="float-card float-card-left">
                <div className="float-icon float-icon-green">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div>
                  <div className="float-text-label">Reports released</div>
                  <div className="float-text-value">226 / 312</div>
                </div>
              </div>
              <div className="float-card float-card-right">
                <div className="float-icon float-icon-indigo">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div className="float-text-label">Active teachers</div>
                  <div className="float-text-value">38 online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOGOS */}
      <div className="logos-section">
        <div className="logos-inner">
          <p className="logos-label">Schools that run on EduPortal</p>
          <div className="logos-row">
            {c.schools.map(s => <div key={s} className="school-name-pill"><span className="dot"></span>{s}</div>)}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <section className="features-section" id="features">
        <div className="section-label">Platform capabilities</div>
        <h2 className="section-h2">Everything a school needs. Nothing it doesn't.</h2>
        <p className="section-sub">From student admission to end-of-term report cards — every workflow is connected, every role has the right access.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="feature-title">Student management</div>
            <div className="feature-desc">Admit students with photos, bulk-import via CSV, track transfers and withdrawals. Full academic history per student.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="feature-title">Scores & grading</div>
            <div className="feature-desc">Teachers enter CA1, CA2, CA3, and exam scores. Totals and letter grades compute automatically with one click.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <div className="feature-title">Daily attendance</div>
            <div className="feature-desc">Mark present, absent, or late for every student per class per day. Bulk mark, summary charts, and analytics all included.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            </div>
            <div className="feature-title">Term report cards</div>
            <div className="feature-desc">Generate PDF report cards automatically. Approve, release, and email them to parents — or download the full class as a ZIP.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10 15.3 15.3 0 0 1-4 10z"/>
              </svg>
            </div>
            <div className="feature-title">Multi-role access</div>
            <div className="feature-desc">School admins, class teachers, subject teachers, parents, and students each see only what they need. Role-based from the ground up.</div>
          </div>
          <div className="feature-card">
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
          <div className="section-label">How it works</div>
          <h2 className="section-h2">Up and running in under a day.</h2>
          <p className="section-sub">No lengthy onboarding. No IT department required. Register your school and start the term.</p>
          <div className="steps-grid">
            <div className="step" data-n="1">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div className="step-title">Register your school</div>
              <div className="step-desc">Set up your school profile, upload a logo, and configure your first academic term.</div>
            </div>
            <div className="step" data-n="2">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="step-title">Add staff & students</div>
              <div className="step-desc">Create teacher accounts, bulk-import students from a spreadsheet, and link guardians.</div>
            </div>
            <div className="step" data-n="3">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              <div className="step-title">Record scores & attendance</div>
              <div className="step-desc">Teachers enter CA scores and mark attendance daily. Grades compute automatically at term end.</div>
            </div>
            <div className="step" data-n="4">
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
          {c.stats.map(s => (
            <div key={s.label}>
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
            <div className="section-label" style={{textAlign:'center'}}>What schools say</div>
            <h2 className="section-h2" style={{maxWidth:'500px', margin:'0 auto'}}>Real feedback from real administrators</h2>
          </div>
          <div className="testimonials-grid">
            {c.testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[1,2,3,4,5].map(n => (
                    <svg key={n} viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                  ))}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="author-avatar" style={{background: t.color}}>{t.initials}</div>
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

      {/* PLANS */}
      <section className="plans-section" id="plans">
        <div style={{textAlign:'center', marginBottom:'56px'}}>
          <div className="section-label" style={{textAlign:'center'}}>Pricing</div>
          <h2 className="section-h2" style={{maxWidth:'480px', margin:'0 auto'}}>Simple pricing. No hidden fees.</h2>
          <p className="section-sub" style={{maxWidth:'400px', margin:'16px auto 0'}}>Pay per term or annually. Cancel any time.</p>
        </div>
        <div className="plans-grid">
          {c.plans.map((plan, i) => (
            <div key={plan.name} className={`plan-card ${plan.popular ? 'featured' : ''}`}>
              {plan.popular && <div className="plan-badge">Most popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price} <span>{plan.period}</span></div>
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-features">
                {plan.features.map(f => (
                  <li key={f}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
                {plan.disabled && plan.disabled.map(f => (
                  <li key={f} className="dim">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className={`btn-plan ${plan.popular ? 'btn-plan-solid' : 'btn-plan-outline'}`} style={{textDecoration:'none', display:'block', textAlign:'center'}}>
                {plan.name === 'Basic' ? 'Get started free' : plan.name === 'Standard' ? 'Start free trial' : 'Contact sales'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section style={{background:'var(--bg)', padding:'1px 0'}}>
        <div className="cta-strip">
          <div className="section-label" style={{textAlign:'center'}}>Get started today</div>
          <h2 className="section-h2">Your school deserves better than spreadsheets.</h2>
          <p className="section-sub">Register in five minutes. No credit card required for the Basic plan.</p>
          <div className="cta-buttons">
            <Link to="/login" className="btn-hero-primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
              Register your school
            </Link>
            <a href="#features" className="btn-hero-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Talk to the team
            </a>
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
                <span className="logo-name">EduPortal</span>
              </Link>
              <p className="footer-tagline">{c.footerTagline}</p>
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
                <li><a href="#features">Features</a></li>
                <li><a href="#plans">Pricing</a></li>
                <li><Link to="/changelog">Changelog</Link></li>
                <li><Link to="/roadmap">Roadmap</Link></li>
                <li><Link to="/team">Team</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Support</div>
              <ul className="footer-links">
                <li><Link to="/docs">Documentation</Link></li>
                <li><Link to="/contact">Contact us</Link></li>
                <li><Link to="/status">Status</Link></li>
                <li><Link to="/community">Community</Link></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Legal</div>
              <ul className="footer-links">
                <li><Link to="/privacy">Privacy policy</Link></li>
                <li><Link to="/terms-of-service">Terms of service</Link></li>
                <li><Link to="/data">Data processing</Link></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2025 EduPortal. All rights reserved.</span>
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
                <span className="font-bold text-gray-900">Install EduPortal</span>
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
                    { step: '2', text: 'Select "Install EduPortal" or "Add to Home Screen"' },
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
    </div>
  );
}