import React from 'react';
import { ExpenseRecord } from '@/types';
import { formatCurrency, formatDisplayDate } from '@/utils';
import './ExpenseList.scss';

interface ExpenseListProps {
  expenses: ExpenseRecord[];
  onDeleteExpense: (id: string) => void;
  onEditExpense: (expense: ExpenseRecord) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, onDeleteExpense, onEditExpense }) => {
  // 按日期分组支出记录
  const groupedExpenses = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, ExpenseRecord[]>);

  // 按日期排序（最新的在前）
  const sortedDates = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  const calculateDayTotal = (records: ExpenseRecord[]): number => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  if (expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="expense-list--empty">
          <p>还没有支出记录，快来添加第一笔吧！</p>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="expense-list__scroll-content">
        {sortedDates.map(date => {
          const dayRecords = groupedExpenses[date];
          const dayTotal = calculateDayTotal(dayRecords);
          
          return (
            <div key={date} className="expense-list__day-group">
              <div className="expense-list__day-header">
                <span className="expense-list__day-date">{formatDisplayDate(date)}</span>
                <span className="expense-list__day-total">{formatCurrency(dayTotal)}</span>
              </div>
              <div className="expense-list__day-records">{dayRecords
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(record => (
                    <div key={record.id} className="expense-record">
                      <div className="expense-record__info">
                        <div className="expense-record__main">
                          <span className="expense-record__category">{record.category}</span>
                          {record.description && (
                            <span className="expense-record__description">{record.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="expense-record__actions">
                        <span className="expense-record__amount">{formatCurrency(record.amount)}</span>
                        <button
                          className="expense-record__edit"
                          onClick={() => onEditExpense(record)}
                          title="编辑记录"
                        >
                          ✏️
                        </button>
                        <button
                          className="expense-record__delete"
                          onClick={() => onDeleteExpense(record.id)}
                          title="删除记录"
                        >
                          🗑️
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

export default ExpenseList;