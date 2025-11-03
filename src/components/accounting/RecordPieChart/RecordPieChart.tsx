import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ExpenseRecord, IncomeRecord, RecordType } from '@/utils';
import { formatCurrency, getCategories, getIncomeCategories } from '@/utils';
import './RecordPieChart.scss';

interface RecordPieChartProps {
  records: ExpenseRecord[] | IncomeRecord[];
  recordType: RecordType;
  title?: string;
  totalAmount?: number; // 总金额（保留作为备用参数）
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number; // 添加索引签名
}

// 生成颜色的函数
const generateColor = (index: number, isIncome: boolean = false): string => {
  if (isIncome) {
    // 收入使用绿色系
    const incomeColors = [
      '#28a745', '#20c997', '#6f9654', '#52b788', '#2d6a4f',
      '#40916c', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc'
    ];
    return incomeColors[index % incomeColors.length];
  } else {
    // 支出使用暖色系
    const expenseColors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', 
      '#FF9FF3', '#54A0FF', '#5F27CD', '#C8D6E5', '#A8E6CF',
      '#FFD93D', '#6C5CE7', '#FD79A8', '#00B894', '#E17055'
    ];
    return expenseColors[index % expenseColors.length];
  }
};

// 获取分类颜色
const getCategoryColor = (index: number, isIncome: boolean = false): string => {
  return generateColor(index, isIncome);
};


const RecordPieChart: React.FC<RecordPieChartProps> = ({ 
  records, 
  recordType,
  title
  // totalAmount 参数暂时保留,未来可能使用
}) => {
  // 根据记录类型生成默认标题
  const getDefaultTitle = () => {
    return recordType === RecordType.EXPENSE ? "支出分类统计" : "收入分类统计";
  };
  
  const finalTitle = title || getDefaultTitle();
  const isIncome = recordType === RecordType.INCOME;
  
  // 获取对应类型的分类
  const categories = isIncome ? getIncomeCategories() : getCategories();
  
  // 计算每个分类的总金额
  const categoryData: CategoryData[] = categories.map((category, index) => {
    const categoryRecords = records.filter(record => record.category === category);
    const total = categoryRecords.reduce((sum, record) => sum + record.amount, 0);
    
    return {
      name: category,
      value: total,
      color: getCategoryColor(index, isIncome)
    };
  }).filter(item => item.value > 0); // 只显示有记录的分类

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
        <h3 className="expense-pie-chart__title">{finalTitle}</h3>
        <div className="expense-pie-chart__empty-message">
          <p>暂无{recordType === RecordType.EXPENSE ? '支出' : '收入'}数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-pie-chart">
      <h3 className="expense-pie-chart__title">
        {finalTitle}
      </h3>
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

export default RecordPieChart;