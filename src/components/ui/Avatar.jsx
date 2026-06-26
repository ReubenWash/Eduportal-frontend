import { getInitials } from '../../utils/helpers';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

// Deterministic color from name
const colors = [
  'bg-indigo-100 text-indigo-700',
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-cyan-100 text-cyan-700',
];

function getColor(name = '') {
  const hash = name.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const initials = getInitials(name);
  const colorClass = getColor(name);
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold overflow-hidden flex-shrink-0 ${colorClass} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="leading-none select-none">{initials}</span>
      )}
    </div>
  );
}