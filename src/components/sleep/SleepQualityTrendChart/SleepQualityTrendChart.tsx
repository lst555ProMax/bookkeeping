import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SleepQualityTrendChart.scss';

export interface SleepQualityData {
  date: string;
  quality: number;
}

interface SleepQualityTrendChartProps {
  data: SleepQualityData[];
  averageQuality: number;
}

const SleepQualityTrendChart: React.FC<SleepQualityTrendChartProps> = ({ data, averageQuality }) => {
  return (
    <div className="sleep-quality-trend-chart">
      <div className="chart-header">
        <h3 className="chart-title">🌙 睡眠质量趋势</h3>
        <span className="chart-average">平均质量：{averageQuality.toFixed(1)}分</span>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: '质量分数', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="睡眠质量"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepQualityTrendChart;
