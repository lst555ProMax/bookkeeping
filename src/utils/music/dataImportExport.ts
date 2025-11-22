/**
 * 音乐日记数据导入导出
 */

import { QuickNote, DiaryEntry } from './types';
import { loadQuickNotes, saveQuickNotes, loadDiaryEntries, saveDiaryEntries } from './storage';

interface MusicExportData {
  quickNotes: QuickNote[];
  diaryEntries: DiaryEntry[];
  exportTime: number;
  version: string;
}

interface QuickNotesExportData {
  version: string;
  exportDate: string;
  quickNotes: QuickNote[];
  totalQuickNotes: number;
}

interface DiaryEntriesExportData {
  version: string;
  exportDate: string;
  diaryEntries: DiaryEntry[];
  totalDiaryEntries: number;
}

/**
 * 导出速记数据
 */
export const exportQuickNotesOnly = (quickNotes?: QuickNote[]): void => {
  try {
    const notesToExport = quickNotes || loadQuickNotes();
    
    const exportData: QuickNotesExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      quickNotes: notesToExport,
      totalQuickNotes: notesToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `music-quicknotes-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${notesToExport.length} 条速记`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出速记数据失败，请重试');
  }
};

/**
 * 导出日记数据
 */
export const exportDiaryEntriesOnly = (diaryEntries?: DiaryEntry[]): void => {
  try {
    const entriesToExport = diaryEntries || loadDiaryEntries();
    
    const exportData: DiaryEntriesExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      diaryEntries: entriesToExport,
      totalDiaryEntries: entriesToExport.length
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
    
    console.log(`成功导出 ${entriesToExport.length} 条日记`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出日记数据失败，请重试');
  }
};

/**
 * 导出所有音乐日记数据（速记+日记）
 */
export const exportMusicData = (): void => {
  const data: MusicExportData = {
    quickNotes: loadQuickNotes(),
    diaryEntries: loadDiaryEntries(),
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
 * 导入速记数据
 */
export const importQuickNotesOnly = (file: File): Promise<{
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
          const importData: QuickNotesExportData = JSON.parse(content);
          
          if (!importData.quickNotes || !Array.isArray(importData.quickNotes)) {
            throw new Error('无效的数据格式：缺少quickNotes数组');
          }
          
          const existingNotes = loadQuickNotes();
          const existingIds = new Set(existingNotes.map(n => n.id));
          
          let imported = 0;
          let skipped = 0;
          const newNotes: QuickNote[] = [];
          
          importData.quickNotes.forEach(note => {
            if (!note.id || !note.content) {
              skipped++;
              return;
            }
            
            if (existingIds.has(note.id)) {
              skipped++;
              return;
            }
            
            newNotes.push(note);
            imported++;
          });
          
          if (newNotes.length > 0) {
            saveQuickNotes([...existingNotes, ...newNotes]);
          }
          
          resolve({
            imported,
            skipped,
            total: importData.quickNotes.length
          });
          
          console.log(`导入完成: ${imported} 条新速记 (${skipped} 条跳过)`);
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
      reject(new Error('导入速记数据失败，请重试'));
    }
  });
};

/**
 * 导入日记数据
 */
export const importDiaryEntriesOnly = (file: File): Promise<{
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
          const importData: DiaryEntriesExportData = JSON.parse(content);
          
          if (!importData.diaryEntries || !Array.isArray(importData.diaryEntries)) {
            throw new Error('无效的数据格式：缺少diaryEntries数组');
          }
          
          const existingEntries = loadDiaryEntries();
          const existingDates = new Set(existingEntries.map(e => e.date));
          
          let imported = 0;
          let skipped = 0;
          
          importData.diaryEntries.forEach(entry => {
            if (!entry.id || !entry.date) {
              skipped++;
              return;
            }
            
            if (existingDates.has(entry.date)) {
              skipped++;
              return;
            }
            
            existingEntries.push(entry);
            existingDates.add(entry.date);
            imported++;
          });
          
          if (imported > 0) {
            existingEntries.sort((a, b) => b.date.localeCompare(a.date));
            saveDiaryEntries(existingEntries);
          }
          
          resolve({
            imported,
            skipped,
            total: importData.diaryEntries.length
          });
          
          console.log(`导入完成: ${imported} 条新日记 (${skipped} 条跳过)`);
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
      reject(new Error('导入日记数据失败，请重试'));
    }
  });
};

/**
 * 导入所有音乐日记数据（速记+日记）
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

        // 导入速记
        if (data.quickNotes && Array.isArray(data.quickNotes)) {
          const existingNotes = loadQuickNotes();
          const existingIds = new Set(existingNotes.map(n => n.id));
          const newNotes = data.quickNotes.filter(n => !existingIds.has(n.id));
          
          if (newNotes.length > 0) {
            saveQuickNotes([...existingNotes, ...newNotes]);
            imported += newNotes.length;
          }
          skipped += data.quickNotes.length - newNotes.length;
        }

        // 导入日记
        if (data.diaryEntries && Array.isArray(data.diaryEntries)) {
          const existingEntries = loadDiaryEntries();
          const existingDates = new Set(existingEntries.map(e => e.date));
          const newEntries = data.diaryEntries.filter(e => !existingDates.has(e.date));
          
          if (newEntries.length > 0) {
            const merged = [...existingEntries, ...newEntries];
            merged.sort((a, b) => b.date.localeCompare(a.date));
            saveDiaryEntries(merged);
            imported += newEntries.length;
          }
          skipped += data.diaryEntries.length - newEntries.length;
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

