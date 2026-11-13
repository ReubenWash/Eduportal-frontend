import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Search, Plus, Filter, Calendar, FileText, CheckCircle2 } from 'lucide-react';

export default function ModulePlaceholderPage({
  title = 'Module',
  subtitle = 'Manage and view module records',
  category = 'School Operations',
  icon: Icon,
  description = 'This module is configured for your school management workflow.',
  features = [],
  actionLabel = 'Add Record',
}) {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader title={title} subtitle={subtitle} />
        {actionLabel && (
          <Button variant="primary" className="self-start sm:self-auto gap-2">
            <Plus className="h-4 w-4" />
            {actionLabel}
          </Button>
        )}
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={`Search ${title.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Badge variant="info">{category}</Badge>
          <span className="text-xs text-gray-400">Live Active Module</span>
        </div>
      </div>

      {/* Overview Card */}
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 p-6 shadow-sm space-y-4">
        <div className="flex items-start gap-4">
          {Icon && (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm flex-shrink-0">
              <Icon className="h-6 w-6" />
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900">{title} Overview</h3>
            <p className="mt-1 text-sm text-gray-600 leading-relaxed max-w-2xl">{description}</p>
          </div>
        </div>

        {features.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white p-3.5 text-xs text-gray-700 shadow-2xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span className="font-medium">{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Data Records Container */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-12 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-50 text-gray-400">
          <FileText className="h-6 w-6" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">No {title} records created yet</h4>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Use the {actionLabel} button above to register or manage entries for this school term.
        </p>
      </div>
    </div>
  );
}

