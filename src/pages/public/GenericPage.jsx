import { Link, useLocation } from 'react-router-dom';

// ─── Page Content ────────────────────────────────────────────────
const PAGES = {
  '/changelog': {
    title: 'Changelog', subtitle: 'Stay up to date with every improvement we ship.',
    icon: '📋', color: 'indigo',
    sections: [
      { heading: 'v1.2.0 — July 2026', badge: 'Latest', badgeColor: 'emerald', items: [
        'Added Super Admin broadcast system with email, in-app, push, and SMS channels.',
        'New public pages (Team, Docs, Status, Community) now editable from the CMS dashboard.',
        'PWA support added — install EduPortal on Android, iOS, and Desktop.',
        'Fixed React error #31 in Enrollments and Table components.',
        'Removed all console.log credential leaks from the auth flow.',
      ]},
      { heading: 'v1.1.0 — June 2026', badge: 'Stable', badgeColor: 'indigo', items: [
        'Introduced role-based dashboards for Super Admin, School Admin, Teacher, Parent, and Student.',
        'Class management with full CRUD — create, edit, and delete classes.',
        'Email template editor with Visual and HTML modes.',
        'Subscription plan management — create, edit, and delete plans from the admin panel.',
        'School edit modal — update name, email, plan, and status directly from the admin.',
      ]},
      { heading: 'v1.0.0 — May 2026', badge: 'Initial Release', badgeColor: 'gray', items: [
        'Initial launch of EduPortal SaaS platform.',
        'Core modules: Students, Staff, Guardians, Classes, Subjects, Enrollments, Scores, Attendance.',
        'Parent Portal and Student Portal with read-only views.',
        'SMTP email integration and notification center.',
        'Secure JWT authentication with refresh token support.',
      ]},
    ]
  },
  '/roadmap': {
    title: 'Roadmap', subtitle: "What we're building next for EduPortal.",
    icon: '🗺️', color: 'violet',
    sections: [
      { heading: 'Q3 2026 — In Progress', badge: 'Now', badgeColor: 'amber', items: [
        'Mobile App for Android and iOS (React Native).',
        'AI-powered student performance predictions and early warning alerts.',
        'Bulk data import via Excel/CSV for students and staff.',
        'Multi-language support: English, French, Twi.',
      ]},
      { heading: 'Q4 2026 — Planned', badge: 'Next', badgeColor: 'indigo', items: [
        'Parent-teacher meeting scheduler with video conferencing integration.',
        'Automated report card generation and PDF export.',
        'Paystack and Flutterwave fee collection integration for schools.',
        'Custom school branding — logo, colors, domain name.',
      ]},
      { heading: '2027 — Horizon', badge: 'Future', badgeColor: 'gray', items: [
        'District and national-level analytics dashboards for MOE.',
        'Offline mode for low-connectivity environments.',
        'E-learning module with lesson plans and digital assignments.',
        'WAEC and BECE result tracking integration.',
      ]},
    ]
  },
  '/team': {
    title: 'Our Team', subtitle: 'The people behind EduPortal, building for African schools.',
    icon: '👥', color: 'indigo',
    sections: [
      { heading: 'Leadership', items: [
        '🧑‍💼 Founder & CEO — Driving the vision of accessible school management across Africa.',
        '👩‍💻 CTO — Architecting the platform infrastructure and API backbone.',
        '🎨 Head of Design — Crafting every pixel of the EduPortal experience.',
      ]},
      { heading: 'Engineering', items: [
        '⚙️ Backend Engineers — Building the secure, scalable Node.js/PostgreSQL API.',
        '💻 Frontend Engineers — Delivering the React-based school dashboard.',
        '📱 Mobile Engineers — React Native app for parents and students.',
      ]},
      { heading: 'Operations', items: [
        '🤝 Customer Success — Onboarding schools and providing training.',
        '📊 Data & Analytics — Turning school data into actionable insights.',
        '🛡️ Security & Compliance — Keeping student data safe and GDPR-compliant.',
      ]},
      { heading: 'Join Us', items: [
        'We are a remote-first team passionate about education technology in Africa.',
        'We are always looking for talented engineers, designers, and education specialists.',
        '📩 Send your CV to careers@eduportal.com to start a conversation.',
      ]},
    ]
  },
  '/docs': {
    title: 'Documentation', subtitle: 'Everything you need to get your school up and running.',
    icon: '📖', color: 'indigo',
    sections: [
      { heading: '🚀 Getting Started', items: [
        'Step 1: Register your school at eduportal.com/register.',
        'Step 2: Wait for Super Admin approval (usually within 24 hours).',
        'Step 3: Once approved, log in with your headmaster credentials.',
        'Step 4: Add your staff and assign roles (Class Teacher, Subject Teacher).',
        'Step 5: Create classes, enroll students, and begin taking attendance.',
      ]},
      { heading: '👩‍🏫 For School Admins', items: [
        'Manage all staff, students, guardians, and classes from one dashboard.',
        'Generate and approve term report cards.',
        'Configure school settings, academic terms, and grading systems.',
        'View school-wide analytics and attendance summaries.',
      ]},
      { heading: '👨‍🏫 For Teachers', items: [
        'View your assigned class and student roster.',
        'Record daily attendance with a single click.',
        'Enter subject scores and view class performance.',
        'Communicate with parents via the notification system.',
      ]},
      { heading: '👨‍👩‍👧 For Parents', items: [
        'Log in to the Parent Portal to see your child\'s attendance and scores.',
        'Receive real-time notifications for school events and emergencies.',
        'View approved report cards at the end of each term.',
        'Contact the school through the messaging system.',
      ]},
    ]
  },
  '/contact': {
    title: 'Contact Us', subtitle: 'We are here to help. Reach out any time.',
    icon: '✉️', color: 'emerald',
    sections: [
      { heading: '📬 General Inquiries', items: [
        'Email: support@eduportal.com',
        'We respond to all emails within 24 business hours.',
        'For urgent platform issues, mark your subject line as [URGENT].',
      ]},
      { heading: '📞 Phone & WhatsApp', items: [
        'Phone: +233 24 000 0000',
        'WhatsApp: +233 24 000 0000',
        'Available Monday–Friday, 8:00 AM – 6:00 PM (GMT)',
      ]},
      { heading: '🏢 Office', items: [
        'EduPortal Ltd.',
        'Accra, Greater Accra Region, Ghana.',
        'Visits by appointment only.',
      ]},
      { heading: '🤝 Partnerships & Sales', items: [
        'Interested in deploying EduPortal across your district or region?',
        'Email: partnerships@eduportal.com',
        'We offer special pricing for NGOs and government institutions.',
      ]},
    ]
  },
  '/status': {
    title: 'System Status', subtitle: 'Live status of all EduPortal services.',
    icon: '🟢', color: 'emerald',
    sections: [
      { heading: '✅ All Systems Operational', badge: 'Live', badgeColor: 'emerald', items: [
        '🟢 API & Backend — Operational (99.98% uptime, last 90 days)',
        '🟢 Web Dashboard — Operational',
        '🟢 Database (PostgreSQL) — Operational',
        '🟢 Email Delivery (SMTP) — Operational',
        '🟢 Authentication Service — Operational',
        '🟢 File Storage — Operational',
        '🟢 Push Notifications — Operational',
      ]},
      { heading: '📊 Uptime History (Last 90 Days)', items: [
        'Overall Platform Uptime: 99.97%',
        'Scheduled Maintenance Windows: Sundays 2:00 AM – 4:00 AM GMT.',
        'No major incidents in the past 90 days.',
        'Subscribe to status updates at status@eduportal.com.',
      ]},
    ]
  },
  '/community': {
    title: 'Community', subtitle: 'Connect with thousands of school administrators across Africa.',
    icon: '🌍', color: 'violet',
    sections: [
      { heading: '💬 Join the Conversation', items: [
        'Our community forum is home to 2,000+ school administrators.',
        'Ask questions, share best practices, and help shape the platform.',
        'New discussions every week on attendance, grading, and school tech.',
        'Join on Slack: eduportal.slack.com',
      ]},
      { heading: '📚 Community Resources', items: [
        'Monthly Webinars: Live training sessions with the EduPortal team.',
        'Template Library: Shared grading rubrics and report card templates.',
        'Video Tutorials: Step-by-step guides on YouTube.',
        'Knowledge Base: 200+ articles and FAQs.',
      ]},
      { heading: '🏆 Community Recognition', items: [
        'EduPortal Star Awards — recognizing outstanding school administrators quarterly.',
        'Beta Tester Program — get early access to new features.',
        'Ambassador Program — represent EduPortal in your region.',
      ]},
    ]
  },
  '/privacy': {
    title: 'Privacy Policy', subtitle: 'Last updated: July 2026',
    icon: '🔒', color: 'indigo',
    sections: [
      { heading: '1. Information We Collect', items: [
        'School registration details: name, address, contact email, and phone number.',
        'User account data: names, email addresses, and assigned roles.',
        'Student data: academic records, attendance, and scores (collected on behalf of the school).',
        'Usage data: browser type, IP address, pages visited, and session duration.',
      ]},
      { heading: '2. How We Use Your Data', items: [
        'To provide and maintain the EduPortal platform.',
        'To send transactional emails (welcome, password reset, notifications).',
        'To analyze platform usage and improve our services.',
        'We never sell your data to third parties.',
      ]},
      { heading: '3. Data Storage & Security', items: [
        'All data is encrypted in transit using TLS 1.3.',
        'Data at rest is encrypted using AES-256.',
        'We use industry-standard security practices and conduct regular audits.',
        'Student data is never used for advertising or profiling.',
      ]},
      { heading: '4. Your Rights', items: [
        'You may request access to, correction of, or deletion of your personal data.',
        'School admins may export all school data at any time.',
        'To exercise your rights, contact: privacy@eduportal.com.',
        'We comply with the Ghana Data Protection Act, 2012 (Act 843).',
      ]},
    ]
  },
  '/terms-of-service': {
    title: 'Terms of Service', subtitle: 'Last updated: July 2026',
    icon: '📜', color: 'indigo',
    sections: [
      { heading: '1. Acceptance of Terms', items: [
        'By creating an account on EduPortal, you agree to these Terms of Service.',
        'These terms apply to all users: School Admins, Teachers, Parents, and Students.',
        'If you do not agree, please do not use the platform.',
      ]},
      { heading: '2. Account Responsibilities', items: [
        'You are responsible for maintaining the confidentiality of your login credentials.',
        'You must notify us immediately of any unauthorized use of your account.',
        'Schools are responsible for the accuracy of all data they enter into the platform.',
        'You must not share your account with another person.',
      ]},
      { heading: '3. Acceptable Use', items: [
        'EduPortal is for legitimate educational administration purposes only.',
        'You must not use the platform to distribute spam, malware, or illegal content.',
        'You must not attempt to reverse-engineer or scrape the platform.',
        'Violation of these terms may result in immediate account suspension.',
      ]},
      { heading: '4. Subscription & Billing', items: [
        'Free plan is available with limited features. Paid plans billed monthly or annually.',
        'All payments are non-refundable unless required by applicable law.',
        'We reserve the right to change pricing with 30 days notice.',
        'Unpaid accounts may be suspended after 14 days of failed payment.',
      ]},
    ]
  },
  '/data': {
    title: 'Data Processing', subtitle: 'How we handle and protect your school\'s data.',
    icon: '🛡️', color: 'indigo',
    sections: [
      { heading: 'Our Role as Data Processor', items: [
        'EduPortal acts as a Data Processor on behalf of your school (the Data Controller).',
        'We only process student and staff data according to your instructions as a school.',
        'We do not independently process student data for our own business purposes.',
      ]},
      { heading: 'Data Residency', items: [
        'All production data is stored on servers located in West Africa.',
        'Backup data is replicated to a secondary region for disaster recovery.',
        'We do not transfer student data outside of Africa without explicit consent.',
      ]},
      { heading: 'Retention Policy', items: [
        'Active school data is retained for as long as your subscription is active.',
        'After account cancellation, data is retained for 90 days before secure deletion.',
        'You may request immediate deletion at any time by emailing privacy@eduportal.com.',
        'Audit logs are retained for 7 years for compliance purposes.',
      ]},
      { heading: 'GDPR & Local Compliance', items: [
        'We are compliant with the Ghana Data Protection Act, 2012 (Act 843).',
        'Schools with EU-based users: we sign a Data Processing Agreement (DPA) on request.',
        'We conduct annual third-party security audits.',
        'To request a DPA, email: legal@eduportal.com.',
      ]},
    ]
  },
};

const colorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-600' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-600' },
  gray:   { bg: 'bg-gray-100',  text: 'text-gray-600',  border: 'border-gray-200',  dot: 'bg-gray-400' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
};

export default function GenericPage() {
  const location = useLocation();

  // Check for admin-saved overrides in localStorage
  const savedPages = JSON.parse(localStorage.getItem('publicPages') || '{}');
  const slugToKey = {
    '/team': 'Team', '/changelog': 'Changelog', '/roadmap': 'Roadmap',
    '/docs': 'Documentation', '/contact': 'Contact Us', '/status': 'System Status',
    '/community': 'Community', '/privacy': 'Privacy Policy',
    '/terms-of-service': 'Terms of Service', '/data': 'Data Processing',
  };
  const savedKey = slugToKey[location.pathname];
  const savedData = savedPages[savedKey];

  const page = PAGES[location.pathname];

  // If admin has saved custom content, show that
  if (savedData && savedData.content && savedData.content !== '<p>Content goes here...</p>') {
    return (
      <PageShell title={savedData.title} subtitle={savedData.subtitle} icon="📄" color="indigo">
        <div className="prose prose-indigo max-w-none" dangerouslySetInnerHTML={{ __html: savedData.content }} />
      </PageShell>
    );
  }

  // Show 404 if route not mapped
  if (!page) {
    return (
      <PageShell title="Page Not Found" subtitle="The page you are looking for does not exist." icon="❓" color="gray">
        <div className="text-center py-8">
          <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700">
            ← Back to Home
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell title={page.title} subtitle={page.subtitle} icon={page.icon} color={page.color}>
      <div className="space-y-8">
        {page.sections.map((section, si) => {
          const c = colorMap[section.badgeColor || page.color] || colorMap.indigo;
          return (
            <div key={si} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <h2 className="text-lg font-bold text-gray-900">{section.heading}</h2>
                {section.badge && (
                  <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}>
                    {section.badge}
                  </span>
                )}
              </div>
              <ul className="space-y-3">
                {section.items.map((item, ii) => (
                  <li key={ii} className="flex items-start gap-3">
                    <span className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${c.dot}`} />
                    <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}

function PageShell({ title, subtitle, icon, color, children }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="h-4 w-4">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span className="font-bold text-lg text-gray-900">EduPortal</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Home</Link>
            <Link to="/login" className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-1.5 rounded-lg transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className={`${c.bg} border-b ${c.border}`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-4xl mb-4">{icon}</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">{title}</h1>
          <p className="text-lg text-gray-500 max-w-2xl">{subtitle}</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} EduPortal. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link to="/terms-of-service" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
