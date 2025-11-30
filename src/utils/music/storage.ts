/**
 * 乐记数据存储管理
 */

import { QuickNote, DiaryEntry } from './types';
import {
  saveImageToIndexedDB,
  getImageFromIndexedDB,
  deleteImageFromIndexedDB
} from '@/utils/common/imageStorage';

const MUSIC_LYRICS_KEY = 'music_quick_notes';
const MUSIC_ENTRIES_KEY = 'music_entries';

/**
 * 加载歌词列表
 */
export const loadMusicLyrics = (): QuickNote[] => {
  try {
    const data = localStorage.getItem(MUSIC_LYRICS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载歌词失败:', error);
    return [];
  }
};

/**
 * 保存歌词列表
 */
export const saveMusicLyrics = (lyrics: QuickNote[]): void => {
  try {
    localStorage.setItem(MUSIC_LYRICS_KEY, JSON.stringify(lyrics));
  } catch (error) {
    console.error('保存歌词失败:', error);
  }
};

/**
 * 添加歌词
 */
export const addMusicLyric = (content: string): QuickNote => {
  const lyric: QuickNote = {
    id: Date.now().toString(),
    content,
    timestamp: Date.now(),
  };
  
  const lyrics = loadMusicLyrics();
  lyrics.unshift(lyric);
  saveMusicLyrics(lyrics);
  
  return lyric;
};

/**
 * 更新歌词
 */
export const updateMusicLyric = (id: string, content: string): QuickNote | null => {
  const lyrics = loadMusicLyrics();
  const index = lyrics.findIndex(lyric => lyric.id === id);
  
  if (index === -1) return null;
  
  lyrics[index] = {
    ...lyrics[index],
    content,
    timestamp: Date.now(), // 更新时间戳
  };
  
  saveMusicLyrics(lyrics);
  return lyrics[index];
};

/**
 * 删除歌词
 */
export const deleteMusicLyric = (id: string): void => {
  const lyrics = loadMusicLyrics();
  const filtered = lyrics.filter(lyric => lyric.id !== id);
  saveMusicLyrics(filtered);
};

/**
 * 清空所有歌词
 */
export const clearAllMusicLyrics = (): number => {
  const lyrics = loadMusicLyrics();
  const count = lyrics.length;
  saveMusicLyrics([]);
  return count;
};

/**
 * 加载乐记列表（同步加载，图片异步加载）
 */
export const loadMusicEntries = (): DiaryEntry[] => {
  try {
    const data = localStorage.getItem(MUSIC_ENTRIES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('加载乐记失败:', error);
    return [];
  }
};

/**
 * 加载乐记条目并获取图片（异步）
 * 如果 entry 有 imageId，从 IndexedDB 加载图片
 * 如果 entry 有 image（向后兼容），直接返回
 */
export const loadMusicEntryWithImage = async (entry: DiaryEntry): Promise<DiaryEntry> => {
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
 * 保存乐记列表
 */
export const saveMusicEntries = (entries: DiaryEntry[]): void => {
  try {
    localStorage.setItem(MUSIC_ENTRIES_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('保存乐记失败:', error);
  }
};

/**
 * 保存乐记条目（支持同一天多篇乐记）
 * 如果 entry 有图片，将图片保存到 IndexedDB，entry 中只存 imageId
 */
export const saveMusicEntry = async (entry: DiaryEntry): Promise<DiaryEntry> => {
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
  
  const entries = loadMusicEntries();
  const existingIndex = entries.findIndex(e => e.id === entryToSave.id);
  
  if (existingIndex >= 0) {
    // 更新现有乐记
    // 如果之前有图片但现在没有了，删除 IndexedDB 中的图片
    const oldEntry = entries[existingIndex];
    if (oldEntry.imageId && !entryToSave.imageId) {
      deleteImageFromIndexedDB(oldEntry.imageId).catch(err => {
        console.error('删除旧图片失败:', err);
      });
    }
    entries[existingIndex] = entryToSave;
  } else {
    // 创建新乐记
    entries.push(entryToSave);
  }
  
  // 按日期降序排序
  entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 同一天的按创建时间降序
    return b.createdAt - a.createdAt;
  });
  
  saveMusicEntries(entries);
  return entryToSave;
};

/**
 * 根据日期加载乐记（返回该日期的所有乐记）
 */
export const loadMusicByDate = (date: string): DiaryEntry[] => {
  const entries = loadMusicEntries();
  return entries.filter(e => e.date === date);
};

/**
 * 删除乐记（按 ID）
 * 同时删除 IndexedDB 中对应的图片
 */
export const deleteMusicEntry = async (id: string): Promise<void> => {
  const entries = loadMusicEntries();
  const entryToDelete = entries.find(e => e.id === id);
  
  // 删除 IndexedDB 中的图片
  if (entryToDelete?.imageId) {
    await deleteImageFromIndexedDB(entryToDelete.imageId).catch(err => {
      console.error('删除图片失败:', err);
    });
  }
  
  const filtered = entries.filter(e => e.id !== id);
  saveMusicEntries(filtered);
};

/**
 * 清空所有乐记
 * 同时删除 IndexedDB 中所有对应的图片
 */
export const clearAllMusicEntries = async (): Promise<number> => {
  const entries = loadMusicEntries();
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
  
  saveMusicEntries([]);
  return count;
};

// 向后兼容的别名
export const loadQuickNotes = loadMusicLyrics;
export const saveQuickNotes = saveMusicLyrics;
export const addQuickNote = addMusicLyric;
export const updateQuickNote = updateMusicLyric;
export const deleteQuickNote = deleteMusicLyric;
export const clearAllQuickNotes = clearAllMusicLyrics;
export const loadDiaryEntries = loadMusicEntries;
export const saveDiaryEntries = saveMusicEntries;
export const saveDiaryEntry = saveMusicEntry;
export const loadDiaryByDate = loadMusicByDate;
export const deleteDiaryEntry = deleteMusicEntry;
export const clearAllDiaryEntries = clearAllMusicEntries;

