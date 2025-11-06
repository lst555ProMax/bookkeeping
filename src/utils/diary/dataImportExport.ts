/**
 * 日记数据导入导出
 */

import { QuickNote, DiaryEntry } from './types';
import { loadQuickNotes, saveQuickNotes, loadDiaryEntries, saveDiaryEntries } from './storage';

interface DiaryExportData {
  quickNotes: QuickNote[];
  diaryEntries: DiaryEntry[];
  exportTime: number;
  version: string;
}

/**
 * 导出日记数据
 */
export const exportDiaryData = (): void => {
  const data: DiaryExportData = {
    quickNotes: loadQuickNotes(),
    diaryEntries: loadDiaryEntries(),
    exportTime: Date.now(),
    version: '1.0.0',
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diary_backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * 导入日记数据
 */
export const importDiaryData = async (file: File): Promise<{ imported: number; skipped: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data: DiaryExportData = JSON.parse(content);

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
export const validateDiaryImportFile = (file: File): string | null => {
  if (!file.name.endsWith('.json')) {
    return '只支持JSON格式文件';
  }

  if (file.size > 10 * 1024 * 1024) {
    return '文件大小不能超过10MB';
  }

  return null;
};
