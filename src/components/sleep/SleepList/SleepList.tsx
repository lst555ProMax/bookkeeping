import React, { useState } from 'react';
import { SleepRecord, getSleepQualityLevel, SLEEP_QUALITY_LABELS } from '@/utils';
import { formatSleepDuration } from '@/utils';
import './SleepList.scss';

interface SleepListProps {
  sleeps: SleepRecord[];
  onDeleteSleep: (id: string) => void;
  onEditSleep: (sleep: SleepRecord) => void;
  // 操作按钮相关
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
}

const SleepList: React.FC<SleepListProps> = ({ 
  sleeps, 
  onDeleteSleep, 
  onEditSleep,
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false
}) => {
  // 跟踪每个月份的展开/收起状态
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // 按月份分组
  const groupedByMonth = sleeps.reduce((groups, sleep) => {
    const monthKey = sleep.date.substring(0, 7); // YYYY-MM
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(sleep);
    return groups;
  }, {} as Record<string, SleepRecord[]>);

  // 按月份排序（最新的在前）
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  // 初始化展开状态（默认展开最近的月份）
  React.useEffect(() => {
    if (sortedMonths.length > 0 && Object.keys(expandedMonths).length === 0) {
      const initialState: Record<string, boolean> = {};
      sortedMonths.forEach((month, index) => {
        initialState[month] = index === 0;
      });
      setExpandedMonths(initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMonths.length]);

  // 切换月份的展开/收起状态
  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // 格式化月份显示
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  // 计算某个月的平均睡眠质量
  const calculateMonthAvgQuality = (monthSleeps: SleepRecord[]): number => {
    const total = monthSleeps.reduce((sum, sleep) => sum + sleep.quality, 0);
    return Math.round(total / monthSleeps.length);
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

  if (sleeps.length === 0) {
    return (
      <div className="sleep-list">
        {/* 标题和操作按钮区域 */}
        <div className="sleep-list__header">
          <h3 className="sleep-list__title">🌙 睡眠记录 (0)</h3>
          {(onViewDashboard || onExport || onImport || onClear) && (
            <div className="sleep-list__actions">
              {onViewDashboard && (
                <button 
                  className="action-icon-btn" 
                  onClick={onViewDashboard}
                  title="查看数据面板"
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
        <div className="sleep-list__empty">
          <div className="empty-icon">🌙</div>
          <p>还没有睡眠记录</p>
          <p className="empty-hint">开始记录你的睡眠吧~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sleep-list">
      {/* 标题和操作按钮区域 */}
      <div className="sleep-list__header">
        <h3 className="sleep-list__title">🌙 睡眠记录 ({sleeps.length})</h3>
        {(onViewDashboard || onExport || onImport || onClear) && (
          <div className="sleep-list__actions">
            {onViewDashboard && (
              <button 
                className="action-icon-btn" 
                onClick={onViewDashboard}
                title="查看数据面板"
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
      
      <div className="sleep-list__content">
        {/* 按月份分组显示 */}
        {sortedMonths.map(monthKey => {
          const monthSleeps = groupedByMonth[monthKey];
          const isExpanded = expandedMonths[monthKey];
          const avgQuality = calculateMonthAvgQuality(monthSleeps);
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
                  <span className="sleep-list__month-count">({monthSleeps.length}条)</span>
                </div>
                <span className="sleep-list__month-avg">
                  {getQualityEmoji(avgQuality)} 平均 {avgQuality}分
                </span>
              </div>

              {/* 月份内容 */}
              {isExpanded && (
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
                                <span className="info-value">
                                  {formatSleepDuration(sleep.duration)}
                                </span>
                              </div>
                            )}
                            <div className="quality-info">
                              <span className="info-label">睡眠质量</span>
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
