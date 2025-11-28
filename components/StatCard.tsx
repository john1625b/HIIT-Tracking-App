import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, icon, highlight = false }) => {
  let trendColor = 'text-slate-400';
  if (trend === 'up') trendColor = 'text-neon-green';
  if (trend === 'down') trendColor = 'text-neon-red';

  const borderColor = highlight ? 'border-neon-blue shadow-[0_0_15px_rgba(6,182,212,0.3)]' : 'border-slate-800';

  return (
    <div className={`bg-slate-850 border ${borderColor} rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">{label}</span>
        {icon && <div className="text-slate-500">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-white">{value}</span>
        {subValue && <span className={`text-sm font-medium mb-1 ${trendColor}`}>{subValue}</span>}
      </div>
    </div>
  );
};

export default StatCard;