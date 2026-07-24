import { X } from 'lucide-react';
import { useEffect } from 'react';

export default function SlideOver({ isOpen, onClose, title, subtitle, children }) {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 flex-shrink-0">
            <div>
              <h2 className="text-base font-semibold text-gray-900">{title}</h2>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="relative flex-1 px-6 py-6 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}