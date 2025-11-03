import React, { useState } from 'react';
import { StudyRecord } from '@/utils';
import './StudyRecordList.scss';

interface StudyRecordListProps {
  records: StudyRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: StudyRecord) => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
}

const StudyRecordList: React.FC<StudyRecordListProps> = ({ 
  records, 
  onDeleteRecord, 
  onEditRecord,
  onExport,
  onImport,
  onClear,
  isImporting = false
}) => {
  // 跟踪每个月份的展开/收起状态
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // 按月份分组
  const groupedByMonth = records.reduce((groups, record) => {
    const monthKey = record.date.substring(0, 7); // YYYY-MM
    if (!groups[monthKey]) {
      groups[monthKey] = [];
    }
    groups[monthKey].push(record);
    return groups;
  }, {} as Record<string, StudyRecord[]>);

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

  // 计算某个月的总学习时长
  const calculateMonthTotal = (monthRecords: StudyRecord[]): number => {
    return monthRecords.reduce((sum, record) => sum + record.totalTime, 0);
  };

  // 计算某个月看的最多的分类
  const calculateTopCategory = (monthRecords: StudyRecord[]): string => {
    if (monthRecords.length === 0) return '暂无';
    
    // 统计每个分类的学习时长
    const categoryStats: Record<string, number> = {};
    monthRecords.forEach(record => {
      categoryStats[record.category] = (categoryStats[record.category] || 0) + record.totalTime;
    });

    // 找出时长最多的分类
    let maxTime = 0;
    let topCategory = '';
    Object.entries(categoryStats).forEach(([category, time]) => {
      if (time > maxTime) {
        maxTime = time;
        topCategory = category;
      }
    });

    return topCategory;
  };

  // 格式化观看时长
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
  };

  // 格式化集数
  const formatEpisodes = (start: number, end: number): string => {
    if (start === end) {
      return `第${start}集`;
    }
    return `第${start}-${end}集`;
  };

  if (records.length === 0) {
    return (
      <div className="study-list">
        {/* 标题和操作按钮区域 */}
        <div className="study-list__header">
          <h3 className="study-list__title">📚 学习记录</h3>
          {(onExport || onImport || onClear) && (
            <div className="study-list__actions">
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
        <div className="study-list__empty">
          <div className="empty-icon">📚</div>
          <p>还没有学习记录</p>
          <p className="empty-hint">开始记录你的学习历程吧~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="study-list">
      {/* 标题和操作按钮区域 */}
      <div className="study-list__header">
        <h3 className="study-list__title">📚 学习记录 ({records.length})</h3>
        {(onExport || onImport || onClear) && (
          <div className="study-list__actions">
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
      
      <div className="study-list__content">
        {/* 按月份分组显示 */}
        {sortedMonths.map(monthKey => {
          const monthRecords = groupedByMonth[monthKey];
          const isExpanded = expandedMonths[monthKey];
          const monthTotal = calculateMonthTotal(monthRecords);
          const topCategory = calculateTopCategory(monthRecords);
          const sortedMonthRecords = [...monthRecords].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          return (
            <div key={monthKey} className="study-list__month-group">
              {/* 月份头部 */}
              <div 
                className="study-list__month-header" 
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="study-list__month-header-left">
                  <span className={`study-list__month-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="study-list__month-title">{formatMonthDisplay(monthKey)}</span>
                  <span className="study-list__month-count">({monthRecords.length}条)</span>
                </div>
                <div className="study-list__month-stats">
                  <span className="study-list__month-stat">
                    ⏱️ {formatDuration(monthTotal)}
                  </span>
                  <span className="study-list__month-stat">
                    🏷️ {topCategory}
                  </span>
                </div>
              </div>

              {/* 月份内容 */}
              {isExpanded && (
                <div className="study-list__month-content">
                  <div className="study-list__grid">
                    {sortedMonthRecords.map((record) => (
                      <div key={record.id} className="study-item">
              <div className="study-item__header">
                <div className="study-item__date">
                  📅 {new Date(record.date).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </div>
                <div className="study-item__actions">
                  <button
                    className="action-btn action-btn--edit"
                    onClick={() => onEditRecord(record)}
                    title="编辑"
                  >
                    ✏️
                  </button>
                  <button
                    className="action-btn action-btn--delete"
                    onClick={() => onDeleteRecord(record.id)}
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="study-item__body">
                {/* 分类 */}
                <div className="category-badge">
                  🏷️ {record.category}
                </div>

                {/* 视频标题 */}
                <div className="detail-section">
                  <h4 className="section-title">🎬 视频标题</h4>
                  <div className="section-content">
                    {record.videoTitle}
                  </div>
                </div>

                {/* 观看集数和时长 - 一行显示 */}
                <div className="episode-duration-row">
                  <div className="episode-info">
                    <span className="info-label">📺 观看集数</span>
                    <span className="info-value">{formatEpisodes(record.episodeStart, record.episodeEnd)}</span>
                  </div>
                  <div className="duration-info">
                    <span className="info-label">⏱️ 观看时长</span>
                    <span className="info-value">{formatDuration(record.totalTime)}</span>
                  </div>
                </div>

                {/* 备注 */}
                {record.remark && (
                  <div className="detail-section">
                    <h4 className="section-title">📝 备注</h4>
                    <div className="section-content">
                      {record.remark}
                    </div>
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

export default StudyRecordList;
