import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseRecord, IncomeRecord, RecordType } from '@/utils';
import { formatCurrency } from '@/utils';
import './RecordDaysChart.scss';

interface RecordDaysChartProps {
  records: ExpenseRecord[] | IncomeRecord[];
  recordType: RecordType;
  selectedMonth: string;
  type: 'top' | 'bottom'; // 新增类型参数
  title?: string;
  count?: number; // 显示天数，默认7天
}

interface DayData {
  date: string;
  amount: number;
  displayDate: string;
}

const RecordDaysChart: React.FC<RecordDaysChartProps> = ({ 
  records,
  recordType,
  selectedMonth, 
  type,
  title,
  count = 7
}) => {
  const isIncome = recordType === RecordType.INCOME;
  
  // 根据类型生成默认标题
  const getDefaultTitle = () => {
    const recordLabel = isIncome ? '收入' : '开销';
    return type === 'top' ? `本月${recordLabel}最高的${count}天` : `本月${recordLabel}最低的${count}天`;
  };

  const finalTitle = title || getDefaultTitle();

  // 计算每天的总额
  const getDailyExpenses = () => {
    const dailyExpenses: Record<string, number> = {};
    
    records
      .filter(record => record.date.startsWith(selectedMonth))
      .forEach(record => {
        const date = record.date;
        dailyExpenses[date] = (dailyExpenses[date] || 0) + record.amount;
      });

    return dailyExpenses;
  };

  // 获取指定类型的天数数据
  const getDaysData = (): DayData[] => {
    const dailyExpenses = getDailyExpenses();
    
    let sortedEntries = Object.entries(dailyExpenses)
      .map(([date, amount]) => ({
        date,
        amount,
        displayDate: formatDisplayDate(date)
      }));

    if (type === 'bottom') {
      // 最低开销：排除0开销的天，然后从低到高排序
      sortedEntries = sortedEntries
        .filter(item => item.amount > 0)
        .sort((a, b) => a.amount - b.amount);
    } else {
      // 最高开销：从高到低排序，然后反转以便在图表中从低到高显示
      sortedEntries = sortedEntries
        .sort((a, b) => b.amount - a.amount)
        .slice(0, count)
        .reverse();
      return sortedEntries;
    }

    return sortedEntries.slice(0, count);
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
        <div className="expense-days-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // 根据类型获取柱子颜色
  const getBarColor = () => {
    if (isIncome) {
      return type === 'top' ? '#28a745' : '#74c69d';
    } else {
      return type === 'top' ? '#FF6B6B' : '#4ECDC4';
    }
  };

  const data = getDaysData();

  if (data.length === 0) {
    return (
      <div className="expense-days-chart expense-days-chart--empty">
        <h3 className="expense-days-chart__title">{finalTitle}</h3>
        <p className="expense-days-chart__empty-message">本月暂无{isIncome ? '收入' : '支出'}记录</p>
      </div>
    );
  }

  return (
    <div className="expense-days-chart">
      <h3 className="expense-days-chart__title">{finalTitle}</h3>
      <div className="expense-days-chart__container">
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
              fill={getBarColor()}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecordDaysChart;