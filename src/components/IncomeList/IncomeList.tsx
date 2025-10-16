import React from 'react';
import { IncomeRecord } from '@/types';
import { formatCurrency, formatDisplayDate } from '@/utils';
import './IncomeList.scss';

interface IncomeListProps {
  incomes: IncomeRecord[];
  onDeleteIncome: (id: string) => void;
  onEditIncome: (income: IncomeRecord) => void;
}

const IncomeList: React.FC<IncomeListProps> = ({ incomes, onDeleteIncome, onEditIncome }) => {
  // 按日期分组收入记录
  const groupedIncomes = incomes.reduce((groups, income) => {
    const date = income.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(income);
    return groups;
  }, {} as Record<string, IncomeRecord[]>);

  // 按日期排序（最新的在前）
  const sortedDates = Object.keys(groupedIncomes).sort((a, b) => b.localeCompare(a));

  const calculateDayTotal = (records: IncomeRecord[]): number => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  if (incomes.length === 0) {
    return (
      <div className="income-list">
        <h2 className="income-list__title">收入记录</h2>
        <div className="income-list--empty">
          <p>还没有收入记录，快来添加第一笔吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="income-list">
      <h2 className="income-list__title">收入记录</h2>
      <div className="income-list__scroll-content">
        {sortedDates.map(date => {
          const dayRecords = groupedIncomes[date];
          const dayTotal = calculateDayTotal(dayRecords);
          
          return (
            <div key={date} className="income-list__day-group">
              <div className="income-list__day-header">
                <span className="income-list__day-date">{formatDisplayDate(date)}</span>
                <span className="income-list__day-total">{formatCurrency(dayTotal)}</span>
              </div>
              <div className="income-list__day-records">{dayRecords
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(record => (
                    <div key={record.id} className="income-record">
                      <div className="income-record__info">
                        <div className="income-record__main">
                          <span className="income-record__category">{record.category}</span>
                          {record.description && (
                            <span className="income-record__description">{record.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="income-record__actions">
                        <span className="income-record__amount">{formatCurrency(record.amount)}</span>
                        <button
                          className="income-record__edit"
                          onClick={() => onEditIncome(record)}
                          title="编辑记录"
                        >
                          ✏️
                        </button>
                        <button
                          className="income-record__delete"
                          onClick={() => onDeleteIncome(record.id)}
                          title="删除记录"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default IncomeList;