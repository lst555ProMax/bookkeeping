import React, { useMemo } from 'react';
import { BrowserUsageRecord } from '@/types';
import './BrowserUsageList.scss';

interface BrowserUsageListProps {
  records: BrowserUsageRecord[];
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
  isImporting: boolean;
}

interface DailyUsage {
  date: string;
  records: BrowserUsageRecord[];
  totalFocus: number; // 总专注时长（秒）
  totalVisits: number; // 总访问次数
}

const BrowserUsageList: React.FC<BrowserUsageListProps> = ({
  records,
  onExport,
  onImport,
  onClear,
  isImporting
}) => {
  // 按日期分组记录
  const dailyUsages = useMemo(() => {
    const grouped = records.reduce((acc, record) => {
      if (!acc[record.date]) {
        acc[record.date] = [];
      }
      acc[record.date].push(record);
      return acc;
    }, {} as Record<string, BrowserUsageRecord[]>);

    // 转换为数组并计算统计信息
    const result: DailyUsage[] = Object.entries(grouped).map(([date, records]) => ({
      date,
      records: records.sort((a, b) => parseInt(b.focus) - parseInt(a.focus)), // 按专注时长降序
      totalFocus: records.reduce((sum, r) => sum + parseInt(r.focus), 0),
      totalVisits: records.reduce((sum, r) => sum + r.time, 0)
    }));

    // 按日期降序排序
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  // 格式化日期显示
  const formatDate = (dateStr: string): string => {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    const date = new Date(`${year}-${month}-${day}`);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${year}年${month}月${day}日 ${weekdays[date.getDay()]}`;
  };

  // 格式化时长显示
  const formatDuration = (seconds: string | number): string => {
    const totalSeconds = typeof seconds === 'string' ? parseInt(seconds) : seconds;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}小时${minutes}分${secs}秒`;
    } else if (minutes > 0) {
      return `${minutes}分${secs}秒`;
    } else {
      return `${secs}秒`;
    }
  };

  // 获取网站显示名称
  const getDisplayName = (record: BrowserUsageRecord): string => {
    return record.alias || record.host;
  };

  // 计算总统计
  const totalStats = useMemo(() => {
    const totalFocus = records.reduce((sum, r) => sum + parseInt(r.focus), 0);
    const totalVisits = records.reduce((sum, r) => sum + r.time, 0);
    const uniqueSites = new Set(records.map(r => r.host)).size;
    return { totalFocus, totalVisits, uniqueSites };
  }, [records]);

  return (
    <div className="browser-usage-list">
      <div className="browser-usage-list__header">
        <div className="browser-usage-list__title-section">
          <h2>🌐 浏览器使用记录</h2>
          <div className="browser-usage-list__stats">
            <span className="stat-item">
              <span className="stat-label">总时长:</span>
              <span className="stat-value">{formatDuration(totalStats.totalFocus)}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">访问次数:</span>
              <span className="stat-value">{totalStats.totalVisits}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">网站数:</span>
              <span className="stat-value">{totalStats.uniqueSites}</span>
            </span>
            <span className="stat-item">
              <span className="stat-label">记录天数:</span>
              <span className="stat-value">{dailyUsages.length}</span>
            </span>
          </div>
        </div>
        <div className="browser-usage-list__actions">
          <button
            className="action-btn action-btn--import"
            onClick={onImport}
            disabled={isImporting}
          >
            {isImporting ? '导入中...' : '📥 导入'}
          </button>
          <button
            className="action-btn action-btn--export"
            onClick={onExport}
            disabled={records.length === 0}
          >
            📤 导出
          </button>
          <button
            className="action-btn action-btn--clear"
            onClick={onClear}
            disabled={records.length === 0}
          >
            🗑️ 清空
          </button>
        </div>
      </div>

      <div className="browser-usage-list__content">
        {dailyUsages.length === 0 ? (
          <div className="browser-usage-list__empty">
            <p>📭 暂无浏览器使用记录</p>
            <p className="empty-hint">点击"导入"按钮导入JSON数据</p>
          </div>
        ) : (
          dailyUsages.map((daily) => (
            <div key={daily.date} className="daily-usage">
              <div className="daily-usage__header">
                <h3 className="daily-usage__date">{formatDate(daily.date)}</h3>
                <div className="daily-usage__summary">
                  <span className="summary-item">
                    ⏱️ {formatDuration(daily.totalFocus)}
                  </span>
                  <span className="summary-item">
                    🔢 {daily.totalVisits} 次访问
                  </span>
                  <span className="summary-item">
                    🌐 {daily.records.length} 个网站
                  </span>
                </div>
              </div>

              <div className="daily-usage__records">
                {daily.records.map((record, index) => (
                  <div key={`${record.id}_${index}`} className="usage-record">
                    <div className="usage-record__rank">#{index + 1}</div>
                    <div className="usage-record__info">
                      <div className="usage-record__name">
                        {getDisplayName(record)}
                      </div>
                      <div className="usage-record__host">{record.host}</div>
                    </div>
                    <div className="usage-record__stats">
                      <div className="usage-record__stat">
                        <span className="stat-icon">⏱️</span>
                        <span className="stat-text">{formatDuration(record.focus)}</span>
                      </div>
                      <div className="usage-record__stat">
                        <span className="stat-icon">🔢</span>
                        <span className="stat-text">{record.time} 次</span>
                      </div>
                    </div>
                    <div className="usage-record__category">
                      <span className="category-badge">{record.cate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BrowserUsageList;
