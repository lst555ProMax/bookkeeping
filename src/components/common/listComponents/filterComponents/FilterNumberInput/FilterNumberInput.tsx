import React from 'react';
import './FilterNumberInput.scss';

interface FilterNumberInputProps {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  width?: string;
  textAlign?: 'left' | 'center' | 'right'; // 文本对齐方式
}

const FilterNumberInput: React.FC<FilterNumberInputProps> = ({
  value,
  onChange,
  placeholder = '',
  min,
  max,
  step = 1,
  className = '',
  width = '60px',
  textAlign = 'left'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || val === '-') {
      onChange(undefined);
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        // 应用 min/max 限制
        let finalVal = numVal;
        if (min !== undefined && finalVal < min) {
          finalVal = min;
        }
        if (max !== undefined && finalVal > max) {
          finalVal = max;
        }
        onChange(finalVal);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 处理上下键，确保值在范围内
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentVal = value ?? (min ?? 0);
      let newVal = currentVal;
      
      if (e.key === 'ArrowUp') {
        newVal = currentVal + step;
      } else {
        newVal = currentVal - step;
      }
      
      // 应用 min/max 限制
      if (min !== undefined && newVal < min) {
        newVal = min;
      }
      if (max !== undefined && newVal > max) {
        newVal = max;
      }
      
      onChange(newVal);
    }
  };

  return (
    <input
      type="number"
      className={`filter-number-input ${className}`}
      style={{ width, textAlign }}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default FilterNumberInput;

