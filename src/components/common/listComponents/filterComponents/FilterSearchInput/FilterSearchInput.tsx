import React from 'react';
import './FilterSearchInput.scss';

interface FilterSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}

const FilterSearchInput: React.FC<FilterSearchInputProps> = ({
  value,
  onChange,
  placeholder = '搜索备注',
  className = '',
  width = '120px'
}) => {
  return (
    <div className={`filter-search-input-wrapper ${className}`} style={{ width }}>
      <input
        type="text"
        className="filter-search-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={10}
      />
      <span className="filter-search-icon">👀</span>
    </div>
  );
};

export default FilterSearchInput;

