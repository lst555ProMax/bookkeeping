import React from 'react';
import { SleepRecord, getSleepQualityLevel, SLEEP_QUALITY_LABELS } from '@/types';
import { formatSleepDuration } from '@/utils/sleepStorage';
import './SleepList.scss';

interface SleepListProps {
  sleeps: SleepRecord[];
  onDeleteSleep: (id: string) => void;
  onEditSleep: (sleep: SleepRecord) => void;
}

const SleepList: React.FC<SleepListProps> = ({ sleeps, onDeleteSleep, onEditSleep }) => {
  // 按日期排序（最新的在前）
  const sortedSleeps = [...sleeps].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

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
      {sortedSleeps.map((sleep) => (
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
            <div className="sleep-detail-row">
              <div className="sleep-detail">
                <span className="detail-label">🌙 入睡时间:</span>
                <span className="detail-value">{sleep.sleepTime}</span>
              </div>

              <div className="sleep-detail">
                <span className="detail-label">☀️ 醒来时间:</span>
                <span className="detail-value">{sleep.wakeTime}</span>
              </div>
            </div>

            {/* 第二行：睡眠时长和睡眠质量 */}
            <div className="sleep-detail-row">
              {sleep.duration !== undefined && (
                <div className="sleep-detail">
                  <span className="detail-label">⏱️ 睡眠时长:</span>
                  <span className="detail-value detail-value--highlight">
                    {formatSleepDuration(sleep.duration)}
                  </span>
                </div>
              )}

              <div className="sleep-detail">
                <span className="detail-label">睡眠质量:</span>
                <span className={`sleep-quality ${getQualityClass(sleep.quality)}`}>
                  {getQualityEmoji(sleep.quality)} {sleep.quality}分 ({SLEEP_QUALITY_LABELS[getSleepQualityLevel(sleep.quality)]})
                </span>
              </div>
            </div>

            {sleep.notes && (
              <div className="sleep-notes">
                <div className="notes-label">📝 备注:</div>
                <div className="notes-content">{sleep.notes}</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SleepList;
