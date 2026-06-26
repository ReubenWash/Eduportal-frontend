import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function StatCard({ icon: Icon, title, value, trend, trendLabel, color = 'indigo' }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', ring: 'ring-indigo-100' },
    green: { bg: 'bg-emerald-50', icon: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', ring: 'ring-amber-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', ring: 'ring-blue-100' },
  };
  const c = colorMap[color] || colorMap.indigo;

  const isPositive = trend > 0;
  const isNeutral = trend === 0 || trend === undefined;
  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const trendColor = isNeutral ? 'text-gray-500' : isPositive ? 'text-emerald-600' : 'text-red-600';
  const trendBg = isNeutral ? 'bg-gray-100' : isPositive ? 'bg-emerald-50' : 'bg-red-50';

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
      {/* Top row */}
      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-lg ${c.bg} ring-1 ${c.ring}`}>
          <Icon className={`h-5 w-5 ${c.icon}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${trendBg}`}>
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <span className={`text-xs font-medium ${trendColor}`}>
              {isNeutral ? '0%' : `${isPositive ? '+' : ''}${trend}%`}
            </span>
          </div>
        )}
      </div>

      {/* Bottom */}
      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">{value ?? '—'}</p>
        <p className="text-sm text-gray-500 mt-0.5 font-medium">{title}</p>
        {trendLabel && <p className="text-xs text-gray-400 mt-1">{trendLabel}</p>}
      </div>
    </div>
  );
}