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
 * 验证速记记录格式，返回详细的错误信息
 */
const validateQuickNoteWithError = (note: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof note !== 'object' || note === null) {
    return { valid: false, error: `无效的速记记录[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(note)) {
    return { valid: false, error: `无效的速记记录[${index}]：记录必须是对象` };
  }
  
  const n = note as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in n) || n.id === undefined || n.id === null) {
    return { valid: false, error: `无效的速记记录[${index}]：缺少id字段` };
  }
  if (typeof n.id !== 'string') {
    return { valid: false, error: `无效的速记记录[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('content' in n) || n.content === undefined || n.content === null) {
    return { valid: false, error: `无效的速记记录[${index}]：缺少content字段` };
  }
  if (typeof n.content !== 'string') {
    return { valid: false, error: `无效的速记记录[${index}]：content字段类型不正确，必须是字符串` };
  }
  
  if (!('timestamp' in n) || n.timestamp === undefined || n.timestamp === null) {
    return { valid: false, error: `无效的速记记录[${index}]：缺少timestamp字段` };
  }
  if (typeof n.timestamp !== 'number') {
    return { valid: false, error: `无效的速记记录[${index}]：timestamp字段类型不正确，必须是数字` };
  }
  
  // 验证timestamp是有效数字
  if (!Number.isFinite(n.timestamp)) {
    return { valid: false, error: `无效的速记记录[${index}]：timestamp必须是有效数字` };
  }
  
  if (!Number.isInteger(n.timestamp) || n.timestamp < 0) {
    return { valid: false, error: `无效的速记记录[${index}]：timestamp必须是非负整数` };
  }
  
  return { valid: true };
};

/**
 * 验证日记条目格式，返回详细的错误信息
 */
const validateDiaryEntryWithError = (entry: unknown, index: number): { valid: boolean; error?: string } => {
  // 先检查是否是null或非对象类型
  if (typeof entry !== 'object' || entry === null) {
    return { valid: false, error: `无效的日记条目[${index}]：记录必须是对象` };
  }
  
  // 检查是否是数组（数组也是object类型，但不符合要求）
  if (Array.isArray(entry)) {
    return { valid: false, error: `无效的日记条目[${index}]：记录必须是对象` };
  }
  
  const e = entry as Record<string, unknown>;
  
  // 检查必需字段是否存在
  if (!('id' in e) || e.id === undefined || e.id === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少id字段` };
  }
  if (typeof e.id !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：id字段类型不正确，必须是字符串` };
  }
  
  if (!('date' in e) || e.date === undefined || e.date === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少date字段` };
  }
  if (typeof e.date !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：date字段类型不正确，必须是字符串` };
  }
  
  if (!('content' in e) || e.content === undefined || e.content === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少content字段` };
  }
  if (typeof e.content !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：content字段类型不正确，必须是字符串` };
  }
  
  if (!('theme' in e) || e.theme === undefined || e.theme === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少theme字段` };
  }
  if (typeof e.theme !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：theme字段类型不正确，必须是字符串` };
  }
  
  if (!('weather' in e) || e.weather === undefined || e.weather === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少weather字段` };
  }
  if (typeof e.weather !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：weather字段类型不正确，必须是字符串` };
  }
  
  if (!('mood' in e) || e.mood === undefined || e.mood === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少mood字段` };
  }
  if (typeof e.mood !== 'string') {
    return { valid: false, error: `无效的日记条目[${index}]：mood字段类型不正确，必须是字符串` };
  }
  
  if (!('createdAt' in e) || e.createdAt === undefined || e.createdAt === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少createdAt字段` };
  }
  if (typeof e.createdAt !== 'number') {
    return { valid: false, error: `无效的日记条目[${index}]：createdAt字段类型不正确，必须是数字` };
  }
  
  if (!('updatedAt' in e) || e.updatedAt === undefined || e.updatedAt === null) {
    return { valid: false, error: `无效的日记条目[${index}]：缺少updatedAt字段` };
  }
  if (typeof e.updatedAt !== 'number') {
    return { valid: false, error: `无效的日记条目[${index}]：updatedAt字段类型不正确，必须是数字` };
  }
  
  // 验证日期格式和值
  const dateValidation = isValidDate(e.date);
  if (!dateValidation.valid) {
    return { valid: false, error: `无效的日记条目[${index}]：date${dateValidation.error}` };
  }
  
  // 验证createdAt和updatedAt是有效数字
  if (!Number.isFinite(e.createdAt)) {
    return { valid: false, error: `无效的日记条目[${index}]：createdAt必须是有效数字` };
  }
  
  if (!Number.isInteger(e.createdAt) || e.createdAt < 0) {
    return { valid: false, error: `无效的日记条目[${index}]：createdAt必须是非负整数` };
  }
  
  if (!Number.isFinite(e.updatedAt)) {
    return { valid: false, error: `无效的日记条目[${index}]：updatedAt必须是有效数字` };
  }
  
  if (!Number.isInteger(e.updatedAt) || e.updatedAt < 0) {
    return { valid: false, error: `无效的日记条目[${index}]：updatedAt必须是非负整数` };
  }
  
  // 验证updatedAt >= createdAt
  if (e.updatedAt < e.createdAt) {
    return { valid: false, error: `无效的日记条目[${index}]：updatedAt(${e.updatedAt})不能小于createdAt(${e.createdAt})` };
  }
  
  // 验证font（如果存在）
  if (e.font !== undefined && e.font !== null) {
    if (typeof e.font !== 'string') {
      return { valid: false, error: `无效的日记条目[${index}]：font必须是字符串` };
    }
  }
  
  // 验证image（如果存在）
  if (e.image !== undefined && e.image !== null) {
    if (typeof e.image !== 'string') {
      return { valid: false, error: `无效的日记条目[${index}]：image必须是字符串` };
    }
  }
  
  return { valid: true };
};

