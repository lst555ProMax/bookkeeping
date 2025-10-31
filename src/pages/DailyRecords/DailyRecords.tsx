import React, { useState } from 'react';
import { MonthSelector } from '@/components';
import { MealRegularityChart, HabitStatsChart, StepsTrendChart, WorkTimeChart, AttendanceComplianceChart } from '@/components/daily';
import { getMonthlyStats, getMonthlyTrendData, getHabitStats } from '@/utils/daily/statistics';
import './DailyRecords.scss';

const DailyRecords: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // 解析选中的年月
  const [year, month] = selectedMonth.split('-').map(Number);

  // 获取月度统计数据
  const stats = getMonthlyStats(year, month);

  // 获取趋势数据
  const trendData = getMonthlyTrendData(year, month);

  // 获取生活习惯统计
  const habitStats = getHabitStats(year, month);

  // 返回首页（切换到日常记录模式）
  const goToHome = () => {
    window.location.hash = '#/?mode=daily';
  };

  return (
    <div className="daily-records">
      {/* 页面头部 */}
      <header className="daily-records__header">
        <button className="back-btn" onClick={goToHome}>
          ← 返回首页
        </button>
        <h1>📊 日常数据面板</h1>
        <p>全方位了解你的日常生活状态</p>
      </header>

      <div className="daily-records__content">
        {/* 月份选择器 */}
        <div className="daily-records__month-selector">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* 统计概览卡片 */}
        <div className="daily-records__stats">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-content">
              <div className="stat-label">本月记录天数</div>
              <div className="stat-value">{stats.totalRecords} 天</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🍽️</div>
            <div className="stat-content">
              <div className="stat-label">三餐规律率</div>
              <div className="stat-value">{stats.regularMealsRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚶</div>
            <div className="stat-content">
              <div className="stat-label">平均步数</div>
              <div className="stat-value">{stats.averageSteps.toLocaleString()}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <div className="stat-label">平均工作时长</div>
              <div className="stat-value">{stats.averageWorkHours}h</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏢</div>
            <div className="stat-content">
              <div className="stat-label">平均在公司时长</div>
              <div className="stat-value">{stats.averageCompanyHours}h</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-label">签到合格率</div>
              <div className="stat-value">{stats.checkInComplianceRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🧼</div>
            <div className="stat-content">
              <div className="stat-label">每日内务完成率</div>
              <div className="stat-value">{stats.dailyHygieneCompletionRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💇</div>
            <div className="stat-content">
              <div className="stat-label">洗头完成率 (2天/次)</div>
              <div className="stat-value">{stats.hairWashCompletionRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛁</div>
            <div className="stat-content">
              <div className="stat-label">洗澡完成率 (7天/次)</div>
              <div className="stat-value">{stats.showerCompletionRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👔</div>
            <div className="stat-content">
              <div className="stat-label">洗衣完成率 (3天/次)</div>
              <div className="stat-value">{stats.laundryCompletionRate}%</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🧹</div>
            <div className="stat-content">
              <div className="stat-label">打扫完成率 (7天/次)</div>
              <div className="stat-value">{stats.cleaningCompletionRate}%</div>
            </div>
          </div>
        </div>

        {/* 图表区域 */}
        <div className="daily-records__charts">
          {/* 第一行：三餐规律性 和 生活习惯 */}
          <div className="charts-row">
            <div className="chart-item">
              <MealRegularityChart
                breakfastStats={stats.mealStats.breakfast}
                lunchStats={stats.mealStats.lunch}
                dinnerStats={stats.mealStats.dinner}
              />
            </div>
            <div className="chart-item">
              <HabitStatsChart data={habitStats} />
            </div>
          </div>

          {/* 第二行：考勤合格率 和 步数趋势 */}
          <div className="charts-row">
            <div className="chart-item">
              <AttendanceComplianceChart
                checkInRate={stats.checkInComplianceRate}
                checkOutRate={stats.checkOutComplianceRate}
                leaveRate={stats.leaveComplianceRate}
              />
            </div>
            <div className="chart-item">
              <StepsTrendChart data={trendData} />
            </div>
          </div>

          {/* 第三行：工作时长分析 */}
          <div className="charts-row charts-row--single">
            <div className="chart-item">
              <WorkTimeChart data={trendData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyRecords;
