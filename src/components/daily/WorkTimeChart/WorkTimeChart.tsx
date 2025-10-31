import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DailyTrendData } from '@/utils/daily/statistics';
import './WorkTimeChart.scss';

interface WorkTimeChartProps {
  data: DailyTrendData[];
}

const WorkTimeChart: React.FC<WorkTimeChartProps> = ({ data }) => {
  const chartData = data
    .filter(item => item.workHours > 0 || item.companyHours > 0)
    .map(item => ({
      日期: item.date.slice(5), // MM-DD
      工作时长: item.workHours,
      在公司时长: item.companyHours,
      date: item.date
    }));

  return (
    <div className="work-time-chart">
      <div className="chart-header">
        <h3>⏰ 工作时长分析</h3>
      </div>
      {chartData.length > 0 ? (
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
            <Bar
              dataKey="工作时长"
              fill="#667eea"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="在公司时长"
              fill="#52c41a"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="no-data">
          <p>暂无工作时长数据</p>
        </div>
      )}
    </div>
  );
};

export default WorkTimeChart;
