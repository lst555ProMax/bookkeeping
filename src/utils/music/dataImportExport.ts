/**
 * 乐记数据导入导出
 */

import { QuickNote, DiaryEntry } from './types';
import { loadMusicLyrics, saveMusicLyrics, loadMusicEntries, saveMusicEntries } from './storage';

interface MusicExportData {
  musicLyrics: QuickNote[];
  musicEntries: DiaryEntry[];
  exportTime: number;
  version: string;
}

interface MusicLyricsExportData {
  version: string;
  exportDate: string;
  musicLyrics: QuickNote[];
  totalMusicLyrics: number;
}

interface MusicEntriesExportData {
  version: string;
  exportDate: string;
  musicEntries: DiaryEntry[];
  totalMusicEntries: number;
}

// 兼容旧格式的类型
interface LegacyQuickNotesExportData {
  quickNotes?: QuickNote[];
}

interface LegacyDiaryEntriesExportData {
  diaryEntries?: DiaryEntry[];
}

interface LegacyMusicExportData {
  quickNotes?: QuickNote[];
  diaryEntries?: DiaryEntry[];
}

/**
 * 验证日期格式是否为 YYYY-MM-DD，并检查日期值是否有效
 */
const isValidDate = (dateStr: string): { valid: boolean; error?: string } => {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return { valid: false, error: '格式不正确，必须是YYYY-MM-DD格式' };
  }
  
  // 检查月份是否在1-12之间
  if (month < 1 || month > 12) {
    return { valid: false, error: `月份值${month}无效，必须在1-12之间` };
  }
  
  // 检查日期是否在1-31之间（粗略检查）
  if (day < 1 || day > 31) {
    return { valid: false, error: `日期值${day}无效，必须在1-31之间` };
  }
  
  // 使用Date对象进一步验证日期是否有效（处理2月29日等情况）
  const date = new Date(dateStr);
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return { valid: false, error: '日期值无效' };
  }
  
  // 验证解析后的日期是否与输入一致（防止"2025-13-45"被解析为其他日期）
  const parsedYear = date.getFullYear();
  const parsedMonth = date.getMonth() + 1;
  const parsedDay = date.getDate();
  
  if (parsedYear !== year || parsedMonth !== month || parsedDay !== day) {
    return { valid: false, error: '日期值无效' };
  }
  
  return { valid: true };
};

/**
 * 验证歌词记录格式，返回详细的错误信息
 */
const validateMusicLyricWithError = (lyric: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof lyric !== 'object' || lyric === null) {
    return { valid: false, error: `无效的歌词记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(lyric)) {
    return { valid: false, error: `无效的歌词记录[${index}]：记录必须是对象` };
  }
  
  const l = lyric as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in l) || l.id === undefined || l.id === null) {
    return { valid: false, error: `无效的歌词记录[${index}]：缺少id字段` };
  }
  if (typeof l.id !== 'string') {
    return { valid: false, error: `无效的歌词记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('content' in l) || l.content === undefined || l.content === null) {
    return { valid: false, error: `无效的歌词记录[${index}]：缺少content字段` };
  }
  if (typeof l.content !== 'string') {
    return { valid: false, error: `无效的歌词记录[${index}]：content字段类型不正确，必须是字符串` };
  }
  
  if (!('timestamp' in l) || l.timestamp === undefined || l.timestamp === null) {
    return { valid: false, error: `无效的歌词记录[${index}]：缺少timestamp字段` };
  }
  if (typeof l.timestamp !== 'number') {
    return { valid: false, error: `无效的歌词记录[${index}]：timestamp字段类型不正确，必须是数字` };
  }
  
  // 验证timestamp是有效数字
  if (!Number.isFinite(l.timestamp)) {
    return { valid: false, error: `无效的歌词记录[${index}]：timestamp必须是有效数字` };
  }
  
  if (!Number.isInteger(l.timestamp) || l.timestamp < 0) {
    return { valid: false, error: `无效的歌词记录[${index}]：timestamp必须是非负整数` };
  }
  
  return { valid: true };
};

/**
 * 验证乐记条目格式，返回详细的错误信息
 */
