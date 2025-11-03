import React from 'react';
import './CategoryFilter.scss';

interface CategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  title?: string; // 可选标题
  totalAmount?: number; // 当前筛选的金额
  allTotalAmount?: number; // 所有记录的总金额（用于计算百分比）
  monthlyAmount?: number; // 本月金额
  theme?: 'expense' | 'income'; // 主题：支出（紫色）或收入（绿色）
  // 操作按钮相关
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  title,
  totalAmount,
  allTotalAmount,
  monthlyAmount,
  theme = 'expense',
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false
}) => {
  // 计算总金额百分比
  const percentage = allTotalAmount && allTotalAmount > 0 && totalAmount !== undefined
    ? ((totalAmount / allTotalAmount) * 100).toFixed(1)
    : null;
  
  // 计算月份金额百分比
  const monthlyPercentage = allTotalAmount && allTotalAmount > 0 && monthlyAmount !== undefined
    ? ((monthlyAmount / allTotalAmount) * 100).toFixed(1)
    : null;
  
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
    <div className={`category-filter category-filter--${theme}`}>
      <div className="category-filter__header">
        {title && (
          <div className="category-filter__title-group">
            <div className="category-filter__title">{title}</div>
            {monthlyAmount !== undefined && (
              <span className="category-filter__monthly">
                ¥{monthlyAmount.toFixed(2)}
                {monthlyPercentage !== null && (
                  <span className="category-filter__percentage"> ({monthlyPercentage}%)</span>
                )}
              </span>
            )}
            {totalAmount !== undefined && (
              <span className="category-filter__total">
                ¥{totalAmount.toFixed(2)}
                {percentage !== null && (
                  <span className="category-filter__percentage"> ({percentage}%)</span>
                )}
              </span>
            )}
          </div>
        )}
        {/* 操作按钮区域 */}
        {(onViewDashboard || onExport || onImport || onClear) && (
          <div className="category-filter__actions">
            {onViewDashboard && (
              <button 
                className="action-icon-btn" 
                onClick={onViewDashboard}
                title="查看数据看板"
              >
                📊
              </button>
            )}
            {onExport && (
              <button 
                className="action-icon-btn action-icon-btn--export" 
                onClick={onExport}
                title="导出数据"
              >
                📤
              </button>
            )}
            {onImport && (
              <button 
                className="action-icon-btn action-icon-btn--import" 
                onClick={onImport}
                disabled={isImporting}
                title={isImporting ? "导入中..." : "导入数据"}
              >
                📥
              </button>
            )}
            {onClear && (
              <button 
                className="action-icon-btn action-icon-btn--danger" 
                onClick={onClear}
                title="清空数据"
              >
                🗑️
              </button>
            )}
          </div>
        )}
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
      {/* 全选按钮移到下面 */}
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
  );
};

export default CategoryFilter;
