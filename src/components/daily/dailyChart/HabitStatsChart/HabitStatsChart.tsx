import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HabitStats } from '@/utils/daily/statistics';
import './HabitStatsChart.scss';

interface HabitStatsChartProps {
  data: HabitStats[];
}

const COLORS = ['#1ea5f9', '#52c41a', '#faad14', '#ff4d4f', '#13c2c2', '#722ed1', '#eb2f96'];

const HabitStatsChart: React.FC<HabitStatsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="habit-stats-chart habit-stats-chart--empty">
        <h3 className="habit-stats-chart__title">🏠 生活习惯完成度</h3>
        <div className="habit-stats-chart__empty-message">
          <p>暂无日常数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-stats-chart">
      <h3 className="habit-stats-chart__title">🏠 生活习惯完成度</h3>
      <div className="habit-stats-chart__container">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={(entry) => {
                const item = data.find(d => d.name === entry.name);
                return item ? `${item.percentage}%` : '';
              }}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((_item, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string) => {
                const item = data.find(d => d.name === value);
                return `${value} (${item?.value}次)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HabitStatsChart;
