import React from 'react';
import { ExpenseRecord, IncomeRecord } from '@/utils';
import { formatCurrency, formatDisplayDate } from '@/utils';
import './RecordList.scss';

type RecordItem = ExpenseRecord | IncomeRecord;

interface RecordListProps {
  records: RecordItem[];
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: RecordItem) => void;
  type?: 'expense' | 'income'; // 用于区分显示样式
}

const RecordList: React.FC<RecordListProps> = ({ 
  records, 
  onDeleteRecord, 
  onEditRecord, 
  type = 'expense' 
}) => {
  // 按日期分组记录
  const groupedRecords = records.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, RecordItem[]>);

  // 按日期排序（最新的在前）
  const sortedDates = Object.keys(groupedRecords).sort((a, b) => b.localeCompare(a));

  const calculateDayTotal = (records: RecordItem[]): number => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  const listClass = type === 'income' ? 'record-list record-list--income' : 'record-list record-list--expense';
  const emptyMessage = type === 'income' ? '还没有收入记录，快来添加第一笔吧！' : '还没有支出记录，快来添加第一笔吧！';

  if (records.length === 0) {
    return (
      <div className={listClass}>
        <div className="record-list__empty">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={listClass}>
      <div className="record-list__scroll-content">
        {sortedDates.map(date => {
          const dayRecords = groupedRecords[date];
          const dayTotal = calculateDayTotal(dayRecords);
          
          return (
            <div key={date} className="record-list__day-group">
              <div className="record-list__day-header">
                <span className="record-list__day-date">{formatDisplayDate(date)}</span>
                <span className="record-list__day-total">{formatCurrency(dayTotal)}</span>
              </div>
              <div className="record-list__day-records">{dayRecords
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map(record => (
                    <div key={record.id} className="record-list__record">
                      <div className="record-list__record-info">
                        <div className="record-list__record-main">
                          <span className="record-list__record-category">{record.category}</span>
                          {record.description && (
                            <span className="record-list__record-description">{record.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="record-list__record-actions">
                        <span className="record-list__record-amount">{formatCurrency(record.amount)}</span>
                        <button
                          className="record-list__record-edit"
                          onClick={() => onEditRecord(record)}
                          title="编辑记录"
                        >
                          ✏️
                        </button>
                        <button
                          className="record-list__record-delete"
                          onClick={() => onDeleteRecord(record.id)}
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

export default RecordList;