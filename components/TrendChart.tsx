import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Workout } from '../types';

interface TrendChartProps {
  data: Workout[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl z-50">
        <p className="text-slate-400 text-xs mb-1 font-medium">{data.displayDate}</p>
        <div className="flex items-end gap-1">
          <p className="text-neon-blue font-bold text-xl leading-none">
            {data.calories}
          </p>
          <span className="text-xs font-normal text-slate-500 mb-0.5">kcal</span>
        </div>
      </div>
    );
  }
  return null;
};

const TrendChart: React.FC<TrendChartProps> = ({ data }) => {
  const chartData = useMemo(() => {
    // 1. Copy and Sort ASCENDING (Oldest -> Newest)
    // Using getTime() ensures numeric comparison
    const sorted = [...data]
      .filter(d => !isNaN(new Date(d.date).getTime()))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Take only the last 20 sessions to match the UI label and prevent overcrowding
    const recent = sorted.slice(-20);

    // 3. Format for display
    return recent.map((d, i) => ({
      ...d,
      uniqueKey: `${d.id}_${i}`, 
      displayDate: new Date(d.date).toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        timeZone: 'UTC' 
      }),
    }));
  }, [data]);

  if (chartData.length === 0) return null;

  return (
    <div className="w-full h-64 mt-4" data-testid="trend-chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="uniqueKey" 
            tickFormatter={(val) => {
              const item = chartData.find(d => d.uniqueKey === val);
              return item?.displayDate || '';
            }}
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
            axisLine={false}
            tickLine={false}
            domain={['dataMin - 50', 'auto']}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area 
            type="monotone" 
            dataKey="calories" 
            stroke="#06b6d4" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorCalories)" 
            animationDuration={1500}
            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;