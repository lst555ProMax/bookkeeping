import { CardDrawRecord } from '@/types';

const CARD_DRAW_STORAGE_KEY = 'bookkeeping_card_draws';

/**
 * 加载所有抽卡记录
 */
export const loadCardDrawRecords = (): CardDrawRecord[] => {
  try {
    const data = localStorage.getItem(CARD_DRAW_STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data);
    return records.map((record: CardDrawRecord) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load card draw records:', error);
    return [];
  }
};

/**
 * 保存抽卡记录
 */
const saveCardDrawRecords = (records: CardDrawRecord[]) => {
  try {
    localStorage.setItem(CARD_DRAW_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save card draw records:', error);
    throw new Error('保存抽卡记录失败');
  }
};

/**
 * 添加抽卡记录
 */
export const addCardDrawRecord = (record: CardDrawRecord) => {
  const records = loadCardDrawRecords();
  records.push(record);
  saveCardDrawRecords(records);
};

/**
 * 获取今天的抽卡记录
 */
export const getTodayCardDraw = (): CardDrawRecord | null => {
  const records = loadCardDrawRecords();
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(record => record.date === today) || null;
};

/**
 * 检查今天是否已经抽过卡
 */
export const hasTodayDrawn = (): boolean => {
  return getTodayCardDraw() !== null;
};

/**
 * 删除今天的抽卡记录（用于重置今日抽卡，历史记录会保留）
 */
export const clearTodayCardDrawRecord = (): boolean => {
  const records = loadCardDrawRecords();
  const today = new Date().toISOString().split('T')[0];
  const filtered = records.filter(record => record.date !== today);
  
  if (filtered.length === records.length) {
    // 今天没有记录
    return false;
  }
  
  saveCardDrawRecords(filtered);
  return true;
};

/**
 * 获取历史抽卡记录（按日期降序排序）
 * @param limit 可选，限制返回的记录数量
 */
export const getCardDrawHistory = (limit?: number): CardDrawRecord[] => {
  const records = loadCardDrawRecords();
  
  // 按日期降序排序（最新的在前）
  const sorted = records.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
};

/**
 * 获取指定日期范围的抽卡记录
 * @param startDate 开始日期 YYYY-MM-DD
 * @param endDate 结束日期 YYYY-MM-DD
 */
export const getCardDrawRecordsByDateRange = (startDate: string, endDate: string): CardDrawRecord[] => {
  const records = loadCardDrawRecords();
  
  return records.filter(record => {
    return record.date >= startDate && record.date <= endDate;
  }).sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
};
