import React, { useState, useEffect } from 'react';
import { MonthSelector, RecordDaysChart, RecordTrendChart, RecordPieChart } from '@/components';
import { ExpenseRecord, IncomeRecord, RecordType } from '@/utils';
import { loadExpenses, loadIncomes, formatCurrency, getCategories, getIncomeCategories } from '@/utils';
import './RecordsContent.scss';

interface RecordsContentProps {
  recordType: RecordType;
  onRecordTypeChange: (type: RecordType) => void;
}

const RecordsContent: React.FC<RecordsContentProps> = ({ recordType, onRecordTypeChange }) => {
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

  // 计算最多分类
  const topCategory = (() => {
    const categoryMap = new Map<string, number>();
    monthlyRecords.forEach(record => {
      const existing = categoryMap.get(record.category) || 0;
      categoryMap.set(record.category, existing + record.amount);
    });
    
    if (categoryMap.size === 0) return { name: '--', amount: 0 };
    
    const sorted = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]);
    
    return {
      name: sorted[0][0],
      amount: sorted[0][1]
    };
  })();

  return (
    <div className="records-content">
      <div className="records-content__main">
        <div className="records-content__container">
          {/* 月份选择器 */}
          <div className="records-content__month-selector">
            <MonthSelector 
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />
          </div>

          {/* 统计卡片 */}
          <div className="records-content__stats-section">
            <div className="stats-grid">
              <div className="stat-card stat-card--primary">
                <div className="stat-icon">{recordType === RecordType.EXPENSE ? '💰' : '📈'}</div>
                <div className="stat-content">
                  <div className="stat-label">总{recordType === RecordType.EXPENSE ? '支出' : '收入'}</div>
                  <div className="stat-value">{formatCurrency(totalAmount)}</div>
                </div>
              </div>
              
              <div className="stat-card stat-card--success">
                <div className="stat-icon">📅</div>
                <div className="stat-content">
                  <div className="stat-label">本月{recordType === RecordType.EXPENSE ? '支出' : '收入'}</div>
                  <div className="stat-value">{formatCurrency(monthlyTotal)}</div>
                </div>
              </div>
              
              <div className="stat-card stat-card--info">
                <div className="stat-icon">📝</div>
                <div className="stat-content">
                  <div className="stat-label">本月记录</div>
                  <div className="stat-value">{monthlyRecordCount} 笔</div>
                </div>
              </div>

              <div className="stat-card stat-card--warning">
                <div className="stat-icon">🏆</div>
                <div className="stat-content">
                  <div className="stat-label">最多{recordType === RecordType.EXPENSE ? '支出' : '收入'}分类</div>
                  <div className="stat-value">{topCategory.name}</div>
                  <div className="stat-subvalue">{formatCurrency(topCategory.amount)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 图表分析区域 */}
          <div className="records-content__chart-section">
            {/* 图表网格 */}
            <div className="charts-grid">
              {/* 第一行：饼状图和趋势图 */}
              <div className="charts-row">
                <div className="chart-item">
                  <RecordPieChart 
                    records={monthlyRecords}
                    recordType={recordType}
                    title={`${recordType === RecordType.EXPENSE ? '💰' : '📈'} ${selectedMonth.split('-')[0]}年${selectedMonth.split('-')[1]}月${recordType === RecordType.EXPENSE ? '支出' : '收入'}分析`}
                    totalAmount={totalAmount}
                  />
                </div>
                <div className="chart-item">
                  <RecordTrendChart 
                    records={currentRecords}
                    recordType={recordType}
                    title={`${recordType === RecordType.EXPENSE ? '💰' : '📈'} 最近7天${recordType === RecordType.EXPENSE ? '开销' : '收入'}趋势`}
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
                    title={`${recordType === RecordType.EXPENSE ? '💰' : '📈'} 本月${recordType === RecordType.EXPENSE ? '开销' : '收入'}最高的7天`}
                  />
                </div>
                <div className="chart-item">
                  <RecordDaysChart 
                    records={currentRecords}
                    recordType={recordType}
                    selectedMonth={selectedMonth}
                    type="bottom"
                    title={`${recordType === RecordType.EXPENSE ? '💰' : '📈'} 本月${recordType === RecordType.EXPENSE ? '开销' : '收入'}最低的7天`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecordsContent;

