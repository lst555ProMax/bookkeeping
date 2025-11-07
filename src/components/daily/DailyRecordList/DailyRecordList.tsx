import React, { useState } from 'react';
import { DailyRecord, MealStatus, MEAL_STATUS_LABELS } from '@/utils';
import './DailyRecordList.scss';

interface DailyRecordListProps {
  records: DailyRecord[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: DailyRecord) => void;
  onViewDashboard?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onClear?: () => void;
  isImporting?: boolean;
  // 查询功能相关
  mealFilter?: 'all' | 'regular' | 'irregular';
  checkinFilter?: 'all' | 'normal' | 'abnormal';
  minSteps?: number | undefined;
  maxSteps?: number | undefined;
  searchNotes?: string;
  onMealFilterChange?: (value: 'all' | 'regular' | 'irregular') => void;
  onCheckinFilterChange?: (value: 'all' | 'normal' | 'abnormal') => void;
  onMinStepsChange?: (value: number | undefined) => void;
  onMaxStepsChange?: (value: number | undefined) => void;
  onSearchNotesChange?: (value: string) => void;
}

const DailyRecordList: React.FC<DailyRecordListProps> = ({ 
  records, 
  onDeleteRecord, 
  onEditRecord,
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false,
  mealFilter = 'all',
  checkinFilter = 'all',
  minSteps,
  maxSteps,
  searchNotes,
  onMealFilterChange,
  onCheckinFilterChange,
  onMinStepsChange,
  onMaxStepsChange,
  onSearchNotesChange
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
  }, {} as Record<string, DailyRecord[]>);

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

  // 计算某个月早餐未吃的次数
  const calculateBreakfastNotEaten = (monthRecords: DailyRecord[]): number => {
    return monthRecords.filter(record => record.meals.breakfast === MealStatus.NOT_EATEN).length;
  };

  // 计算某个月午餐不规律的次数
  const calculateLunchIrregular = (monthRecords: DailyRecord[]): number => {
    return monthRecords.filter(record => record.meals.lunch === MealStatus.EATEN_IRREGULAR).length;
  };

  // 获取三餐状态的emoji
  const getMealEmoji = (status: MealStatus) => {
    switch (status) {
      case MealStatus.NOT_EATEN:
        return '❌';
      case MealStatus.EATEN_IRREGULAR:
        return '⚠️';
      case MealStatus.EATEN_REGULAR:
        return '✅';
      default:
        return '❌';
    }
  };

  // 获取三餐状态的CSS类
  const getMealClass = (status: MealStatus) => {
    switch (status) {
      case MealStatus.NOT_EATEN:
        return 'meal--not-eaten';
      case MealStatus.EATEN_IRREGULAR:
        return 'meal--irregular';
      case MealStatus.EATEN_REGULAR:
        return 'meal--regular';
      default:
        return 'meal--not-eaten';
    }
  };

  // 判断打卡是否正常
  // 签到在9点前、签退在6点后、离开在10点后算正常
  // 没填打卡时间（不工作的日子）也算正常
  const isCheckinNormal = (record: DailyRecord): boolean => {
    // 如果都没填，说明不工作，算正常
    if (!record.checkInTime && !record.checkOutTime && !record.leaveTime) {
      return true;
    }
    
    // 有任何一项填了就按工作日标准检查
    let normal = true;
    
    // 签到时间检查：9点前算正常
    if (record.checkInTime) {
      const checkInHour = parseInt(record.checkInTime.split(':')[0]);
      const checkInMinute = parseInt(record.checkInTime.split(':')[1]);
      const checkInTotalMinutes = checkInHour * 60 + checkInMinute;
      if (checkInTotalMinutes >= 9 * 60) { // 9:00及以后算不正常
        normal = false;
      }
    }
    
    // 签退时间检查：6点后算正常
    if (record.checkOutTime) {
      const checkOutHour = parseInt(record.checkOutTime.split(':')[0]);
      const checkOutMinute = parseInt(record.checkOutTime.split(':')[1]);
      const checkOutTotalMinutes = checkOutHour * 60 + checkOutMinute;
      if (checkOutTotalMinutes < 18 * 60) { // 18:00之前算不正常
        normal = false;
      }
    }
    
    // 离开时间检查：10点后算正常
    if (record.leaveTime) {
      const leaveHour = parseInt(record.leaveTime.split(':')[0]);
      const leaveMinute = parseInt(record.leaveTime.split(':')[1]);
      const leaveTotalMinutes = leaveHour * 60 + leaveMinute;
      if (leaveTotalMinutes < 22 * 60) { // 22:00之前算不正常
        normal = false;
      }
    }
    
    return normal;
  };

  if (records.length === 0) {
    return (
      <div className="daily-list">
        {/* 标题和操作按钮区域 */}
        <div className="daily-list__header">
          <h3 className="daily-list__title">📝 日常记录 (0)</h3>
          {/* 查询组件 */}
          {(onMealFilterChange || onCheckinFilterChange || onMinStepsChange || onSearchNotesChange) && (
            <div className="daily-list__search">
              {/* 三餐筛选 */}
              {onMealFilterChange && (
                <div className="search-group">
                  <span className="search-label">三餐</span>
                  <select 
                    className="search-select"
                    value={mealFilter}
                    onChange={(e) => onMealFilterChange(e.target.value as 'all' | 'regular' | 'irregular')}
                  >
                    <option value="all">全部</option>
                    <option value="regular">规律</option>
                    <option value="irregular">不规律</option>
                  </select>
                </div>
              )}
              {/* 打卡筛选 */}
              {onCheckinFilterChange && (
                <div className="search-group">
                  <span className="search-label">打卡</span>
                  <select 
                    className="search-select"
                    value={checkinFilter}
                    onChange={(e) => onCheckinFilterChange(e.target.value as 'all' | 'normal' | 'abnormal')}
                  >
                    <option value="all">全部</option>
                    <option value="normal">正常</option>
                    <option value="abnormal">不正常</option>
                  </select>
                </div>
              )}
              {/* 步数区间 */}
              {(onMinStepsChange || onMaxStepsChange) && (
                <div className="search-group">
                  <span className="search-label">步数</span>
                  <input
                    type="number"
                    className="search-input search-input--number"
                    placeholder="0"
                    value={minSteps ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onMinStepsChange?.(val === '' ? undefined : parseInt(val));
                    }}
                    min="0"
                    max="50000"
                    step="1000"
                  />
                  <span className="search-separator">-</span>
                  <input
                    type="number"
                    className="search-input search-input--number"
                    placeholder="50000"
                    value={maxSteps ?? ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      onMaxStepsChange?.(val === '' ? undefined : parseInt(val));
                    }}
                    min="0"
                    max="50000"
                    step="1000"
                  />
                </div>
              )}
              {/* 备注搜索 */}
              {onSearchNotesChange && (
                <input
                  type="text"
                  className="search-input search-input--text"
                  placeholder="备注关键词"
                  value={searchNotes ?? ''}
                  onChange={(e) => onSearchNotesChange?.(e.target.value)}
                />
              )}
            </div>
          )}
          {(onViewDashboard || onExport || onImport || onClear) && (
            <div className="daily-list__actions">
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
        <div className="daily-list__empty">
          <div className="empty-icon">📝</div>
          <p>还没有日常记录</p>
          <p className="empty-hint">开始记录你的日常生活吧~</p>
        </div>
      </div>
    );
  }

  return (
    <div className="daily-list">
      {/* 标题和操作按钮区域 */}
      <div className="daily-list__header">
        <h3 className="daily-list__title">📝 日常记录 ({records.length})</h3>
        {/* 查询组件 */}
        {(onMealFilterChange || onCheckinFilterChange || onMinStepsChange || onSearchNotesChange) && (
          <div className="daily-list__search">
            {/* 三餐筛选 */}
            {onMealFilterChange && (
              <div className="search-group">
                <span className="search-label">三餐</span>
                <select 
                  className="search-select"
                  value={mealFilter}
                  onChange={(e) => onMealFilterChange(e.target.value as 'all' | 'regular' | 'irregular')}
                >
                  <option value="all">全部</option>
                  <option value="regular">规律</option>
                  <option value="irregular">不规律</option>
                </select>
              </div>
            )}
            {/* 打卡筛选 */}
            {onCheckinFilterChange && (
              <div className="search-group">
                <span className="search-label">打卡</span>
                <select 
                  className="search-select"
                  value={checkinFilter}
                  onChange={(e) => onCheckinFilterChange(e.target.value as 'all' | 'normal' | 'abnormal')}
                >
                  <option value="all">全部</option>
                  <option value="normal">正常</option>
                  <option value="abnormal">不正常</option>
                </select>
              </div>
            )}
            {/* 步数区间 */}
            {(onMinStepsChange || onMaxStepsChange) && (
              <div className="search-group">
                <span className="search-label">步数</span>
                <input
                  type="number"
                  className="search-input search-input--number"
                  placeholder="0"
                  value={minSteps ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onMinStepsChange?.(val === '' ? undefined : parseInt(val));
                  }}
                  min="0"
                  max="50000"
                  step="1000"
                />
                <span className="search-separator">-</span>
                <input
                  type="number"
                  className="search-input search-input--number"
                  placeholder="50000"
                  value={maxSteps ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onMaxStepsChange?.(val === '' ? undefined : parseInt(val));
                  }}
                  min="0"
                  max="50000"
                  step="1000"
                />
              </div>
            )}
            {/* 备注搜索 */}
            {onSearchNotesChange && (
              <input
                type="text"
                className="search-input search-input--text"
                placeholder="备注关键词"
                value={searchNotes ?? ''}
                onChange={(e) => onSearchNotesChange?.(e.target.value)}
              />
            )}
          </div>
        )}
        {(onViewDashboard || onExport || onImport || onClear) && (
          <div className="daily-list__actions">
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
      
      <div className="daily-list__content">
        {/* 按月份分组显示 */}
        {sortedMonths.map(monthKey => {
          const monthRecords = groupedByMonth[monthKey];
          const isExpanded = expandedMonths[monthKey];
          const breakfastNotEaten = calculateBreakfastNotEaten(monthRecords);
          const lunchIrregular = calculateLunchIrregular(monthRecords);
          const sortedMonthRecords = [...monthRecords].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          );

          return (
            <div key={monthKey} className="daily-list__month-group">
              {/* 月份头部 */}
              <div 
                className="daily-list__month-header" 
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="daily-list__month-header-left">
                  <span className={`daily-list__month-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="daily-list__month-title">{formatMonthDisplay(monthKey)}</span>
                  <span className="daily-list__month-count">({monthRecords.length}条)</span>
                </div>
                <div className="daily-list__month-stats">
                  <span className="daily-list__month-stat">
                    ❌ 早餐未吃 {breakfastNotEaten}次
                  </span>
                  <span className="daily-list__month-stat">
                    ⚠️ 午餐不规律 {lunchIrregular}次
                  </span>
                </div>
              </div>

              {/* 月份内容 */}
              {isExpanded && (
                <div className="daily-list__month-content">
                  <div className="daily-list__grid">
                    {sortedMonthRecords.map((record) => (
                      <div key={record.id} className="daily-item">
          <div className="daily-item__header">
            <div className="daily-item__date">
              📅 {new Date(record.date).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'short'
              })}
            </div>
            <div className="daily-item__actions">
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

          <div className="daily-item__body">
            {/* 三餐情况 */}
            <div className="detail-section">
              <div className="section-title">🍽️ 三餐</div>
              <div className="section-content">
                <div className="meal-grid">
                  <div className={`meal-status ${getMealClass(record.meals.breakfast)}`}>
                    <span className="meal-name">早餐:</span>
                    <span className="meal-value">
                      {getMealEmoji(record.meals.breakfast)} {MEAL_STATUS_LABELS[record.meals.breakfast]}
                    </span>
                  </div>
                  <div className={`meal-status ${getMealClass(record.meals.lunch)}`}>
                    <span className="meal-name">午餐:</span>
                    <span className="meal-value">
                      {getMealEmoji(record.meals.lunch)} {MEAL_STATUS_LABELS[record.meals.lunch]}
                    </span>
                  </div>
                  <div className={`meal-status ${getMealClass(record.meals.dinner)}`}>
                    <span className="meal-name">晚餐:</span>
                    <span className="meal-value">
                      {getMealEmoji(record.meals.dinner)} {MEAL_STATUS_LABELS[record.meals.dinner]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 内务情况 - 合并洗漱/洗浴/家务 */}
            <div className="detail-section">
              <div className="section-title">🏠 内务</div>
              <div className="section-content">
                <div className="tag-group">
                  {/* 洗漱 */}
                  {record.hygiene.morningWash && <span className="tag tag--success">✅ 早洗</span>}
                  {record.hygiene.nightWash && <span className="tag tag--success">✅ 晚洗</span>}
                  {/* 洗浴 */}
                  {record.bathing.shower && <span className="tag tag--info">🚿 洗澡</span>}
                  {record.bathing.hairWash && <span className="tag tag--info">💆 洗头</span>}
                  {record.bathing.footWash && <span className="tag tag--info">🦶 洗脚</span>}
                  {record.bathing.faceWash && <span className="tag tag--info">😊 洗脸</span>}
                  {/* 家务 */}
                  {record.laundry && <span className="tag tag--warning">👕 洗衣</span>}
                  {record.cleaning && <span className="tag tag--warning">🧹 打扫</span>}
                  {/* 如果全空 */}
                  {!record.hygiene.morningWash && !record.hygiene.nightWash && 
                   !record.bathing.shower && !record.bathing.hairWash && 
                   !record.bathing.footWash && !record.bathing.faceWash &&
                   !record.laundry && !record.cleaning && (
                    <span className="tag tag--muted">未记录</span>
                  )}
                </div>
              </div>
            </div>

            {/* 步数和打卡 */}
            {(record.wechatSteps || record.checkInTime || record.checkOutTime || record.leaveTime) && (
              <div className="steps-checkin-row">
                {/* 微信步数 */}
                {record.wechatSteps && (
                  <div className="steps-info">
                    <span className="steps-label">👣 步数:</span>
                    <span className="steps-value">{record.wechatSteps.toLocaleString()} 步</span>
                  </div>
                )}

                {/* 工作日打卡 */}
                {(record.checkInTime || record.checkOutTime || record.leaveTime) && (
                  <div className={`checkin-info ${!isCheckinNormal(record) ? 'checkin-info--abnormal' : ''}`}>
                    <span className="checkin-label">💼 打卡:</span>
                    <div className="time-grid">
                      {record.checkInTime && (
                        <div className="time-item">
                          <span className="time-label">签到:</span>
                          <span className="time-value">{record.checkInTime}</span>
                        </div>
                      )}
                      {record.checkOutTime && (
                        <div className="time-item">
                          <span className="time-label">签退:</span>
                          <span className="time-value">{record.checkOutTime}</span>
                        </div>
                      )}
                      {record.leaveTime && (
                        <div className="time-item">
                          <span className="time-label">离开:</span>
                          <span className="time-value">{record.leaveTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 备注 */}
            {record.notes && (
              <div className="daily-notes">
                <span className="notes-label">📝 备注:</span>
                <span className="notes-content">{record.notes}</span>
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

export default DailyRecordList;
