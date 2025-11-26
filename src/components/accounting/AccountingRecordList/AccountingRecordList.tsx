import React, { useState } from 'react';
import { ExpenseRecord, IncomeRecord } from '@/utils';
import { formatCurrency, formatDisplayDate } from '@/utils';
import { RecordListEmpty } from '@/components/common';
import './AccountingRecordList.scss';

type AccountingRecordItem = ExpenseRecord | IncomeRecord;

interface AccountingRecordListProps {
  records: AccountingRecordItem[];
  allRecords?: AccountingRecordItem[]; // 所有记录（用于计算总数）
  onDeleteRecord: (id: string) => void;
  onEditRecord: (record: AccountingRecordItem) => void;
  type?: 'expense' | 'income'; // 用于区分显示样式
}

const AccountingRecordList: React.FC<AccountingRecordListProps> = ({ 
  records, 
  allRecords,
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
  }, {} as Record<string, Record<string, AccountingRecordItem[]>>);
  

  // 计算所有记录按月份分组（用于显示总数和月份头）
  const allGroupedByMonth = React.useMemo(() => {
    const all = allRecords || records;
    return all.reduce((groups, record) => {
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
    }, {} as Record<string, Record<string, AccountingRecordItem[]>>);
  }, [allRecords, records]);
  
  // 使用所有记录的月份来生成月份头列表
  const sortedMonths = React.useMemo(() => {
    return Object.keys(allGroupedByMonth).sort((a, b) => b.localeCompare(a));
  }, [allGroupedByMonth]);

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
  const calculateDayTotal = (records: AccountingRecordItem[]): number => {
    return records.reduce((sum, record) => sum + record.amount, 0);
  };

  // 计算某个月的总额
  const calculateMonthTotal = (monthRecords: Record<string, AccountingRecordItem[]> | undefined): number => {
    if (!monthRecords) return 0;
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

  if (records.length === 0) {
    return (
      <div className={listClass}>
        <RecordListEmpty
          icon={type === 'income' ? '💰' : '💸'}
          message={type === 'income' ? '还没有收入记录' : '还没有支出记录'}
          hint={type === 'income' ? '开始记录你的收入吧~' : '开始记录你的支出吧~'}
          className="record-list__empty"
        />
      </div>
    );
  }

  return (
    <div className={listClass}>
      <div className="record-list__scroll-content">
        {sortedMonths.map(monthKey => {
          const monthRecords = groupedByMonth[monthKey] || {};
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
                  <span className="record-list__month-count">
                    (<span className="record-list__month-count-current">{Object.values(monthRecords).flat().length}</span>/{Object.values(allGroupedByMonth[monthKey] || {}).flat().length}笔)
                  </span>
                </div>
                <span className="record-list__month-total">{formatCurrency(monthTotal)}</span>
              </div>

              {/* 月份内容 - 可展开/收起 */}
              {isExpanded && sortedDates.length > 0 && (
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

export default AccountingRecordList;