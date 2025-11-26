import { FortuneRecord } from './types';

const FORTUNE_STORAGE_KEY = 'bookkeeping_fortune_records';

/**
 * 加载所有运势记录
 */
export const loadFortuneRecords = (): FortuneRecord[] => {
  try {
    const data = localStorage.getItem(FORTUNE_STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data);
    return records.map((record: FortuneRecord) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load fortune records:', error);
    return [];
  }
};

/**
 * 保存运势记录
 */
const saveFortuneRecords = (records: FortuneRecord[]) => {
  try {
    localStorage.setItem(FORTUNE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save fortune records:', error);
    throw new Error('保存运势记录失败');
  }
};

/**
 * 添加运势记录
 */
export const addFortuneRecord = (record: FortuneRecord) => {
  const records = loadFortuneRecords();
  records.push(record);
  saveFortuneRecords(records);
};

/**
 * 获取今天的运势记录
 */
export const getTodayFortune = (): FortuneRecord | null => {
  const records = loadFortuneRecords();
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(record => record.date === today) || null;
};

/**
 * 检查今天是否已经算过命
 */
export const hasTodayFortune = (): boolean => {
  return getTodayFortune() !== null;
};

/**
 * 删除今天的运势记录（用于重置今日运势，历史记录会保留）
 */
export const clearTodayFortuneRecord = (): boolean => {
  const records = loadFortuneRecords();
  const today = new Date().toISOString().split('T')[0];
  const filtered = records.filter(record => record.date !== today);
  
  if (filtered.length === records.length) {
    // 今天没有记录
    return false;
  }
  
  saveFortuneRecords(filtered);
  return true;
};

/**
 * 获取历史运势记录（按日期降序排序）
 * @param limit 可选，限制返回的记录数量
 */
export const getFortuneHistory = (limit?: number): FortuneRecord[] => {
  const records = loadFortuneRecords();
  
  // 按日期降序排序（最新的在前）
  const sorted = records.sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return limit ? sorted.slice(0, limit) : sorted;
};
