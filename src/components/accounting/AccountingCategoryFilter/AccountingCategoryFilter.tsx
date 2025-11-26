import React, { useState } from 'react';
import { FilterNumberInput, FilterSearchInput } from '@/components/common';
import './AccountingCategoryFilter.scss';

interface AccountingCategoryFilterProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  title?: string; // 可选标题
  totalAmount?: number; // 当前筛选的金额
  allTotalAmount?: number; // 所有记录的总金额（用于计算百分比）
  monthlyAmount?: number; // 本月金额
  monthlyTotalAmount?: number; // 本月总金额（用于计算月度百分比）
  theme?: 'expense' | 'income'; // 主题：支出（橙色）或收入（绿色）
  // 操作按钮相关
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
  // 查询功能相关
  minAmount?: number | undefined;
  maxAmount?: number | undefined;
  searchDescription?: string;
  onMinAmountChange?: (value: number | undefined) => void;
  onMaxAmountChange?: (value: number | undefined) => void;
  onSearchDescriptionChange?: (value: string) => void;
}

const AccountingCategoryFilter: React.FC<AccountingCategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  title,
  totalAmount,
  allTotalAmount,
  monthlyAmount,
  monthlyTotalAmount,
  theme = 'expense',
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false,
  minAmount,
  maxAmount,
  searchDescription,
  onMinAmountChange,
  onMaxAmountChange,
  onSearchDescriptionChange
}) => {
  // 控制展开/收起状态，默认展开
  const [isExpanded, setIsExpanded] = useState(true);
  // 计算总金额百分比
  const percentage = allTotalAmount && allTotalAmount > 0 && totalAmount !== undefined
    ? ((totalAmount / allTotalAmount) * 100).toFixed(1)
    : null;
  
  // 计算月份金额百分比(相对于当月总金额)
  const monthlyPercentage = monthlyTotalAmount && monthlyTotalAmount > 0 && monthlyAmount !== undefined
    ? ((monthlyAmount / monthlyTotalAmount) * 100).toFixed(1)
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
    <div className={`category-filter category-filter--${theme} ${isExpanded ? 'category-filter--expanded' : 'category-filter--collapsed'}`}>
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
      
      {/* 分类筛选项 - 根据展开状态显示/隐藏 */}
      {isExpanded && (
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
      )}
      
      {/* 控制区域 */}
      <div className="category-filter__controls">
        {/* 展开/收起按钮 */}
        <button 
          className="toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收起筛选' : '展开筛选'}
        >
          {isExpanded ? '📭' : '📬'}
        </button>
        
        {/* 全选/全不选按钮 - 只在展开时显示 */}
        {isExpanded && (
          <div className="category-filter__controls-left">
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
        )}
        
        {/* 查询组件 */}
        {(onMinAmountChange || onMaxAmountChange || onSearchDescriptionChange) && (
          <div className="category-filter__search">
            {(onMinAmountChange || onMaxAmountChange) && (
              <div className="search-group">
                <span className="search-label">金额</span>
                <FilterNumberInput
                  value={minAmount}
                  onChange={(val) => onMinAmountChange?.(val)}
                  placeholder="0"
                  min={0}
                  step={500}
                  width="70px"
                  textAlign="center"
                />
                <span className="search-separator">-</span>
                <FilterNumberInput
                  value={maxAmount}
                  onChange={(val) => onMaxAmountChange?.(val)}
                  placeholder="0"
                  min={0}
                  step={500}
                  width="70px"
                  textAlign="center"
                />
              </div>
            )}
            {onSearchDescriptionChange && (
              <FilterSearchInput
                value={searchDescription ?? ''}
                onChange={(val) => onSearchDescriptionChange?.(val)}
                placeholder="备注"
                width="120px"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountingCategoryFilter;
