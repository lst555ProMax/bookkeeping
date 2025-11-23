import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './TimePicker.scss';

interface TimePickerProps {
  value: string; // HH:MM 格式
  onChange: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  placeholder = '请选择时间',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const pickerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 解析时间值
  const parseTime = (timeStr: string): { hour: number; minute: number } => {
    if (!timeStr || !timeStr.includes(':')) {
      return { hour: 0, minute: 0 };
    }
    const [hour, minute] = timeStr.split(':').map(Number);
    return { 
      hour: isNaN(hour) ? 0 : hour, 
      minute: isNaN(minute) ? 0 : minute 
    };
  };

  const { hour: currentHour, minute: currentMinute } = parseTime(value);
  const [selectedHour, setSelectedHour] = useState(currentHour);
  const [selectedMinute, setSelectedMinute] = useState(currentMinute);

  // 当外部值变化时，更新内部状态
  useEffect(() => {
    const { hour, minute } = parseTime(value);
    setSelectedHour(hour);
    setSelectedMinute(minute);
  }, [value]);

  // 格式化显示时间
  const formatDisplayTime = (timeStr: string): string => {
    if (!timeStr || !timeStr.includes(':')) return placeholder;
    const { hour, minute } = parseTime(timeStr);
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 计算下拉框位置
  const updateDropdownPosition = () => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateDropdownPosition();
      
      // 监听滚动和窗口大小变化，更新位置
      const handleScroll = () => updateDropdownPosition();
      const handleResize = () => updateDropdownPosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isOpen]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current && 
        !pickerRef.current.contains(event.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // 生成小时选项 (0-23)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // 生成分钟选项 (0-59，步长为1)
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  // 处理时间选择（立即更新值）
  const handleTimeChange = (hour: number, minute: number, closeOnMinuteClick: boolean = false) => {
    setSelectedHour(hour);
    setSelectedMinute(minute);
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onChange(timeStr);
    // 如果点击的是分钟值，直接关闭下拉框
    if (closeOnMinuteClick) {
      setIsOpen(false);
    }
  };

  // 滚动到选中项
  const scrollToSelected = (containerRef: React.RefObject<HTMLDivElement>, selectedValue: number) => {
    if (containerRef.current) {
      const item = containerRef.current.querySelector(`[data-value="${selectedValue}"]`);
      if (item) {
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minuteScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // 延迟滚动，确保下拉框已渲染
      setTimeout(() => {
        scrollToSelected(hourScrollRef, selectedHour);
        scrollToSelected(minuteScrollRef, selectedMinute);
      }, 100);
    }
  }, [isOpen, selectedHour, selectedMinute]);

  return (
    <div className="time-picker" ref={pickerRef}>
      <div 
        className={`time-picker__input ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className="time-picker__icon">⏰</span>
        <span className="time-picker__value">{formatDisplayTime(value)}</span>
        <span className={`time-picker__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && ReactDOM.createPortal(
        <div 
          ref={dropdownRef}
          className="time-picker__dropdown"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            width: `${dropdownPosition.width}px`
          }}
        >
          <div className="time-picker__header">
            <span className="time-picker__title">选择时间</span>
          </div>

          <div className="time-picker__selectors">
            {/* 小时选择器 */}
            <div className="time-picker__selector">
              <div className="time-picker__label">时</div>
              <div className="time-picker__scroll-container" ref={hourScrollRef}>
                {hours.map((hour) => (
                  <div
                    key={hour}
                    data-value={hour}
                    className={`time-picker__option ${
                      selectedHour === hour ? 'selected' : ''
                    }`}
                    onClick={() => handleTimeChange(hour, selectedMinute)}
                  >
                    {String(hour).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* 分隔符 */}
            <div className="time-picker__separator">:</div>

            {/* 分钟选择器 */}
            <div className="time-picker__selector">
              <div className="time-picker__label">分</div>
              <div className="time-picker__scroll-container" ref={minuteScrollRef}>
                {minutes.map((minute) => (
                  <div
                    key={minute}
                    data-value={minute}
                    className={`time-picker__option ${
                      selectedMinute === minute ? 'selected' : ''
                    }`}
                    onClick={() => handleTimeChange(selectedHour, minute, true)}
                  >
                    {String(minute).padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default TimePicker;

