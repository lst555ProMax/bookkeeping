import React, { useState, useEffect } from 'react';
import { MonthSelector, RecordDaysChart, RecordTrendChart, RecordPieChart } from '@/components';
import { ExpenseRecord, IncomeRecord, RecordType } from '@/utils';
import { loadExpenses, loadIncomes, formatCurrency } from '@/utils';
import './Records.scss';

const Records: React.FC = () => {
  // 从 URL 参数读取初始类型
  const [recordType, setRecordType] = useState<RecordType>(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const type = params.get('type');
    return type === 'income' ? RecordType.INCOME : RecordType.EXPENSE;
  });
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([]);
  const [incomes, setIncomes] = useState<IncomeRecord[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  // 加载存储的支出和收入记录
  const loadData = () => {
    const savedExpenses = loadExpenses();
    const savedIncomes = loadIncomes();
    setExpenses(savedExpenses);
    setIncomes(savedIncomes);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 获取当前记录类型的数据
  const currentRecords = recordType === RecordType.EXPENSE ? expenses : incomes;

  // 根据选中月份过滤记录
  const monthlyRecords = currentRecords.filter(record => 
    record.date.startsWith(selectedMonth)
  );

  // 计算统计数据
  const totalAmount = currentRecords.reduce((sum, record) => sum + record.amount, 0);
  const monthlyTotal = monthlyRecords.reduce((sum, record) => sum + record.amount, 0);
  const monthlyRecordCount = monthlyRecords.length;

  // 切换记录类型
  const toggleRecordType = () => {
    setRecordType(recordType === RecordType.EXPENSE ? RecordType.INCOME : RecordType.EXPENSE);
  };

  // 返回首页（保持在记账模式）
  const goToHome = () => {
    window.location.hash = '#/?mode=accounting';
  };

  return (
    <div className="records">
      <header className="records__header">
        <div className="records__nav">
          <button className="records__back-btn" onClick={goToHome}>
            ← 返回首页
          </button>
          <button 
            className="records__toggle-btn"
            onClick={toggleRecordType}
            title={`切换到${recordType === RecordType.EXPENSE ? '收入' : '支出'}看板`}
          >
            {recordType === RecordType.EXPENSE ? '💰→📈' : '📈→💰'}
          </button>
        </div>
        <h1>📊 数据看板</h1>
        <p>一目了然的{recordType === RecordType.EXPENSE ? '支出' : '收入'}分析</p>
      </header>

      <main className="records__main">
        <div className="records__container">
          {/* 统计卡片 */}
          <div className="records__stats-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-card__icon">{recordType === RecordType.EXPENSE ? '💰' : '📈'}</div>
                <div className="stat-card__content">
                  <h3>总{recordType === RecordType.EXPENSE ? '支出' : '收入'}</h3>
                  <p className="stat-card__value">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-card__icon">📅</div>
                <div className="stat-card__content">
                  <h3>本月{recordType === RecordType.EXPENSE ? '支出' : '收入'}</h3>
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
                  <RecordPieChart 
                    records={monthlyRecords}
                    recordType={recordType}
                    title={`${selectedMonth.split('-')[0]}年${selectedMonth.split('-')[1]}月${recordType === RecordType.EXPENSE ? '支出' : '收入'}分析`}
                    totalAmount={totalAmount}
                  />
                </div>
                <div className="chart-item">
                  <RecordTrendChart 
                    records={currentRecords}
                    recordType={recordType}
                    title={`最近7天${recordType === RecordType.EXPENSE ? '开销' : '收入'}趋势`}
                  />
                </div>
              </div>
              
              {/* 第二行：最高和最低开销柱状图 */}
              <div className="charts-row">
                <div className="chart-item">
                  <RecordDaysChart 
                    records={currentRecords}
                    recordType={recordType}
                    selectedMonth={selectedMonth}
                    type="top"
                    title={`本月${recordType === RecordType.EXPENSE ? '开销' : '收入'}最高的7天`}
                  />
                </div>
                <div className="chart-item">
                  <RecordDaysChart 
                    records={currentRecords}
                    recordType={recordType}
                    selectedMonth={selectedMonth}
                    type="bottom"
                    title={`本月${recordType === RecordType.EXPENSE ? '开销' : '收入'}最低的7天`}
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