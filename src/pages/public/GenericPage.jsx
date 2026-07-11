import { Link, useLocation } from 'react-router-dom';

export default function GenericPage() {
  const location = useLocation();
  
  const slugToKey = {
    '/team': 'Team',
    '/changelog': 'Changelog',
    '/roadmap': 'Roadmap',
    '/docs': 'Documentation',
    '/contact': 'Contact Us',
    '/status': 'System Status',
    '/community': 'Community',
    '/privacy': 'Privacy Policy',
    '/terms-of-service': 'Terms of Service',
    '/data': 'Data Processing',
  };

  const defaultPages = {
    'Team': { title: 'Our Team', subtitle: 'Meet the people building EduPortal.', content: '<h3>Founders</h3><p>EduPortal was built by a group of passionate educators and engineers...</p>' },
    'Changelog': { title: 'Changelog', subtitle: 'See what\'s new in EduPortal.', content: '<h3>v1.0.0</h3><ul><li>Initial release of the school management dashboard.</li><li>Added core modules for Enrollments, Scores, and Attendance.</li></ul>' },
    'Roadmap': { title: 'Roadmap', subtitle: 'Our planned features and upcoming releases.', content: '<h3>Q3 2026</h3><ul><li>Mobile Application for Parents</li><li>AI-driven student performance predictions</li></ul>' },
    'Documentation': { title: 'Documentation', subtitle: 'Guides and tutorials for using EduPortal.', content: '<h3>Getting Started</h3><p>Welcome to the EduPortal docs. Here you will find step-by-step guides for onboarding your school...</p>' },
    'Contact Us': { title: 'Contact Us', subtitle: 'Get in touch with our support team.', content: '<p><strong>Email:</strong> support@eduportal.com</p><p><strong>Phone:</strong> +233 24 000 0000</p><p><strong>Office:</strong> Accra, Ghana</p><p>We aim to respond to all inquiries within 24 hours.</p>' },
    'System Status': { title: 'System Status', subtitle: 'All systems are fully operational.', content: '<ul><li><strong>Database:</strong> Operational (99.99% uptime)</li><li><strong>API:</strong> Operational (99.98% uptime)</li><li><strong>Email Delivery:</strong> Operational</li></ul>' },
    'Community': { title: 'Community', subtitle: 'Join the EduPortal administrator community.', content: '<p>Join thousands of other school administrators in our private forum to share tips, configurations, and best practices.</p><button style="background: #4F46E5; color: white; padding: 8px 16px; border-radius: 6px; border: none; margin-top: 12px; cursor: pointer;">Join the Slack Channel</button>' },
    'Privacy Policy': { title: 'Privacy Policy', subtitle: 'How we collect, use, and protect your data.', content: '<h3>Data Collection</h3><p>We only collect data necessary for operating the school platform...</p>' },
    'Terms of Service': { title: 'Terms of Service', subtitle: 'The rules and guidelines for using our platform.', content: '<h3>1. Acceptance of Terms</h3><p>By registering a school on EduPortal, you agree to...</p>' },
    'Data Processing': { title: 'Data Processing', subtitle: 'Information on data handling and GDPR compliance.', content: '<h3>Security</h3><p>All student records are encrypted at rest using industry-standard protocols...</p>' },
  };

  const savedPages = JSON.parse(localStorage.getItem('publicPages') || '{}');
  const pageKey = slugToKey[location.pathname];
  
  // Load from saved CMS data, fallback to defaults, or show 404
  const page = savedPages[pageKey] || defaultPages[pageKey] || { 
    title: 'Page Not Found', 
    subtitle: 'The page you are looking for does not exist.',
    content: '<p>Content coming soon</p>'
  };

  const renderContent = page.content || '<p>Content coming soon</p>';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" className="h-5 w-5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">EduPortal</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
          <div className="h-16 w-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-8 w-8 text-indigo-600">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">{page.title}</h1>
          <p className="text-lg text-gray-500 mb-8 max-w-2xl mx-auto">{page.subtitle}</p>
          
          <div 
            className="prose prose-indigo max-w-none text-left bg-gray-50 p-6 sm:p-8 rounded-xl border border-gray-100"
            dangerouslySetInnerHTML={{ __html: renderContent }}
          />
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8 text-center">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} EduPortal. All rights reserved.</p>
      </footer>
    </div>
  );
}
