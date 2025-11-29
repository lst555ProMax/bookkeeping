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
import './SleepTimeTrendChart.scss';

interface SleepTimeTrendChartProps {
  data: Array<{
    date: string;
    day: number;
    sleepTime: number; // 分钟数（可能为负值，表示前一天晚上）
    wakeTime: number;  // 分钟数
  }>;
}

const SleepTimeTrendChart: React.FC<SleepTimeTrendChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="sleep-time-trend-chart sleep-time-trend-chart--empty">
        <h3 className="sleep-time-trend-chart__title">⏰ 入睡与醒来时间趋势</h3>
        <div className="sleep-time-trend-chart__empty-message">
          <p>暂无睡眠数据</p>
        </div>
      </div>
    );
  }

  // 格式化分钟数为时间字符串（支持负值）
  const formatMinutesToTime = (minutes: number): string => {
    let displayMinutes = minutes;
    if (displayMinutes < 0) {
      displayMinutes += 24 * 60; // 转换回21:00-23:59
    }
    
    // 计算小时和分钟，确保分钟数在 0-59 范围内
    const totalMins = Math.round(displayMinutes);
    const hours = Math.floor(totalMins / 60) % 24;
    const mins = totalMins % 60;
    
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // 自定义tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-date">{payload[0].payload.date}</p>
          <p className="tooltip-item sleep">
            🌙 入睡: {formatMinutesToTime(payload[0].value)}
          </p>
          <p className="tooltip-item wake">
            ☀️ 醒来: {formatMinutesToTime(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Y轴刻度格式化
  const formatYAxis = (minutes: number) => {
    return formatMinutesToTime(minutes);
  };

  return (
    <div className="sleep-time-trend-chart">
      <h3 className="sleep-time-trend-chart__title">⏰ 入睡与醒来时间趋势</h3>
      <div className="sleep-time-trend-chart__container">
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
            domain={[-3 * 60, 24 * 60]}
            ticks={[-3*60, -2*60, -1*60, 0, 6*60, 12*60, 18*60, 24*60]}
            label={{ value: '时间', angle: -90, position: 'insideLeft' }}
            stroke="#666"
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="sleepTime"
            stroke="#1ea5f9"
            strokeWidth={2}
            name="入睡时间"
            dot={{ fill: '#1ea5f9', r: 4 }}
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
    </div>
  );
};

export default SleepTimeTrendChart;
