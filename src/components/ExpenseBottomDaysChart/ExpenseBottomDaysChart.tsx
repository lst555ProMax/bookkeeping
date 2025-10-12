import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseRecord } from '@/types';
import { formatCurrency } from '@/utils';
import './ExpenseBottomDaysChart.scss';

interface ExpenseBottomDaysChartProps {
  expenses: ExpenseRecord[];
  selectedMonth: string;
  title?: string;
}

interface DayData {
  date: string;
  amount: number;
  displayDate: string;
}

const ExpenseBottomDaysChart: React.FC<ExpenseBottomDaysChartProps> = ({ 
  expenses, 
  selectedMonth, 
  title = "本月开销最低的7天" 
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

  // 获取开销最低的7天（排除0开销的天）
  const getBottomDays = (): DayData[] => {
    const dailyExpenses = getDailyExpenses();
    
    return Object.entries(dailyExpenses)
      .map(([date, amount]) => ({
        date,
        amount,
        displayDate: formatDisplayDate(date)
      }))
      .filter(item => item.amount > 0) // 排除没有开销的天
      .sort((a, b) => a.amount - b.amount) // 从低到高排序
      .slice(0, 7);
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
        <div className="expense-bottom-days-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const data = getBottomDays();

  if (data.length === 0) {
    return (
      <div className="expense-bottom-days-chart expense-bottom-days-chart--empty">
        <h3 className="expense-bottom-days-chart__title">{title}</h3>
        <p className="expense-bottom-days-chart__empty-message">本月暂无支出记录</p>
      </div>
    );
  }

  return (
    <div className="expense-bottom-days-chart">
      <h3 className="expense-bottom-days-chart__title">{title}</h3>
      <div className="expense-bottom-days-chart__container">
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
              fill="#4ECDC4"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseBottomDaysChart;