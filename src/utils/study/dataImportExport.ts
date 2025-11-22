// 学习记录导入导出功能
import { StudyRecord } from './types';
import { loadStudyRecords, addStudyRecord } from './storage';
import { getStudyCategories, addStudyCategory } from './category';

/**
 * 导出学习记录为 JSON 文件
 */
export const exportStudyRecords = (records?: StudyRecord[]): void => {
  const dataToExport = records || loadStudyRecords();
  
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    recordCount: dataToExport.length,
    records: dataToExport
  };
  
  const jsonStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `study_records_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * 验证导入文件
 */
export const validateStudyImportFile = (file: File): string | null => {
  // 检查文件类型
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return '请选择 JSON 格式的文件';
  }
  
  // 检查文件大小（限制为 10MB）
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return '文件大小超过限制（最大 10MB）';
  }
  
  return null;
};

/**
 * 验证学习记录数据格式
 */
const validateStudyRecord = (record: unknown): record is StudyRecord => {
  if (typeof record !== 'object' || record === null) {
    return false;
  }
  
  const r = record as Record<string, unknown>;
  
  return (
    typeof r.id === 'string' &&
    typeof r.date === 'string' &&
    typeof r.category === 'string' &&
    typeof r.videoTitle === 'string' &&
    typeof r.episodeStart === 'number' &&
    typeof r.episodeEnd === 'number' &&
    typeof r.totalTime === 'number' &&
    typeof r.createdAt === 'string' &&
    typeof r.updatedAt === 'string'
  );
};

/**
 * 导入学习记录
 */
export const importStudyRecords = (file: File): Promise<{
  imported: number;
  skipped: number;
  total: number;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // 验证数据格式
        if (!data.records || !Array.isArray(data.records)) {
          reject(new Error('无效的文件格式：缺少 records 字段'));
          return;
        }
        
        // 检查缺失的分类
        const currentCategories = getStudyCategories();
        const missingCategories = new Set<string>();
        
        data.records.forEach((record: unknown) => {
          // 先验证记录格式，以便安全访问 category
          if (validateStudyRecord(record)) {
            if (record.category && !currentCategories.includes(record.category)) {
              missingCategories.add(record.category);
            }
          }
        });
        
        // 如果有缺失的分类，提示用户
        if (missingCategories.size > 0) {
          let message = '导入的数据中有以下学习分类没有创建：\n\n';
          message += Array.from(missingCategories).join('、') + '\n';
          message += '\n是否创建这些分类并继续导入？';
          
          const userConfirmed = window.confirm(message);
          
          if (!userConfirmed) {
            reject(new Error('用户取消导入'));
            return;
          }
          
          missingCategories.forEach(category => {
            addStudyCategory(category);
          });
        }
        
        const existingRecords = loadStudyRecords();
        const existingIds = new Set(existingRecords.map(r => r.id));
        
        let imported = 0;
        let skipped = 0;
        
        data.records.forEach((record: unknown) => {
          // 验证记录格式
          if (!validateStudyRecord(record)) {
            console.warn('跳过无效记录:', record);
            skipped++;
            return;
          }
          
          // 检查是否已存在
          if (existingIds.has(record.id)) {
            skipped++;
            return;
          }
          
          // 添加记录
          try {
            addStudyRecord({
              date: record.date,
              category: record.category,
              videoTitle: record.videoTitle,
              episodeStart: record.episodeStart,
              episodeEnd: record.episodeEnd,
              totalTime: record.totalTime,
              remark: record.remark
            });
            imported++;
          } catch (error) {
            console.error('导入记录失败:', record, error);
            skipped++;
          }
        });
        
        resolve({
          imported,
          skipped,
          total: data.records.length
        });
      } catch (error) {
        reject(new Error('解析文件失败：' + (error instanceof Error ? error.message : '未知错误')));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('读取文件失败'));
    };
    
    reader.readAsText(file);
  });
};
