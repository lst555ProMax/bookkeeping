import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExpenseRecord, IncomeRecord, RecordType } from '@/types';
import { formatCurrency } from '@/utils';
import './RecordTrendChart.scss';

interface RecordTrendChartProps {
  records: ExpenseRecord[] | IncomeRecord[];
  recordType: RecordType;
  title?: string;
}

interface DayData {
  date: string;
  amount: number;
  displayDate: string;
}

const RecordTrendChart: React.FC<RecordTrendChartProps> = ({ 
  records,
  recordType,
  title
}) => {
  const isIncome = recordType === RecordType.INCOME;
  
  // 根据类型生成默认标题
  const getDefaultTitle = () => {
    return isIncome ? "最近7天收入趋势" : "最近7天开销趋势";
  };
  
  const finalTitle = title || getDefaultTitle();

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

  // 计算最近7天每天的记录
  const getTrendData = (): DayData[] => {
    const last7Days = getLast7Days();
    const dailyExpenses: Record<string, number> = {};
    
    // 计算每天的总金额
    records.forEach(record => {
      const date = record.date;
      dailyExpenses[date] = (dailyExpenses[date] || 0) + record.amount;
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
  
  // 根据类型获取线条颜色
  const getLineColor = () => {
    return isIncome ? '#28a745' : '#45B7D1';
  };

  return (
    <div className="expense-trend-chart">
      <h3 className="expense-trend-chart__title">{finalTitle}</h3>
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
              stroke={getLineColor()}
              strokeWidth={3}
              dot={{ fill: getLineColor(), strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: getLineColor(), strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RecordTrendChart;