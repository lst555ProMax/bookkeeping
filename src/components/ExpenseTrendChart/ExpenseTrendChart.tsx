import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseRecord } from '@/types';
import { formatCurrency } from '@/utils';
import './ExpenseTrendChart.scss';

interface ExpenseTrendChartProps {
  expenses: ExpenseRecord[];
  title?: string;
}

interface DayData {
  date: string;
  amount: number;
  displayDate: string;
}

const ExpenseTrendChart: React.FC<ExpenseTrendChartProps> = ({ 
  expenses, 
  title = "最近7天开销趋势" 
}) => {
  // 获取最近7天的日期
  const getLast7Days = (): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // 计算最近7天每天的开销
  const getTrendData = (): DayData[] => {
    const last7Days = getLast7Days();
    const dailyExpenses: Record<string, number> = {};
    
    // 计算每天的总开销
    expenses.forEach(expense => {
      const date = expense.date;
      dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
    });

    // 为最近7天生成数据，没有记录的天数金额为0
    return last7Days.map(date => ({
      date,
      amount: dailyExpenses[date] || 0,
      displayDate: formatDisplayDate(date)
    }));
  };

  // 格式化日期显示
  const formatDisplayDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
  };

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="expense-trend-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const data = getTrendData();

  return (
    <div className="expense-trend-chart">
      <h3 className="expense-trend-chart__title">{title}</h3>
      <div className="expense-trend-chart__container">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
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
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="amount" 
              stroke="#45B7D1"
              strokeWidth={3}
              dot={{ fill: '#45B7D1', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#45B7D1', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseTrendChart;