import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import './StudyTrendChart.scss';

interface DateStats {
  date: string;
  totalMinutes: number;
  recordCount: number;
}

interface LineData {
  date: string;
  minutes: number;
  displayDate: string;
}

interface StudyTrendChartProps {
  dateStats: DateStats[];
}

const StudyTrendChart: React.FC<StudyTrendChartProps> = ({ dateStats }) => {
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
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

  // 准备折线图数据
  const lineChartData: LineData[] = dateStats.map(stat => ({
    date: stat.date,
    minutes: stat.totalMinutes,
    displayDate: formatDate(stat.date)
  }));

  // 自定义折线图 Tooltip
  const CustomLineTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="study-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatDuration(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-card chart-card--trend">
      <h3 className="chart-card__title">📈 最近7天学习趋势</h3>
      <div className="chart-card__container">
        {lineChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={lineChartData}
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
              <Tooltip content={<CustomLineTooltip />} />
              <Line 
                type="monotone" 
                dataKey="minutes" 
                stroke="#45B7D1"
                strokeWidth={3}
                dot={{ fill: '#45B7D1', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#45B7D1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="empty-state">暂无数据</div>
        )}
      </div>
    </div>
  );
};

export default StudyTrendChart;

