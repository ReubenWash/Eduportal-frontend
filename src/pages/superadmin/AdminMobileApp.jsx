import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { Smartphone, RefreshCw, Send, Link, Plus, Trash2, Edit2, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/ui/Modal';

export default function AdminMobileApp() {
  const { addToast } = useToast();
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modal) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  const renderModalContent = () => {
    switch (activeModal) {
      case 'banners':
        return (
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">Manage promotional banners on the mobile app home screen.</p>
              <Button size="sm" icon={Plus}>Add Banner</Button>
            </div>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr><th className="px-4 py-2 text-left">Banner Name</th><th className="px-4 py-2 text-left">Status</th><th className="px-4 py-2 text-right">Actions</th></tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Term 3 Registration Promo</td>
                    <td className="px-4 py-3"><span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span></td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-gray-900">Holiday Special Discount</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Draft</span></td>
                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                      <button className="text-indigo-600 hover:text-indigo-900"><Edit2 className="h-4 w-4" /></button>
                      <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'deeplinks':
        return (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">Configure how web URLs open inside the mobile application.</p>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm text-gray-900">App Scheme</p>
                  <p className="text-xs text-gray-500">eduportal://</p>
                </div>
                <Button variant="outline" size="sm">Edit</Button>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">Universal Links (iOS)</p>
                  <p className="text-xs text-green-600 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Configured correctly</p>
                </div>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200 pt-3">
                <div>
                  <p className="font-semibold text-sm text-gray-900">App Links (Android)</p>
                  <p className="text-xs text-amber-600 flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Needs attention</p>
                </div>
                <Button variant="outline" size="sm">Verify</Button>
              </div>
            </div>
          </div>
        );
      case 'push':
        return (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-gray-500">Configure Firebase Cloud Messaging (FCM) credentials.</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">FCM Server Key</label>
                <input type="password" value="************************" readOnly className="mt-1 w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Sender ID</label>
                <input type="text" value="987654321012" readOnly className="mt-1 w-full bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm font-mono" />
              </div>
              <div className="pt-2">
                <Button variant="outline" className="w-full">Test Push Notification</Button>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  const modalTitles = {
    banners: 'Manage App Banners',
    deeplinks: 'Configure Deep Links',
    push: 'Push Notification Settings'
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mobile App Management"
        subtitle="Manage the platform's mobile application settings."
        action={
          <Button icon={RefreshCw} onClick={() => addToast('Users forced to update.', 'success')}>Force Update Users</Button>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-indigo-500" />
            Version Control
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Minimum Supported Version</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" defaultValue="1.2.0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current App Store Version</label>
              <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" defaultValue="1.5.2" />
            </div>
            <Button className="w-full" onClick={() => addToast('Versions saved', 'success')}>Save Versions</Button>
          </div>
        </div>
        
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
          <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <Send className="h-5 w-5 text-indigo-500" />
            App Content
          </h3>
          <div className="space-y-3">
             <Button variant="outline" className="w-full justify-start" onClick={() => openModal('banners')}>Manage App Banners</Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => openModal('deeplinks')}>Configure Deep Links</Button>
             <Button variant="outline" className="w-full justify-start" onClick={() => openModal('push')}>Push Notification Settings</Button>
          </div>
        </div>
      </div>

      {activeModal && (
        <Modal isOpen={!!activeModal} onClose={closeModal} title={modalTitles[activeModal]}>
          {renderModalContent()}
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={() => { addToast('Settings saved successfully', 'success'); closeModal(); }}>Save Changes</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
