import React from 'react';

export const StatCard = ({ title, value, icon: Icon, color = 'emerald', onClick, clickable = false }) => {
  const borderColors = {
    emerald: 'border-l-emerald-500',
    blue: 'border-l-blue-500',
    amber: 'border-l-amber-500',
    rose: 'border-l-rose-500',
    indigo: 'border-l-indigo-500'
  };

  return (
    <div
      onClick={onClick}
      className={`bg-slate-800 p-5 rounded-xl border-l-4 ${borderColors[color] || 'border-l-emerald-500'} border-slate-700/50 shadow-lg ${
        clickable ? 'cursor-pointer hover:bg-slate-750 hover:border-slate-600 transition-all transform hover:-translate-y-0.5' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value !== undefined ? value : 0}</p>
        </div>
        {Icon && (
          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-700/40">
            <Icon className="w-6 h-6 text-slate-300" />
          </div>
        )}
      </div>
      {clickable && (
        <p className="text-[11px] text-emerald-400 mt-2 font-medium">Click for breakdown &rarr;</p>
      )}
    </div>
  );
};