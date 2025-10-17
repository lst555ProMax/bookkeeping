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
import { minutesToTime } from '@/utils/sleepStorage';
import './SleepTimeTrendChart.scss';

interface SleepTimeTrendChartProps {
  data: Array<{
    date: string;
    day: number;
    sleepTime: number; // 分钟数
    wakeTime: number;  // 分钟数
  }>;
}

const SleepTimeTrendChart: React.FC<SleepTimeTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="sleep-time-trend-chart">
        <div className="chart-empty">
          <p>📊 暂无数据</p>
          <p className="hint">开始记录睡眠后，这里将显示入睡和醒来时间趋势</p>
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
          <p className="tooltip-item sleep">
            🌙 入睡: {minutesToTime(payload[0].value)}
          </p>
          <p className="tooltip-item wake">
            ☀️ 醒来: {minutesToTime(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Y轴刻度格式化
  const formatYAxis = (minutes: number) => {
    return minutesToTime(minutes);
  };

  return (
    <div className="sleep-time-trend-chart">
      <h3>⏰ 入睡与醒来时间趋势</h3>
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
            domain={[0, 24 * 60]}
            ticks={[0, 6*60, 12*60, 18*60, 24*60]}
            label={{ value: '时间', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sleepTime"
            stroke="#667eea"
            strokeWidth={2}
            name="入睡时间"
            dot={{ fill: '#667eea', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="wakeTime"
            stroke="#ffc107"
            strokeWidth={2}
            name="醒来时间"
            dot={{ fill: '#ffc107', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SleepTimeTrendChart;
