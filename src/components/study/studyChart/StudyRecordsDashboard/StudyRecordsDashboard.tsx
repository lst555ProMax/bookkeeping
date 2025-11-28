import React, { useState, useEffect } from 'react';
import { MonthSelector, StudyCategoryPieChart, StudyTrendChart, StudyDaysChart } from '@/components';
import { StudyRecord } from '@/utils';
import { loadStudyRecords } from '@/utils';
import './StudyRecordsDashboard.scss';

interface StudyCategoryStats {
  category: string;
  totalMinutes: number;
  recordCount: number;
  percentage: number;
}

interface StudyDateStats {
  date: string;
  totalMinutes: number;
  recordCount: number;
}

const StudyRecordsDashboard: React.FC = () => {
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

  // 计算当月已过天数
  const getDaysPassedInMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const today = new Date();
    const selectedDate = new Date(year, month - 1, 1);
    
    // 如果选择的月份是当前月份,返回今天是几号
    if (today.getFullYear() === year && today.getMonth() === month - 1) {
      return today.getDate();
    }
    
    // 如果选择的月份在过去,返回该月的总天数
    if (selectedDate < new Date(today.getFullYear(), today.getMonth(), 1)) {
      return new Date(year, month, 0).getDate();
    }
    
    // 如果选择的月份在未来,返回0
    return 0;
  };

  const daysPassedInMonth = getDaysPassedInMonth();

  // 按分类统计
  const categoryStats: StudyCategoryStats[] = (() => {
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
  const recentDaysStats: StudyDateStats[] = (() => {
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

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 格式化时长
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="study-records-content">
      <div className="study-records-content__content">
        {/* 月份选择器 */}
        <div className="study-records-content__month-selector">
          <MonthSelector
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
          />
        </div>

        {/* 统计概览卡片 */}
        <div className="study-records-content__stats">
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
                {daysPassedInMonth > 0
                  ? formatDuration(Math.round(totalMinutes / daysPassedInMonth))
                  : '0m'}
              </div>
            </div>
          </div>

          <div className="stat-card stat-card--warning">
            <div className="stat-icon">🏆</div>
            <div className="stat-content">
              <div className="stat-label">最长学习时间</div>
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
        <div className="study-records-content__charts">
          {/* 分类统计和趋势图在同一行 */}
          <div className="chart-row">
            <StudyCategoryPieChart 
              categoryStats={categoryStats} 
            />
            <StudyTrendChart dateStats={recentDaysStats} />
          </div>
          
          {/* 学习时长最多和最少的7天 */}
          <div className="chart-row">
            <StudyDaysChart
              dailyStats={maxStudyDay}
              selectedMonth={selectedMonth}
              type="top"
              count={7}
            />
            <StudyDaysChart
              dailyStats={maxStudyDay}
              selectedMonth={selectedMonth}
              type="bottom"
              count={7}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRecordsDashboard;

