import React, { useState, useRef, useEffect, useCallback } from 'react';
import './FormSelect.scss';

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  placeholder?: string;
  required?: boolean;
  id?: string;
  className?: string;
}

const FormSelect: React.FC<FormSelectProps> = ({
  value,
  onChange,
  options,
  placeholder = '请选择',
  required = false,
  id,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 检测是否需要向上展开
  const checkPosition = useCallback(() => {
    if (!selectRef.current) return;

    const rect = selectRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    // 下拉框的预估高度（最大300px + 8px间距）
    const estimatedHeight = 308;
    
    // 如果底部空间不够，且上方空间足够，则向上展开
    if (spaceBelow < estimatedHeight && spaceAbove > estimatedHeight) {
      setOpenUpward(true);
    } else {
      setOpenUpward(false);
    }
  }, []);

  // 点击外部关闭和位置检测
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // 打开时检测位置
      checkPosition();
      // 监听滚动和窗口大小变化
      window.addEventListener('scroll', checkPosition, true);
      window.addEventListener('resize', checkPosition);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', checkPosition, true);
      window.removeEventListener('resize', checkPosition);
    };
  }, [isOpen, checkPosition]);

  // 获取当前选中项的标签
  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  const handleToggle = () => {
    if (!isOpen) {
      // 打开前先检测位置
      checkPosition();
    }
    setIsOpen(!isOpen);
  };

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`custom-select ${className} ${isOpen ? 'open' : ''} ${openUpward ? 'upward' : ''}`}
      ref={selectRef}
    >
      <div 
        className="custom-select__trigger"
        onClick={handleToggle}
      >
        <span className={`custom-select__value ${!selectedOption ? 'placeholder' : ''}`}>
          {displayText}
        </span>
        <span className={`custom-select__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div 
          className={`custom-select__dropdown ${openUpward ? 'upward' : ''}`}
          ref={dropdownRef}
        >
          {options.length === 0 ? (
            <div className="custom-select__option custom-select__option--empty">
              暂无选项
            </div>
          ) : (
            options.map((option) => (
              <div
                key={option.value}
                className={`custom-select__option ${value === option.value ? 'selected' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {value === option.value && (
                  <span className="custom-select__check">✓</span>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* 隐藏的原生select用于表单验证 */}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="custom-select__native"
        tabIndex={-1}
      >
        {!required && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default FormSelect;

