import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { HabitStats } from '@/utils/daily/statistics';
import './HabitStatsChart.scss';

interface HabitStatsChartProps {
  data: HabitStats[];
}

const COLORS = ['#667eea', '#52c41a', '#faad14', '#ff4d4f', '#13c2c2', '#722ed1', '#eb2f96'];

const HabitStatsChart: React.FC<HabitStatsChartProps> = ({ data }) => {
  return (
    <div className="habit-stats-chart">
      <div className="chart-header">
        <h3>🏠 生活习惯完成度</h3>
      </div>
      {data.length > 0 ? (
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
      ) : (
        <div className="no-data">
          <p>暂无数据</p>
        </div>
      )}
    </div>
  );
};

export default HabitStatsChart;
