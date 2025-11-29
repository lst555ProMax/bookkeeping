import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { formatSleepDuration } from '@/utils';
import './SleepDurationTrendChart.scss';

interface SleepDurationTrendChartProps {
  data: Array<{
    date: string;
    day: number;
    duration: number; // 分钟数
  }>;
}

const SleepDurationTrendChart: React.FC<SleepDurationTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="sleep-duration-trend-chart sleep-duration-trend-chart--empty">
        <h3 className="sleep-duration-trend-chart__title">⏱️ 睡眠时长趋势</h3>
        <div className="sleep-duration-trend-chart__empty-message">
          <p>暂无睡眠数据</p>
        </div>
      </div>
    );
  }

  // 自定义tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.date}</p>
          <p className="tooltip-item">
            ⏱️ 睡眠时长: {formatSleepDuration(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Y轴刻度格式化（小时）
  const formatYAxis = (minutes: number) => {
    const hours = minutes / 60;
    return `${hours.toFixed(1)}h`;
  };

  return (
    <div className="sleep-duration-trend-chart">
      <h3 className="sleep-duration-trend-chart__title">⏱️ 睡眠时长趋势</h3>
      <div className="sleep-duration-trend-chart__container">
        <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            label={{ value: '日期', position: 'insideBottom', offset: -5 }}
            stroke="#666"
          />
          <YAxis 
            tickFormatter={formatYAxis}
            domain={[0, 12 * 60]}
            ticks={[0, 3*60, 6*60, 9*60, 12*60]}
            label={{ value: '时长', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="duration"
            stroke="#28a745"
            strokeWidth={2}
            name="睡眠时长"
            dot={{ fill: '#28a745', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SleepDurationTrendChart;
