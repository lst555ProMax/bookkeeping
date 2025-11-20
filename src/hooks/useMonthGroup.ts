import { useState, useEffect, useMemo } from 'react';

/**
 * 通用的月份分组和展开状态管理 Hook
 * @param records 记录数组，需要包含 date 字段（YYYY-MM-DD格式）
 * @returns 分组后的数据、展开状态和相关操作函数
 */
export function useMonthGroup<T extends { date: string }>(records: T[]) {
  // 跟踪每个月份的展开/收起状态
  const [expandedMonths, setExpandedMonths] = useState<Record<string, boolean>>({});

  // 按月份分组
  const groupedByMonth = useMemo(() => {
    return records.reduce((groups, record) => {
      const monthKey = record.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(record);
      return groups;
    }, {} as Record<string, T[]>);
  }, [records]);

  // 按月份排序（最新的在前）
  const sortedMonths = useMemo(() => {
    return Object.keys(groupedByMonth).sort((a, b) => b.localeCompare(a));
  }, [groupedByMonth]);

  // 初始化展开状态（默认展开最近的月份）
  useEffect(() => {
    if (sortedMonths.length > 0 && Object.keys(expandedMonths).length === 0) {
      const initialState: Record<string, boolean> = {};
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

  // 格式化月份显示
  const formatMonthDisplay = (monthKey: string): string => {
    const [year, month] = monthKey.split('-');
    return `${year}年${parseInt(month)}月`;
  };

  return {
    groupedByMonth,
    sortedMonths,
    expandedMonths,
    toggleMonth,
    formatMonthDisplay
  };
}

