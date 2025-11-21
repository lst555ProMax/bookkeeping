import React from 'react';
import { FilterNumberInput, FilterSelect, FilterSearchInput } from '@/components/common';

interface SleepListSearchSectionProps {
  minSleepHour?: number | undefined;
  maxSleepHour?: number | undefined;
  minDurationHour?: number;
  qualityLevel?: 'all' | 'excellent' | 'good' | 'fair' | 'poor';
  searchNotes?: string;
  onMinSleepHourChange?: (value: number | undefined) => void;
  onMaxSleepHourChange?: (value: number | undefined) => void;
  onMinDurationHourChange?: (value: number) => void;
  onQualityLevelChange?: (value: 'all' | 'excellent' | 'good' | 'fair' | 'poor') => void;
  onSearchNotesChange?: (value: string) => void;
}

export const SleepListSearchSection: React.FC<SleepListSearchSectionProps> = ({
  minSleepHour,
  maxSleepHour,
  minDurationHour = 0,
  qualityLevel = 'all',
  searchNotes,
  onMinSleepHourChange,
  onMaxSleepHourChange,
  onMinDurationHourChange,
  onQualityLevelChange,
  onSearchNotesChange
}) => {
  if (!onMinSleepHourChange && !onMinDurationHourChange && !onQualityLevelChange && !onSearchNotesChange) {
    return null;
  }

  return (
    <>
      {/* 睡眠区间 */}
      {(onMinSleepHourChange || onMaxSleepHourChange) && (
        <div className="search-group">
          <span className="search-label">入睡区间</span>
          <FilterNumberInput
            value={minSleepHour}
            onChange={(val) => onMinSleepHourChange?.(val)}
            placeholder="0"
            min={0}
            max={24}
            step={1}
            width="60px"
            textAlign="center"
          />
          <span className="search-separator">-</span>
          <FilterNumberInput
            value={maxSleepHour}
            onChange={(val) => onMaxSleepHourChange?.(val)}
            placeholder="24"
            min={0}
            max={24}
            step={1}
            width="60px"
            textAlign="center"
          />
        </div>
      )}
      {/* 睡眠时长 */}
      {onMinDurationHourChange && (
        <div className="search-group">
          <span className="search-label">时长≥</span>
          <FilterNumberInput
            value={minDurationHour}
            onChange={(val) => {
              const numVal = val ?? 0;
              onMinDurationHourChange(Math.max(0, Math.min(12, numVal)));
            }}
            placeholder="0"
            min={0}
            max={12}
            step={1}
            width="60px"
            textAlign="center"
          />
        </div>
      )}
      {/* 睡眠质量等级 */}
      {onQualityLevelChange && (
        <div className="search-group">
          <span className="search-label">质量</span>
          <FilterSelect
            value={qualityLevel}
            onChange={(val) => onQualityLevelChange(val as 'all' | 'excellent' | 'good' | 'fair' | 'poor')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'excellent', label: '优秀 ≥90分' },
              { value: 'good', label: '良好 ≥75分' },
              { value: 'fair', label: '一般 ≥60分' },
              { value: 'poor', label: '较差 <60分' }
            ]}
            width="120px"
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

