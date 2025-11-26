/**
 * 书记数据导入导出
 */

import { QuickNote, DiaryEntry } from './types';
import { loadReadingExcerpts, saveReadingExcerpts, loadReadingEntries, saveReadingEntries } from './storage';

interface ReadingExportData {
  readingExcerpts: QuickNote[];
  readingEntries: DiaryEntry[];
  exportTime: number;
  version: string;
}

interface ReadingExcerptsExportData {
  version: string;
  exportDate: string;
  readingExcerpts: QuickNote[];
  totalReadingExcerpts: number;
}

interface ReadingEntriesExportData {
  version: string;
  exportDate: string;
  readingEntries: DiaryEntry[];
  totalReadingEntries: number;
}

// 兼容旧格式的类型
interface LegacyQuickNotesExportData {
  quickNotes?: QuickNote[];
}

interface LegacyDiaryEntriesExportData {
  diaryEntries?: DiaryEntry[];
}

interface LegacyReadingExportData {
  quickNotes?: QuickNote[];
  diaryEntries?: DiaryEntry[];
}

/**
 * 导出摘抄数据
 */
export const exportReadingExcerptsOnly = (readingExcerpts?: QuickNote[]): void => {
  try {
    const excerptsToExport = readingExcerpts || loadReadingExcerpts();
    
    const exportData: ReadingExcerptsExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      readingExcerpts: excerptsToExport,
      totalReadingExcerpts: excerptsToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `reading-excerpts-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${excerptsToExport.length} 条摘抄`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出摘抄数据失败，请重试');
  }
};

/**
 * 导出书记数据
 */
export const exportReadingEntriesOnly = (readingEntries?: DiaryEntry[]): void => {
  try {
    const entriesToExport = readingEntries || loadReadingEntries();
    
    const exportData: ReadingEntriesExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      readingEntries: entriesToExport,
      totalReadingEntries: entriesToExport.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `reading-entries-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${entriesToExport.length} 条书记`);
  } catch (error) {
    console.error('导出失败:', error);
    throw new Error('导出书记数据失败，请重试');
  }
};

/**
 * 导出所有书记数据（摘抄+书记）
 */
export const exportReadingData = (): void => {
  const data: ReadingExportData = {
    readingExcerpts: loadReadingExcerpts(),
    readingEntries: loadReadingEntries(),
    exportTime: Date.now(),
    version: '1.0.0',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  a.download = `reading-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 导入摘抄数据
 */
export const importReadingExcerptsOnly = (file: File): Promise<{
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
          const importData: ReadingExcerptsExportData = JSON.parse(content);
          
          // 兼容旧格式
          const legacyData = importData as ReadingExcerptsExportData & LegacyQuickNotesExportData;
          const excerpts = legacyData.readingExcerpts || legacyData.quickNotes || [];
          if (!Array.isArray(excerpts)) {
            throw new Error('无效的数据格式：缺少readingExcerpts数组');
          }
          
          const existingExcerpts = loadReadingExcerpts();
          const existingIds = new Set(existingExcerpts.map(e => e.id));
          
          let imported = 0;
          let skipped = 0;
          const newExcerpts: QuickNote[] = [];
          
          excerpts.forEach(excerpt => {
            if (!excerpt.id || !excerpt.content) {
              skipped++;
              return;
            }
            
            if (existingIds.has(excerpt.id)) {
              skipped++;
              return;
            }
            
            newExcerpts.push(excerpt);
            imported++;
          });
          
          if (newExcerpts.length > 0) {
            saveReadingExcerpts([...existingExcerpts, ...newExcerpts]);
          }
          
          resolve({
            imported,
            skipped,
            total: excerpts.length
          });
          
          console.log(`导入完成: ${imported} 条新摘抄 (${skipped} 条跳过)`);
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
      reject(new Error('导入摘抄数据失败，请重试'));
    }
  });
};

/**
 * 导入书记数据
 */
export const importReadingEntriesOnly = (file: File): Promise<{
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
          const importData: ReadingEntriesExportData = JSON.parse(content);
          
          // 兼容旧格式
          const legacyData = importData as ReadingEntriesExportData & LegacyDiaryEntriesExportData;
          const entries = legacyData.readingEntries || legacyData.diaryEntries || [];
          if (!Array.isArray(entries)) {
            throw new Error('无效的数据格式：缺少readingEntries数组');
          }
          
          const existingEntries = loadReadingEntries();
          // 使用id作为唯一标识，而不是date，因为同一天可能有多篇书记
          const existingIds = new Set(existingEntries.map(e => e.id));
          
          let imported = 0;
          let skipped = 0;
          
          entries.forEach(entry => {
            if (!entry.id || !entry.date) {
              skipped++;
              return;
            }
            
            // 检查是否已存在相同id的书记
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
                console.warn(`书记 ${entry.id} 的图片格式可能不正确`);
              }
            }
            
            // 保存完整的entry数据（包括image字段）
            existingEntries.push(entry);
            existingIds.add(entry.id);
            imported++;
          });
          
          if (imported > 0) {
            existingEntries.sort((a, b) => b.date.localeCompare(a.date));
            saveReadingEntries(existingEntries);
          }
          
          resolve({
            imported,
            skipped,
            total: entries.length
          });
          
          console.log(`导入完成: ${imported} 条新书记 (${skipped} 条跳过)`);
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
      reject(new Error('导入书记数据失败，请重试'));
    }
  });
};

/**
 * 导入所有书记数据（摘抄+书记）
 */
export const importReadingData = async (file: File): Promise<{ imported: number; skipped: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: ReadingExportData = JSON.parse(content);

        let imported = 0;
        let skipped = 0;

        // 兼容旧格式
        const legacyData = data as ReadingExportData & LegacyReadingExportData;

        // 导入摘抄（兼容旧格式）
        const excerpts = legacyData.readingExcerpts || legacyData.quickNotes || [];
        if (Array.isArray(excerpts)) {
          const existingExcerpts = loadReadingExcerpts();
          const existingIds = new Set(existingExcerpts.map(e => e.id));
          const newExcerpts = excerpts.filter(e => !existingIds.has(e.id));
          
          if (newExcerpts.length > 0) {
            saveReadingExcerpts([...existingExcerpts, ...newExcerpts]);
            imported += newExcerpts.length;
          }
          skipped += excerpts.length - newExcerpts.length;
        }

        // 导入书记（包含图片数据，兼容旧格式）
        const entries = legacyData.readingEntries || legacyData.diaryEntries || [];
        if (Array.isArray(entries)) {
          const existingEntries = loadReadingEntries();
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
                console.warn(`书记 ${entry.id} 的图片格式可能不正确`);
              }
            }
          });
          
          if (newEntries.length > 0) {
            const merged = [...existingEntries, ...newEntries];
            merged.sort((a, b) => b.date.localeCompare(a.date));
            saveReadingEntries(merged);
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
export const validateReadingImportFile = (file: File): string | null => {
  if (!file.name.endsWith('.json')) {
    return '只支持JSON格式文件';
  }

  if (file.size > 10 * 1024 * 1024) {
    return '文件大小不能超过10MB';
  }

  return null;
};

// 向后兼容的别名
export const exportQuickNotesOnly = exportReadingExcerptsOnly;
export const importQuickNotesOnly = importReadingExcerptsOnly;
export const exportDiaryEntriesOnly = exportReadingEntriesOnly;
export const importDiaryEntriesOnly = importReadingEntriesOnly;

