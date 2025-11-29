import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyTrendData } from '@/utils/daily/statistics';
import './WorkTimeChart.scss';

interface WorkTimeChartProps {
  data: DailyTrendData[];
}

const WorkTimeChart: React.FC<WorkTimeChartProps> = ({ data }) => {
  // 筛选最近10天有工作时长的数据
  const chartData = data
    .filter(item => item.workHours > 0 || item.studyHours > 0)
    .slice(-10) // 只取最近10天
    .map(item => ({
      日期: item.date.slice(5), // MM-DD
      工作时长: item.workHours,
      学习时长: item.studyHours,
      date: item.date
    }));

  if (chartData.length === 0) {
    return (
      <div className="work-time-chart work-time-chart--empty">
        <h3 className="work-time-chart__title">⏰ 工作时长分析（最近10天）</h3>
        <div className="work-time-chart__empty-message">
          <p>暂无日常数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="work-time-chart">
      <h3 className="work-time-chart__title">⏰ 工作时长分析（最近10天）</h3>
      <div className="work-time-chart__container">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
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
              label={{ value: '小时', angle: -90, position: 'insideLeft', fill: '#666' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px'
              }}
              formatter={(value: number, name: string) => [`${value}小时`, name]}
            />
            <Legend />
            {/* 使用堆叠柱状图 - stackId 相同的Bar会堆叠在一起 */}
            <Bar
              dataKey="工作时长"
              stackId="a"
              fill="#1ea5f9"
            />
            <Bar
              dataKey="学习时长"
              stackId="a"
              fill="#52c41a"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkTimeChart;
