import React from 'react';
import { FilterNumberInput, FilterSelect, FilterSearchInput } from '@/components/common';

interface SleepListSearchSectionProps {
  minSleepHour?: number | undefined;
  maxSleepHour?: number | undefined;
  durationLevel?: 'all' | 'too-short' | 'insufficient' | 'normal' | 'excessive';
  qualityLevel?: 'all' | 'excellent' | 'good' | 'fair' | 'poor';
  searchNotes?: string;
  onMinSleepHourChange?: (value: number | undefined) => void;
  onMaxSleepHourChange?: (value: number | undefined) => void;
  onDurationLevelChange?: (value: 'all' | 'too-short' | 'insufficient' | 'normal' | 'excessive') => void;
  onQualityLevelChange?: (value: 'all' | 'excellent' | 'good' | 'fair' | 'poor') => void;
  onSearchNotesChange?: (value: string) => void;
}

export const SleepListSearchSection: React.FC<SleepListSearchSectionProps> = ({
  minSleepHour,
  maxSleepHour,
  durationLevel = 'all',
  qualityLevel = 'all',
  searchNotes,
  onMinSleepHourChange,
  onMaxSleepHourChange,
  onDurationLevelChange,
  onQualityLevelChange,
  onSearchNotesChange
}) => {
  if (!onMinSleepHourChange && !onDurationLevelChange && !onQualityLevelChange && !onSearchNotesChange) {
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
      {onDurationLevelChange && (
        <div className="search-group">
          <span className="search-label">时长</span>
          <FilterSelect
            value={durationLevel}
            onChange={(val) => onDurationLevelChange(val as 'all' | 'too-short' | 'insufficient' | 'normal' | 'excessive')}
            options={[
              { value: 'all', label: '全部' },
              { value: 'too-short', label: '过少 <4小时' },
              { value: 'insufficient', label: '欠缺 4-7小时' },
              { value: 'normal', label: '正常 7-9小时' },
              { value: 'excessive', label: '过多 ≥9小时' }
            ]}
            width="140px"
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

