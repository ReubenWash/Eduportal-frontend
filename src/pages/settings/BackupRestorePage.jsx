import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';
import { Database, Download, ShieldCheck } from 'lucide-react';
import { downloadSchoolDataExport } from '../../api/schoolOperationsApi';

export default function BackupRestorePage() {
  const [exporting, setExporting] = useState(false);
  const { addToast } = useToast();

  const handleExport = async () => {
    setExporting(true);
    try {
      const file = await downloadSchoolDataExport();
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.href = url;
      link.download = `school-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      addToast('School data export downloaded.', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to export school data.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="School Data Export"
        subtitle="Download a current export of this school's records from the backend."
        action={
          <Button variant="primary" className="gap-2" onClick={handleExport} disabled={exporting}>
            <Download className="h-4 w-4" /> {exporting ? 'Preparing Export...' : 'Download Data Export'}
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-indigo-50 p-2 text-indigo-600"><Database className="h-5 w-5" /></div>
          <h2 className="font-semibold text-gray-900">Live school records</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            The export is generated on request and includes school profile, students, guardians, staff, classes,
            terms, attendance, finance, library, transport, and payroll records currently stored for this school.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 inline-flex rounded-lg bg-emerald-50 p-2 text-emerald-600"><ShieldCheck className="h-5 w-5" /></div>
          <h2 className="font-semibold text-gray-900">Tenant-scoped export</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Access is restricted to this school's administrator, and the export omits authentication secrets.
            This file is a data export, not a platform database backup or a restore point.
          </p>
        </div>
      </div>
    </div>
  );
}
