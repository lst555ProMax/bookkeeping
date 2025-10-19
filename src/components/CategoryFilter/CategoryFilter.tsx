import React from 'react';
import './CategoryFilter.scss';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  title?: string; // 可选标题
  totalAmount?: number; // 可选总金额
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  title,
  totalAmount
}) => {
  // 全选
  const handleSelectAll = () => {
    onCategoryChange([...categories]);
  };

  // 全不选
  const handleDeselectAll = () => {
    onCategoryChange([]);
  };

  // 切换单个分类
  const handleToggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const isAllSelected = selectedCategories.length === categories.length;
  const isNoneSelected = selectedCategories.length === 0;

  return (
    <div className="category-filter">
      <div className="category-filter__header">
        {title && (
          <div className="category-filter__title-group">
            <div className="category-filter__title">{title}</div>
            {totalAmount !== undefined && (
              <span className="category-filter__total">¥{totalAmount.toFixed(2)}</span>
            )}
          </div>
        )}
        <div className="category-filter__controls">
          <button 
            className={`control-btn ${isAllSelected ? 'control-btn--active' : ''}`}
            onClick={handleSelectAll}
          >
            全选
          </button>
          <button 
            className={`control-btn ${isNoneSelected ? 'control-btn--active' : ''}`}
            onClick={handleDeselectAll}
          >
            全不选
          </button>
        </div>
      </div>
      <div className="category-filter__items">
        {categories.map(category => (
          <label key={category} className="category-item">
            <input
              type="checkbox"
              checked={selectedCategories.includes(category)}
              onChange={() => handleToggleCategory(category)}
            />
            <span className="category-name">{category}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
