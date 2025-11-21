import React from 'react';
import { FilterNumberInput, FilterSelect, FilterSearchInput } from '@/components/common';
import { StudyCategory } from '@/utils';

interface StudyRecordListSearchSectionProps {
  categories?: StudyCategory[];
  selectedCategory?: string;
  searchTitle?: string;
  minDurationHours?: number;
  onCategoryChange?: (category: string) => void;
  onSearchTitleChange?: (title: string) => void;
  onMinDurationHoursChange?: (hours: number) => void;
}

export const StudyRecordListSearchSection: React.FC<StudyRecordListSearchSectionProps> = ({
  categories = [],
  selectedCategory = '全部',
  searchTitle = '',
  minDurationHours = 0,
  onCategoryChange,
  onSearchTitleChange,
  onMinDurationHoursChange
}) => {
  if (!onCategoryChange && !onSearchTitleChange && onMinDurationHoursChange === undefined) {
    return null;
  }

  return (
    <>
      {/* 分类筛选 */}
      {onCategoryChange && categories.length > 0 && (
        <div className="search-group">
          <span className="search-label">分类</span>
          <FilterSelect
            value={selectedCategory}
            onChange={(val) => onCategoryChange(val)}
            options={[
              { value: '全部', label: '全部' },
              ...categories.map(cat => ({ value: cat, label: cat }))
            ]}
            width="130px"
          />
        </div>
      )}
      {/* 最小时长 */}
      {onMinDurationHoursChange !== undefined && (
        <div className="search-group">
          <span className="search-label">时长≥</span>
          <FilterNumberInput
            value={minDurationHours}
            onChange={(val) => onMinDurationHoursChange(val ?? 0)}
            placeholder="0"
            min={0}
            max={24}
            step={1}
            width="60px"
            textAlign="center"
          />
          <span className="search-unit">小时</span>
        </div>
      )}
      {/* 标题搜索 */}
      {onSearchTitleChange && (
        <FilterSearchInput
          value={searchTitle}
          onChange={(val) => onSearchTitleChange(val)}
          placeholder="标题"
          width="140px"
        />
      )}
    </>
  );
};

