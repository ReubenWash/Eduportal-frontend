import { classNames } from '../../utils/helpers';

export default function Input({
  label, error, placeholder, value, onChange,
  type = 'text', disabled = false, className = '',
  icon: Icon, required, hint, ...props
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={classNames(
            'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all',
            'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
            Icon && 'pl-9',
            error && 'border-red-400 focus:ring-red-400/30 focus:border-red-400',
          )}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}