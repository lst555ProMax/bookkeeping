import React from 'react';
import { DiaryEntry, WEATHER_OPTIONS, MOOD_OPTIONS } from '../types';
import './DiaryList.scss';

interface DiaryListProps {
  diaryEntries: DiaryEntry[];
  selectedDate: string;
  onLoadDiary: (entry: DiaryEntry) => void;
  onDeleteDiary: (id: string) => void;
}

const DiaryList: React.FC<DiaryListProps> = ({
  diaryEntries,
  selectedDate,
  onLoadDiary,
  onDeleteDiary,
}) => {
  return (
    <div className="diary-list">
      <div className="diary-list__header">
        <h3>📚 日记列表</h3>
        <span className="diary-count">{diaryEntries.length} 篇</span>
      </div>
      <div className="diary-list__items">
        {diaryEntries.map(entry => (
          <div 
            key={entry.id} 
            className={`diary-item ${entry.date === selectedDate ? 'diary-item--active' : ''}`}
            onClick={() => onLoadDiary(entry)}
          >
            <div className="diary-item__header">
              <span className="diary-item__date">
                📅 {new Date(entry.date).toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
              <div className="diary-item__meta">
                {entry.weather && (
                  <span className="diary-item__weather">
                    {WEATHER_OPTIONS.find(w => w.label === entry.weather)?.icon}
                  </span>
                )}
                {entry.mood && (
                  <span className="diary-item__mood">
                    {MOOD_OPTIONS.find(m => m.label === entry.mood)?.icon}
                  </span>
                )}
                <button 
                  className="diary-item__delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteDiary(entry.id);
                  }}
                  title="删除记录"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="diary-item__preview">
              {entry.content.substring(0, 100)}
              {entry.content.length > 100 && '...'}
            </div>
          </div>
        ))}
        {diaryEntries.length === 0 && (
          <div className="empty-state">
            <div className="empty-state__icon">📖</div>
            <p>还没有日记哦</p>
            <p className="empty-state__hint">在中间写下你的第一篇日记吧！</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryList;
