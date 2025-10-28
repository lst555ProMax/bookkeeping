import React from 'react';
import './MonthSelector.scss';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  // 生成从2025年10月开始到当前月份的所有月份选项
  const generateMonthOptions = () => {
    const startDate = new Date(2025, 9); // 2025年10月 (月份从0开始)
    const currentDate = new Date();
    const months = [];

    while (startDate <= currentDate) {
      const year = startDate.getFullYear();
      const month = (startDate.getMonth() + 1).toString().padStart(2, '0');
      const value = `${year}-${month}`;
      const label = `${year}年${month}月`;
      
      months.push({ value, label });
      startDate.setMonth(startDate.getMonth() + 1);
    }

    return months.reverse(); // 最新的月份在前
  };

  const monthOptions = generateMonthOptions();

  return (
    <div className="month-selector">
      <label className="month-selector__label">选择月份</label>
      <select
        className="month-selector__select"
        value={selectedMonth}
        onChange={(e) => onMonthChange(e.target.value)}
      >
        {monthOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MonthSelector;