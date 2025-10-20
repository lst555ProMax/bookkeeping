import React, { useState } from 'react';
import { MonthSelector, SleepTimeTrendChart, SleepDurationTrendChart, SleepQualityTrendChart } from '@/components';
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

  // 准备睡眠质量数据
  const qualityData = trendData.map(item => ({
    date: item.date,
    quality: item.quality
  }));

  // 返回首页（切换到睡眠记录模式）
  const goToHome = () => {
    window.location.hash = '#/?mode=sleep';
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

      <div className="sleep-records__content">
        {/* 月份选择器 */}
        <div className="sleep-records__month-selector">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* 统计概览卡片 */}
        <div className="sleep-records__overview">
          <div className="overview-card">
            <div className="overview-icon">📊</div>
            <div className="overview-content">
              <div className="overview-label">本月记录天数</div>
              <div className="overview-value">{stats.totalRecords} 天</div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="sleep-records__charts">
          {/* 入睡与醒来时间趋势 */}
          <div className="chart-with-stats">
            <div className="chart-header-stats">
              <span className="stat-item">🌙 平均入睡：{stats.averageSleepTime}</span>
              <span className="stat-item">☀️ 平均醒来：{stats.averageWakeTime}</span>
            </div>
            <SleepTimeTrendChart data={trendData} />
          </div>

          {/* 睡眠时长趋势 */}
          <div className="chart-with-stats">
            <div className="chart-header-stats">
              <span className="stat-item">⏱️ 平均时长：{formatSleepDuration(stats.averageDuration)}</span>
            </div>
            <SleepDurationTrendChart data={trendData} />
          </div>

          {/* 睡眠质量趋势 */}
          <SleepQualityTrendChart 
            data={qualityData}
            averageQuality={stats.averageQuality}
          />
        </div>
      </div>
    </div>
  );
};

export default SleepRecords;
