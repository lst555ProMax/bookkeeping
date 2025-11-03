import { SleepRecord } from './types';
import { loadSleepRecords, addSleepRecord } from './storage';

/**
 * 睡眠记录导出数据接口
 */
export interface SleepExportData {
  version: string;
  exportDate: string;
  sleepRecords: SleepRecord[];
  totalRecords: number;
}

/**
 * 导出睡眠记录到JSON文件
 */
export const exportSleepRecords = (): void => {
  try {
    const sleepRecords = loadSleepRecords();
    
    const exportData: SleepExportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      sleepRecords,
      totalRecords: sleepRecords.length
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    link.download = `sleep-records-export-${dateStr}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`成功导出 ${sleepRecords.length} 条睡眠记录`);
  } catch (error) {
    console.error('导出睡眠记录失败:', error);
    throw new Error('导出睡眠记录失败，请重试');
  }
};

/**
 * 从JSON文件导入睡眠记录
 */
export const importSleepRecords = (file: File): Promise<{
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
          const importData: SleepExportData = JSON.parse(content);
          
          if (!importData.sleepRecords || !Array.isArray(importData.sleepRecords)) {
            throw new Error('无效的数据格式：缺少sleepRecords数组');
          }
          
          const existingRecords = loadSleepRecords();
          const existingIds = new Set(existingRecords.map(record => record.id));
          
          let imported = 0;
          let skipped = 0;
          
          importData.sleepRecords.forEach(record => {
            if (!record.id || !record.date || !record.sleepTime || !record.wakeTime || record.quality === undefined) {
              skipped++;
              return;
            }
            
            if (existingIds.has(record.id)) {
              skipped++;
              return;
            }
            
            addSleepRecord(record);
            imported++;
          });
          
          resolve({
            imported,
            skipped,
            total: importData.sleepRecords.length
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
      console.error('导入睡眠记录失败:', error);
      reject(new Error('导入睡眠记录失败，请重试'));
    }
  });
};

/**
 * 验证睡眠记录导入文件格式
 */
export const validateSleepImportFile = (file: File): string | null => {
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小不能超过10MB';
  }
  
  return null;
};
