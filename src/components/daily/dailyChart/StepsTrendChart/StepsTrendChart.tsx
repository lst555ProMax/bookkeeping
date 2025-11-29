import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyTrendData } from '@/utils/daily/statistics';
import './StepsTrendChart.scss';

interface StepsTrendChartProps {
  data: DailyTrendData[];
}

const StepsTrendChart: React.FC<StepsTrendChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    日期: item.date.slice(5), // MM-DD
    步数: item.steps,
    date: item.date
  }));

  if (chartData.length === 0) {
    return (
      <div className="steps-trend-chart steps-trend-chart--empty">
        <h3 className="steps-trend-chart__title">🚶 每日步数趋势</h3>
        <div className="steps-trend-chart__empty-message">
          <p>暂无日常数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="steps-trend-chart">
      <h3 className="steps-trend-chart__title">🚶 每日步数趋势</h3>
      <div className="steps-trend-chart__container">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="日期"
              tick={{ fill: '#666', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: '#666', fontSize: 14 }}
              label={{ value: '步数', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px'
              }}
              formatter={(value: number) => [`${value}步`, '步数']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="步数"
              stroke="#1ea5f9"
              strokeWidth={3}
              dot={{ r: 5, fill: '#1ea5f9' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StepsTrendChart;
