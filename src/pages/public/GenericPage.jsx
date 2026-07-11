import { Link, useLocation } from 'react-router-dom';

const contentMap = {
  '/changelog': { title: 'Changelog', subtitle: 'See what\'s new in EduPortal.' },
  '/roadmap': { title: 'Roadmap', subtitle: 'Our planned features and upcoming releases.' },
  '/team': { title: 'Our Team', subtitle: 'Meet the people building EduPortal.' },
  '/docs': { title: 'Documentation', subtitle: 'Guides and tutorials for using EduPortal.' },
  '/contact': { title: 'Contact Us', subtitle: 'Get in touch with our support team.' },
  '/status': { title: 'System Status', subtitle: 'All systems are fully operational.' },
  '/community': { title: 'Community', subtitle: 'Join the EduPortal administrator community.' },
  '/privacy': { title: 'Privacy Policy', subtitle: 'How we collect, use, and protect your data.' },
  '/terms': { title: 'Terms of Service', subtitle: 'The rules and guidelines for using our platform.' },
  '/data': { title: 'Data Processing', subtitle: 'Information on data handling and GDPR compliance.' },
};

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

  const savedPages = JSON.parse(localStorage.getItem('publicPages') || '{}');
  const pageKey = slugToKey[location.pathname];
  
  // Try to load from saved CMS data, fallback to hardcoded map, or 404
  const page = savedPages[pageKey] || contentMap[location.pathname] || { 
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
