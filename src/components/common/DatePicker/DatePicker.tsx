import React, { useState, useRef, useEffect } from 'react';
import './DatePicker.scss';

interface DatePickerProps {
  value: string; // YYYY-MM-DD 格式
  onChange: (date: string) => void;
  minDate?: string; // YYYY-MM-DD 格式
  maxDate?: string; // YYYY-MM-DD 格式
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, minDate, maxDate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    return value ? new Date(value) : new Date();
  });
  const pickerRef = useRef<HTMLDivElement>(null);

  // 格式化显示日期
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '请选择日期';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    return `${year}年${month}月${day}日 星期${weekDay}`;
  };

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 获取当月的所有日期
  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startWeekDay = firstDay.getDay();

    const days: (Date | null)[] = [];

    // 填充上个月的日期
    for (let i = 0; i < startWeekDay; i++) {
      days.push(null);
    }

    // 填充当月的日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  // 检查日期是否在范围内
  const isDateInRange = (date: Date): boolean => {
    const dateStr = formatDateToString(date);
    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;
    return true;
  };

  // 检查是否是今天
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  // 检查是否是选中的日期
  const isSelected = (date: Date): boolean => {
    if (!value) return false;
    const selectedDate = new Date(value);
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // 格式化日期为 YYYY-MM-DD
  const formatDateToString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 处理日期选择
  const handleDateClick = (date: Date) => {
    if (!isDateInRange(date)) return;
    onChange(formatDateToString(date));
    setIsOpen(false);
  };

  // 切换到上个月
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  // 切换到下个月
  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };


  const days = getDaysInMonth(viewDate);
  const monthYear = `${viewDate.getFullYear()}年${viewDate.getMonth() + 1}月`;

  return (
    <div className="date-picker" ref={pickerRef}>
      <div className="date-picker__input" onClick={() => setIsOpen(!isOpen)}>
        <span className="date-picker__icon">📅</span>
        <span className="date-picker__value">{formatDisplayDate(value)}</span>
        <span className={`date-picker__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="date-picker__dropdown">
          <div className="date-picker__header">
            <button 
              type="button"
              className="date-picker__nav-btn" 
              onClick={handlePrevMonth}
              title="上个月"
            >
              ←
            </button>
            <div className="date-picker__month">{monthYear}</div>
            <button 
              type="button"
              className="date-picker__nav-btn" 
              onClick={handleNextMonth}
              title="下个月"
            >
              →
            </button>
          </div>

          <div className="date-picker__weekdays">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="date-picker__weekday">{day}</div>
            ))}
          </div>

          <div className="date-picker__days">
            {days.map((day, index) => (
              <div key={index} className="date-picker__day-cell">
                {day ? (
                  <button
                    type="button"
                    className={`
                      date-picker__day
                      ${isToday(day) ? 'today' : ''}
                      ${isSelected(day) ? 'selected' : ''}
                      ${!isDateInRange(day) ? 'disabled' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                    disabled={!isDateInRange(day)}
                  >
                    {day.getDate()}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;

