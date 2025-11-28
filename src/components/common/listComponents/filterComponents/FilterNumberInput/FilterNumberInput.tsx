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
    if (val === '') {
      onChange(undefined);
      return;
    }
    
    // 只允许非负整数（不允许负号、小数点）
    const integerRegex = /^\d*$/;
    if (!integerRegex.test(val)) {
      return; // 不更新值，保持原值
    }
    
    // 允许中间状态输入，不在这里验证范围
    // 范围验证在 handlePaste 和 handleBlur 中进行
    const numVal = parseFloat(val);
    if (!isNaN(numVal)) {
      onChange(numVal);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // 如果粘贴内容为空，允许
    if (pastedText.trim() === '') {
      onChange(undefined);
      return;
    }

    // 验证格式：只允许非负整数
    const integerRegex = /^\d+$/;
    if (!integerRegex.test(pastedText.trim())) {
      // 格式不符合，阻止粘贴
      return;
    }

    // 验证范围
    const numVal = parseInt(pastedText.trim(), 10);
    if (!isNaN(numVal)) {
      // 检查是否超出范围
      if (min !== undefined && numVal < min) {
        // 超出最小值，阻止粘贴
        return;
      }
      if (max !== undefined && numVal > max) {
        // 超出最大值，阻止粘贴
        return;
      }

      // 格式和范围都符合，允许粘贴
      onChange(numVal);
    }
  };

  const handleBlur = () => {
    // 失焦时验证并修正范围
    if (value !== undefined) {
      let finalVal = value;
      
      // 应用 min/max 限制
      if (min !== undefined && finalVal < min) {
        finalVal = min;
      }
      if (max !== undefined && finalVal > max) {
        finalVal = max;
      }
      
      // 确保值是非负整数
      finalVal = Math.max(0, Math.floor(finalVal));
      
      onChange(finalVal);
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
      
      // 应用 min/max 限制（确保非负整数）
      if (min !== undefined && newVal < min) {
        newVal = min;
      }
      if (max !== undefined && newVal > max) {
        newVal = max;
      }
      
      // 确保值是非负整数
      newVal = Math.max(0, Math.floor(newVal));
      
      onChange(newVal);
    }
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      className={`filter-number-input ${className}`}
      style={{ width, textAlign }}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onBlur={handleBlur}
    />
  );
};

export default FilterNumberInput;

