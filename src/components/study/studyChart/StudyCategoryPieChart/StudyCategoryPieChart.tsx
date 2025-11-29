import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './StudyCategoryPieChart.scss';

interface CategoryStats {
  category: string;
  totalMinutes: number;
  recordCount: number;
  percentage: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface StudyCategoryPieChartProps {
  categoryStats: CategoryStats[];
}

const StudyCategoryPieChart: React.FC<StudyCategoryPieChartProps> = ({ categoryStats }) => {
  // 获取分类颜色（参照账单面板支出饼图配色）
  const getCategoryColor = (index: number) => {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#C8D6E5', '#A8E6CF',
      '#FFD93D', '#6C5CE7', '#FD79A8', '#00B894', '#E17055'
    ];
    return colors[index % colors.length];
  };

  // 准备饼图数据
  const pieChartData: PieData[] = categoryStats.map((stat, index) => ({
    name: stat.category,
    value: stat.totalMinutes,
    color: getCategoryColor(index)
  }));

  // 格式化时长
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 自定义饼图 Tooltip
  const CustomPieTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: PieData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="study-chart__tooltip">
          <p className="tooltip__label">{data.name}</p>
          <p className="tooltip__value">{formatDuration(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (pieChartData.length === 0) {
    return (
      <div className="chart-card chart-card--pie chart-card--empty">
        <h3 className="chart-card__title">📊 学习分类统计</h3>
        <div className="chart-card__empty-message">
          <p>暂无学习数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card chart-card--pie">
      <h3 className="chart-card__title">📊 学习分类统计</h3>
      <div className="chart-card__container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              formatter={(value) => value}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyCategoryPieChart;

