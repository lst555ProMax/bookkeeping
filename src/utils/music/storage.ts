/**
 * 乐记数据存储管理
 */

import { QuickNote, DiaryEntry } from './types';

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
 * 加载乐记列表
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
 */
export const saveMusicEntry = (entry: DiaryEntry): DiaryEntry => {
  const entries = loadMusicEntries();
  const existingIndex = entries.findIndex(e => e.id === entry.id);
  
  if (existingIndex >= 0) {
    // 更新现有乐记
    entries[existingIndex] = entry;
  } else {
    // 创建新乐记
    entries.push(entry);
  }
  
  // 按日期降序排序
  entries.sort((a, b) => {
    const dateCompare = b.date.localeCompare(a.date);
    if (dateCompare !== 0) return dateCompare;
    // 同一天的按创建时间降序
    return b.createdAt - a.createdAt;
  });
  
  saveMusicEntries(entries);
  return entry;
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
 */
export const deleteMusicEntry = (id: string): void => {
  const entries = loadMusicEntries();
  const filtered = entries.filter(e => e.id !== id);
  saveMusicEntries(filtered);
};

/**
 * 清空所有乐记
 */
export const clearAllMusicEntries = (): number => {
  const entries = loadMusicEntries();
  const count = entries.length;
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

