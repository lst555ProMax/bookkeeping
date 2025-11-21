import React from 'react';
import { FilterSelect, FilterSearchInput } from '@/components/common';

interface DailyRecordListSearchSectionProps {
  mealFilter?: 'all' | 'regular' | 'irregular';
  checkinFilter?: 'all' | 'normal' | 'abnormal';
  houseworkFilter?: 'all' | 'wash' | 'bath' | 'housework';
  stepsLevel?: 'all' | 'gold' | 'green' | 'normal' | 'orange' | 'red';
  searchNotes?: string;
  onMealFilterChange?: (value: 'all' | 'regular' | 'irregular') => void;
  onCheckinFilterChange?: (value: 'all' | 'normal' | 'abnormal') => void;
  onHouseworkFilterChange?: (value: 'all' | 'wash' | 'bath' | 'housework') => void;
  onStepsLevelChange?: (value: 'all' | 'gold' | 'green' | 'normal' | 'orange' | 'red') => void;
  onSearchNotesChange?: (value: string) => void;
}

export const DailyRecordListSearchSection: React.FC<DailyRecordListSearchSectionProps> = ({
  mealFilter = 'all',
  checkinFilter = 'all',
  houseworkFilter = 'all',
  stepsLevel = 'all',
  searchNotes,
  onMealFilterChange,
  onCheckinFilterChange,
  onHouseworkFilterChange,
  onStepsLevelChange,
  onSearchNotesChange
}) => {
  if (!onMealFilterChange && !onCheckinFilterChange && !onHouseworkFilterChange && !onStepsLevelChange && !onSearchNotesChange) {
    return null;
  }

  return (
    <>
      {/* 三餐筛选 */}
      {onMealFilterChange && (
        <div className="search-group">
          <span className="search-label">三餐</span>
          <FilterSelect
            value={mealFilter}
            onChange={(val) => onMealFilterChange(val as 'all' | 'regular' | 'irregular')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'regular', label: '规律' },
              { value: 'irregular', label: '不规律' }
            ]}
            width="100px"
          />
        </div>
      )}
      {/* 内务筛选 */}
      {onHouseworkFilterChange && (
        <div className="search-group">
          <span className="search-label">内务</span>
          <FilterSelect
            value={houseworkFilter}
            onChange={(val) => onHouseworkFilterChange(val as 'all' | 'wash' | 'bath' | 'housework')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'wash', label: '洗漱' },
              { value: 'bath', label: '洗浴' },
              { value: 'housework', label: '家务' }
            ]}
            width="100px"
          />
        </div>
      )}
      {/* 步数等级筛选 */}
      {onStepsLevelChange && (
        <div className="search-group">
          <span className="search-label">步数</span>
          <FilterSelect
            value={stepsLevel}
            onChange={(val) => onStepsLevelChange(val as 'all' | 'gold' | 'green' | 'normal' | 'orange' | 'red')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'gold', label: '超常 ≥25000' },
              { value: 'green', label: '健康 ≥10000' },
              { value: 'normal', label: '正常 ≥5000' },
              { value: 'orange', label: '一般 ≥2000' },
              { value: 'red', label: '过少 <2000' }
            ]}
            width="135px"
          />
        </div>
      )}
      {/* 打卡筛选 */}
      {onCheckinFilterChange && (
        <div className="search-group">
          <span className="search-label">打卡</span>
          <FilterSelect
            value={checkinFilter}
            onChange={(val) => onCheckinFilterChange(val as 'all' | 'normal' | 'abnormal')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'normal', label: '正常' },
              { value: 'abnormal', label: '不正常' }
            ]}
            width="100px"
          />
        </div>
      )}
      {/* 备注搜索 */}
      {onSearchNotesChange && (
        <FilterSearchInput
          value={searchNotes ?? ''}
          onChange={(val) => onSearchNotesChange?.(val)}
          placeholder="备注"
          width="120px"
        />
      )}
    </>
  );
};

