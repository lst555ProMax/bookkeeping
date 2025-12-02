/**
 * 书记数据存储管理
 */

import { QuickNote, DiaryEntry } from './types';
import {
  saveImageToIndexedDB,
  getImageFromIndexedDB,
  deleteImageFromIndexedDB
} from '@/utils/common/imageStorage';

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
    // 保持创建时间不变，不更新timestamp
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
 * 加载书记列表（同步加载，图片异步加载）
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
 * 加载书记条目并获取图片（异步）
 * 如果 entry 有 imageId，从 IndexedDB 加载图片
 * 如果 entry 有 image（向后兼容），直接返回
 */
export const loadReadingEntryWithImage = async (entry: DiaryEntry): Promise<DiaryEntry> => {
  // 如果已经有 imageId，从 IndexedDB 加载图片
  if (entry.imageId) {
    const image = await getImageFromIndexedDB(entry.imageId);
    if (image) {
      return {
        ...entry,
        image: image
      };
    }
  }
  // 如果没有 imageId 但有 image（向后兼容），直接返回
  return entry;
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
 * 如果 entry 有图片，将图片保存到 IndexedDB，entry 中只存 imageId
 */
export const saveReadingEntry = async (entry: DiaryEntry): Promise<DiaryEntry> => {
  // 处理图片：如果有图片，保存到 IndexedDB
  let entryToSave: DiaryEntry = { ...entry };
  
  if (entry.image && entry.image.trim() !== '') {
    // 使用 entry.id 作为图片ID
    const imageId = entry.id;
    
    try {
      // 保存图片到 IndexedDB
      await saveImageToIndexedDB(imageId, entry.image);
      
      // entry 中只保存 imageId，删除 image 字段以节省 localStorage 空间
      entryToSave = {
        ...entry,
        imageId: imageId,
        image: undefined // 删除 image 字段
      };
    } catch (error) {
      console.error('保存图片到 IndexedDB 失败，保留在 entry 中:', error);
      // 如果保存失败，保留原来的 image（向后兼容）
    }
  } else if (entry.imageId) {
    // 如果没有图片但有 imageId，删除 imageId（图片可能已被删除）
    entryToSave = {
      ...entry,
      imageId: undefined
    };
  }
  
  const entries = loadReadingEntries();
  const existingIndex = entries.findIndex(e => e.id === entryToSave.id);
  
  if (existingIndex >= 0) {
    // 更新现有书记
    // 如果之前有图片但现在没有了，删除 IndexedDB 中的图片
    const oldEntry = entries[existingIndex];
    if (oldEntry.imageId && !entryToSave.imageId) {
      deleteImageFromIndexedDB(oldEntry.imageId).catch(err => {
        console.error('删除旧图片失败:', err);
      });
    }
    entries[existingIndex] = entryToSave;
  } else {
    // 创建新书记
    entries.push(entryToSave);
  }
  
  // 按日期降序排序
  entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 同一天的按创建时间降序
    return b.createdAt - a.createdAt;
  });
  
  saveReadingEntries(entries);
  return entryToSave;
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
 * 同时删除 IndexedDB 中对应的图片
 */
export const deleteReadingEntry = async (id: string): Promise<void> => {
  const entries = loadReadingEntries();
  const entryToDelete = entries.find(e => e.id === id);
  
  // 删除 IndexedDB 中的图片
  if (entryToDelete?.imageId) {
    await deleteImageFromIndexedDB(entryToDelete.imageId).catch(err => {
      console.error('删除图片失败:', err);
    });
  }
  
  const filtered = entries.filter(e => e.id !== id);
  saveReadingEntries(filtered);
};

/**
 * 清空所有书记
 * 同时删除 IndexedDB 中所有对应的图片
 */
export const clearAllReadingEntries = async (): Promise<number> => {
  const entries = loadReadingEntries();
  const count = entries.length;
  
  // 删除所有图片
  const imageIds = entries
    .filter(e => e.imageId)
    .map(e => e.imageId!);
  
  if (imageIds.length > 0) {
    await Promise.all(
      imageIds.map(id => deleteImageFromIndexedDB(id).catch(err => {
        console.error(`删除图片 ${id} 失败:`, err);
      }))
    );
  }
  
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

