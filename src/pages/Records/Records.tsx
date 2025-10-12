import React, { useState, useEffect } from 'react';
import { ExpensePieChart, MonthSelector, ExpenseTopDaysChart, ExpenseBottomDaysChart, ExpenseTrendChart } from '@/components';
import { ExpenseRecord } from '@/types';
import { loadExpenses, formatCurrency } from '@/utils';
import './Records.scss';

const Records: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // 加载存储的支出记录
  useEffect(() => {
    const savedExpenses = loadExpenses();
    setExpenses(savedExpenses);
  }, []);

  // 根据选中月份过滤支出记录
  const monthlyExpenses = expenses.filter(expense => 
    expense.date.startsWith(selectedMonth)
  );

  // 计算统计数据
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyRecordCount = monthlyExpenses.length;

  // 返回首页
  const goToHome = () => {
    window.location.hash = '#/';
  };

  return (
    <div className="records">
      <header className="records__header">
        <div className="records__nav">
          <button className="records__back-btn" onClick={goToHome}>
            ← 返回首页
          </button>
        </div>
        <h1>📊 数据看板</h1>
        <p>一目了然的支出分析</p>
      </header>

      <main className="records__main">
        <div className="records__container">
          {/* 统计卡片 */}
          <div className="records__stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__icon">💰</div>
                <div className="stat-card__content">
                  <h3>总支出</h3>
                  <p className="stat-card__value">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card__icon">📅</div>
                <div className="stat-card__content">
                  <h3>本月支出</h3>
                  <p className="stat-card__value">{formatCurrency(monthlyTotal)}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card__icon">📝</div>
                <div className="stat-card__content">
                  <h3>本月记录</h3>
                  <p className="stat-card__value">{monthlyRecordCount} 笔</p>
                </div>
              </div>
            </div>
          </div>

          {/* 图表分析区域 */}
          <div className="records__chart-section">
            <div className="chart-controls">
              <MonthSelector 
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
            
            {/* 图表网格 */}
            <div className="charts-grid">
              {/* 第一行：饼状图和趋势图 */}
              <div className="charts-row">
                <div className="chart-item">
                  <ExpensePieChart 
                    expenses={monthlyExpenses}
                    title={`${selectedMonth.split('-')[0]}年${selectedMonth.split('-')[1]}月支出分析`}
                  />
                </div>
                <div className="chart-item">
                  <ExpenseTrendChart 
                    expenses={expenses}
                    title="最近7天开销趋势"
                  />
                </div>
              </div>
              
              {/* 第二行：最高和最低开销柱状图 */}
              <div className="charts-row">
                <div className="chart-item">
                  <ExpenseTopDaysChart 
                    expenses={expenses}
                    selectedMonth={selectedMonth}
                    title="本月开销最高的7天"
                  />
                </div>
                <div className="chart-item">
                  <ExpenseBottomDaysChart 
                    expenses={expenses}
                    selectedMonth={selectedMonth}
                    title="本月开销最低的7天"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Records;