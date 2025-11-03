import { DailyRecord } from './types';
import { loadDailyRecords, addDailyRecord } from './storage';

/**
 * 日常记录导出数据接口
 */
export interface DailyExportData {
  version: string;
  exportDate: string;
  dailyRecords: DailyRecord[];
  totalRecords: number;
}

/**
 * 导出日常记录到JSON文件
 */
export const exportDailyRecords = (records?: DailyRecord[]): void => {
  try {
    const dailyRecords = records || loadDailyRecords();
    
    const exportData: DailyExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      dailyRecords,
      totalRecords: dailyRecords.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `daily-records-export-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${dailyRecords.length} 条日常记录`);
  } catch (error) {
    console.error('导出日常记录失败:', error);
    throw new Error('导出日常记录失败，请重试');
  }
};

/**
 * 从JSON文件导入日常记录
 */
export const importDailyRecords = (file: File): Promise<{
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
          const importData: DailyExportData = JSON.parse(content);
          
          if (!importData.dailyRecords || !Array.isArray(importData.dailyRecords)) {
            throw new Error('无效的数据格式：缺少dailyRecords数组');
          }
          
          const existingRecords = loadDailyRecords();
          const existingIds = new Set(existingRecords.map(record => record.id));
          
          let imported = 0;
          let skipped = 0;
          
          importData.dailyRecords.forEach(record => {
            if (!record.id || !record.date) {
              skipped++;
              return;
            }
            
            if (existingIds.has(record.id)) {
              skipped++;
              return;
            }
            
            addDailyRecord(record);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.dailyRecords.length
          });
          
          console.log(`导入完成: ${imported} 条新记录 (${skipped} 条跳过)`);
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
      console.error('导入日常记录失败:', error);
      reject(new Error('导入日常记录失败，请重试'));
    }
  });
};

/**
 * 验证日常记录导入文件格式
 */
export const validateDailyImportFile = (file: File): string | null => {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};
