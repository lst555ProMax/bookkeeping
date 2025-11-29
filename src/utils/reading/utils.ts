/**
 * 书记工具函数
 */

import { DiaryEntry } from './types';

/**
 * 计算某一天的书记序号
 * @param entries 所有书记条目
 * @param targetDate 目标日期
 * @param targetId 目标书记的ID（用于确定该书记在同一天中的位置）
 * @returns 序号（从1开始）
 */
export const getDiaryEntryNumber = (
  entries: DiaryEntry[],
  targetDate: string,
  targetId: string
): number => {
  // 筛选出同一天的书记，按创建时间排序
  const sameDateEntries = entries
    .filter(entry => entry.date === targetDate)
    .sort((a, b) => {
      // 先按创建时间排序
      const createdAtCompare = a.createdAt - b.createdAt;
      if (createdAtCompare !== 0) return createdAtCompare;
      // 如果创建时间相同，按ID排序（确保稳定排序）
      return a.id.localeCompare(b.id);
    });

  // 找到目标书记在同一天中的位置（索引+1）
  const index = sameDateEntries.findIndex(entry => entry.id === targetId);
  
  // 如果找到了，返回索引+1；如果没找到（不应该发生），返回同一天的总数+1
  return index >= 0 ? index + 1 : sameDateEntries.length + 1;
};

