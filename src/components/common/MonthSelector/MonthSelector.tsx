import React from 'react';
import { FormSelect } from '../FormSelect';
import type { FormSelectOption } from '../FormSelect';
import './MonthSelector.scss';

interface MonthSelectorProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MonthSelector: React.FC<MonthSelectorProps> = ({ selectedMonth, onMonthChange }) => {
  // 生成从2025年10月开始到当前月份的所有月份选项
  const generateMonthOptions = (): FormSelectOption[] => {
    const startDate = new Date(2025, 9); // 2025年10月 (月份从0开始)
    const currentDate = new Date();
    const months: FormSelectOption[] = [];

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
      <FormSelect
        value={selectedMonth}
        onChange={onMonthChange}
        options={monthOptions}
        placeholder="选择月份"
        className="month-selector__select"
      />
    </div>
  );
};

export default MonthSelector;

