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
}

const FilterNumberInput: React.FC<FilterNumberInputProps> = ({
  value,
  onChange,
  placeholder = '',
  min,
  max,
  step = 1,
  className = '',
  width = '60px'
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      onChange(undefined);
    } else {
      const numVal = parseFloat(val);
      if (!isNaN(numVal)) {
        onChange(numVal);
      }
    }
  };

  return (
    <input
      type="number"
      className={`filter-number-input ${className}`}
      style={{ width }}
      placeholder={placeholder}
      value={value ?? ''}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
    />
  );
};

export default FilterNumberInput;

