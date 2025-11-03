/**
 * 浏览器使用记录存储管理
 */

import { BrowserUsageRecord } from './types';

const BROWSER_USAGE_STORAGE_KEY = 'browserUsageRecords';

/**
 * 加载所有浏览器使用记录
 */
export const loadBrowserUsageRecords = (): BrowserUsageRecord[] => {
  try {
    const stored = localStorage.getItem(BROWSER_USAGE_STORAGE_KEY);
    if (!stored) return [];
    
    const records = JSON.parse(stored) as BrowserUsageRecord[];
    // 将存储的日期字符串转换回Date对象
    return records.map((record) => ({
      ...record,
      createdAt: new Date(record.createdAt)
    }));
  } catch (error) {
    console.error('Failed to load browser usage records:', error);
    return [];
  }
};

/**
 * 保存浏览器使用记录
 */
const saveBrowserUsageRecords = (records: BrowserUsageRecord[]): void => {
  try {
    localStorage.setItem(BROWSER_USAGE_STORAGE_KEY, JSON.stringify(records));
  } catch (error) {
    console.error('Failed to save browser usage records:', error);
    throw new Error('保存浏览器使用记录失败');
  }
};

/**
 * 添加单条浏览器使用记录
 */
export const addBrowserUsageRecord = (record: BrowserUsageRecord): void => {
  const records = loadBrowserUsageRecords();
  records.push(record);
  saveBrowserUsageRecords(records);
};

/**
 * 批量添加浏览器使用记录
 */
export const addBrowserUsageRecords = (newRecords: BrowserUsageRecord[]): void => {
  const records = loadBrowserUsageRecords();
  records.push(...newRecords);
  saveBrowserUsageRecords(records);
};

/**
 * 删除浏览器使用记录
 */
export const deleteBrowserUsageRecord = (id: string): void => {
  const records = loadBrowserUsageRecords();
  const filtered = records.filter(record => record.id !== id);
  saveBrowserUsageRecords(filtered);
};

/**
 * 更新浏览器使用记录
 */
export const updateBrowserUsageRecord = (updatedRecord: BrowserUsageRecord): void => {
  const records = loadBrowserUsageRecords();
  const index = records.findIndex(record => record.id === updatedRecord.id);
  
  if (index !== -1) {
    records[index] = updatedRecord;
    saveBrowserUsageRecords(records);
  }
};

/**
 * 清空所有浏览器使用记录
 */
export const clearAllBrowserUsageRecords = (): number => {
  const records = loadBrowserUsageRecords();
  const count = records.length;
  localStorage.removeItem(BROWSER_USAGE_STORAGE_KEY);
  return count;
};

/**
 * 根据日期范围获取记录
 */
export const getBrowserUsageRecordsByDateRange = (startDate: string, endDate: string): BrowserUsageRecord[] => {
  const records = loadBrowserUsageRecords();
  return records.filter(record => record.date >= startDate && record.date <= endDate);
};

/**
 * 根据日期获取记录
 */
export const getBrowserUsageRecordsByDate = (date: string): BrowserUsageRecord[] => {
  const records = loadBrowserUsageRecords();
  return records.filter(record => record.date === date);
};

/**
 * 获取所有分类
 */
export const getBrowserUsageCategories = (): string[] => {
  const records = loadBrowserUsageRecords();
  const categories = new Set(records.map(record => record.cate));
  return Array.from(categories).sort();
};
