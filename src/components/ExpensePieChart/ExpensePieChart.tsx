import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExpenseRecord } from '@/types';
import { formatCurrency, getCategories } from '@/utils';
import './ExpensePieChart.scss';

interface ExpensePieChartProps {
  expenses: ExpenseRecord[];
  title?: string;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // 添加索引签名
}


// 生成颜色的函数
const generateColor = (index: number): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
    '#FF9FF3', '#54A0FF', '#5F27CD', '#C8D6E5', '#A8E6CF',
    '#FFD93D', '#6C5CE7', '#FD79A8', '#00B894', '#E17055'
  ];
  return colors[index % colors.length];
};

// 获取分类颜色
const getCategoryColor = (category: string, index: number): string => {
  return generateColor(index);
};

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, title = "支出分类统计" }) => {
  // 获取所有分类
  const categories = getCategories();
  
  // 计算每个分类的总金额
  const categoryData: CategoryData[] = categories.map((category, index) => {
    const categoryExpenses = expenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category,
      value: total,
      color: getCategoryColor(category, index)
    };
  }).filter(item => item.value > 0); // 只显示有支出的分类

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: CategoryData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategoryData;
      return (
        <div className="expense-pie-chart__tooltip">
          <p className="tooltip__label">{data.name}</p>
          <p className="tooltip__value">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  if (categoryData.length === 0) {
    return (
      <div className="expense-pie-chart expense-pie-chart--empty">
        <h3 className="expense-pie-chart__title">{title}</h3>
        <div className="expense-pie-chart__empty-message">
          <p>暂无支出数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-pie-chart">
      <h3 className="expense-pie-chart__title">{title}</h3>
      <div className="expense-pie-chart__container">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
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

export default ExpensePieChart;