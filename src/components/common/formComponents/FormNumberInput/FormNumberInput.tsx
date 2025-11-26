import React from 'react';
import './FormNumberInput.scss';

interface FormNumberInputProps {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  decimalPlaces?: number; // 小数位数限制（0表示整数）
  arrowStep?: number; // 上下箭头键的步长（默认等于step）
  wheelStep?: number; // 鼠标滚轮的步长（默认等于step）
}

const FormNumberInput: React.FC<FormNumberInputProps> = ({
  value,
  onChange,
  placeholder = '',
  min,
  max,
  step = 1,
  className = '',
  id,
  required = false,
  disabled = false,
  decimalPlaces = 0,
  arrowStep,
  wheelStep
}) => {
  const effectiveArrowStep = arrowStep ?? step;
  const effectiveWheelStep = wheelStep ?? step;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // 如果输入为空，允许清空
    if (inputValue === '' || inputValue === '-') {
      onChange('');
      return;
    }

    // 根据 decimalPlaces 限制小数位数
    if (decimalPlaces === 0) {
      // 整数：只允许数字
      const regex = /^-?\d*$/;
      if (regex.test(inputValue)) {
        onChange(inputValue);
      }
    } else {
      // 小数：限制小数位数
      const regex = new RegExp(`^-?\\d*\\.?\\d{0,${decimalPlaces}}$`);
      if (regex.test(inputValue)) {
        onChange(inputValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 处理上下键
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const currentVal = parseFloat(String(value)) || (min ?? 0);
      let newVal = currentVal;
      
      if (e.key === 'ArrowUp') {
        newVal = currentVal + effectiveArrowStep;
      } else {
        newVal = currentVal - effectiveArrowStep;
      }
      
      // 应用 min/max 限制
      if (min !== undefined && newVal < min) {
        newVal = min;
      }
      if (max !== undefined && newVal > max) {
        newVal = max;
      }
      
      // 根据 decimalPlaces 格式化输出
      if (decimalPlaces === 0) {
        onChange(Math.round(newVal).toString());
      } else {
        onChange(newVal.toFixed(decimalPlaces));
      }
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    // 处理滚轮事件
    if (disabled) return;
    
    e.preventDefault();
    const currentVal = parseFloat(String(value)) || (min ?? 0);
    let newVal = currentVal;
    
    // 根据滚轮方向调整值
    if (e.deltaY < 0) {
      // 向上滚动，增加
      newVal = currentVal + effectiveWheelStep;
    } else {
      // 向下滚动，减少
      newVal = currentVal - effectiveWheelStep;
    }
    
    // 应用 min/max 限制
    if (min !== undefined && newVal < min) {
      newVal = min;
    }
    if (max !== undefined && newVal > max) {
      newVal = max;
    }
    
    // 根据 decimalPlaces 格式化输出
    if (decimalPlaces === 0) {
      onChange(Math.round(newVal).toString());
    } else {
      // 对于小数，保持精度
      onChange(newVal.toFixed(decimalPlaces));
    }
  };

  const handleBlur = () => {
    // 失焦时格式化值
    const numVal = parseFloat(String(value));
    if (!isNaN(numVal)) {
      let finalVal = numVal;
      
      // 应用 min/max 限制
      if (min !== undefined && finalVal < min) {
        finalVal = min;
      }
      if (max !== undefined && finalVal > max) {
        finalVal = max;
      }
      
      // 根据 decimalPlaces 格式化输出
      if (decimalPlaces === 0) {
        onChange(Math.round(finalVal).toString());
      } else {
        onChange(finalVal.toFixed(decimalPlaces));
      }
    } else if (value === '') {
      // 如果为空且不是必填，保持为空
      onChange('');
    } else if (required) {
      // 如果必填但值无效，设置为最小值或0
      onChange(min !== undefined ? min.toString() : '0');
    }
  };

  return (
    <input
      type="number"
      id={id}
      className={`form-number-input ${className}`}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onWheel={handleWheel}
      onBlur={handleBlur}
      min={min}
      max={max}
      step={step}
      required={required}
      disabled={disabled}
    />
  );
};

export default FormNumberInput;

