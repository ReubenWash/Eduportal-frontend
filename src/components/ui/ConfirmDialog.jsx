import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onConfirm, onCancel, message = 'Are you sure?' }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-900/50" onClick={onCancel} />
        <div className="relative inline-block w-full max-w-md bg-white rounded-xl shadow-xl">
          <div className="p-6">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Action</h3>
              <p className="text-sm text-gray-500 mb-6">{message}</p>
              <div className="flex gap-3 justify-center">
                <button onClick={onCancel} className="btn-secondary h-10 px-4 text-sm rounded-md">Cancel</button>
                <button onClick={onConfirm} className="btn-danger h-10 px-4 text-sm rounded-md">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}