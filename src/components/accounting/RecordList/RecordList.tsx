import React, { useState } from 'react';
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
  // 跟踪每个月份的展开/收起状态
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // 按月份和日期分组记录
  const groupedByMonth = records.reduce((groups, record) => {
    const date = record.date; // YYYY-MM-DD
    const monthKey = date.substring(0, 7); // YYYY-MM
    
    if (!groups[monthKey]) {
      groups[monthKey] = {};
    }
    
    if (!groups[monthKey][date]) {
      groups[monthKey][date] = [];
    }
    
    groups[monthKey][date].push(record);
    return groups;
  }, {} as Record<string, Record<string, RecordItem[]>>);

  // 按月份排序（最新的在前）
  const sortedMonths = Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));

  // 初始化展开状态（默认展开最近的月份）
  React.useEffect(() => {
    if (sortedMonths.length > 0 && Object.keys(expandedMonths).length === 0) {
      const initialState: Record<string, boolean> = {};
      // 默认展开最近的月份
      sortedMonths.forEach((month, index) => {
        initialState[month] = index === 0;
      });
      setExpandedMonths(initialState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedMonths.length]);

  // 切换月份的展开/收起状态
  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };

  // 计算某一天的总额
  const calculateDayTotal = (records: RecordItem[]): number => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  // 计算某个月的总额
  const calculateMonthTotal = (monthRecords: Record<string, RecordItem[]>): number => {
    return Object.values(monthRecords).reduce((sum, dayRecords) => {
      return sum + calculateDayTotal(dayRecords);
    }, 0);
  };

  // 格式化月份显示
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
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
        {sortedMonths.map(monthKey => {
          const monthRecords = groupedByMonth[monthKey];
          const monthTotal = calculateMonthTotal(monthRecords);
          const isExpanded = expandedMonths[monthKey];
          const sortedDates = Object.keys(monthRecords).sort((a, b) => b.localeCompare(a));
          
          return (
            <div key={monthKey} className="record-list__month-group">
              {/* 月份头部 - 可点击展开/收起 */}
              <div 
                className="record-list__month-header" 
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="record-list__month-header-left">
                  <span className={`record-list__month-arrow ${isExpanded ? 'expanded' : ''}`}>
                    ▶
                  </span>
                  <span className="record-list__month-title">{formatMonthDisplay(monthKey)}</span>
                  <span className="record-list__month-count">({Object.values(monthRecords).flat().length}笔)</span>
                </div>
                <span className="record-list__month-total">{formatCurrency(monthTotal)}</span>
              </div>

              {/* 月份内容 - 可展开/收起 */}
              {isExpanded && (
                <div className="record-list__month-content">
                  {sortedDates.map(date => {
                    const dayRecords = monthRecords[date];
                    const dayTotal = calculateDayTotal(dayRecords);
                    
                    return (
                      <div key={date} className="record-list__day-group">
                        <div className="record-list__day-header">
                          <span className="record-list__day-date">{formatDisplayDate(date)}</span>
                          <span className="record-list__day-total">{formatCurrency(dayTotal)}</span>
                        </div>
                        <div className="record-list__day-records">
                          {dayRecords
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
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecordList;