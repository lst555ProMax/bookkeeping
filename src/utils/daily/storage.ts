import { DailyRecord } from './types';

const STORAGE_KEY = 'daily_records';

// ==================== 基础存储操作 ====================

/**
 * 加载所有日常记录
 */
export const loadDailyRecords = (): DailyRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    
    const records = JSON.parse(data) as DailyRecord[];
    return records.map((record) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('加载日常记录失败:', error);
    return [];
  }
};

/**
 * 保存日常记录到localStorage
 */
const saveDailyRecords = (records: DailyRecord[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('保存日常记录失败:', error);
  }
};

/**
 * 添加新的日常记录
 */
export const addDailyRecord = (record: DailyRecord): void => {
  const records = loadDailyRecords();
  records.push(record);
  saveDailyRecords(records);
};

/**
 * 删除日常记录
 */
export const deleteDailyRecord = (id: string): void => {
  const records = loadDailyRecords();
  const updatedRecords = records.filter(record => record.id !== id);
  saveDailyRecords(updatedRecords);
};

/**
 * 更新日常记录
 */
export const updateDailyRecord = (updatedRecord: DailyRecord): void => {
  const records = loadDailyRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  
  if (index !== -1) {
    records[index] = updatedRecord;
    saveDailyRecords(records);
  }
};

/**
 * 根据ID获取日常记录
 */
export const getDailyRecordById = (id: string): DailyRecord | undefined => {
  const records = loadDailyRecords();
  return records.find(record => record.id === id);
};

/**
 * 清空所有日常记录（谨慎使用）
 */
export const clearAllDailyRecords = (): number => {
  const records = loadDailyRecords();
  const count = records.length;
  localStorage.removeItem(STORAGE_KEY);
  return count;
};

// ==================== 查询和统计 ====================

/**
 * 获取指定月份的日常记录
 * @param year 年份
 * @param month 月份（1-12）
 */
export const getDailyRecordsByMonth = (year: number, month: number): DailyRecord[] => {
  const records = loadDailyRecords();
  return records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getFullYear() === year && recordDate.getMonth() + 1 === month;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * 获取指定日期范围的日常记录
 * @param startDate 开始日期 YYYY-MM-DD
 * @param endDate 结束日期 YYYY-MM-DD
 */
export const getDailyRecordsByDateRange = (startDate: string, endDate: string): DailyRecord[] => {
  const records = loadDailyRecords();
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  
  return records.filter(record => {
    const recordTime = new Date(record.date).getTime();
    return recordTime >= start && recordTime <= end;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * 获取指定日期的日常记录
 * @param date 日期 YYYY-MM-DD
 */
export const getDailyRecordByDate = (date: string): DailyRecord | undefined => {
  const records = loadDailyRecords();
  return records.find(record => record.date === date);
};
