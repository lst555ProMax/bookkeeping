import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './SleepQualityTrendChart.scss';

export interface SleepQualityData {
  date: string;
  quality: number;
}

interface SleepQualityTrendChartProps {
  data: SleepQualityData[];
  averageQuality: number; // 保留此参数以保持接口兼容性，但不再在组件内使用
}

const SleepQualityTrendChart: React.FC<SleepQualityTrendChartProps> = ({ data, averageQuality: _averageQuality }) => {
  if (!data || data.length === 0) {
    return (
      <div className="sleep-quality-trend-chart sleep-quality-trend-chart--empty">
        <h3 className="sleep-quality-trend-chart__title">🌙 睡眠质量趋势</h3>
        <div className="sleep-quality-trend-chart__empty-message">
          <p>暂无睡眠数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-quality-trend-chart">
      <h3 className="sleep-quality-trend-chart__title">🌙 睡眠质量趋势</h3>
      <div className="sleep-quality-trend-chart__container">
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 50 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            label={{ value: '日期', position: 'insideBottom', offset: -20 }}
            stroke="#666"
          />
          <YAxis 
            domain={[0, 100]}
            tick={{ fontSize: 12 }}
            label={{ value: '质量分数', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip />
          <Legend 
            verticalAlign="bottom" 
            align="left"
            wrapperStyle={{ paddingLeft: '20px', paddingBottom: '10px' }}
          />
          <Line 
            type="monotone" 
            dataKey="quality" 
            stroke="#8884d8" 
            strokeWidth={2}
            name="睡眠质量"
            dot={{ fill: '#8884d8', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SleepQualityTrendChart;
