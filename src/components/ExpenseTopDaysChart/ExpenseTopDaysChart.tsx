import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseRecord } from '@/types';
import { formatCurrency } from '@/utils';
import './ExpenseTopDaysChart.scss';

interface ExpenseTopDaysChartProps {
  expenses: ExpenseRecord[];
  selectedMonth: string;
  title?: string;
}

interface DayData {
  date: string;
  amount: number;
  displayDate: string;
}

const ExpenseTopDaysChart: React.FC<ExpenseTopDaysChartProps> = ({ 
  expenses, 
  selectedMonth, 
  title = "本月开销最高的7天" 
}) => {
  // 计算每天的总开销
  const getDailyExpenses = () => {
    const dailyExpenses: Record<string, number> = {};
    
    expenses
      .filter(expense => expense.date.startsWith(selectedMonth))
      .forEach(expense => {
        const date = expense.date;
        dailyExpenses[date] = (dailyExpenses[date] || 0) + expense.amount;
      });

    return dailyExpenses;
  };

  // 获取开销最高的7天
  const getTopDays = (): DayData[] => {
    const dailyExpenses = getDailyExpenses();
    
    return Object.entries(dailyExpenses)
      .map(([date, amount]) => ({
        date,
        amount,
        displayDate: formatDisplayDate(date)
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 7)
      .reverse(); // 反转以便在图表中从低到高显示
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
        <div className="expense-top-days-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const data = getTopDays();

  if (data.length === 0) {
    return (
      <div className="expense-top-days-chart expense-top-days-chart--empty">
        <h3 className="expense-top-days-chart__title">{title}</h3>
        <p className="expense-top-days-chart__empty-message">本月暂无支出记录</p>
      </div>
    );
  }

  return (
    <div className="expense-top-days-chart">
      <h3 className="expense-top-days-chart__title">{title}</h3>
      <div className="expense-top-days-chart__container">
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
              tickFormatter={(value) => `¥${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="amount" 
              fill="#FF6B6B"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseTopDaysChart;