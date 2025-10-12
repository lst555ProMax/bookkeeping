import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExpenseRecord, ExpenseCategory } from '@/types';
import { formatCurrency } from '@/utils';
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

// 为不同分类定义颜色
const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  [ExpenseCategory.MEALS]: '#FF6B6B',
  [ExpenseCategory.SNACKS]: '#4ECDC4', 
  [ExpenseCategory.TRANSPORT]: '#45B7D1',
  [ExpenseCategory.TRAVEL]: '#96CEB4',
  [ExpenseCategory.SOFTWARE]: '#FECA57',
  [ExpenseCategory.MEDICAL]: '#FF9FF3',
  [ExpenseCategory.HOUSING]: '#54A0FF',
  [ExpenseCategory.GIFTS]: '#5F27CD',
  [ExpenseCategory.OTHER]: '#C8D6E5'
};

const ExpensePieChart: React.FC<ExpensePieChartProps> = ({ expenses, title = "支出分类统计" }) => {
  // 计算每个分类的总金额
  const categoryData: CategoryData[] = Object.values(ExpenseCategory).map(category => {
    const categoryExpenses = expenses.filter(expense => expense.category === category);
    const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    return {
      name: category,
      value: total,
      color: CATEGORY_COLORS[category]
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