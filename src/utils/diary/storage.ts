/**
 * 日记数据存储管理
 */

import { QuickNote, DiaryEntry } from './types';

const QUICK_NOTES_KEY = 'diary_quick_notes';
const DIARY_ENTRIES_KEY = 'diary_entries';

/**
 * 加载速记列表
 */
export const loadQuickNotes = (): QuickNote[] => {
  try {
    const data = localStorage.getItem(QUICK_NOTES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载速记失败:', error);
    return [];
  }
};

/**
 * 保存速记列表
 */
export const saveQuickNotes = (notes: QuickNote[]): void => {
  try {
    localStorage.setItem(QUICK_NOTES_KEY, JSON.stringify(notes));
  } catch (error) {
    console.error('保存速记失败:', error);
  }
};

/**
 * 添加速记
 */
export const addQuickNote = (content: string): QuickNote => {
  const note: QuickNote = {
    id: Date.now().toString(),
    content,
    timestamp: Date.now(),
  };
  
  const notes = loadQuickNotes();
  notes.unshift(note);
  saveQuickNotes(notes);
  
  return note;
};

/**
 * 更新速记
 */
export const updateQuickNote = (id: string, content: string): QuickNote | null => {
  const notes = loadQuickNotes();
  const index = notes.findIndex(note => note.id === id);
  
  if (index === -1) return null;
  
  notes[index] = {
    ...notes[index],
    content,
    // 保持创建时间不变，不更新timestamp
  };
  
  saveQuickNotes(notes);
  return notes[index];
};

/**
 * 删除速记
 */
export const deleteQuickNote = (id: string): void => {
  const notes = loadQuickNotes();
  const filtered = notes.filter(note => note.id !== id);
  saveQuickNotes(filtered);
};

/**
 * 清空所有速记
 */
export const clearAllQuickNotes = (): number => {
  const notes = loadQuickNotes();
  const count = notes.length;
  saveQuickNotes([]);
  return count;
};

/**
 * 加载日记列表
 */
export const loadDiaryEntries = (): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(DIARY_ENTRIES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载日记失败:', error);
    return [];
  }
};

/**
 * 保存日记列表
 */
export const saveDiaryEntries = (entries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(DIARY_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存日记失败:', error);
  }
};

/**
 * 保存日记条目（支持同一天多篇日记）
 */
export const saveDiaryEntry = (entry: DiaryEntry): DiaryEntry => {
  const entries = loadDiaryEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    // 更新现有日记
    entries[existingIndex] = entry;
  } else {
    // 创建新日记
    entries.push(entry);
  }
  
  // 按日期降序排序
  entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 同一天的按创建时间降序
    return b.createdAt - a.createdAt;
  });
  
  saveDiaryEntries(entries);
  return entry;
};

/**
 * 根据日期加载日记（返回该日期的所有日记）
 */
export const loadDiaryByDate = (date: string): DiaryEntry[] => {
  const entries = loadDiaryEntries();
  return entries.filter(e => e.date === date);
};

/**
 * 删除日记（按 ID）
 */
export const deleteDiaryEntry = (id: string): void => {
  const entries = loadDiaryEntries();
  const filtered = entries.filter(e => e.id !== id);
  saveDiaryEntries(filtered);
};

/**
 * 清空所有日记
 */
export const clearAllDiaryEntries = (): number => {
  const entries = loadDiaryEntries();
  const count = entries.length;
  saveDiaryEntries([]);
  return count;
};
