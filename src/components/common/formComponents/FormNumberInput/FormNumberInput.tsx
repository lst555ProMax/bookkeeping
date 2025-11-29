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
  onRangeError?: (error: { type: 'min' | 'max'; value: number; limit: number }) => void; // 超出范围时的回调
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
  wheelStep,
  onRangeError
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

    // 根据 decimalPlaces 限制小数位数（只验证格式，不验证范围）
    // 允许用户输入中间状态，范围验证在 handlePaste 和 handleBlur 中进行
    if (decimalPlaces === 0) {
      // 整数：只允许数字
      const regex = /^-?\d*$/;
      if (!regex.test(inputValue)) {
        return; // 不更新值，保持原值
      }
    } else {
      // 小数：限制小数位数
      const regex = new RegExp(`^-?\\d*\\.?\\d{0,${decimalPlaces}}$`);
      if (!regex.test(inputValue)) {
        return; // 不更新值，保持原值
      }
    }

    onChange(inputValue);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    // 如果粘贴内容为空，允许
    if (pastedText.trim() === '') {
      return;
    }

    // 验证格式
    let isValidFormat = false;
    if (decimalPlaces === 0) {
      // 整数：只允许数字（可能包含负号）
      const regex = /^-?\d+$/;
      isValidFormat = regex.test(pastedText.trim());
    } else {
      // 小数：限制小数位数
      const regex = new RegExp(`^-?\\d+\\.?\\d{0,${decimalPlaces}}$`);
      isValidFormat = regex.test(pastedText.trim());
    }

    if (!isValidFormat) {
      // 格式不符合，阻止粘贴
      return;
    }

    // 验证范围（允许粘贴超出范围的值，在失焦时显示错误提示）
    const numVal = parseFloat(pastedText.trim());
    if (!isNaN(numVal)) {
      // 允许粘贴，即使超出范围（失焦时会触发错误提示）
      // 根据 decimalPlaces 格式化
      let formattedValue: string;
      if (decimalPlaces === 0) {
        formattedValue = Math.round(numVal).toString();
      } else {
        formattedValue = numVal.toFixed(decimalPlaces);
      }
      onChange(formattedValue);
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

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // 失焦时格式化值
    const numVal = parseFloat(String(value));
    if (!isNaN(numVal)) {
      let finalVal = numVal;
      let hasError = false;
      
      // 检查是否超出范围，如果超出则触发错误回调，不自动限制值
      if (min !== undefined && finalVal < min) {
        if (onRangeError) {
          onRangeError({ type: 'min', value: finalVal, limit: min });
        }
        // 设置自定义验证消息
        e.target.setCustomValidity(`值不能小于${min}`);
        hasError = true;
      } else if (max !== undefined && finalVal > max) {
        if (onRangeError) {
          onRangeError({ type: 'max', value: finalVal, limit: max });
        }
        // 设置自定义验证消息
        e.target.setCustomValidity(`值不能大于${max}`);
        hasError = true;
      } else {
        // 清除自定义验证消息
        e.target.setCustomValidity('');
      }
      
      // 如果超出范围，不自动限制值，让用户看到错误
      if (hasError) {
        // 触发原生验证显示
        e.target.reportValidity();
        return;
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
      e.target.setCustomValidity('');
    } else if (required) {
      // 如果必填但值无效，设置为最小值或0
      onChange(min !== undefined ? min.toString() : '0');
      e.target.setCustomValidity('');
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
      onPaste={handlePaste}
      min={min}
      max={max}
      step={step}
      required={required}
      disabled={disabled}
    />
  );
};

export default FormNumberInput;