/**
 * 验证速记导出数据格式，返回详细的错误信息
 */
const validateQuickNotesExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalQuickNotes !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalQuickNotes字段或类型不正确' };
  }
  
  // 检查quickNotes数组
  if (!Array.isArray(d.quickNotes)) {
    return { valid: false, error: '无效的数据格式：quickNotes必须是数组' };
  }
  
  // 验证totalQuickNotes与实际数组长度一致
  if (d.totalQuickNotes !== d.quickNotes.length) {
    return { valid: false, error: `无效的数据格式：totalQuickNotes(${d.totalQuickNotes})与quickNotes数组长度(${d.quickNotes.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.quickNotes.length; i++) {
    const validation = validateQuickNoteWithError(d.quickNotes[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.quickNotes.length; i++) {
    const note = d.quickNotes[i];
    if (typeof note !== 'object' || note === null || Array.isArray(note)) {
      continue; // 已经在validateQuickNoteWithError中检查过了
    }
    const n = note as Record<string, unknown>;
    const id = n.id as string;
    if (ids.has(id)) {
      return { valid: false, error: `无效的数据格式：存在重复的记录ID"${id}"` };
    }
    ids.add(id);
  }
  
  return { valid: true };
};

/**
 * 验证日记条目导出数据格式，返回详细的错误信息
 */
const validateDiaryEntriesExportDataWithError = (data: unknown): { valid: boolean; error?: string } => {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '无效的数据格式：数据必须是JSON对象' };
  }
  
  const d = data as Record<string, unknown>;
  
  // 检查顶层字段
  if (typeof d.version !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少version字段或类型不正确' };
  }
  
  if (typeof d.exportDate !== 'string') {
    return { valid: false, error: '无效的数据格式：缺少exportDate字段或类型不正确' };
  }
  
  if (typeof d.totalDiaryEntries !== 'number') {
    return { valid: false, error: '无效的数据格式：缺少totalDiaryEntries字段或类型不正确' };
  }
  
  // 检查diaryEntries数组
  if (!Array.isArray(d.diaryEntries)) {
    return { valid: false, error: '无效的数据格式：diaryEntries必须是数组' };
  }
  
  // 验证totalDiaryEntries与实际数组长度一致
  if (d.totalDiaryEntries !== d.diaryEntries.length) {
    return { valid: false, error: `无效的数据格式：totalDiaryEntries(${d.totalDiaryEntries})与diaryEntries数组长度(${d.diaryEntries.length})不一致` };
  }
  
  // 验证每个记录
  for (let i = 0; i < d.diaryEntries.length; i++) {
    const validation = validateDiaryEntryWithError(d.diaryEntries[i], i);
    if (!validation.valid) {
      return validation;
    }
  }
  
  // 检查ID重复
  const ids = new Set<string>();
  for (let i = 0; i < d.diaryEntries.length; i++) {
    const entry = d.diaryEntries[i];
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      continue; // 已经在validateDiaryEntryWithError中检查过了
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
    link.download = `diary-quicknotes-${dateStr}.json`;
    
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
    link.download = `diary-entries-${dateStr}.json`;
    
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
 * 导出所有日记数据（速记+日记）
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
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  a.download = `diary-backup-${dateStr}.json`;
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
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateQuickNotesExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as QuickNotesExportData;
          
          const existingNotes = loadQuickNotes();
          const existingIds = new Set(existingNotes.map(n => n.id));
          
          let imported = 0;
          let skipped = 0;
          const newNotes: QuickNote[] = [];
          
          importData.quickNotes.forEach(note => {
            // 检查是否已存在
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
        } catch (error) {
          console.error('导入速记数据失败:', error);
          reject(error instanceof Error ? error : new Error('导入速记数据失败，请重试'));
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
          let parsedData: unknown;
          
          try {
            parsedData = JSON.parse(content);
          } catch {
            throw new Error('文件格式错误：无法解析JSON，请确保文件是有效的JSON格式');
          }
          
          // 严格验证数据格式
          const validation = validateDiaryEntriesExportDataWithError(parsedData);
          if (!validation.valid) {
            throw new Error(validation.error || '无效的数据格式：文件格式与导出格式不一致，请确保使用正确的导出文件');
          }
          
          const importData = parsedData as DiaryEntriesExportData;
          
          const existingEntries = loadDiaryEntries();
          const existingDates = new Set(existingEntries.map(e => e.date));
          
          let imported = 0;
          let skipped = 0;
          
          importData.diaryEntries.forEach(entry => {
            // 检查是否已存在（按日期）
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
        } catch (error) {
          console.error('导入日记数据失败:', error);
          reject(error instanceof Error ? error : new Error('导入日记数据失败，请重试'));
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
 * 导入所有日记数据（速记+日记）
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
