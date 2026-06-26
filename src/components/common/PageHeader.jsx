export default function PageHeader({ title, subtitle, action, breadcrumb }) {
  return (
    <div className="flex items-start justify-between mb-7 gap-4">
      <div>
        {breadcrumb && (
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1.5">{breadcrumb}</p>
        )}
        <h1 className="text-[22px] font-semibold text-gray-900 tracking-tight leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 flex items-center gap-2">
          {action}
        </div>
      )}
    </div>
  );
}