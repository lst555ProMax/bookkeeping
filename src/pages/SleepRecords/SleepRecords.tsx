import React, { useState } from 'react';
import { MonthSelector, SleepTimeTrendChart, SleepDurationTrendChart } from '@/components';
import { getMonthSleepStats, getMonthSleepTrend, formatSleepDuration } from '@/utils';
import './SleepRecords.scss';

const SleepRecords: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // 解析选中的年月
  const [year, month] = selectedMonth.split('-').map(Number);

  // 获取月度统计数据
  const stats = getMonthSleepStats(year, month);

  // 获取趋势数据
  const trendData = getMonthSleepTrend(year, month);

  // 返回首页
  const goToHome = () => {
    window.location.hash = '#/';
  };

  return (
    <div className="sleep-records">
      {/* 页面头部 */}
      <header className="sleep-records__header">
        <button className="back-btn" onClick={goToHome}>
          ← 返回首页
        </button>
        <h1>🌙 睡眠数据面板</h1>
        <p>查看你的睡眠统计与趋势分析</p>
      </header>

      {/* 月份选择器 */}
      <div className="sleep-records__month-selector">
        <MonthSelector
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
        />
      </div>

      {/* 统计卡片 */}
      <div className="sleep-records__stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">本月记录天数</div>
            <div className="stat-value">{stats.totalRecords} 天</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌙</div>
          <div className="stat-content">
            <div className="stat-label">平均入睡时间</div>
            <div className="stat-value">{stats.averageSleepTime}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">☀️</div>
          <div className="stat-content">
            <div className="stat-label">平均醒来时间</div>
            <div className="stat-value">{stats.averageWakeTime}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">平均睡眠时长</div>
            <div className="stat-value">{formatSleepDuration(stats.averageDuration)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💯</div>
          <div className="stat-content">
            <div className="stat-label">平均睡眠质量</div>
            <div className="stat-value">{stats.averageQuality} 分</div>
          </div>
        </div>
      </div>

      {/* 图表区域 */}
      <div className="sleep-records__charts">
        {/* 入睡与醒来时间趋势 */}
        <SleepTimeTrendChart data={trendData} />

        {/* 睡眠时长趋势 */}
        <SleepDurationTrendChart data={trendData} />
      </div>
    </div>
  );
};

export default SleepRecords;
