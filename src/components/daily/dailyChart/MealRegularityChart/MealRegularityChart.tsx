import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './MealRegularityChart.scss';

interface MealStats {
  regular: number;
  irregular: number;
  notEaten: number;
}

interface MealRegularityChartProps {
  breakfastStats: MealStats;
  lunchStats: MealStats;
  dinnerStats: MealStats;
}

const MealRegularityChart: React.FC<MealRegularityChartProps> = ({
  breakfastStats,
  lunchStats,
  dinnerStats
}) => {
  const data = [
    {
      name: '早餐',
      规律: breakfastStats.regular,
      不规律: breakfastStats.irregular,
      未吃: breakfastStats.notEaten
    },
    {
      name: '午餐',
      规律: lunchStats.regular,
      不规律: lunchStats.irregular,
      未吃: lunchStats.notEaten
    },
    {
      name: '晚餐',
      规律: dinnerStats.regular,
      不规律: dinnerStats.irregular,
      未吃: dinnerStats.notEaten
    }
  ];

  return (
    <div className="meal-regularity-chart">
      <div className="chart-header">
        <h3>🍽️ 三餐规律性统计</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#666', fontSize: 14 }}
          />
          <YAxis 
            tick={{ fill: '#666', fontSize: 14 }}
            label={{ value: '天数', angle: -90, position: 'insideLeft', fill: '#666' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '10px'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="rect"
          />
          <Bar dataKey="规律" fill="#52c41a" radius={[8, 8, 0, 0]} />
          <Bar dataKey="不规律" fill="#faad14" radius={[8, 8, 0, 0]} />
          <Bar dataKey="未吃" fill="#ff4d4f" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MealRegularityChart;
