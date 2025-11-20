import React, { useState, useRef, useEffect } from 'react';
import './FilterSelect.scss';

export interface FilterSelectOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  className?: string;
  width?: string;
}

const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  width = 'auto'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
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

  const selectedOption = options.find(opt => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : options[0]?.label || '';

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div 
      className={`filter-select-wrapper ${className} ${isOpen ? 'open' : ''}`}
      style={{ width }}
      ref={selectRef}
    >
      <div 
        className="filter-select-wrapper__trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="filter-select-wrapper__value">{displayText}</span>
        <span className={`filter-select-wrapper__arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="filter-select-wrapper__dropdown">
          {options.map((option) => (
            <div
              key={option.value}
              className={`filter-select-wrapper__option ${value === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
              {value === option.value && (
                <span className="filter-select-wrapper__check">✓</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;

