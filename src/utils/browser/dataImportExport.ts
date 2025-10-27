/**
 * 浏览器使用记录数据导入导出功能
 */

import { BrowserUsageRecord } from '@/types';
import { loadBrowserUsageRecords, addBrowserUsageRecords, clearAllBrowserUsageRecords } from './storage';

/**
 * 导入结果接口
 */
export interface ImportResult {
  imported: number;  // 成功导入的数量
  skipped: number;   // 跳过的数量（重复）
  total: number;     // 总数量
}

/**
 * 导出浏览器使用记录为JSON文件
 */
export const exportBrowserUsageRecords = (records?: BrowserUsageRecord[]): void => {
  const recordsToExport = records || loadBrowserUsageRecords();
  
  // 准备导出的数据（不包含id和createdAt）
  const exportData = recordsToExport.map(record => ({
    host: record.host,
    date: record.date,
    ...(record.alias && { alias: record.alias }),
    cate: record.cate,
    focus: record.focus,
    time: record.time
  }));
  
  const dataStr = JSON.stringify(exportData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `browser-usage-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 验证导入文件
 */
export const validateBrowserUsageImportFile = (file: File): string | null => {
  // 检查文件类型
  if (!file.type.includes('json') && !file.name.endsWith('.json')) {
    return '请选择JSON格式的文件';
  }
  
  // 检查文件大小（限制为10MB）
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return '文件大小超过限制（最大10MB）';
  }
  
  return null;
};

/**
 * 导入浏览器使用记录
 */
export const importBrowserUsageRecords = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedData = JSON.parse(content);
        
        // 验证数据格式
        if (!Array.isArray(importedData)) {
          reject(new Error('数据格式错误：应为数组格式'));
          return;
        }
        
        // 验证每条记录的必要字段
        for (const item of importedData) {
          if (!item.host || !item.date || item.focus === undefined || item.time === undefined) {
            reject(new Error('数据格式错误：缺少必要字段（host, date, focus, time）'));
            return;
          }
        }
        
        // 获取现有记录
        const existingRecords = loadBrowserUsageRecords();
        
        // 创建唯一键来检测重复
        const existingKeys = new Set(
          existingRecords.map(r => `${r.host}_${r.date}`)
        );
        
        // 处理导入的记录
        const newRecords: BrowserUsageRecord[] = [];
        let skippedCount = 0;
        
        importedData.forEach((item) => {
          const key = `${item.host}_${item.date}`;
          
          // 如果记录已存在（相同host和date），更新它
          const existingIndex = existingRecords.findIndex(
            r => r.host === item.host && r.date === item.date
          );
          
          if (existingIndex !== -1) {
            // 更新现有记录
            existingRecords[existingIndex] = {
              ...existingRecords[existingIndex],
              alias: item.alias || existingRecords[existingIndex].alias,
              cate: item.cate,
              focus: item.focus,
              time: item.time
            };
            skippedCount++;
          } else if (!existingKeys.has(key)) {
            // 添加新记录
            const newRecord: BrowserUsageRecord = {
              id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              host: item.host,
              date: item.date,
              alias: item.alias,
              cate: item.cate,
              focus: item.focus,
              time: item.time,
              createdAt: new Date()
            };
            
            newRecords.push(newRecord);
            existingKeys.add(key);
          } else {
            skippedCount++;
          }
        });
        
        // 保存更新后的所有记录
        if (newRecords.length > 0 || skippedCount > 0) {
          // 清空并重新保存所有记录
          clearAllBrowserUsageRecords();
          addBrowserUsageRecords([...existingRecords, ...newRecords]);
        }
        
        resolve({
          imported: newRecords.length,
          skipped: skippedCount,
          total: existingRecords.length + newRecords.length
        });
        
      } catch (error) {
        reject(new Error('文件解析失败：' + (error instanceof Error ? error.message : '未知错误')));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    
    reader.readAsText(file);
  });
};