const validateMusicEntryWithError = (entry: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof entry !== 'object' || entry === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(entry)) {
    return { valid: false, error: `无效的乐记条目[${index}]：记录必须是对象` };
  }
  
  const e = entry as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in e) || e.id === undefined || e.id === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少id字段` };
  }
  if (typeof e.id !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in e) || e.date === undefined || e.date === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少date字段` };
  }
  if (typeof e.date !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('content' in e) || e.content === undefined || e.content === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少content字段` };
  }
  if (typeof e.content !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：content字段类型不正确，必须是字符串` };
  }
  
  if (!('theme' in e) || e.theme === undefined || e.theme === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少theme字段` };
  }
  if (typeof e.theme !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：theme字段类型不正确，必须是字符串` };
  }
  
  if (!('weather' in e) || e.weather === undefined || e.weather === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少weather字段` };
  }
  if (typeof e.weather !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：weather字段类型不正确，必须是字符串` };
  }
  
  if (!('mood' in e) || e.mood === undefined || e.mood === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少mood字段` };
  }
  if (typeof e.mood !== 'string') {
    return { valid: false, error: `无效的乐记条目[${index}]：mood字段类型不正确，必须是字符串` };
  }
  
  if (!('createdAt' in e) || e.createdAt === undefined || e.createdAt === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少createdAt字段` };
  }
  if (typeof e.createdAt !== 'number') {
    return { valid: false, error: `无效的乐记条目[${index}]：createdAt字段类型不正确，必须是数字` };
  }
  
  if (!('updatedAt' in e) || e.updatedAt === undefined || e.updatedAt === null) {
    return { valid: false, error: `无效的乐记条目[${index}]：缺少updatedAt字段` };
  }
  if (typeof e.updatedAt !== 'number') {
    return { valid: false, error: `无效的乐记条目[${index}]：updatedAt字段类型不正确，必须是数字` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(e.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的乐记条目[${index}]：date${dateValidation.error}` };
  }
  
  // 验证createdAt和updatedAt是有效数字
  if (!Number.isFinite(e.createdAt)) {
    return { valid: false, error: `无效的乐记条目[${index}]：createdAt必须是有效数字` };
  }
  
  if (!Number.isInteger(e.createdAt) || e.createdAt < 0) {
    return { valid: false, error: `无效的乐记条目[${index}]：createdAt必须是非负整数` };
  }
  
  if (!Number.isFinite(e.updatedAt)) {
    return { valid: false, error: `无效的乐记条目[${index}]：updatedAt必须是有效数字` };
  }
  
  if (!Number.isInteger(e.updatedAt) || e.updatedAt < 0) {
    return { valid: false, error: `无效的乐记条目[${index}]：updatedAt必须是非负整数` };
  }
  
  // 验证updatedAt >= createdAt
  if (e.updatedAt < e.createdAt) {
    return { valid: false, error: `无效的乐记条目[${index}]：updatedAt(${e.updatedAt})不能小于createdAt(${e.createdAt})` };
  }
  
  // 验证font（如果存在）
  if (e.font !== undefined && e.font !== null) {
    if (typeof e.font !== 'string') {
      return { valid: false, error: `无效的乐记条目[${index}]：font必须是字符串` };
    }
  }
  
  // 验证image（如果存在）
  if (e.image !== undefined && e.image !== null) {
    if (typeof e.image !== 'string') {
      return { valid: false, error: `无效的乐记条目[${index}]：image必须是字符串` };
    }
  }
  
  return { valid: true };
};

/**
 * 验证歌词导出数据格式，返回详细的错误信息
 */
const validateMusicLyricsExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(data)) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象，不能是数组' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalMusicLyrics !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalMusicLyrics字段或类型不正确' };
  }
  
  // 检查musicLyrics字段是否存在
  if (!('musicLyrics' in d) || d.musicLyrics === undefined || d.musicLyrics === null) {
    return { valid: false, error: '无效的数据格式：缺少musicLyrics字段' };
  }
  
  // 检查musicLyrics数组
  if (!Array.isArray(d.musicLyrics)) {
    return { valid: false, error: '无效的数据格式：musicLyrics必须是数组' };
  }
  
  // 验证totalMusicLyrics与实际数组长度一致
  if (d.totalMusicLyrics !== d.musicLyrics.length) {
    return { valid: false, error: `无效的数据格式：totalMusicLyrics(${d.totalMusicLyrics})与musicLyrics数组长度(${d.musicLyrics.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.musicLyrics.length; i++) {
    const validation = validateMusicLyricWithError(d.musicLyrics[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.musicLyrics.length; i++) {
    const lyric = d.musicLyrics[i];
    if (typeof lyric !== 'object' || lyric === null || Array.isArray(lyric)) {
      continue; // 已经在validateMusicLyricWithError中检查过了
    }
    const l = lyric as Record<string, unknown>;
    const id = l.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  return { valid: true };
};

/**
 * 验证乐记条目导出数据格式，返回详细的错误信息
 */
const validateMusicEntriesExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(data)) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象，不能是数组' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalMusicEntries !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalMusicEntries字段或类型不正确' };
  }
  
  // 检查musicEntries字段是否存在
  if (!('musicEntries' in d) || d.musicEntries === undefined || d.musicEntries === null) {
    return { valid: false, error: '无效的数据格式：缺少musicEntries字段' };
  }
  
  // 检查musicEntries数组
  if (!Array.isArray(d.musicEntries)) {
    return { valid: false, error: '无效的数据格式：musicEntries必须是数组' };
  }
  
  // 验证totalMusicEntries与实际数组长度一致
  if (d.totalMusicEntries !== d.musicEntries.length) {
    return { valid: false, error: `无效的数据格式：totalMusicEntries(${d.totalMusicEntries})与musicEntries数组长度(${d.musicEntries.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.musicEntries.length; i++) {
    const validation = validateMusicEntryWithError(d.musicEntries[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.musicEntries.length; i++) {
    const entry = d.musicEntries[i];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      continue; // 已经在validateMusicEntryWithError中检查过了
    }
    const e = entry as Record<string, unknown>;
    const id = e.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  return { valid: true };
};

/**
 * 导出歌词数据
 */
export const exportMusicLyricsOnly = (musicLyrics?: QuickNote[]): void => {
  try {
    const lyricsToExport = musicLyrics || loadMusicLyrics();
    
    const exportData: MusicLyricsExportData = {
      version: '2025.11.30',
      exportDate: new Date().toISOString(),
      musicLyrics: lyricsToExport,
      totalMusicLyrics: lyricsToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `music-lyrics-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${lyricsToExport.length} 条歌词`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出歌词数据失败，请重试');
  }
};

/**
 * 导出乐记数据（包含图片数据）
 */
export const exportMusicEntriesOnly = (musicEntries?: DiaryEntry[]): void => {
  try {
    const entriesToExport = musicEntries || loadMusicEntries();
    
    // 统计包含图片的乐记数量
    const entriesWithImages = entriesToExport.filter(e => e.image).length;
    
    const exportData: MusicEntriesExportData = {
      version: '2025.11.30',
      exportDate: new Date().toISOString(),
      musicEntries: entriesToExport, // 包含完整的entry数据，包括image字段（base64格式）
      totalMusicEntries: entriesToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `music-entries-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${entriesToExport.length} 条乐记（其中 ${entriesWithImages} 条包含图片）`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出乐记数据失败，请重试');
  }
};

/**
 * 导出所有乐记数据（歌词+乐记）
 */
export const exportMusicData = (): void => {
  const data: MusicExportData = {
    musicLyrics: loadMusicLyrics(),
    musicEntries: loadMusicEntries(),
    exportTime: Date.now(),
    version: '2025.11.30',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  a.download = `music-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 导入歌词数据
 */
export const importMusicLyricsOnly = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 兼容旧格式
          const legacyData = parsedData as Record<string, unknown> & LegacyQuickNotesExportData;
          const lyrics = (legacyData.musicLyrics || legacyData.quickNotes || []) as QuickNote[];
          
          // 如果数据格式是新格式，进行严格验证
          if (legacyData.musicLyrics && Array.isArray(legacyData.musicLyrics)) {
            const validation = validateMusicLyricsExportDataWithError(parsedData);
            if (!validation.valid) {
              throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
            }
          } else if (!Array.isArray(lyrics)) {
            throw new Error('无效的数据格式：缺少musicLyrics数组');
          }
          
          const existingLyrics = loadMusicLyrics();
          const existingIds = new Set(existingLyrics.map(l => l.id));
          
          let imported = 0;
          let skipped = 0;
          const newLyrics: QuickNote[] = [];
          
          lyrics.forEach(lyric => {
            // 检查是否已存在
            if (existingIds.has(lyric.id)) {
              skipped++;
              return;
            }
            
            newLyrics.push(lyric);
            imported++;
          });
          
          if (newLyrics.length > 0) {
            saveMusicLyrics([...existingLyrics, ...newLyrics]);
          }
          
          resolve({
            imported,
            skipped,
            total: lyrics.length
          });
          
          console.log(`导入完成: ${imported} 条新歌词 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('导入歌词数据失败:', error);
          reject(error instanceof Error ? error : new Error('导入歌词数据失败，请重试'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入失败:', error);
      reject(new Error('导入歌词数据失败，请重试'));
    }
  });
};

/**
 * 导入乐记数据
 */
export const importMusicEntriesOnly = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 兼容旧格式
          const legacyData = parsedData as Record<string, unknown> & LegacyDiaryEntriesExportData;
          const entries = (legacyData.musicEntries || legacyData.diaryEntries || []) as DiaryEntry[];
          
          // 如果数据格式是新格式，进行严格验证
          if (legacyData.musicEntries && Array.isArray(legacyData.musicEntries)) {
            const validation = validateMusicEntriesExportDataWithError(parsedData);
            if (!validation.valid) {
              throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
            }
          } else if (!Array.isArray(entries)) {
            throw new Error('无效的数据格式：缺少musicEntries数组');
          }
          
          const existingEntries = loadMusicEntries();
          // 使用id作为唯一标识，而不是date，因为同一天可能有多篇乐记
          const existingIds = new Set(existingEntries.map(e => e.id));
          
          let imported = 0;
          let skipped = 0;
          
          entries.forEach(entry => {
            // 检查是否已存在相同id的乐记
            if (existingIds.has(entry.id)) {
              skipped++;
              return;
            }
            
            // 验证图片数据格式（如果存在）
            if (entry.image && typeof entry.image === 'string') {
              // 检查是否是有效的base64图片格式
              if (!entry.image.startsWith('data:image/')) {
                // 如果不是data URI格式，尝试添加默认前缀
                // 或者保持原样（可能是base64字符串）
                console.warn(`乐记 ${entry.id} 的图片格式可能不正确`);
              }
            }
            
            // 保存完整的entry数据（包括image字段）
            existingEntries.push(entry);
            existingIds.add(entry.id);
            imported++;
          });
          
          if (imported > 0) {
            existingEntries.sort((a, b) => b.date.localeCompare(a.date));
            saveMusicEntries(existingEntries);
          }
          
          resolve({
            imported,
            skipped,
            total: entries.length
          });
          
          console.log(`导入完成: ${imported} 条新乐记 (${skipped} 条跳过)`);
        } catch (error) {
          console.error('导入乐记数据失败:', error);
          reject(error instanceof Error ? error : new Error('导入乐记数据失败，请重试'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('导入失败:', error);
      reject(new Error('导入乐记数据失败，请重试'));
    }
  });
};

/**
 * 导入所有乐记数据（歌词+乐记）
 */
export const importMusicData = async (file: File): Promise<{ imported: number; skipped: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: MusicExportData = JSON.parse(content);

        let imported = 0;
        let skipped = 0;

        // 兼容旧格式
        const legacyData = data as MusicExportData & LegacyMusicExportData;

        // 导入歌词（兼容旧格式）
        const lyrics = legacyData.musicLyrics || legacyData.quickNotes || [];
        if (Array.isArray(lyrics)) {
          const existingLyrics = loadMusicLyrics();
          const existingIds = new Set(existingLyrics.map(l => l.id));
          const newLyrics = lyrics.filter(l => !existingIds.has(l.id));
          
          if (newLyrics.length > 0) {
            saveMusicLyrics([...existingLyrics, ...newLyrics]);
            imported += newLyrics.length;
          }
          skipped += lyrics.length - newLyrics.length;
        }

        // 导入乐记（包含图片数据，兼容旧格式）
        const entries = legacyData.musicEntries || legacyData.diaryEntries || [];
        if (Array.isArray(entries)) {
          const existingEntries = loadMusicEntries();
          // 使用id作为唯一标识，而不是date
          const existingIds = new Set(existingEntries.map(e => e.id));
          const newEntries = entries.filter(e => {
            if (!e.id || !e.date) return false;
            return !existingIds.has(e.id);
          });
          
          // 验证并处理图片数据
          newEntries.forEach(entry => {
            if (entry.image && typeof entry.image === 'string') {
              if (!entry.image.startsWith('data:image/')) {
                console.warn(`乐记 ${entry.id} 的图片格式可能不正确`);
              }
            }
          });
          
          if (newEntries.length > 0) {
            const merged = [...existingEntries, ...newEntries];
            merged.sort((a, b) => b.date.localeCompare(a.date));
            saveMusicEntries(merged);
            imported += newEntries.length;
          }
          skipped += entries.length - newEntries.length;
        }

        resolve({ imported, skipped });
      } catch {
        reject(new Error('文件格式错误或数据无效'));
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsText(file);
  });
};

/**
 * 验证导入文件
 */
export const validateMusicImportFile = (file: File): string | null => {
  if (!file.name.endsWith('.json')) {
    return '只支持JSON格式文件';
  }

  if (file.size > 10 * 1024 * 1024) {
    return '文件大小不能超过10MB';
  }

  return null;
};

// 向后兼容的别名
export const exportQuickNotesOnly = exportMusicLyricsOnly;
export const importQuickNotesOnly = importMusicLyricsOnly;
export const exportDiaryEntriesOnly = exportMusicEntriesOnly;
export const importDiaryEntriesOnly = importMusicEntriesOnly;

