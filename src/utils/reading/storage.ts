/**
 * 书记数据存储管理
 */

import { QuickNote, DiaryEntry } from './types';

const READING_EXCERPTS_KEY = 'reading_quick_notes';
const READING_ENTRIES_KEY = 'reading_entries';

/**
 * 加载摘抄列表
 */
export const loadReadingExcerpts = (): QuickNote[] => {
  try {
    const data = localStorage.getItem(READING_EXCERPTS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载摘抄失败:', error);
    return [];
  }
};

/**
 * 保存摘抄列表
 */
export const saveReadingExcerpts = (excerpts: QuickNote[]): void => {
  try {
    localStorage.setItem(READING_EXCERPTS_KEY, JSON.stringify(excerpts));
  } catch (error) {
    console.error('保存摘抄失败:', error);
  }
};

/**
 * 添加摘抄
 */
export const addReadingExcerpt = (content: string): QuickNote => {
  const excerpt: QuickNote = {
    id: Date.now().toString(),
    content,
    timestamp: Date.now(),
  };
  
  const excerpts = loadReadingExcerpts();
  excerpts.unshift(excerpt);
  saveReadingExcerpts(excerpts);
  
  return excerpt;
};

/**
 * 更新摘抄
 */
export const updateReadingExcerpt = (id: string, content: string): QuickNote | null => {
  const excerpts = loadReadingExcerpts();
  const index = excerpts.findIndex(excerpt => excerpt.id === id);
  
  if (index === -1) return null;
  
  excerpts[index] = {
    ...excerpts[index],
    content,
    timestamp: Date.now(), // 更新时间戳
  };
  
  saveReadingExcerpts(excerpts);
  return excerpts[index];
};

/**
 * 删除摘抄
 */
export const deleteReadingExcerpt = (id: string): void => {
  const excerpts = loadReadingExcerpts();
  const filtered = excerpts.filter(excerpt => excerpt.id !== id);
  saveReadingExcerpts(filtered);
};

/**
 * 清空所有摘抄
 */
export const clearAllReadingExcerpts = (): number => {
  const excerpts = loadReadingExcerpts();
  const count = excerpts.length;
  saveReadingExcerpts([]);
  return count;
};

/**
 * 加载书记列表
 */
export const loadReadingEntries = (): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(READING_ENTRIES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载书记失败:', error);
    return [];
  }
};

/**
 * 保存书记列表
 */
export const saveReadingEntries = (entries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(READING_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存书记失败:', error);
  }
};

/**
 * 保存书记条目（支持同一天多篇书记）
 */
export const saveReadingEntry = (entry: DiaryEntry): DiaryEntry => {
  const entries = loadReadingEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    // 更新现有书记
    entries[existingIndex] = entry;
  } else {
    // 创建新书记
    entries.push(entry);
  }
  
  // 按日期降序排序
  entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 同一天的按创建时间降序
    return b.createdAt - a.createdAt;
  });
  
  saveReadingEntries(entries);
  return entry;
};

/**
 * 根据日期加载书记（返回该日期的所有书记）
 */
export const loadReadingByDate = (date: string): DiaryEntry[] => {
  const entries = loadReadingEntries();
  return entries.filter(e => e.date === date);
};

/**
 * 删除书记（按 ID）
 */
export const deleteReadingEntry = (id: string): void => {
  const entries = loadReadingEntries();
  const filtered = entries.filter(e => e.id !== id);
  saveReadingEntries(filtered);
};

/**
 * 清空所有书记
 */
export const clearAllReadingEntries = (): number => {
  const entries = loadReadingEntries();
  const count = entries.length;
  saveReadingEntries([]);
  return count;
};

// 向后兼容的别名
export const loadQuickNotes = loadReadingExcerpts;
export const saveQuickNotes = saveReadingExcerpts;
export const addQuickNote = addReadingExcerpt;
export const updateQuickNote = updateReadingExcerpt;
export const deleteQuickNote = deleteReadingExcerpt;
export const clearAllQuickNotes = clearAllReadingExcerpts;
export const loadDiaryEntries = loadReadingEntries;
export const saveDiaryEntries = saveReadingEntries;
export const saveDiaryEntry = saveReadingEntry;
export const loadDiaryByDate = loadReadingByDate;
export const deleteDiaryEntry = deleteReadingEntry;
export const clearAllDiaryEntries = clearAllReadingEntries;

