import React from 'react';
import { SleepRecord, getSleepQualityLevel, SLEEP_QUALITY_LABELS } from '@/utils';
import { formatSleepDuration } from '@/utils';
import { RecordListHeader, RecordListEmpty, ActionButtons } from '@/components/common';
import { useMonthGroup } from '@/hooks/useMonthGroup';
import { SleepListSearchSection } from './SleepListSearchSection';
import './SleepList.scss';

interface SleepListProps {
  sleeps: SleepRecord[];
  allSleeps?: SleepRecord[]; // 所有记录（用于计算总数）
  onDeleteSleep: (id: string) => void;
  onEditSleep: (sleep: SleepRecord) => void;
  // 操作按钮相关
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
  // 查询功能相关
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

const SleepList: React.FC<SleepListProps> = ({ 
  sleeps, 
  allSleeps,
  onDeleteSleep, 
  onEditSleep,
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false,
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
  // 使用通用的月份分组 Hook（用于当前筛选结果）
  const { groupedByMonth, expandedMonths, toggleMonth, formatMonthDisplay } = useMonthGroup(sleeps);
  
  // 计算所有记录按月份分组（用于显示总数和月份头）
  const allGroupedByMonth = React.useMemo(() => {
    const all = allSleeps || sleeps;
    return all.reduce((groups, record) => {
      const monthKey = record.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(record);
      return groups;
    }, {} as Record<string, SleepRecord[]>);
  }, [allSleeps, sleeps]);
  
  // 使用所有记录的月份来生成月份头列表
  const sortedMonths = React.useMemo(() => {
    return Object.keys(allGroupedByMonth).sort((a, b) => b.localeCompare(a));
  }, [allGroupedByMonth]);

  // 计算某个月的平均睡眠质量
  const calculateMonthAvgQuality = (monthSleeps: SleepRecord[] | undefined): number => {
    if (!monthSleeps || monthSleeps.length === 0) return 0;
    const total = monthSleeps.reduce((sum, sleep) => sum + sleep.quality, 0);
    return Math.round(total / monthSleeps.length);
  };

  // 计算某个月的平均入睡时间
  const calculateMonthAvgSleepTime = (monthSleeps: SleepRecord[] | undefined): string => {
    if (!monthSleeps || monthSleeps.length === 0) return '--';
    // 将时间字符串转换为分钟数
    const timeToMinutes = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number);
      let totalMinutes = hours * 60 + minutes;
      // 如果时间小于12点，认为是凌晨，加上24小时
      if (hours < 12) {
        totalMinutes += 24 * 60;
      }
      return totalMinutes;
    };

    // 将分钟数转换回时间字符串
    const minutesToTime = (minutes: number): string => {
      const adjustedMinutes = minutes % (24 * 60);
      const hours = Math.floor(adjustedMinutes / 60);
      const mins = Math.round(adjustedMinutes % 60);
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const totalMinutes = monthSleeps.reduce((sum, sleep) => sum + timeToMinutes(sleep.sleepTime), 0);
    const avgMinutes = totalMinutes / monthSleeps.length;
    return minutesToTime(avgMinutes);
  };

  // 计算某个月的平均睡眠时长
  const calculateMonthAvgDuration = (monthSleeps: SleepRecord[] | undefined): string => {
    if (!monthSleeps || monthSleeps.length === 0) return '--';
    const validSleeps = monthSleeps.filter(sleep => sleep.duration !== undefined);
    if (validSleeps.length === 0) return '--';
    
    const totalDuration = validSleeps.reduce((sum, sleep) => sum + (sleep.duration || 0), 0);
    const avgDuration = Math.round(totalDuration / validSleeps.length); // 对平均值取整
    
    return formatSleepDuration(avgDuration);
  };

  // 获取睡眠质量对应的emoji
  const getQualityEmoji = (score: number) => {
    const level = getSleepQualityLevel(score);
    switch (level) {
      case 'excellent':
        return '😴';
      case 'good':
        return '😊';
      case 'fair':
        return '😐';
      case 'poor':
        return '😞';
      default:
        return '💤';
    }
  };

  // 获取睡眠质量对应的颜色类
  const getQualityClass = (score: number) => {
    const level = getSleepQualityLevel(score);
    switch (level) {
      case 'excellent':
        return 'quality--excellent';
      case 'good':
        return 'quality--good';
      case 'fair':
        return 'quality--fair';
      case 'poor':
        return 'quality--poor';
      default:
        return '';
    }
  };

  // 获取睡眠时长分类（小时）
  const getSleepDurationLevel = (durationMinutes: number | undefined): 'too-short' | 'insufficient' | 'normal' | 'excessive' | 'unknown' => {
    if (durationMinutes === undefined) return 'unknown';
    const hours = durationMinutes / 60;
    if (hours < 4) return 'too-short';      // 0-4小时：过少
    if (hours < 7) return 'insufficient';  // 4-7小时：欠缺
    if (hours <= 9) return 'normal';       // 7-9小时：正常
    return 'excessive';                     // 9小时以上：过多
  };

  // 获取睡眠时长对应的颜色类
  const getDurationColorClass = (durationMinutes: number | undefined): string => {
    const level = getSleepDurationLevel(durationMinutes);
    switch (level) {
      case 'too-short':
        return 'duration--too-short';
      case 'insufficient':
        return 'duration--insufficient';
      case 'normal':
        return 'duration--normal';
      case 'excessive':
        return 'duration--excessive';
      default:
        return '';
    }
  };

  // 渲染搜索区域
  const renderSearchSection = () => (
    <SleepListSearchSection
      minSleepHour={minSleepHour}
      maxSleepHour={maxSleepHour}
      durationLevel={durationLevel}
      qualityLevel={qualityLevel}
      searchNotes={searchNotes}
      onMinSleepHourChange={onMinSleepHourChange}
      onMaxSleepHourChange={onMaxSleepHourChange}
      onDurationLevelChange={onDurationLevelChange}
      onQualityLevelChange={onQualityLevelChange}
      onSearchNotesChange={onSearchNotesChange}
    />
  );

  if (sleeps.length === 0) {
    return (
      <div className="sleep-list">
        <RecordListHeader
          title="🌙 睡眠记录"
          count={0}
          className="sleep-list__header"
          searchSection={renderSearchSection()}
          actions={
            <ActionButtons
              onViewDashboard={onViewDashboard}
              onExport={onExport}
              onImport={onImport}
              onClear={onClear}
              isImporting={isImporting}
            />
          }
        />
        <RecordListEmpty
          icon="🌙"
          message="还没有睡眠记录"
          hint="开始记录你的睡眠吧~"
          className="sleep-list__empty"
        />
      </div>
    );
  }

  return (
    <div className="sleep-list">
      <RecordListHeader
        title="🌙 睡眠记录"
        count={sleeps.length}
        className="sleep-list__header"
        searchSection={renderSearchSection()}
        actions={
          <ActionButtons
            onViewDashboard={onViewDashboard}
            onExport={onExport}
            onImport={onImport}
            onClear={onClear}
            isImporting={isImporting}
          />
        }
      />
      
      <div className="sleep-list__content">
        {/* 按月份分组显示 */}
        {sortedMonths.map(monthKey => {
          const monthSleeps = groupedByMonth[monthKey] || [];
          const isExpanded = expandedMonths[monthKey];
          const avgQuality = calculateMonthAvgQuality(monthSleeps);
          const avgSleepTime = calculateMonthAvgSleepTime(monthSleeps);
          const avgDuration = calculateMonthAvgDuration(monthSleeps);
          const sortedMonthSleeps = [...monthSleeps].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          return (
            <div key={monthKey} className="sleep-list__month-group">
              {/* 月份头部 */}
              <div 
                className="sleep-list__month-header" 
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="sleep-list__month-header-left">
                  <span className={`sleep-list__month-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="sleep-list__month-title">{formatMonthDisplay(monthKey)}</span>
                  <span className="sleep-list__month-count">
                    (<span className="sleep-list__month-count-current">{monthSleeps.length}</span>/{allGroupedByMonth[monthKey]?.length || 0}条)
                  </span>
                </div>
                <div className="sleep-list__month-stats">
                  <span className="sleep-list__month-stat">
                    {getQualityEmoji(avgQuality)} {avgQuality}分
                  </span>
                  <span className="sleep-list__month-stat">
                    🌙 {avgSleepTime}
                  </span>
                  <span className="sleep-list__month-stat">
                    ⏱️ {avgDuration}
                  </span>
                </div>
              </div>

              {/* 月份内容 */}
              {isExpanded && sortedMonthSleeps.length > 0 && (
                <div className="sleep-list__month-content">
                  <div className="sleep-list__grid">
                    {sortedMonthSleeps.map((sleep) => (
                      <div key={sleep.id} className="sleep-item">
                        <div className="sleep-item__header">
                          <div className="sleep-item__date">
                            📅 {new Date(sleep.date).toLocaleDateString('zh-CN', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'short'
                            })}
                          </div>
                          <div className="sleep-item__actions">
                            <button
                              className="action-btn action-btn--edit"
                              onClick={() => onEditSleep(sleep)}
                              title="编辑"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn action-btn--delete"
                              onClick={() => onDeleteSleep(sleep.id)}
                              title="删除"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>

                        <div className="sleep-item__body">
                          {/* 第一行：入睡时间和醒来时间 */}
                          <div className="time-info-row">
                            <div className="time-info">
                              <span className="info-label">🌙 入睡时间</span>
                              <span className="info-value">{sleep.sleepTime}</span>
                            </div>
                            <div className="time-info">
                              <span className="info-label">☀️ 醒来时间</span>
                              <span className="info-value">{sleep.wakeTime}</span>
                            </div>
                          </div>

                          {/* 第二行：睡眠时长和睡眠质量 */}
                          <div className="duration-quality-row">
                            {sleep.duration !== undefined && (
                              <div className="duration-info">
                                <span className="info-label">⏱️ 睡眠时长</span>
                                <span className={`info-value ${getDurationColorClass(sleep.duration)}`}>
                                  {formatSleepDuration(sleep.duration)}
                                </span>
                              </div>
                            )}
                            <div className="quality-info">
                              <span className="info-label">⭐ 睡眠质量</span>
                              <span className={`sleep-quality ${getQualityClass(sleep.quality)}`}>
                                {getQualityEmoji(sleep.quality)} {sleep.quality}分 ({SLEEP_QUALITY_LABELS[getSleepQualityLevel(sleep.quality)]})
                              </span>
                            </div>
                          </div>

                          {/* 第三行：小睡和备注 */}
                          {((sleep.naps && (sleep.naps.morning || sleep.naps.noon || sleep.naps.afternoon || sleep.naps.evening)) || sleep.notes) && (
                            <div className="naps-notes-row">
                              {sleep.naps && (sleep.naps.morning || sleep.naps.noon || sleep.naps.afternoon || sleep.naps.evening) && (
                                <div className="sleep-naps">
                                  <span className="naps-label">💤 小睡</span>
                                  <div className="naps-tags">
                                    {sleep.naps.morning && <span className="nap-tag">上午</span>}
                                    {sleep.naps.noon && <span className="nap-tag">中午</span>}
                                    {sleep.naps.afternoon && <span className="nap-tag">下午</span>}
                                    {sleep.naps.evening && <span className="nap-tag">晚上</span>}
                                  </div>
                                </div>
                              )}

                              {sleep.notes && (
                                <div className="sleep-notes">
                                  <span className="notes-label">📝 备注</span>
                                  <span className="notes-content">{sleep.notes}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SleepList;
