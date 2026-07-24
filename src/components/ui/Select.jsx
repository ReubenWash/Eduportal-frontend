import { ChevronDown } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function Select({ label, options = [], value, onChange, disabled = false, className = '', placeholder = 'Select...' }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={classNames(
            'appearance-none w-full rounded-md border-gray-300 pl-3 pr-10 py-2 text-sm focus:border-primary-500 focus:ring-primary-500',
            disabled && 'bg-gray-50 text-gray-500'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value ?? opt} value={opt.value ?? opt}>{opt.label ?? opt}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}