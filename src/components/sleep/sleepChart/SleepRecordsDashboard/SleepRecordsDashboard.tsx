import React, { useState } from 'react';
import { MonthSelector, SleepTimeTrendChart, SleepDurationTrendChart, SleepQualityTrendChart } from '@/components';
import { getMonthSleepStats, getMonthSleepTrend, formatSleepDuration } from '@/utils';
import './SleepRecordsDashboard.scss';

const SleepRecordsDashboard: React.FC = () => {
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

  return (
    <div className="sleep-records-content">
      <div className="sleep-records-content__content">
        {/* 月份选择器 */}
        <div className="sleep-records-content__month-selector">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* 统计概览卡片 */}
        <div className="sleep-records-content__stats">
          <div className="stat-card stat-card--warning">
            <div className="stat-icon">🌃</div>
            <div className="stat-content">
              <div className="stat-label">熬穿天数</div>
              <div className="stat-value">{stats.lateNightDays} 天</div>
            </div>
          </div>

          <div className="stat-card stat-card--danger">
            <div className="stat-icon">😴</div>
            <div className="stat-content">
              <div className="stat-label">失眠天数</div>
              <div className="stat-value">{stats.insomniaDays} 天</div>
            </div>
          </div>

          <div className="stat-card stat-card--info">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <div className="stat-label">入睡规律性</div>
              <div className="stat-value">{stats.sleepTimeRegularity}%</div>
            </div>
          </div>

          <div className="stat-card stat-card--success">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-label">睡眠时长规律性</div>
              <div className="stat-value">{stats.durationRegularity}%</div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="sleep-records-content__charts">
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

export default SleepRecordsDashboard;

