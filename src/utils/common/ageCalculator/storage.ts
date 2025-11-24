import { AgeRecord } from './types';

const AGE_STORAGE_KEY = 'bookkeeping_age_records';

/**
 * 加载所有年龄计算记录
 */
export const loadAgeRecords = (): AgeRecord[] => {
  try {
    const data = localStorage.getItem(AGE_STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data);
    return records.map((record: AgeRecord) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load age records:', error);
    return [];
  }
};

/**
 * 保存年龄计算记录
 */
const saveAgeRecords = (records: AgeRecord[]) => {
  try {
    localStorage.setItem(AGE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save age records:', error);
    throw new Error('保存年龄记录失败');
  }
};

/**
 * 添加年龄计算记录
 */
export const addAgeRecord = (record: AgeRecord) => {
  const records = loadAgeRecords();
  records.push(record);
  saveAgeRecords(records);
};

/**
 * 获取今天的年龄计算记录
 */
export const getTodayAgeRecord = (): AgeRecord | null => {
  const records = loadAgeRecords();
  const today = new Date().toISOString().split('T')[0];
  
  return records.find(record => record.date === today) || null;
};

/**
 * 检查今天是否已经计算过年龄
 */
export const hasTodayAgeRecord = (): boolean => {
  return getTodayAgeRecord() !== null;
};

/**
 * 删除今天的年龄计算记录（用于重置今日计算，历史记录会保留）
 */
export const clearTodayAgeRecord = (): boolean => {
  const records = loadAgeRecords();
  const today = new Date().toISOString().split('T')[0];
  const filtered = records.filter(record => record.date !== today);
  
  if (filtered.length === records.length) {
    // 今天没有记录
    return false;
  }
  
  saveAgeRecords(filtered);
  return true;
};

