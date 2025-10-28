import React from 'react';
import { DailyRecord, MealStatus, MEAL_STATUS_LABELS } from '@/types';
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
}

const DailyRecordList: React.FC<DailyRecordListProps> = ({ 
  records, 
  onDeleteRecord, 
  onEditRecord,
  onViewDashboard,
  onExport,
  onImport,
  onClear,
  isImporting = false
}) => {
  // 按日期排序（最新的在前）
  const sortedRecords = [...records].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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

  if (records.length === 0) {
    return (
      <div className="daily-list">
        {/* 标题和操作按钮区域 */}
        <div className="daily-list__header">
          <h3 className="daily-list__title">日常记录</h3>
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
        <h3 className="daily-list__title">日常记录</h3>
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
        {sortedRecords.map((record) => (
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

            {/* 工作日打卡 */}
            {(record.checkInTime || record.checkOutTime || record.leaveTime) && (
              <div className="detail-section">
                <div className="section-title">💼 打卡</div>
                <div className="section-content">
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
              </div>
            )}

            {/* 备注 */}
            {record.notes && (
              <div className="daily-notes">
                <div className="notes-label">📝 备注:</div>
                <div className="notes-content">{record.notes}</div>
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default DailyRecordList;
