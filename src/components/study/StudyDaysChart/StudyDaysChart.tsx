import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './StudyDaysChart.scss';

interface DayData {
  date: string;
  totalMinutes: number;
  displayDate: string;
}

interface StudyDaysChartProps {
  dailyStats: Map<string, number>;
  selectedMonth: string;
  type: 'top' | 'bottom';
  title?: string;
  count?: number;
}

const StudyDaysChart: React.FC<StudyDaysChartProps> = ({ 
  dailyStats,
  selectedMonth,
  type,
  title,
  count = 3
}) => {
  // 格式化日期显示
  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 格式化时长
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 获取指定类型的天数数据
  const getDaysData = (): DayData[] => {
    // 过滤当月数据
    const monthlyData = Array.from(dailyStats.entries())
      .filter(([date]) => date.startsWith(selectedMonth))
      .map(([date, totalMinutes]) => ({
        date,
        totalMinutes,
        displayDate: formatDisplayDate(date)
      }));

    if (type === 'bottom') {
      // 最少学习：排除0学习的天，然后从低到高排序
      const sorted = monthlyData
        .filter(item => item.totalMinutes > 0)
        .sort((a, b) => a.totalMinutes - b.totalMinutes);
      return sorted.slice(0, count);
    } else {
      // 最多学习：从高到低排序，然后反转以便在图表中从低到高显示
      const sorted = monthlyData
        .sort((a, b) => b.totalMinutes - a.totalMinutes)
        .slice(0, count)
        .reverse();
      return sorted;
    }
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="study-days-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatDuration(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // 根据类型获取柱子颜色（参照账单面板配色）
  const getBarColor = () => {
    return type === 'top' ? '#FF6B6B' : '#4ECDC4';
  };

  const data = getDaysData();
  const defaultTitle = type === 'top' 
    ? `📚 本月学习时长最多的${count}天` 
    : `📚 本月学习时长最少的${count}天`;
  const finalTitle = title || defaultTitle;

  if (data.length === 0) {
    return (
      <div className="study-days-chart study-days-chart--empty">
        <h3 className="study-days-chart__title">{finalTitle}</h3>
        <p className="study-days-chart__empty-message">本月暂无学习记录</p>
      </div>
    );
  }

  return (
    <div className="study-days-chart">
      <h3 className="study-days-chart__title">{finalTitle}</h3>
      <div className="study-days-chart__container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="displayDate" 
              tick={{ fontSize: 12 }}
              stroke="#666"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              stroke="#666"
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="totalMinutes" 
              fill={getBarColor()}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyDaysChart;

