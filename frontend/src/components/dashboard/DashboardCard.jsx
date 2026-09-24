import React from 'react';

export const DashboardCard = ({ title, value, subtitle, icon: Icon, trend, trendText, color = 'emerald' }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
  };

  const iconBg = colorMap[color] || colorMap.emerald;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all relative overflow-hidden group flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
            {title}
          </span>
          {Icon && (
            <div className={`p-2 rounded-xl border ${iconBg} group-hover:scale-105 transition-transform shadow-2xs`}>
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="text-lg sm:text-xl font-black text-slate-900 mb-1 leading-tight line-clamp-2">
          {value}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] mt-1 pt-1 border-t border-slate-100">
        <span className="text-slate-500 font-medium truncate max-w-[140px]">{subtitle}</span>
        {trend && (
          <span
            className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
              trend === 'up'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
