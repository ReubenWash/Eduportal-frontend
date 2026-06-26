import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const icons = { success: CheckCircle, error: XCircle, info: Info, warning: AlertTriangle };
const styles = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-end justify-start p-4 pointer-events-none">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;
        return (
          <div key={toast.id} className={`pointer-events-auto mb-3 flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg max-w-sm ${styles[toast.type] || styles.info}`}>
            <Icon className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="text-current hover:opacity-70"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}