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
 * 导出歌词数据
 */
export const exportMusicLyricsOnly = (musicLyrics?: QuickNote[]): void => {
  try {
    const lyricsToExport = musicLyrics || loadMusicLyrics();
    
    const exportData: MusicLyricsExportData = {
      version: '1.0.0',
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
      version: '1.0.0',
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
    version: '1.0.0',
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
          const importData: MusicLyricsExportData = JSON.parse(content);
          
          // 兼容旧格式
          const legacyData = importData as MusicLyricsExportData & LegacyQuickNotesExportData;
          const lyrics = legacyData.musicLyrics || legacyData.quickNotes || [];
          if (!Array.isArray(lyrics)) {
            throw new Error('无效的数据格式：缺少musicLyrics数组');
          }
          
          const existingLyrics = loadMusicLyrics();
          const existingIds = new Set(existingLyrics.map(l => l.id));
          
          let imported = 0;
          let skipped = 0;
          const newLyrics: QuickNote[] = [];
          
          lyrics.forEach(lyric => {
            if (!lyric.id || !lyric.content) {
              skipped++;
              return;
            }
            
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
        } catch (parseError) {
          console.error('解析文件失败:', parseError);
          reject(new Error('文件格式错误，请确保是有效的JSON文件'));
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
          const importData: MusicEntriesExportData = JSON.parse(content);
          
          // 兼容旧格式
          const legacyData = importData as MusicEntriesExportData & LegacyDiaryEntriesExportData;
          const entries = legacyData.musicEntries || legacyData.diaryEntries || [];
          if (!Array.isArray(entries)) {
            throw new Error('无效的数据格式：缺少musicEntries数组');
          }
          
          const existingEntries = loadMusicEntries();
          // 使用id作为唯一标识，而不是date，因为同一天可能有多篇乐记
          const existingIds = new Set(existingEntries.map(e => e.id));
          
          let imported = 0;
          let skipped = 0;
          
          entries.forEach(entry => {
            if (!entry.id || !entry.date) {
              skipped++;
              return;
            }
            
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
        } catch (parseError) {
          console.error('解析文件失败:', parseError);
          reject(new Error('文件格式错误，请确保是有效的JSON文件'));
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

