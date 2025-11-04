import React, { useState, useEffect } from 'react';
import { MonthSelector } from '@/components';
import { StudyRecord } from '@/utils';
import { loadStudyRecords } from '@/utils';
import './StudyRecords.scss';

interface CategoryStats {
  category: string;
  totalMinutes: number;
  recordCount: number;
  percentage: number;
}

interface DateStats {
  date: string;
  totalMinutes: number;
  recordCount: number;
}

const StudyRecords: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [studyRecords, setStudyRecords] = useState<StudyRecord[]>([]);

  // 加载数据
  useEffect(() => {
    const records = loadStudyRecords();
    setStudyRecords(records);
  }, []);

  // 过滤当月记录
  const monthlyRecords = studyRecords.filter(record =>
    record.date.startsWith(selectedMonth)
  );

  // 计算总学习时长（分钟）
  const totalMinutes = monthlyRecords.reduce((sum, record) => sum + record.totalTime, 0);

  // 计算总学习次数
  const totalRecordCount = monthlyRecords.length;

  // 按分类统计
  const categoryStats: CategoryStats[] = (() => {
    const statsMap = new Map<string, { totalMinutes: number; recordCount: number }>();
    
    monthlyRecords.forEach(record => {
      const existing = statsMap.get(record.category) || { totalMinutes: 0, recordCount: 0 };
      statsMap.set(record.category, {
        totalMinutes: existing.totalMinutes + record.totalTime,
        recordCount: existing.recordCount + 1
      });
    });

    return Array.from(statsMap.entries())
      .map(([category, stats]) => ({
        category,
        totalMinutes: stats.totalMinutes,
        recordCount: stats.recordCount,
        percentage: totalMinutes > 0 ? (stats.totalMinutes / totalMinutes) * 100 : 0
      }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  })();

  // 按日期统计（最近7天）
  const recentDaysStats: DateStats[] = (() => {
    const statsMap = new Map<string, { totalMinutes: number; recordCount: number }>();
    
    // 获取最近7天的日期
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    // 初始化所有日期为0
    last7Days.forEach(date => {
      statsMap.set(date, { totalMinutes: 0, recordCount: 0 });
    });

    // 统计数据
    studyRecords
      .filter(record => last7Days.includes(record.date))
      .forEach(record => {
        const existing = statsMap.get(record.date) || { totalMinutes: 0, recordCount: 0 };
        statsMap.set(record.date, {
          totalMinutes: existing.totalMinutes + record.totalTime,
          recordCount: existing.recordCount + 1
        });
      });

    return last7Days.map(date => ({
      date,
      totalMinutes: statsMap.get(date)?.totalMinutes || 0,
      recordCount: statsMap.get(date)?.recordCount || 0
    }));
  })();

  // 计算学习最多的一天
  const maxStudyDay = monthlyRecords.reduce((acc, record) => {
    const existing = acc.get(record.date) || 0;
    acc.set(record.date, existing + record.totalTime);
    return acc;
  }, new Map<string, number>());

  const [topDate, topMinutes] = Array.from(maxStudyDay.entries())
    .sort((a, b) => b[1] - a[1])[0] || ['--', 0];

  // 格式化时长
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 获取分类颜色
  const getCategoryColor = (index: number) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
    return colors[index % colors.length];
  };

  // 返回首页
  const goToHome = () => {
    window.location.hash = '#/?mode=study';
  };

  return (
    <div className="study-records">
      {/* 页面头部 */}
      <header className="study-records__header">
        <button className="back-btn" onClick={goToHome}>
          ← 返回首页
        </button>
        <h1>📚 学习数据面板</h1>
        <p>记录成长，见证进步</p>
      </header>

      <div className="study-records__content">
        {/* 月份选择器 */}
        <div className="study-records__month-selector">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* 统计概览卡片 */}
        <div className="study-records__stats">
          <div className="stat-card stat-card--primary">
            <div className="stat-icon">⏱️</div>
            <div className="stat-content">
              <div className="stat-label">本月学习时长</div>
              <div className="stat-value">{formatDuration(totalMinutes)}</div>
            </div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-icon">📝</div>
            <div className="stat-content">
              <div className="stat-label">本月学习次数</div>
              <div className="stat-value">{totalRecordCount} 次</div>
            </div>
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">平均每天学习</div>
              <div className="stat-value">
                {totalRecordCount > 0
                  ? formatDuration(Math.round(totalMinutes / new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate()))
                  : '0m'}
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--warning">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">学习最多的一天</div>
              <div className="stat-value">
                {topDate !== '--' ? formatDate(topDate) : '--'}
                <span className="stat-subvalue">
                  {topMinutes > 0 ? formatDuration(topMinutes) : ''}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="study-records__charts">
          {/* 分类统计饼图 */}
          <div className="chart-card chart-card--full">
            <div className="chart-header">
              <h3>📊 学习分类统计</h3>
            </div>
            <div className="chart-content">
              {categoryStats.length > 0 ? (
                <div className="category-chart">
                  {/* 饼图 */}
                  <div className="pie-chart">
                    <svg viewBox="0 0 200 200" className="pie-svg">
                      {(() => {
                        let currentAngle = 0;
                        return categoryStats.map((stat, index) => {
                          const angle = (stat.percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;

                          // 计算路径
                          const startRad = (startAngle - 90) * (Math.PI / 180);
                          const endRad = (endAngle - 90) * (Math.PI / 180);
                          const x1 = 100 + 80 * Math.cos(startRad);
                          const y1 = 100 + 80 * Math.sin(startRad);
                          const x2 = 100 + 80 * Math.cos(endRad);
                          const y2 = 100 + 80 * Math.sin(endRad);
                          const largeArc = angle > 180 ? 1 : 0;

                          return (
                            <path
                              key={stat.category}
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={getCategoryColor(index)}
                              opacity="0.9"
                            />
                          );
                        });
                      })()}
                      {/* 中心白圈 */}
                      <circle cx="100" cy="100" r="50" fill="white" />
                      <text
                        x="100"
                        y="95"
                        textAnchor="middle"
                        fontSize="16"
                        fontWeight="bold"
                        fill="#667eea"
                      >
                        总计
                      </text>
                      <text
                        x="100"
                        y="115"
                        textAnchor="middle"
                        fontSize="14"
                        fill="#999"
                      >
                        {formatDuration(totalMinutes)}
                      </text>
                    </svg>
                  </div>

                  {/* 图例 */}
                  <div className="category-legend">
                    {categoryStats.map((stat, index) => (
                      <div key={stat.category} className="legend-item">
                        <div
                          className="legend-color"
                          style={{ backgroundColor: getCategoryColor(index) }}
                        />
                        <div className="legend-content">
                          <div className="legend-name">{stat.category}</div>
                          <div className="legend-stats">
                            <span className="legend-time">{formatDuration(stat.totalMinutes)}</span>
                            <span className="legend-percentage">{stat.percentage.toFixed(1)}%</span>
                            <span className="legend-count">{stat.recordCount}次</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </div>

          {/* 最近7天趋势 */}
          <div className="chart-card chart-card--full">
            <div className="chart-header">
              <h3>📈 最近7天学习趋势</h3>
            </div>
            <div className="chart-content">
              {recentDaysStats.length > 0 ? (
                <div className="trend-chart">
                  {recentDaysStats.map((stat) => {
                    const maxMinutes = Math.max(...recentDaysStats.map(s => s.totalMinutes), 1);
                    const heightPercent = (stat.totalMinutes / maxMinutes) * 100;

                    return (
                      <div key={stat.date} className="trend-bar-container">
                        <div className="trend-bar-wrapper">
                          <div
                            className="trend-bar"
                            style={{ height: `${heightPercent}%` }}
                          >
                            <div className="trend-value">{formatDuration(stat.totalMinutes)}</div>
                          </div>
                        </div>
                        <div className="trend-label">
                          <div className="trend-date">{formatDate(stat.date)}</div>
                          <div className="trend-count">{stat.recordCount}次</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-state">暂无数据</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRecords;
