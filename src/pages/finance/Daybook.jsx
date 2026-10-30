import { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useToast } from '../../context/ToastContext';
import { getDaybook, exportDaybook, getLedgerAccounts, getTrialBalance } from '../../api/ledgerApi';
import { Download } from 'lucide-react';

export default function Daybook() {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [trial, setTrial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState({
    from: '', to: '', accountId: '', type: '', sourceType: '',
  });

  const { addToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const [data, accs, tb] = await Promise.all([
        getDaybook(params),
        getLedgerAccounts(),
        getTrialBalance(),
      ]);
      setEntries(data);
      setAccounts(accs);
      setTrial(tb);
    } catch {
      addToast('Failed to load daybook', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const blob = await exportDaybook(params);
      const url = URL.createObjectURL(new Blob([blob]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `daybook-${new Date().toISOString().slice(0, 10)}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      addToast('Export failed', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Daybook"
        subtitle="Every cash movement across the school, in date order."
        action={
          <Button onClick={handleExport} icon={Download} disabled={exporting || entries.length === 0}>
            {exporting ? 'Exporting…' : 'Export Excel'}
          </Button>
        }
      />

      {trial && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <Stat label="Money In"  value={trial.totalIn}  tone="emerald" />
          <Stat label="Money Out" value={trial.totalOut} tone="rose" />
          <Stat label="Net"       value={trial.net}      tone="indigo" />
          <Stat label="Entries"   value={trial.entryCount} isCurrency={false} />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Input type="date" label="From" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          <Input type="date" label="To"   value={filters.to}   onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          <Select
            label="Account"
            value={filters.accountId}
            onChange={(e) => setFilters({ ...filters, accountId: e.target.value })}
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
            placeholder="All"
          />
          <Select
            label="Type"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            options={[{ value: 'IN', label: 'IN' }, { value: 'OUT', label: 'OUT' }]}
            placeholder="All"
          />
          <div className="flex items-end">
            <Button onClick={load}>Apply</Button>
          </div>
        </div>

        <Table
          loading={loading}
          data={entries}
          emptyMessage="No entries yet"
          columns={[
            { header: 'Date', key: 'date', render: (v) => <span className="text-sm text-gray-700">{new Date(v).toLocaleDateString()}</span> },
            { header: 'Account', key: '_acc', render: (_, r) => <span className="text-sm">{r.account?.name}</span> },
            { header: 'Type', key: 'type', render: (v) => (
              <Badge variant={v === 'IN' ? 'success' : 'danger'}>{v}</Badge>
            )},
            { header: 'Amount', key: 'amount', render: (v, r) => (
              <span className={`text-sm font-semibold ${r.type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                GHS {Number(v).toFixed(2)}
              </span>
            )},
            { header: 'Category', key: '_cat', render: (_, r) => (
              <span className="text-sm text-gray-600">{r.financialCategory?.name || r.expenseCategory?.name || '—'}</span>
            )},
            { header: 'Source', key: 'sourceType', render: (v) => <Badge variant="neutral">{v}</Badge> },
            { header: 'Description', key: 'description', render: (v) => <span className="text-xs text-gray-500">{v || '—'}</span> },
          ]}
        />
      </div>
    </div>
  );
}

function Stat({ label, value, tone = 'indigo', isCurrency = true }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    rose:    'bg-rose-50 text-rose-700',
    indigo:  'bg-indigo-50 text-indigo-700',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className={`text-2xl font-semibold mt-1 ${tones[tone]}`}>
        {isCurrency ? `GHS ${Number(value).toFixed(2)}` : value}
      </p>
    </div>
  );
}