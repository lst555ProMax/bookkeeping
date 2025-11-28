import React from 'react';
import { StudyRecord, StudyCategory } from '@/utils';
import { RecordListHeader, RecordListEmpty, ActionButtons } from '@/components/common';
import { useMonthGroup } from '@/hooks/useMonthGroup';
import { StudyRecordListSearchSection } from './StudyRecordListSearchSection';
import './StudyRecordList.scss';

interface StudyRecordListProps {
  records: StudyRecord[];
  allRecords?: StudyRecord[]; // 所有记录（用于计算总数）
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: StudyRecord) => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
  // 查询功能相关
  categories?: StudyCategory[];
  selectedCategory?: string;
  searchTitle?: string;
  minDurationHours?: number;
  onCategoryChange?: (category: string) => void;
  onSearchTitleChange?: (title: string) => void;
  onMinDurationHoursChange?: (hours: number) => void;
}

const StudyRecordList: React.FC<StudyRecordListProps> = ({ 
  records, 
  allRecords,
  onDeleteRecord, 
  onEditRecord,
  onExport,
  onImport,
  onClear,
  isImporting = false,
  categories = [],
  selectedCategory = '全部',
  searchTitle = '',
  minDurationHours = 0,
  onCategoryChange,
  onSearchTitleChange,
  onMinDurationHoursChange
}) => {
  // 使用通用的月份分组 Hook（用于当前筛选结果）
  const { groupedByMonth, expandedMonths, toggleMonth, formatMonthDisplay } = useMonthGroup(records);
  
  // 计算所有记录按月份分组（用于显示总数和月份头）
  const allGroupedByMonth = React.useMemo(() => {
    const all = allRecords || records;
    return all.reduce((groups, record) => {
      const monthKey = record.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(record);
      return groups;
    }, {} as Record<string, StudyRecord[]>);
  }, [allRecords, records]);
  
  // 使用所有记录的月份来生成月份头列表
  const sortedMonths = React.useMemo(() => {
    return Object.keys(allGroupedByMonth).sort((a, b) => b.localeCompare(a));
  }, [allGroupedByMonth]);

  // 计算某个月的总学习时长
  const calculateMonthTotal = (monthRecords: StudyRecord[] | undefined): number => {
    if (!monthRecords || monthRecords.length === 0) return 0;
    return monthRecords.reduce((sum, record) => sum + record.totalTime, 0);
  };

  // 计算某个月看的最多的分类
  const calculateTopCategory = (monthRecords: StudyRecord[] | undefined): string => {
    if (!monthRecords || monthRecords.length === 0) return '暂无';
    
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

  // 跳转到学习数据面板
  const goToStudyDashboard = () => {
    window.location.hash = '#/dashboard?tab=study';
  };

  // 渲染搜索区域
  const renderSearchSection = () => (
    <StudyRecordListSearchSection
      categories={categories}
      selectedCategory={selectedCategory}
      searchTitle={searchTitle}
      minDurationHours={minDurationHours}
      onCategoryChange={onCategoryChange}
      onSearchTitleChange={onSearchTitleChange}
      onMinDurationHoursChange={onMinDurationHoursChange}
    />
  );

  if (records.length === 0) {
    return (
      <div className="study-list">
        <RecordListHeader
          title="📚 学习记录"
          count={0}
          className="study-list__header"
          searchSection={renderSearchSection()}
          actions={
            <ActionButtons
              onViewDashboard={goToStudyDashboard}
              onExport={onExport}
              onImport={onImport}
              onClear={onClear}
              isImporting={isImporting}
            />
          }
        />
        <RecordListEmpty
          icon="📚"
          message="还没有学习记录"
          hint="开始记录你的学习历程吧~"
          className="study-list__empty"
        />
      </div>
    );
  }

  return (
    <div className="study-list">
      <RecordListHeader
        title="📚 学习记录"
        count={records.length}
        className="study-list__header"
        searchSection={renderSearchSection()}
        actions={
          <ActionButtons
            onViewDashboard={goToStudyDashboard}
            onExport={onExport}
            onImport={onImport}
            onClear={onClear}
            isImporting={isImporting}
          />
        }
      />
      
      <div className="study-list__content">
        {/* 按月份分组显示 */}
        {sortedMonths.map(monthKey => {
          const monthRecords = groupedByMonth[monthKey] || [];
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
                  <span className="study-list__month-count">
                    (<span className="study-list__month-count-current">{monthRecords.length}</span>/{allGroupedByMonth[monthKey]?.length || 0}条)
                  </span>
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
              {isExpanded && sortedMonthRecords.length > 0 && (
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
                  <div className="study-duration-info">
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
