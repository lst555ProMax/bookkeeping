import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './AttendanceComplianceChart.scss';

interface AttendanceComplianceChartProps {
  checkInRate: number;
  checkOutRate: number;
  leaveRate: number;
}

const AttendanceComplianceChart: React.FC<AttendanceComplianceChartProps> = ({
  checkInRate,
  checkOutRate,
  leaveRate
}) => {
  const data = [
    { name: '签到合格率 (≤9:30)', value: checkInRate, fullValue: 100 },
    { name: '签退合格率 (≥18:00)', value: checkOutRate, fullValue: 100 },
    { name: '离开合格率 (≥22:00)', value: leaveRate, fullValue: 100 }
  ];

  // 检查是否有数据（所有合格率都为0或未定义表示无数据）
  const hasData = data.some(item => item.value > 0);

  const COLORS = ['#52c41a', '#1890ff', '#722ed1'];

  if (!hasData) {
    return (
      <div className="attendance-compliance-chart attendance-compliance-chart--empty">
        <h3 className="attendance-compliance-chart__title">📋 考勤合格率</h3>
        <div className="attendance-compliance-chart__empty-message">
          <p>暂无日常数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-compliance-chart">
      <h3 className="attendance-compliance-chart__title">📋 考勤合格率</h3>
      <div className="attendance-compliance-chart__container">
        <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={(entry) => `${entry.value}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((_item, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AttendanceComplianceChart;
