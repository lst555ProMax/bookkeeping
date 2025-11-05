import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
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

  // 准备饼图数据
  interface PieData {
    name: string;
    value: number;
    color: string;
    [key: string]: string | number; // 添加索引签名
  }

    // 获取分类颜色
  const getCategoryColor = (index: number) => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#feca57'];
    return colors[index % colors.length];
  };


  const pieChartData: PieData[] = categoryStats.map((stat, index) => ({
    name: stat.category,
    value: stat.totalMinutes,
    color: getCategoryColor(index)
  }));

    // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };


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

  // 准备折线图数据
  interface LineData {
    date: string;
    minutes: number;
    displayDate: string;
  }

  const lineChartData: LineData[] = recentDaysStats.map(stat => ({
    date: stat.date,
    minutes: stat.totalMinutes,
    displayDate: formatDate(stat.date)
  }));

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

  // 自定义饼图 Tooltip
  const CustomPieTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ payload: PieData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="study-chart__tooltip">
          <p className="tooltip__label">{data.name}</p>
          <p className="tooltip__value">{formatDuration(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  // 自定义折线图 Tooltip
  const CustomLineTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="study-chart__tooltip">
          <p className="tooltip__label">{label}</p>
          <p className="tooltip__value">{formatDuration(payload[0].value)}</p>
        </div>
      );
    }
    return null;
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
                {daysPassedInMonth > 0
                  ? formatDuration(Math.round(totalMinutes / daysPassedInMonth))
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
          {/* 分类统计和趋势图在同一行 */}
          <div className="chart-row">
            {/* 分类统计饼图 */}
            <div className="chart-card chart-card--pie">
              <h3 className="chart-card__title">📊 学习分类统计</h3>
              <div className="chart-card__container">
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36}
                        formatter={(value) => value}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">暂无数据</div>
                )}
              </div>
            </div>

            {/* 最近7天趋势 */}
            <div className="chart-card chart-card--trend">
              <h3 className="chart-card__title">📈 最近7天学习趋势</h3>
              <div className="chart-card__container">
                {lineChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={lineChartData}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="displayDate" 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                      />
                      <YAxis 
                        tick={{ fontSize: 12 }}
                        stroke="#666"
                        tickFormatter={(value) => `${value}m`}
                      />
                      <Tooltip content={<CustomLineTooltip />} />
                      <Line 
                        type="monotone" 
                        dataKey="minutes" 
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ fill: '#667eea', strokeWidth: 2, r: 5 }}
                        activeDot={{ r: 7, stroke: '#667eea', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="empty-state">暂无数据</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyRecords;
